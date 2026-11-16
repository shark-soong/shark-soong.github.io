/**
 * 사이트 전체 설정.
 * 홈 화면 섹션 순서를 바꾸거나 빼려면 homeSections 배열만 고치면 됩니다.
 * 타임라인(학력·경력)은 'intro' 안 오른쪽 단에 함께 나옵니다.
 * 새 섹션을 만들려면 src/components/sections/ 에 컴포넌트를 만들고
 * src/views/HomePage.astro 의 sectionMap 에 등록한 뒤 여기에 이름을 추가하세요.
 */
export const site = {
  handle: 'shark-soong',
  repoUrl: 'https://github.com/shark-soong/shark-soong.github.io',
  /** 홈 화면에 노출할 대표 프로젝트 최대 개수 (featured: true 우선, 부족하면 최신순으로 채움) */
  featuredLimit: 3,
  /** 홈 화면에 노출할 최근 글 개수 */
  recentPostsLimit: 5,
  homeSections: ['intro', 'projects', 'writing'] as const,
};

export type SectionName = (typeof site.homeSections)[number];
