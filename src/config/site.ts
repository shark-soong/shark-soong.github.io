/**
 * 사이트 전체 설정.
 * 홈 화면 섹션 순서를 바꾸거나 빼려면 homeSections 배열만 고치면 됩니다.
 * 타임라인(학력·경력)은 'intro' 안 오른쪽 단에 함께 나옵니다.
 * 'activities'(활동)·'awards'(수상)·'writing'(글)은 항목이 하나도 없으면 자동으로 숨겨집니다.
 * 새 섹션을 만들려면 src/components/sections/ 에 컴포넌트를 만들고
 * src/views/HomePage.astro 의 sectionMap 에 등록한 뒤 여기에 이름을 추가하세요.
 */
export const site = {
  handle: 'shark-soong',
  /** 왼쪽 위에 보이는 사이트 이름 */
  brand: 'Shark-Soong',
  repoUrl: 'https://github.com/shark-soong/shark-soong.github.io',
  /** 홈 화면에 노출할 대표 프로젝트 최대 개수 (featured: true 우선, 부족하면 최신순으로 채움) */
  featuredLimit: 3,
  /** 홈 화면에 노출할 최근 글 개수 */
  recentPostsLimit: 5,
  /** 타임라인에 넣을 종류. 활동(activity)·수상(award)은 아래 별도 섹션으로 나옵니다. */
  timelineKinds: ['education', 'work', 'military'] as const,
  homeSections: ['intro', 'projects', 'activities', 'awards', 'writing'] as const,
};

export type SectionName = (typeof site.homeSections)[number];
