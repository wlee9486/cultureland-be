export class SignUpRequestDto {
  email: string;
  password: string;
  registrationId: string;
  phoneNumber: string;
  name: string;
  ownerName: string;
  address: string;
  bankName: string;
  bankAccount: string;
}

export class SignInRequestDto {
  email: string;
  password: string;
}
