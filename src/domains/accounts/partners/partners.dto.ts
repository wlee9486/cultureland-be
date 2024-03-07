import { IsEmail, IsNotEmpty, IsNumberString, IsString } from 'class-validator';

export class SignUpRequestDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  registrationId: string;

  @IsNotEmpty()
  phoneNumber: string;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsString()
  ownerName: string;

  @IsNotEmpty()
  address: string;

  @IsNotEmpty()
  @IsString()
  bankName: string;

  @IsNumberString()
  bankAccount: string;
}

export class SignInRequestDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;
}
