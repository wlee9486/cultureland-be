import { Module } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { UsersModule } from './users/users.module';

@Module({
  imports: [UsersModule],
  providers: [AccountsService],
  exports: [AccountsService],
})
export class AccountsModule {}
