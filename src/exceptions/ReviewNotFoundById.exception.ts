import { HttpException, HttpStatus } from '@nestjs/common';

export class ReviewNotFoundById extends HttpException {
  constructor() {
    super('리뷰를 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
  }
}
