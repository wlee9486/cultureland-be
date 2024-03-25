import { HttpException, HttpStatus } from '@nestjs/common';

export class DuplicatedReviewException extends HttpException {
  constructor() {
    super(
      '이미 작성한 리뷰가 존재합니다(1개의 이벤트에는 하나의 리뷰만 작성 가능합니다).',
      HttpStatus.BAD_REQUEST,
    );
  }
}
