import { PrismaClient } from '@prisma/client';

const prismaClient = new PrismaClient();

const startTime = Date.now();

export async function seedCategories() {
  const categories = [
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
  for (const category of categories) {
    await prismaClient.category.upsert({
      where: { value: category },
      update: {},
      create: {
        value: category,
      },
    });
  }

  const endTime = Date.now();
  console.log(
    `[Categories] Seeding completed in ${(endTime - startTime) / 1000} seconds.`,
  );
}
