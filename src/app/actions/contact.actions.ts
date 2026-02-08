"use server";

import prisma from "@/lib/prisma";

// Add a new contact
export async function createContact(name: string) {
  try {
    const contact = await prisma.savedContact.create({
      data: {
        name: name.trim(),
      },
    });
    return { success: true, data: contact };
  } catch (error) {
    // Check for unique constraint violation
    // @ts-expect-error: Prisma error code typing is not fully exposed in this context
    if (error.code === "P2002") {
      return { success: false, error: "รายชื่อนี้มีอยู่แล้ว" };
    }
    console.error("Failed to create contact:", error);
    return { success: false, error: "ไม่สามารถบันทึกรายชื่อได้" };
  }
}

// Get all contacts sorted by name
export async function getContacts() {
  try {
    const contacts = await prisma.savedContact.findMany({
      orderBy: {
        name: "asc",
      },
    });
    return contacts;
  } catch (error) {
    console.error("Failed to fetch contacts:", error);
    return [];
  }
}

// Search contacts by name
export async function searchContacts(query: string) {
  try {
    const contacts = await prisma.savedContact.findMany({
      where: {
        name: {
          contains: query,
          mode: "insensitive", // Case-insensitive search
        },
      },
      orderBy: {
        name: "asc",
      },
      take: 5, // Limit results
    });
    return contacts;
  } catch (error) {
    console.error("Failed to search contacts:", error);
    return [];
  }
}
