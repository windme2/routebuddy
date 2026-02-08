"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface ActivityFormData {
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  category: string;
  location?: string;
  notes?: string;
  tripId: string;
}

export async function createActivity(data: ActivityFormData) {
  try {
    const activity = await prisma.activity.create({
      data: {
        name: data.name,
        date: new Date(data.date),
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        category: data.category,
        location: data.location || null,
        notes: data.notes || null,
        tripId: data.tripId,
      },
    });

    revalidatePath(`/trips/${data.tripId}`);
    return { success: true, data: activity };
  } catch (error) {
    console.error("Failed to create activity:", error);
    return { success: false, error: "ไม่สามารถสร้างกิจกรรมได้" };
  }
}

export async function updateActivity(
  id: string,
  tripId: string,
  data: Partial<ActivityFormData>,
) {
  try {
    const activity = await prisma.activity.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.date && { date: new Date(data.date) }),
        ...(data.startTime && { startTime: new Date(data.startTime) }),
        ...(data.endTime && { endTime: new Date(data.endTime) }),
        ...(data.category && { category: data.category }),
        ...(data.location !== undefined && { location: data.location || null }),
        ...(data.notes !== undefined && { notes: data.notes || null }),
      },
    });

    revalidatePath(`/trips/${tripId}`);
    return { success: true, data: activity };
  } catch (error) {
    console.error("Failed to update activity:", error);
    return { success: false, error: "ไม่สามารถแก้ไขกิจกรรมได้" };
  }
}

export async function deleteActivity(id: string, tripId: string) {
  try {
    await prisma.activity.delete({
      where: { id },
    });

    revalidatePath(`/trips/${tripId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete activity:", error);
    return { success: false, error: "ไม่สามารถลบกิจกรรมได้" };
  }
}
