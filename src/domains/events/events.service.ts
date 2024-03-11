import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/db/prisma/prisma.service';

@Injectable()
export class EventsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}
  async getEvents(page: number) {
    const pageSize = this.configService.getOrThrow<number>(
      'PAGESIZE_EVENT_LIST',
    );
    return await this.prismaService.event.findMany({
      where: {},
      orderBy: { startDate: 'desc' },
      skip: Number(pageSize) * (page - 1),
      take: Number(pageSize),
    });
  }

  async getEvent(eventId: number) {
    return await this.prismaService.event.findUniqueOrThrow({
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
  }
}
