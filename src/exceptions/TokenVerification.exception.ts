import { HttpException, HttpStatus } from '@nestjs/common';

export class TokenVerificationException extends HttpException {
  constructor() {
    super('유효한 토큰이 아닙니다.', HttpStatus.UNAUTHORIZED);
  }
}
