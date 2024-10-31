"use server";

import prisma from "@/lib/prisma";

export async function getOrCreateUser(clerkId: string, userInfo: any) {
  return await prisma.user.upsert({
    where: { clerkId },
    update: {},
    create: {
      clerkId,
      username: userInfo.username,
      name: userInfo.name,
      email: userInfo.email,
    },
  });
}
