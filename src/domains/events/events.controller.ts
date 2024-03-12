import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  getEventsByPage(@Query('page') page?: number) {
    return this.eventsService.getEvents(page ? page : 1);
  }
  @Get('search')
  searchEvents(
    @Query('keywords') keywords: string = ' ',
    @Query('page') page?: number,
  ) {
    return this.eventsService.searchEvents(keywords, page ? page : 1);
  }

  @Get('/update')
  updateEventReservationWebsite() {
    return this.eventsService.updateEventReservationWebsite();
  }

  @Get(':eventId')
  getEvent(@Param('eventId', ParseIntPipe) eventId: number) {
    return this.eventsService.getEvent(eventId);
  }
}
