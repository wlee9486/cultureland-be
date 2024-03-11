import { PrismaClient } from '@prisma/client';
import { utils } from '../../utils';

const prismaClient = new PrismaClient();

const startTime = Date.now();

export async function seedCategories() {
  const apiCategories = [
    '연극',
    '뮤지컬',
    '서양음악(클래식)',
    '한국음악(국악)',
    '대중음악',
    '무용',
    '대중무용',
    '서커스/마술',
    '복합',
  ];

  for (const category of apiCategories) {
    await prismaClient.category.upsert({
      where: {
        name: utils.integrations.category(category),
        value: category,
      },
      update: {},
      create: {
        name: utils.integrations.category(category),
        value: category,
      },
    });
  }

  const endTime = Date.now();
  console.log(
    `[Categories] Seeding completed in ${(endTime - startTime) / 1000} seconds.`,
  );
}
