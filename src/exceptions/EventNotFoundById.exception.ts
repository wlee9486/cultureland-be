import { EventNotFoundException } from './EventNotFound.exception copy';

export class EventNotFoundByIdException extends EventNotFoundException {
  constructor() {
    super('해당 ID를 가진 이벤트를 찾을 수 없습니다');
  }
}
