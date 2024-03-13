import { HttpException, HttpStatus } from '@nestjs/common';

export class InterestNotFoundException extends HttpException {
  constructor() {
    super('해당하는 관심 정보를 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
  }
}
