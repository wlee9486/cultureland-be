import { Injectable } from '@nestjs/common';
import { hash } from 'bcrypt';
import { PrismaService } from 'src/db/prisma/prisma.service';
import { AccountsService } from '../accounts.service';
import { SignUpRequestDto } from './partners.dto';

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

  async signUp(dto: SignUpRequestDto) {
    const {
      email,
      password,
      registrationId,
      phoneNumber,
      name,
      ownerName,
      address,
      bankName,
      bankAccount,
    } = dto;

    const encryptedPassword = await hash(password, 12);

    const partner = await this.prismaService.partner.create({
      data: {
        email,
        password: encryptedPassword,
        business: {
          create: {
            registrationId,
            phoneNumber,
            name,
            ownerName,
            address,
            bankName,
            bankAccount,
          },
        },
      },
      select: { id: true, email: true },
    });

    const accessToken = this.accountsService.generateAccessToken(
      partner,
      'partner',
    );

    return accessToken;
  }
}
