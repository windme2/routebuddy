"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addImage(tripId: string, url: string, caption?: string) {
  try {
    const image = await prisma.tripImage.create({
      data: {
        url,
        caption,
        tripId,
      },
    });

    revalidatePath(`/trips/${tripId}`);
    return { success: true, data: image };
  } catch (error) {
    console.error("Failed to add image:", error);
    return { success: false, error: "ไม่สามารถเพิ่มรูปภาพได้" };
  }
}

export async function deleteImage(id: string, tripId: string) {
  try {
    await prisma.tripImage.delete({
      where: { id },
    });

    revalidatePath(`/trips/${tripId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete image:", error);
    return { success: false, error: "ไม่สามารถลบรูปภาพได้" };
  }
}
