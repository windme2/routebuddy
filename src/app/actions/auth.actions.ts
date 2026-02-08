"use server";

import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function register(data: {
  name: string;
  username: string;
  password: string;
}) {
  const { name, username, password } = data;

  if (!name || !username || !password) {
    return { error: "กรุณากรอกข้อมูลให้ครบ" };
  }

  if (password.length < 6) {
    return { error: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" };
  }

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    return { error: "ชื่อผู้ใช้งานนี้ถูกใช้แล้ว" };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: { name, username, passwordHash },
  });

  return { success: true };
}

export async function updateProfile(data: { name: string }) {
  const session = await auth();
  if (!session?.user?.id) return { error: "ไม่ได้เข้าสู่ระบบ" };

  const { name } = data;
  if (!name?.trim()) return { error: "กรุณาระบุชื่อ" };

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: name.trim() },
  });

  return { success: true };
}

export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "ไม่ได้เข้าสู่ระบบ" };

  const { currentPassword, newPassword } = data;

  if (!currentPassword || !newPassword) {
    return { error: "กรุณากรอกข้อมูลให้ครบ" };
  }

  if (newPassword.length < 6) {
    return { error: "รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร" };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) return { error: "ไม่พบข้อมูลผู้ใช้งาน" };

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) return { error: "รหัสผ่านปัจจุบันไม่ถูกต้อง" };

  const newHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: newHash },
  });

  return { success: true };
}
