import dayjs from 'dayjs';
import locale from 'dayjs/locale/ko';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale(locale);
dayjs.tz.setDefault('Asia/Seoul');

export default function dayUtil(...args: Parameters<typeof dayjs>) {
  return dayjs(...args);
}
