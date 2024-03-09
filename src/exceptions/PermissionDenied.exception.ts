import { HttpException, HttpStatus } from '@nestjs/common';

export class PermissionDeniedException extends HttpException {
  constructor() {
    super('리뷰 수정/삭제 권한이 없습니다.', HttpStatus.FORBIDDEN);
  }
}
