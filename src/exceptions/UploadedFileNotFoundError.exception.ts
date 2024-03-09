import { HttpException, HttpStatus } from '@nestjs/common';

export class UploadedFileNotFoundError extends HttpException {
  constructor() {
    super('업로드된 파일이 존재하지 않습니다.', HttpStatus.BAD_REQUEST);
  }
}
