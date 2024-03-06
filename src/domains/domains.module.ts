import { Module } from '@nestjs/common';
import { AccountsModule } from './accounts/accounts.module';
import { PartnersModule } from './accounts/partners/partners.module';
import { UsersModule } from './accounts/users/users.module';

@Module({
  imports: [AccountsModule, PartnersModule, UsersModule],
})
export class DomainsModule {}
