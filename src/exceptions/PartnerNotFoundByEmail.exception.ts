import { HttpException, HttpStatus } from '@nestjs/common';

export class PartnerNotFoundByEmail extends HttpException {
  constructor() {
    super('파트너를 찾을 수 없습니다', HttpStatus.NOT_FOUND);
  }
}
