import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async emailCheck(email: string) {
    const existingEmail = await this.prismaService.user.count({
      where: { email },
    });

    return !!existingEmail;
  }
}
