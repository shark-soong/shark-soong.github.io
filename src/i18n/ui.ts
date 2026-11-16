/**
 * 화면에 고정으로 보이는 문구(메뉴, 버튼, 섹션 제목)의 번역.
 * 언어를 하나 더 추가하려면:
 *   1) languages 에 추가  2) ui 에 같은 키로 번역 추가
 *   3) src/content 아래 각 컬렉션에 <새 언어> 폴더를 만들고 콘텐츠 추가
 */
export const languages = {
  ko: '한국어',
  en: 'English',
} as const;

export type Lang = keyof typeof languages;
export const defaultLang: Lang = 'ko';
export const langs = Object.keys(languages) as Lang[];

export const ui = {
  ko: {
    'nav.writing': '글',
    'nav.projects': '프로젝트',
    'nav.resume': '이력서',
    'nav.langLabel': '언어 선택',
    'nav.mainLabel': '주요 메뉴',
    'section.writing': '글',
    'section.projects': '프로젝트',
    'section.experience': '타임라인',
    'section.activities': '활동',
    'section.awards': '수상',
    'section.skills': '기술',
    'writing.all': '전체 글 →',
    'writing.pageTitle': '글',
    'writing.pageIntro': '배운 것, 만든 것의 뒷이야기, 생각을 기록합니다.',
    'writing.empty': '첫 글을 준비하고 있어요.',
    'writing.back': '← 전체 글',
    'writing.updated': '수정',
    'projects.all': '전체 프로젝트 →',
    'projects.pageTitle': '프로젝트',
    'projects.pageIntro': '지금까지 만든 것들을 모았습니다.',
    'projects.back': '← 전체 프로젝트',
    'projects.repo': '저장소',
    'projects.demo': '데모',
    'projects.role': '역할',
    'projects.period': '기간',
    'fallback.notice': '아직 번역되지 않아 원문으로 표시됩니다.',
    'fallback.badge': '원문',
    'page.updated': '마지막 업데이트',
    'experience.present': '현재',
    'meta.description': '프로젝트와 글을 기록하는 개인 사이트',
    '404.title': '페이지를 찾을 수 없어요',
    '404.home': '홈으로',
  },
  en: {
    'nav.writing': 'Writing',
    'nav.projects': 'Projects',
    'nav.resume': 'Resume',
    'nav.langLabel': 'Language',
    'nav.mainLabel': 'Main menu',
    'section.writing': 'Writing',
    'section.projects': 'Projects',
    'section.experience': 'Timeline',
    'section.activities': 'Activities',
    'section.awards': 'Awards',
    'section.skills': 'Skills',
    'writing.all': 'All writing →',
    'writing.pageTitle': 'Writing',
    'writing.pageIntro': 'Notes on what I learn, what I build, and what I think about.',
    'writing.empty': 'The first post is on its way.',
    'writing.back': '← All writing',
    'writing.updated': 'Updated',
    'projects.all': 'All projects →',
    'projects.pageTitle': 'Projects',
    'projects.pageIntro': 'Things I have built so far.',
    'projects.back': '← All projects',
    'projects.repo': 'Repository',
    'projects.demo': 'Demo',
    'projects.role': 'Role',
    'projects.period': 'Period',
    'fallback.notice': 'This has not been translated yet, so it is shown in Korean.',
    'fallback.badge': 'KR',
    'page.updated': 'Last updated',
    'experience.present': 'Present',
    'meta.description': 'Personal site with projects and writing',
    '404.title': 'Page not found',
    '404.home': 'Go home',
  },
} as const satisfies Record<Lang, Record<string, string>>;

export type UiKey = keyof (typeof ui)[typeof defaultLang];
