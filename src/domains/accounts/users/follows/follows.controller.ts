import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { FollowsService } from './follows.service';

@Controller('accounts/users')
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Get(':userId/follows/followers')
  async getFollowers(@Param('userId', ParseIntPipe) userId: number) {
    return this.followsService.getFollowers(userId);
  }
}
