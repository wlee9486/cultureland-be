export function statusIntegration(apiStatus: string) {
  switch (apiStatus) {
    case '공연예정':
      return '진행예정';
    case '공연중':
      return '진행중';
    case '공연완료':
      return '마감';
    default:
      return '마감';
  }
}
