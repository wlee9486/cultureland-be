import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { Private } from 'src/decorators/private.decorator';
import { DUser } from 'src/decorators/user.decorator';
import { InterestsService } from './interests.service';

@Controller('events/interests')
export class InterestsController {
  constructor(private readonly interestsService: InterestsService) {}

  @Post()
  @Private('user')
  createInterest(
    @DUser() loggedInUser: User,
    @Body('eventId') eventId: number,
  ) {
    return this.interestsService.createInterest(loggedInUser, eventId);
  }

  @Get(':userId')
  @Private('user', 'guest')
  getUsersInterests(
    @Param('userId', ParseIntPipe) userId: number,
    @DUser() loggedInUser?: User,
    @Query('page') page?: number,
  ) {
    return this.interestsService.getUsersInterests(
      userId,
      loggedInUser,
      page ? page : 1,
    );
  }

  @Delete(':userId/:eventId')
  @Private('user')
  remove(
    @DUser() loggedInUser: User,
    @Param('userId', ParseIntPipe)
    userId: number,
    @Param('eventId', ParseIntPipe)
    eventId: number,
  ) {
    const dto: Prisma.UserInterestedEventsUserIdEventIdCompoundUniqueInput = {
      eventId,
      userId,
    };
    return this.interestsService.deleteInterest(loggedInUser, dto);
  }
}
