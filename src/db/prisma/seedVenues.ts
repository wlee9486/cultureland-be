import { PrismaClient } from '@prisma/client';
const detailVenues = require('../data/detailData/detailVenues.json');

const prismaClient = new PrismaClient();

export async function seedVenues() {
  const startTime = Date.now();

  // 모든 venue에 대한 upsert 작업을 Promise 배열로 생성
  const upsertPromises = detailVenues.map((venue) =>
    prismaClient.venue.upsert({
      where: { apiId: venue.mt10id },
      update: {},
      create: {
        apiId: venue.mt10id,
        name: venue.fcltynm.trim(),
        address: venue.adres,
        latitude: Number(venue.la),
        longitude: Number(venue.lo),
      },
    }),
  );

  // Promise.all로 생성된 모든 Promise를 하나의 트랜잭션으로 묶음
  await prismaClient.$transaction(upsertPromises);

  const endTime = Date.now();
  console.log(
    `[Venues] Seeding completed in ${(endTime - startTime) / 1000} seconds.`,
  );
}
