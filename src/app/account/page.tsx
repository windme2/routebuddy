import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import AccountClient from "./AccountClient";

export default async function AccountPage() {
  const session = await auth();
  
  // Session user id is set via JWT callback in auth.config.ts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (session?.user as any)?.id;
  
  if (!session || !userId) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, username: true, createdAt: true },
  });

  if (!user) redirect("/login");

  return <AccountClient user={user} />;
}
