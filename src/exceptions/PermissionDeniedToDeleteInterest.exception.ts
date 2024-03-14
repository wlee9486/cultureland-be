import { HttpException, HttpStatus } from '@nestjs/common';

export class PermissionDeniedToDeleteInterestException extends HttpException {
  constructor() {
    super('해당 관심을 수정할 권한이 없습니다.', HttpStatus.FORBIDDEN);
  }
}
