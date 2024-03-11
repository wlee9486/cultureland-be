import { PrismaClient } from '@prisma/client';

const prismaClient = new PrismaClient();

const startTime = Date.now();

export async function seedAreas() {
  const areas = [
    '서울특별시',
    '부산광역시',
    '대구광역시',
    '인천광역시',
    '광주광역시',
    '대전광역시',
    '울산광역시',
    '세종특별자치시',
    '경기도',
    '강원도',
    '충청남도',
    '충청북도',
    '전라남도',
    '전라북도',
    '경상남도',
    '경상북도',
    '제주특별자치도',
  ];
  for (const area of areas) {
    await prismaClient.area.upsert({
      where: { name: area },
      update: {},
      create: {
        name: area,
      },
    });
  }

  const endTime = Date.now();
  console.log(
    `[Areas] Seeding completed in ${(endTime - startTime) / 1000} seconds.`,
  );
}
