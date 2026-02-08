"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { TripFormData, TripWithMemberCount } from "@/types/trip";

// Create a new trip
export async function createTrip(data: TripFormData) {
  try {
    // Get max order
    const maxOrder = await prisma.trip.findFirst({
      select: { order: true },
      orderBy: { order: "desc" },
    });
    const trip = await prisma.trip.create({
      data: {
        name: data.name,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        timezone: data.timezone || "Asia/Bangkok",
        budget: data.budget,
        description: data.description || null,
        coverImage: data.coverImage || null,
        order: (maxOrder?.order ?? 0) + 1,
      },
    });

    revalidatePath("/");
    return { success: true, data: trip };
  } catch (error) {
    console.error("Failed to create trip:", error);
    return { success: false, error: "ไม่สามารถสร้างทริปได้" };
  }
}

// Get all trips with member count — ordered by `order` field
export async function getTrips(): Promise<TripWithMemberCount[]> {
  try {
    const trips = await prisma.trip.findMany({
      include: {
        _count: { select: { members: true } },
        images: { take: 1, select: { url: true } },
        expenses: { select: { thbAmount: true } },
      },
      orderBy: { order: "asc" },
    });
    return trips;
  } catch (error) {
    console.error("Failed to fetch trips:", error);
    return [];
  }
}

// Get single trip by ID with all relations
export async function getTripById(id: string) {
  try {
    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        members: true,
        activities: {
          orderBy: [{ date: "asc" }, { startTime: "asc" }],
        },
        expenses: {
          include: {
            payer: true,
            participants: { include: { member: true } },
          },
          orderBy: { date: "desc" },
        },
        images: { orderBy: { createdAt: "desc" } },
        settlements: {
          include: { debtor: true, creditor: true },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: { members: true, activities: true, expenses: true },
        },
      },
    });
    return trip;
  } catch (error) {
    console.error("Failed to fetch trip:", error);
    return null;
  }
}

// Update trip
export async function updateTrip(id: string, data: Partial<TripFormData>) {
  try {
    const trip = await prisma.trip.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.startDate && { startDate: new Date(data.startDate) }),
        ...(data.endDate && { endDate: new Date(data.endDate) }),
        ...(data.timezone && { timezone: data.timezone }),
        ...(data.budget !== undefined && { budget: data.budget }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.coverImage !== undefined && {
          coverImage: data.coverImage,
        }),
      },
    });

    revalidatePath("/");
    revalidatePath(`/trips/${id}`);
    return { success: true, data: trip };
  } catch (error) {
    console.error("Failed to update trip:", error);
    return { success: false, error: "ไม่สามารถแก้ไขทริปได้" };
  }
}

// Delete trip
export async function deleteTrip(id: string) {
  try {
    await prisma.trip.delete({ where: { id } });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete trip:", error);
    return { success: false, error: "ไม่สามารถลบทริปได้" };
  }
}

// Reorder trips — persist order to DB
export async function reorderTrips(orderedIds: string[]) {
  try {
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.trip.update({ where: { id }, data: { order: index } }),
      ),
    );
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to reorder trips:", error);
    return { success: false, error: "ไม่สามารถเรียงลำดับทริปได้" };
  }
}

// Duplicate a trip (copy name, dates, members, activities — not expenses)
export async function duplicateTrip(id: string) {
  try {
    const original = await prisma.trip.findUnique({
      where: { id },
      include: { members: true, activities: true },
    });
    if (!original) return { success: false, error: "ไม่พบทริปต้นฉบับ" };

    const maxOrder = await prisma.trip.findFirst({
      select: { order: true },
      orderBy: { order: "desc" },
    });

    const newTrip = await prisma.trip.create({
      data: {
        name: `${original.name} (สำเนา)`,
        startDate: original.startDate,
        endDate: original.endDate,
        timezone: original.timezone,
        budget: original.budget,
        description: original.description,
        order: (maxOrder?.order ?? 0) + 1,
        members: {
          create: original.members.map((m) => ({
            name: m.name,
            role: m.role,
          })),
        },
      },
    });

    revalidatePath("/");
    return { success: true, data: newTrip };
  } catch (error) {
    console.error("Failed to duplicate trip:", error);
    return { success: false, error: "ไม่สามารถคัดลอกทริปได้" };
  }
}
