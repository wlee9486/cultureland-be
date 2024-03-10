import { PrismaClient } from '@prisma/client';

const prismaClient = new PrismaClient();

const startTime = Date.now();

export async function seedUser() {
  await prismaClient.user.upsert({
    where: { email: 'testseed@test.com' },
    update: {},
    create: {
      email: 'testseed@test.com',
      password: '$2b$12$bIKclwObrOJD64MVC3gJKeWxtgerA9VsILCQYSqtZgpe3MlCzSKCi',
      userProfile: {
        create: {
          nickname: 'testseed',
        },
      },
    },
  });
  await prismaClient.user.upsert({
    where: { email: 'exampleseed@example.com' },
    update: {},
    create: {
      email: 'exampleseed@example.com',
      password: '$2b$12$bIKclwObrOJD64MVC3gJKeWxtgerA9VsILCQYSqtZgpe3MlCzSKCi',
      userProfile: {
        create: {
          nickname: 'exampleseed',
        },
      },
    },
  });

  const endTime = Date.now();
  console.log(
    `[User] Seeding completed in ${(endTime - startTime) / 1000} seconds.`,
  );
}
