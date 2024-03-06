import { HttpException, HttpStatus } from '@nestjs/common';

export class UserNotFoundByEmail extends HttpException {
  constructor() {
    super('회원을 찾을 수 없습니다', HttpStatus.NOT_FOUND);
  }
}
