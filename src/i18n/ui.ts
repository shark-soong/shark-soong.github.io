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
    'nav.about': '소개',
    'nav.projects': '프로젝트',
    'nav.experience': '경력·학력',
    'nav.contact': '연락처',
    'nav.langLabel': '언어 선택',
    'nav.mainLabel': '주요 메뉴',
    'hero.viewProjects': '프로젝트 보기',
    'hero.resume': '이력서 PDF',
    'section.about': 'About',
    'section.projects': 'Selected Projects',
    'section.experience': 'Experience & Education',
    'projects.all': '전체 프로젝트 →',
    'projects.pageTitle': '프로젝트',
    'projects.pageIntro': '지금까지 만든 것들을 모았습니다.',
    'projects.back': '← 전체 프로젝트',
    'projects.repo': '저장소',
    'projects.demo': '데모',
    'projects.role': '역할',
    'projects.period': '기간',
    'projects.fallback': '이 프로젝트는 아직 번역되지 않아 원문으로 표시됩니다.',
    'experience.present': '현재',
    'footer.builtWith': 'Astro로 만들고 GitHub Pages로 배포',
    'meta.description': '프로젝트와 이력을 정리한 포트폴리오',
    '404.title': '페이지를 찾을 수 없어요',
    '404.home': '홈으로',
  },
  en: {
    'nav.about': 'About',
    'nav.projects': 'Projects',
    'nav.experience': 'Experience',
    'nav.contact': 'Contact',
    'nav.langLabel': 'Language',
    'nav.mainLabel': 'Main menu',
    'hero.viewProjects': 'View projects',
    'hero.resume': 'Résumé PDF',
    'section.about': 'About',
    'section.projects': 'Selected Projects',
    'section.experience': 'Experience & Education',
    'projects.all': 'All projects →',
    'projects.pageTitle': 'Projects',
    'projects.pageIntro': 'Things I have built so far.',
    'projects.back': '← All projects',
    'projects.repo': 'Repository',
    'projects.demo': 'Demo',
    'projects.role': 'Role',
    'projects.period': 'Period',
    'projects.fallback': 'This project has not been translated yet, so it is shown in Korean.',
    'experience.present': 'Present',
    'footer.builtWith': 'Built with Astro · Deployed on GitHub Pages',
    'meta.description': 'Portfolio of projects and experience',
    '404.title': 'Page not found',
    '404.home': 'Go home',
  },
} as const satisfies Record<Lang, Record<string, string>>;

export type UiKey = keyof (typeof ui)[typeof defaultLang];
