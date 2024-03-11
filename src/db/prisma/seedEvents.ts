import { PrismaClient } from '@prisma/client';
import { utils } from '../../utils';
const detailEvents = require('../data/detailData/detailEvents.json');

const prismaClient = new PrismaClient();

export async function seedEvents() {
  const startTime = Date.now();

  const batchSize = 60;
  const totalEvents = detailEvents.length;
  let startIndex = 0;

  while (startIndex < totalEvents) {
    const endIndex = Math.min(startIndex + batchSize, totalEvents);

    const batchEvents = detailEvents.slice(startIndex, endIndex);

    const promises = batchEvents.map(async (event) => {
      const descriptionImagesData =
        event.styurls && event.styurls.styurl
          ? Array.isArray(event.styurls.styurl)
            ? event.styurls.styurl.map((url) => ({ imageUrl: url }))
            : [{ imageUrl: event.styurls.styurl }]
          : [];

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
              where: { value: event.area ? event.area : '기타' },
              create: {
                value: event.area,
                name: utils.integrations.area(event.area),
              },
            },
          },
          startDate: utils.day(event.prfpdfrom).startOf('day').toDate(),
          endDate: utils.day(event.prfpdto).startOf('day').toDate(),
          venue: {
            connect: { apiId: event.mt10id },
          },
          category: {
            connectOrCreate: {
              where: {
                value: event.genrenm ? event.genrenm : '정보없음',
              },
              create: {
                value: event.genrenm,
                name: utils.integrations.category(event.genrenm),
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
                connectOrCreate: {
                  where: {
                    value: event.prfstate ? event.prfstate : '정보없음',
                  },
                  create: {
                    name: utils.integrations.state(event.prfstate),
                    value: event.prfstate,
                  },
                },
              },
            },
          },
        },
      });

      return promise; // 각 프로미스 반환
    });

    // 현재 배치의 작업들을 수행
    await Promise.all(promises);

    startIndex += batchSize; // 다음 배치의 시작 인덱스로 이동
  }

  // 작업이 완료된 후에 실행할 코드
  const endTime = Date.now();
  console.log(
    `[Events] Seeding completed in ${(endTime - startTime) / 1000} seconds.`,
  );
}
