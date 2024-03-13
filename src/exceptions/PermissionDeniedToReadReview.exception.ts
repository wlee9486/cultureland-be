import { HttpException, HttpStatus } from '@nestjs/common';

export class PermissionDeniedToReadReviewException extends HttpException {
  constructor() {
    super('리뷰 조회 권한이 없습니다.', HttpStatus.FORBIDDEN);
  }
}
