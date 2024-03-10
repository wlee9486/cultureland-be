import { HttpException, HttpStatus } from '@nestjs/common';
import { UserNotFound } from './UserNotFound.exception';

export class UserNotFoundById extends HttpException implements UserNotFound {
  constructor() {
    super('해당 ID를 가진 회원을 찾을 수 없습니다', HttpStatus.NOT_FOUND);
  }
}
