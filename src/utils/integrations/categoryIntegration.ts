export function categoryIntegration(apiCategory: string) {
  switch (apiCategory) {
    case '연극':
      return '연극';
    case '뮤지컬':
      return '뮤지컬';
    case '서양음악(클래식)':
      return '클래식';
    case '한국음악(국악)':
      return '국악';
    case '대중음악':
      return '대중음악';
    case '무용':
      return '무용';
    case '대중무용':
      return '대중무용';
    case '서커스/마술':
      return '서커스/마술';
    case '복합':
      return '복합';
    default:
      return '복합';
  }
}
