import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import * as cheerio from 'cheerio';
import { PrismaService } from 'src/db/prisma/prisma.service';
import { EventNotFoundByIdException } from 'src/exceptions/EventNotFoundById.exception';

@Injectable()
export class EventsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  pageSize = this.configService.getOrThrow<number>('PAGESIZE_EVENT_LIST');

  async getEvents(
    category,
    area: string,
    orderBy: 'recent' | 'popular',
    page: number,
  ) {
    const orderOption = {};
    if (orderBy == 'recent') {
      orderOption['startDate'] = 'desc';
    } else {
      orderOption['interestedUsers'] = { _count: 'desc' };
    }
    const categoryOption = {};
    if (category && category !== '전체') categoryOption['name'] = category;
    const areaOption = {};
    if (area) areaOption['name'] = area;

    const options = {
      AND: [{ category: categoryOption }, { area: areaOption }],
    };
    const events = await this.prismaService.event.findMany({
      where: options,
      include: {
        venue: true,
        category: true,
        area: true,
        _count: true,
      },
      orderBy: { startDate: 'desc' },
      skip: Number(this.pageSize) * (page - 1),
      take: Number(this.pageSize),
    });
    const eventsCount = await this.prismaService.event.count({
      where: options,
    });

    const eventsWithAvgRating = await Promise.all(
      events.map(async (event) => {
        const aggregate = await this.prismaService.review.aggregate({
          _avg: {
            rating: true,
          },
          where: {
            eventId: event.id,
            deletedAt: null,
          },
        });
        return {
          ...event,
          avgRating: aggregate._avg.rating ? aggregate._avg.rating : 0,
        };
      }),
    );

    const data = {
      events: eventsWithAvgRating,
      totalEventsCnt: eventsCount,
    };
    return { data };
  }

  async getEventsForHome(
    category,
    area: string,
    orderBy: 'recent' | 'popular',
  ) {
    const orderOption = {};
    if (orderBy == 'recent') {
      orderOption['startDate'] = 'desc';
    } else {
      orderOption['interestedUsers'] = { _count: 'desc' };
    }
    const categoryOption = {};
    if (category !== '전체') categoryOption['name'] = category;
    const areaOption = {};
    if (area) areaOption['name'] = area;
    const options = {
      where: {
        AND: [
          { category: categoryOption },
          { area: areaOption },
          { eventDetail: { eventStatus: { isNot: { code: 3 } } } },
        ],
      },
      orderBy: orderOption,
      include: {
        venue: true,
        category: true,
        area: true,
        _count: true,
      },
      take: 10,
    };
    const events = await this.prismaService.event.findMany(options);
    const data = {
      events,
    };
    return data;
  }

  async searchEventsForMap(category: string, la: number, lo: number) {
    category == '전체' ? undefined : category;
    const eventsWithDistance = (await this.prismaService.$queryRaw`
      SELECT "Event".id, "Event"."venueId",
        COALESCE(AVG("Review".rating), 0) AS averageRating,
        earth_distance(
          ll_to_earth("Venue".latitude, "Venue".longitude),
          ll_to_earth(${la}, ${lo})
        ) AS distance
      FROM "Event"
      JOIN "Category" ON "Category"."code" = "Event"."categoryCode"
      JOIN "Venue" ON "Venue".id = "Event"."venueId" 
      JOIN "EventDetail" ON "EventDetail"."eventId" = "Event".id
      JOIN "EventStatus" ON "EventStatus".code = "EventDetail"."eventStatusCode"
      LEFT JOIN "Review" ON "Review"."eventId" = "Event".id AND "Review"."deletedAt" IS NULL
      WHERE "EventStatus"."name" <> '마감' ${
        category ? Prisma.sql`AND "Category".name = ${category}` : Prisma.empty
      }
      GROUP BY "Event".id, "Venue".id
      ORDER BY "distance"
      LIMIT 20
      `) as {
      id: number;
      venueId: number;
      average_rating: string;
      distance: number;
    }[];

    const eventIds = eventsWithDistance.map((event) => event.id);

    const events = await this.prismaService.event.findMany({
      where: { id: { in: eventIds } },
      select: {
        id: true,
        title: true,
        venue: { select: { name: true, latitude: true, longitude: true } },
        category: { select: { name: true } },
        _count: {
          select: {
            reviews: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
      },
    });
    console.log(events);

    const result = events.map((event) => {
      const eventWithDistance = eventsWithDistance.find(
        (_event) => event.id === _event.id,
      );
      return { ...event, ...eventWithDistance };
    });

    return result;
  }

  async searchEvents(
    keywords: string,
    category,
    area: string,
    orderBy: 'recent' | 'popular',
    page: number,
  ) {
    let searchKey;
    if (keywords != ' ') searchKey = keywords.replace(' ', ' | ');

    const orderOption = {};
    if (orderBy == 'recent') {
      orderOption['startDate'] = 'desc';
    } else {
      orderOption['interestedUsers'] = { _count: 'desc' };
    }

    const options = {
      OR: [
        { title: { search: searchKey } },
        { category: { name: { search: searchKey } } },
        { area: { name: { search: searchKey } } },
      ],
      AND: [
        { category: { name: category === '전체' ? undefined : category } },
        { area: { name: area } },
      ],
    };
    const events = await this.prismaService.event.findMany({
      where: options,
      include: {
        venue: true,
        category: true,
        area: true,
        _count: true,
      },
      orderBy: orderOption,
      skip: Number(this.pageSize) * (page - 1),
      take: Number(this.pageSize),
    });
    const eventsCount = await this.prismaService.event.count({
      where: options,
    });

    const eventsWithAvgRating = await Promise.all(
      events.map(async (event) => {
        const aggregate = await this.prismaService.review.aggregate({
          _avg: {
            rating: true,
          },
          where: {
            eventId: event.id,
            deletedAt: null,
          },
        });
        return {
          ...event,
          avgRating: aggregate._avg.rating ? aggregate._avg.rating : 0,
        };
      }),
    );

    const data = {
      events: eventsWithAvgRating,
      totalEventsCnt: eventsCount,
    };
    return { data };
  }

  async getFamousEvents() {
    const famousEvents = await this.prismaService.event.findMany({
      where: { eventDetail: { eventStatus: { isNot: { code: 3 } } } },
      include: {
        area: true,
        reviews: { where: { deletedAt: null } },
        _count: true,
      },
      orderBy: { interestedUsers: { _count: 'desc' } },
      take: 5,
    });

    const famousEventsWithAvgRating = await Promise.all(
      famousEvents.map(async (event) => {
        const aggregate = await this.prismaService.review.aggregate({
          _avg: {
            rating: true,
          },
          where: {
            eventId: event.id,
            deletedAt: null,
          },
        });
        return {
          ...event,
          avgRating: aggregate._avg.rating ? aggregate._avg.rating : 0,
        };
      }),
    );
    const data = {
      event: famousEventsWithAvgRating,
    };

    return data;
  }

  async getEvent(eventId: number) {
    const foundEvent = await this.prismaService.event.findUniqueOrThrow({
      where: { id: eventId },
      include: {
        area: true,
        category: true,
        eventDetail: {
          include: {
            bookingLinks: true,
            description_images: true,
            eventStatus: true,
          },
        },
        venue: true,
        partner: {
          select: {
            business: {
              select: {
                phoneNumber: true,
              },
            },
          },
        },
        _count: {
          select: {
            reviews: {
              where: {
                eventId: eventId,
                deletedAt: null,
              },
            },
          },
        },
        reviews: {
          where: {
            deletedAt: null,
          },
        },
      },
    });
    if (!foundEvent) throw new EventNotFoundByIdException();

    const reviews = foundEvent.reviews;
    const totalReviews = reviews.length;
    let totalRating = 0;
    for (const review of reviews) {
      totalRating += review.rating;
    }
    const avgRating = totalReviews > 0 ? totalRating / totalReviews : 0;

    const data = {
      event: foundEvent,
      avgRating: avgRating.toFixed(1),
    };

    return data;
  }

  async updateEventReservationWebsite() {
    await this.prismaService.bookingLink.deleteMany();
    const events = await this.prismaService.event.findMany({
      select: { id: true, title: true, apiId: true },
      where: { eventDetail: { eventStatus: { value: { not: '공연완료' } } } },
    });

    let count = 0;

    for (const event of events) {
      const { id, title, apiId } = event;

      try {
        const url = `https://www.kopis.or.kr/por/db/pblprfr/pblprfrView.do?menuId=MNU_00020&mt20Id=${apiId}`;
        const response = await fetch(url);
        const html = await response.text();
        const $ = cheerio.load(html);
        const serviceReservationLinks = $('#lpop04 a')
          .map(function (_, el) {
            return {
              name: $(el).text(),
              link: el.attribs['href'],
            };
          })
          .toArray();

        await this.prismaService.bookingLink.deleteMany({
          where: { eventId: id },
        });

        const bookingLinks = await this.prismaService.bookingLink.createMany({
          data: serviceReservationLinks.map(({ name, link }) => ({
            eventId: id,
            name,
            link,
          })),
        });
        console.log(`${++count}/${events.length}`, title, bookingLinks);
      } catch (e) {
        console.log(`${++count}/${events.length}`, title, '에러 발생', e);
      }
    }
  }

  async getCategories() {
    const category = await this.prismaService.category.findMany({
      select: { name: true, code: true },
      distinct: ['name'],
      orderBy: { code: 'asc' },
    });
    category.unshift({ name: '전체', code: 0 });
    return category;
  }

  async getAreas() {
    return await this.prismaService.area.findMany({
      select: { name: true, code: true },
      distinct: ['name'],
      orderBy: { code: 'asc' },
    });
  }
}
