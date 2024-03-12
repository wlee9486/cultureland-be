import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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

  async getEvents(page: number) {
    const events = await this.prismaService.event.findMany({
      where: {},
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
      where: {},
    });

    const eventsWithAvgRating = await Promise.all(
      events.map(async (event) => {
        const aggregate = await this.prismaService.review.aggregate({
          _avg: {
            rating: true,
          },
          where: {
            eventId: event.id,
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

  async searchEvents(keywords: string, page: number) {
    const searchKey = keywords.replace(' ', ' | ');
    const options = {
      OR: [
        { title: { search: searchKey } },
        { category: { name: { search: searchKey } } },
        { area: { name: { search: searchKey } } },
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
              },
            },
          },
        },
        reviews: true,
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

    const event = {
      event: foundEvent,
      avgRating: avgRating.toFixed(1),
    };

    return event;
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
}
