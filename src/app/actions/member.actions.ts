"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Add member to trip
export async function addMember(
  tripId: string,
  name: string,
  role: "LEADER" | "MEMBER" = "MEMBER",
) {
  try {
    // Check if member already exists
    const existingMember = await prisma.member.findFirst({
      where: {
        tripId,
        name,
      },
    });

    if (existingMember) {
      return { success: false, error: "สมาชิกนี้อยู่ในทริปแล้ว" };
    }

    // If adding a leader, demote existing leader first
    if (role === "LEADER") {
      await prisma.member.updateMany({
        where: { tripId, role: "LEADER" },
        data: { role: "MEMBER" },
      });
    }

    const member = await prisma.member.create({
      data: {
        name,
        tripId,
        role,
      },
    });

    revalidatePath(`/trips/${tripId}`);
    return { success: true, data: member };
  } catch (error) {
    console.error("Failed to add member:", error);
    return { success: false, error: "ไม่สามารถเพิ่มสมาชิกได้" };
  }
}

// Remove member from trip
export async function removeMember(id: string, tripId: string) {
  try {
    await prisma.member.delete({
      where: { id },
    });

    revalidatePath(`/trips/${tripId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to remove member:", error);
    return { success: false, error: "ไม่สามารถลบสมาชิกได้" };
  }
}

// Get members by trip ID
export async function getMembersByTrip(tripId: string) {
  try {
    const members = await prisma.member.findMany({
      where: { tripId },
      orderBy: { name: "asc" },
    });
    return members;
  } catch (error) {
    console.error("Failed to fetch members:", error);
    return [];
  }
}

// Update member name and role
export async function updateMember(
  id: string,
  tripId: string,
  data: { name?: string; role?: "LEADER" | "MEMBER" },
) {
  try {
    // If setting to leader, demote existing leader first
    if (data.role === "LEADER") {
      await prisma.member.updateMany({
        where: {
          tripId,
          role: "LEADER",
          id: { not: id }, // Don't update self yet
        },
        data: { role: "MEMBER" },
      });
    }

    const member = await prisma.member.update({
      where: { id },
      data,
    });

    revalidatePath(`/trips/${tripId}`);
    return { success: true, data: member };
  } catch (error) {
    console.error("Failed to update member:", error);
    return { success: false, error: "ไม่สามารถแก้ไขข้อมูลสมาชิกได้" };
  }
}
// Get all unique member names for suggestions
export async function getAllUniqueMembers() {
  try {
    const members = await prisma.member.findMany({
      select: { name: true },
      distinct: ["name"],
      orderBy: { name: "asc" },
    });
    return members.map((m) => m.name);
  } catch (error) {
    console.error("Failed to fetch unique members:", error);
    return [];
  }
}
