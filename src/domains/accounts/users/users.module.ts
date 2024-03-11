import { Module, forwardRef } from '@nestjs/common';
import { AccountsModule } from '../accounts.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { FollowsModule } from './follows/follows.module';

@Module({
  imports: [forwardRef(() => AccountsModule), FollowsModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
