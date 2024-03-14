import {
  Controller,
  Get,
  Param,
  ParseFloatPipe,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  getEventsByPage(
    @Query('category') category?: string,
    @Query('area') area?: string,
    @Query('orderBy') orderBy?: undefined | 'recent' | 'popular',
    @Query('page') page?: number,
  ) {
    return this.eventsService.getEvents(
      category,
      area ? area : '서울',
      orderBy ? orderBy : 'recent',
      page ? page : 1,
    );
  }

  @Get('/home?')
  getEventsForHome(
    @Query('category') category?: string,
    @Query('area') area?: string,
    @Query('orderBy') orderBy?: undefined | 'recent' | 'popular',
  ) {
    return this.eventsService.getEventsForHome(
      category,
      area ? area : '서울',
      orderBy ? orderBy : 'recent',
    );
  }

  @Get('/home/famous')
  getFamousEvents() {
    return this.eventsService.getFamousEvents();
  }

  @Get('/map')
  searchEventsForMap(
    @Query('category') category?: string,
    @Query('la', ParseFloatPipe) la?: number,
    @Query('lo', ParseFloatPipe) lo?: number,
  ) {
    return this.eventsService.searchEventsForMap(category, la, lo);
  }

  @Get('/search')
  searchEvents(
    @Query('keywords') keywords?: string,
    @Query('category') category?: string,
    @Query('area') area?: string,
    @Query('orderBy') orderBy?: undefined | 'recent' | 'popular',
    @Query('page') page?: number,
  ) {
    return this.eventsService.searchEvents(
      keywords ? keywords : ' ',
      category,
      area ? area : '서울',
      orderBy ? orderBy : 'recent',
      page ? page : 1,
    );
  }

  @Get('/category')
  getCategories() {
    return this.eventsService.getCategories();
  }

  @Get('/area')
  getAreas() {
    return this.eventsService.getAreas();
  }

  @Get('/update')
  updateEventReservationWebsite() {
    return this.eventsService.updateEventReservationWebsite();
  }

  @Get('/:eventId')
  getEvent(@Param('eventId', ParseIntPipe) eventId: number) {
    return this.eventsService.getEvent(eventId);
  }
}
