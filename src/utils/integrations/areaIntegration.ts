export function areaIntegration(apiCategory: string) {
  switch (apiCategory) {
    case '서울특별시':
      return '서울';
    case '경기도':
      return '경기';
    case '인천광역시':
      return '인천';
    case '부산광역시':
      return '부산';
    case '광주광역시':
      return '광주';
    case '강원도':
    case '강원특별자치도':
      return '강원';
    case '충청남도':
    case '충청북도':
    case '대전광역시':
    case '세종특별자치시':
      return '충청';
    case '대구광역시':
    case '경상남도':
    case '경상북도':
    case '울산광역시':
      return '경상';
    case '전라남도':
    case '전라북도':
      return '전라';
    case '제주특별자치도':
      return '제주';
    case '해외':
      return '해외';
    default:
      return '기타'; // 기타 또는 알 수 없는 지역의 경우
  }
}
