import { HttpException, HttpStatus } from '@nestjs/common';

export class TokenNotFoundException extends HttpException {
  constructor() {
    super('토큰을 찾을 수 없습니다.', HttpStatus.UNAUTHORIZED);
  }
}
