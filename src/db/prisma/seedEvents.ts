import { PrismaClient } from '@prisma/client';
import dayUtil from '../../utils/day';
const detailEvents = require('../data/detailData/detailEvents.json');

const prismaClient = new PrismaClient();

export async function seedEvents() {
  const startTime = Date.now();

  // 프로미스 배열 초기화
  const promises = [];

  for (const event of detailEvents) {
    const descriptionImagesData =
      event.styurls && event.styurls.styurl
        ? Array.isArray(event.styurls.styurl)
          ? event.styurls.styurl.map((url) => ({ imageUrl: url }))
          : [{ imageUrl: event.styurls.styurl }]
        : [];

    const apiStatus = event.prfstate;
    const status =
      apiStatus === '공연완료'
        ? '마감'
        : apiStatus === '공연중'
          ? '진행중'
          : '진행예정';

    const apiArea = event.area;
    const area = apiArea ? apiArea : '정보 없음';

    const apiCategory = event.genrenm;
    const category = apiCategory ? apiCategory : '정보 없음';
    console.log(event);

    const promise = prismaClient.event.upsert({
      where: { apiId: event.mt20id },
      update: {},
      create: {
        apiId: event.mt20id,
        partner: {
          connectOrCreate: {
            where: { email: 'partner@partner.com' },
            create: {
              email: 'partner@partner.com',
              password:
                '$2b$12$TrhHXd/GctbK8HTUkAxBv.C8nujcjbPfAUgjG38IL/l1fSrW9cWH2',
              business: {
                create: {
                  address: '서울특별시 중구 청계천로 24',
                  name: '유데미 부트캠프 1기 moyeorak팀',
                  ownerName: '고현아',
                  bankName: '웅진은행',
                  bankAccount: '999-999-9999-9999',
                  phoneNumber: '010-0000-0000',
                  registrationId: '000000000000',
                },
              },
            },
          },
        },
        title: event.prfnm,
        poster: event.poster,
        area: {
          connectOrCreate: {
            where: { name: area },
            create: { name: area },
          },
        },
        startDate: dayUtil(event.prfpdfrom).startOf('day').toDate(),
        endDate: dayUtil(event.prfpdto).startOf('day').toDate(),
        venue: {
          connect: { apiId: event.mt10id },
        },
        category: {
          connectOrCreate: {
            where: {
              value: category,
            },
            create: {
              value: category,
            },
          },
        },
        eventDetail: {
          create: {
            description: event.sty,
            description_images: {
              createMany: {
                data: descriptionImagesData,
                skipDuplicates: true,
              },
            },
            price: event.pcseguidance,
            runtime: event.prfruntime,
            timeInfo: event.dtguidance,
            targetAudience: event.prfage,
            eventStatus: {
              connect: { status },
            },
          },
        },
      },
    });

    promises.push(promise);
    prismaClient.$disconnect;
  }

  // 모든 프로미스가 완료될 때까지 기다림
  await Promise.all(promises);

  // const endTime = Date.now();
  // console.log(
  //   `[Events] Seeding completed in ${(endTime - startTime) / 1000} seconds.`,
  // );
}
