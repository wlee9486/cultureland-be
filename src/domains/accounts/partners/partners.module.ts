import { Module, forwardRef } from '@nestjs/common';
import { AccountsModule } from '../accounts.module';
import { PartnersController } from './partners.controller';
import { PartnersService } from './partners.service';

@Module({
  imports: [forwardRef(() => AccountsModule)],
  controllers: [PartnersController],
  providers: [PartnersService],
  exports: [PartnersService],
})
export class PartnersModule {}
