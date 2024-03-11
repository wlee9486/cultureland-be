import { PrismaClient } from '@prisma/client';
import { utils } from '../../utils';

const prismaClient = new PrismaClient();

const startTime = Date.now();

export async function seedAreas() {
  const apiAreas = [
    '서울특별시',
    '부산광역시',
    '대구광역시',
    '인천광역시',
    '광주광역시',
    '대전광역시',
    '울산광역시',
    '세종특별자치시',
    '경기도',
    '강원특별자치도',
    '충청남도',
    '충청북도',
    '전라남도',
    '전라북도',
    '경상남도',
    '경상북도',
    '제주특별자치도',
    '해외',
    '기타',
  ];

  for (const area of apiAreas) {
    await prismaClient.area.upsert({
      where: {
        name: utils.integrations.area(area),
        value: area,
      },
      update: {},
      create: {
        name: utils.integrations.area(area),
        value: area,
      },
    });
  }

  const endTime = Date.now();
  console.log(
    `[Areas] Seeding completed in ${(endTime - startTime) / 1000} seconds.`,
  );
}
