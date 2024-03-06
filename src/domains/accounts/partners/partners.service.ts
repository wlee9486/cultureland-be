import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma/prisma.service';
import { AccountsService } from '../accounts.service';

@Injectable()
export class PartnersService {
  constructor(
    private readonly accountsService: AccountsService,
    private readonly prismaService: PrismaService,
  ) {}

  async emailCheck(email: string) {
    const existingEmail = await this.prismaService.partner.count({
      where: { email },
    });

    return !!existingEmail;
  }
}
