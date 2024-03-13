import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { InterestsModule } from './interests/interests.module';

@Module({
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
  imports: [InterestsModule],
})
export class EventsModule {}
