import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { Private } from 'src/decorators/private.decorator';
import { DUser } from 'src/decorators/user.decorator';
import { FollowsService } from './follows.service';

@Controller('accounts/users')
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Get(':userId/follows/followers')
  async getFollowers(@Param('userId', ParseIntPipe) userId: number) {
    return this.followsService.getFollowers(userId);
  }

  @Get(':userId/follows/followings')
  async getFollowings(@Param('userId', ParseIntPipe) userId: number) {
    return this.followsService.getFollowings(userId);
  }

  @Post(':userId/follows')
  @Private('user')
  async addFollow(
    @DUser() signedInUser: User,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.followsService.addFollow(signedInUser, userId);
  }

  @Delete(':userId/follows')
  @Private('user')
  async deleteFollow(
    @DUser() signedInUser: User,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.followsService.deleteFollow(signedInUser, userId);
  }
}
