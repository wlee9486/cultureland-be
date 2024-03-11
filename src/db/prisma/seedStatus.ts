import { PrismaClient } from '@prisma/client';
import { utils } from '../../utils';

const prismaClient = new PrismaClient();

const startTime = Date.now();

export async function seedStatus() {
  const apiStatuses = ['공연예정', '공연중', '공연완료'];

  for (const status of apiStatuses) {
    await prismaClient.eventStatus.upsert({
      where: { value: status },
      update: {},
      create: {
        name: utils.integrations.state(status),
        value: status,
      },
    });
  }

  const endTime = Date.now();
  console.log(
    `[Status] Seeding completed in ${(endTime - startTime) / 1000} seconds.`,
  );
}
