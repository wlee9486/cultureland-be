# 💃 컬처랜드
유데미 X 사람인 취업 부트캠프 팀 프로젝트
<br/>
<br/>

## 프로젝트 소개
- 컬처랜드는 문화 컨텐츠 정보를 제공하고, 사용자들 간 리뷰를 공유하며 이벤트 예매처를 연결해주는 플랫폼입니다.
- 유저들은 자신이 관심 있는 문화 활동에 대한 정보를 얻을 수 있을 뿐만 아니라, 다른 이용자들의 리뷰를 통해 실제 경험을 공유할 수 있습니다.
- [API 명세서](https://documenter.getpostman.com/view/33400198/2sA2xe5EnT)
  
<br/>
<br/>

## 개발 기간
2024년 2월 29일 ~ 2024년 3월 15일(16일)

<br/>
<br/>

## 멤버 구성
| 이름            | 담당                       |
| -------------- | -------------------------- | 
| 고현아(팀장)| Base Data Seeding, Batch, 문화 이벤트 관련 api 구현 |
| 이휘성 | 유저 관련 api 구현, 리뷰 관련 api 구현, API 명세 |

<br/>
<br/>

## 기술 스택
![Typescript](https://img.shields.io/badge/Typescript-3178C6?style=flat-square&logo=Typescript&logoColor=white)
![NestJs](https://img.shields.io/badge/-NestJs-ea2845?style=flat-square&logo=nestjs&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=flat-square&logo=Prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/postgresql-4169e1?style=flat-square&logo=postgresql&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=flat-square&logo=amazon-aws&logoColor=white)

<br/>
<br/>

## DB 구조
![erd](https://i.postimg.cc/yxH0VpV4/prisma-erd.png)
<br/>

## 깃허브 전략
### Branch 관리 규칙
- dev : 개발 서버에 배포하는 데 사용되는 주요 개발 브랜치
- feat : 이슈에 해당하는 기능을 개발하기 위한 브랜치
- fix : 버그 수정이나 기존 기능의 오류를 해결하기 위한 브랜치
<br/>
<br/>

### Commit Convention
| 유형 | 설명 | 
| --- | --- |
| init | Begin a project |
| feat | 새로운 기능 추가 (자료 추가 포함) |
| fix | 버그 수정 (자료 수정) |
| refactor | 코드 리팩토링 |
| comment | 주석 추가(코드 변경 X) 혹은 오타 수정 |
| docs | README 문서 수정 (전체 개괄이나 목차만 있는 readme 파일) |
| merge | merge |
| rename | 파일, 폴더명 수정 혹은 이동 |
| style | 코드 포맷팅, 세미콜론 누락 등 |
| design | CSS 등 사용자 UI 디자인 변경 |
| chore | 빌드 업무 수정, 패키지 매니저 수정, 패키지 관리자 구성 등 업데이트, Production Code 변경 없음 |

<br/>
<br/>

## 핵심 기능
유저
- 회원가입 및 로그인 기능
- 카카오 소셜 로그인 기능
- 유저 정보 변경 기능
- 다른 유저를 팔로우하거나 언팔로우할 수 있는 기능

이벤트
- 이벤트에 대한 상세 정보 조회 가능
- 지도와 위치정보를 활용하여 이벤트 탐색 가능
- 관심 있는 이벤트를 관리할 수 있는 기능 제공

리뷰
- 이벤트의 리뷰 정보 확인 가능
- 이벤트에 대한 리뷰 작성, 수정 및 삭제 기능
- 다른 유저의 리뷰 정보 확인 기능
- 다른 유저의 리뷰에 대한 좋아요/싫어요 반응 기능

<br/>
<br/>

