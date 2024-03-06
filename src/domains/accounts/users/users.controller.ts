import { Controller, Get, Query } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('accounts/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('email-check')
  async emailCheck(@Query('email') email) {
    const isExistingEmail = await this.usersService.emailCheck(email);

    return isExistingEmail;
  }
}
