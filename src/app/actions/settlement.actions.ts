"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createSettlement(data: {
  tripId: string;
  debtorId: string;
  creditorId: string;
  amount: number;
  currency?: string;
  slipUrl?: string;
}) {
  try {
    const settlement = await prisma.settlement.create({
      data: {
        tripId: data.tripId,
        debtorId: data.debtorId,
        creditorId: data.creditorId,
        amount: data.amount,
        currency: data.currency || "THB",
        status: "PENDING",
        slipUrl: data.slipUrl || null,
      },
    });

    revalidatePath(`/trips/${data.tripId}`);
    return { success: true, data: settlement };
  } catch (error) {
    console.error("Failed to create settlement:", error);
    return { success: false, error: "ไม่สามารถแจ้งโอนเงินได้" };
  }
}

export async function confirmSettlement(id: string, tripId: string) {
  try {
    const settlement = await prisma.settlement.update({
      where: { id },
      data: { status: "CONFIRMED" },
    });

    revalidatePath(`/trips/${tripId}`);
    return { success: true, data: settlement };
  } catch (error) {
    console.error("Failed to confirm settlement:", error);
    return { success: false, error: "ไม่สามารถยืนยันรับเงินได้" };
  }
}

export async function deleteSettlement(id: string, tripId: string) {
  try {
    await prisma.settlement.delete({ where: { id } });
    revalidatePath(`/trips/${tripId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete settlement:", error);
    return { success: false, error: "ไม่สามารถลบรายการเคลียร์หนี้ได้" };
  }
}

export async function updateSettlementSlip(
  id: string,
  tripId: string,
  slipUrl: string,
) {
  try {
    const settlement = await prisma.settlement.update({
      where: { id },
      data: { slipUrl },
    });
    revalidatePath(`/trips/${tripId}`);
    return { success: true, data: settlement };
  } catch (error) {
    console.error("Failed to update settlement slip:", error);
    return { success: false, error: "ไม่สามารถอัปเดตสลิปได้" };
  }
}
