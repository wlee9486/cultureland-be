import { PrismaClient } from '@prisma/client';

const prismaClient = new PrismaClient();

const startTime = Date.now();

export async function seedStatus() {
  const statuses = [
    { status: '진행중' },
    { status: '진행예정' },
    { status: '마감' },
  ];
  for (const status of statuses) {
    await prismaClient.eventStatus.upsert({
      where: { status: status.status },
      update: {},
      create: status,
    });
  }

  const endTime = Date.now();
  console.log(
    `[Status] Seeding completed in ${(endTime - startTime) / 1000} seconds.`,
  );
}
