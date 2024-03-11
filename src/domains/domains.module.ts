import { Module } from '@nestjs/common';
import { AccountsModule } from './accounts/accounts.module';
import { PartnersModule } from './accounts/partners/partners.module';
import { UsersModule } from './accounts/users/users.module';
import { EventsModule } from './events/events.module';
import { ReviewsModule } from './reviews/reviews.module';

@Module({
  imports: [
    AccountsModule,
    EventsModule,
    PartnersModule,
    UsersModule,
    ReviewsModule,
  ],
})
export class DomainsModule {}
