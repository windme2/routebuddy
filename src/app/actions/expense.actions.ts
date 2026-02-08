"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const ExpenseSchema = z.object({
  description: z.string().min(1, "กรุณาระบุรายการค่าใช้จ่าย"),
  amount: z.number().positive("จำนวนเงินต้องมากกว่า 0"),
  currency: z.string().default("THB"),
  thbAmount: z.number().positive("จำนวนเงินเทียบเท่าบาทต้องมากกว่า 0"),
  category: z.string(),
  date: z.string(),
  payerId: z.string().min(1, "กรุณาระบุผู้จ่าย"),
  involvedMemberIds: z
    .array(z.string())
    .min(1, "ต้องมีผู้รับผิดชอบอย่างน้อย 1 คน"),
  splitType: z.enum(["EQUAL", "EXACT"]).default("EQUAL"),
  exactShares: z.record(z.string(), z.number()).optional(), // Key: memberId, Value: exact share in local currency
  tripId: z.string(),
  activityId: z.string().optional(),
});

type ExpenseFormData = z.infer<typeof ExpenseSchema>;

// Helper to distribute rounded satang without losing precision
function calculateShares(data: ExpenseFormData) {
  const totalThbSatang = Math.round(data.thbAmount * 100);
  const shares: Record<string, number> = {};

  if (data.splitType === "EXACT" && data.exactShares) {
    let allocated = 0;
    const memberIds = data.involvedMemberIds;
    const totalLocalAmount = data.amount;

    for (let i = 0; i < memberIds.length; i++) {
      const memberId = memberIds[i];
      const localShare = data.exactShares[memberId] || 0;

      // Calculate share proportion relative to total THB
      if (i === memberIds.length - 1) {
        // Last person gets the remaining satang to avoid rounding errors
        shares[memberId] = totalThbSatang - allocated;
      } else {
        const thbShare = Math.round(
          (localShare / totalLocalAmount) * totalThbSatang,
        );
        shares[memberId] = thbShare;
        allocated += thbShare;
      }
    }
  } else {
    // EQUAL split
    const count = data.involvedMemberIds.length;
    const baseShare = Math.floor(totalThbSatang / count);
    let remainder = totalThbSatang % count;

    for (const memberId of data.involvedMemberIds) {
      if (remainder > 0) {
        shares[memberId] = baseShare + 1;
        remainder--;
      } else {
        shares[memberId] = baseShare;
      }
    }
  }

  return shares;
}

export async function createExpense(rawData: unknown) {
  try {
    const parseResult = ExpenseSchema.safeParse(rawData);
    if (!parseResult.success) {
      return { success: false, error: parseResult.error.issues[0].message };
    }
    const data = parseResult.data;

    const sharesInSatang = calculateShares(data);

    const expense = await prisma.$transaction(async (tx) => {
      const newExpense = await tx.expense.create({
        data: {
          description: data.description,
          amount: Math.round(data.amount * 100), // convert to satang
          currency: data.currency,
          thbAmount: Math.round(data.thbAmount * 100), // convert to satang
          category: data.category,
          date: new Date(data.date),
          payerId: data.payerId,
          tripId: data.tripId,
          ...(data.activityId && { activityId: data.activityId }),
        },
      });

      for (const memberId of data.involvedMemberIds) {
        await tx.expenseParticipant.create({
          data: {
            expenseId: newExpense.id,
            memberId: memberId,
            share: sharesInSatang[memberId] || 0,
          },
        });
      }

      return newExpense;
    });

    revalidatePath(`/trips/${data.tripId}`);
    return { success: true, data: expense };
  } catch (error) {
    console.error("Failed to create expense:", error);
    return { success: false, error: "ไม่สามารถบันทึกค่าใช้จ่ายได้" };
  }
}

export async function updateExpense(id: string, rawData: unknown) {
  try {
    const parseResult = ExpenseSchema.safeParse(rawData);
    if (!parseResult.success) {
      return { success: false, error: parseResult.error.issues[0].message };
    }
    const data = parseResult.data;

    const sharesInSatang = calculateShares(data);

    const expense = await prisma.$transaction(async (tx) => {
      const updatedExpense = await tx.expense.update({
        where: { id },
        data: {
          description: data.description,
          amount: Math.round(data.amount * 100),
          currency: data.currency,
          thbAmount: Math.round(data.thbAmount * 100),
          category: data.category,
          date: new Date(data.date),
          payerId: data.payerId,
          activityId: data.activityId || null,
        },
      });

      await tx.expenseParticipant.deleteMany({
        where: { expenseId: id },
      });

      for (const memberId of data.involvedMemberIds) {
        await tx.expenseParticipant.create({
          data: {
            expenseId: id,
            memberId: memberId,
            share: sharesInSatang[memberId] || 0,
          },
        });
      }

      return updatedExpense;
    });

    revalidatePath(`/trips/${data.tripId}`);
    return { success: true, data: expense };
  } catch (error) {
    console.error("Failed to update expense:", error);
    return { success: false, error: "ไม่สามารถแก้ไขค่าใช้จ่ายได้" };
  }
}

// Get all expenses for a trip with details
export async function getExpensesByTrip(tripId: string) {
  try {
    const expenses = await prisma.expense.findMany({
      where: {
        // We need to query expenses that belong to this trip.
        // Since Expense doesn't have tripId directly, we find it via Payer -> Trip
        // OR we should have added tripId to Expense for easier querying.
        // Looking at schema: Payer is a Member. Member has tripId.
        payer: {
          tripId: tripId,
        },
      },
      include: {
        payer: true,
        participants: {
          include: {
            member: true,
          },
        },
        activity: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    return expenses;
  } catch (error) {
    console.error("Failed to fetch expenses:", error);
    return [];
  }
}

// Delete expense
export async function deleteExpense(id: string, tripId: string) {
  try {
    await prisma.expense.delete({
      where: { id },
    });

    revalidatePath(`/trips/${tripId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete expense:", error);
    return { success: false, error: "ไม่สามารถลบค่าใช้จ่ายได้" };
  }
}
