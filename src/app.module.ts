import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './db/prisma/prisma.module';
import { DomainsModule } from './domains/domains.module';

@Module({
  imports: [
    DomainsModule,
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env`, `.env.${process.env.NODE_ENV}`],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
