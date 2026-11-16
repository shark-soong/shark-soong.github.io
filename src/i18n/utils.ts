import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import { defaultLang, langs, ui, type Lang, type UiKey } from './ui';

/** 고정 문구 번역 함수: const t = useTranslations(lang); t('nav.about') */
export function useTranslations(lang: Lang) {
  return (key: UiKey): string => ui[lang][key] ?? ui[defaultLang][key];
}

/** 언어가 붙은 경로 만들기: localizePath('en', '/projects/') → '/en/projects/' */
export function localizePath(lang: Lang, path = '/'): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `/${lang}${clean}`.replace(/\/{2,}/g, '/');
}

/** 현재 URL에서 언어 부분만 바꾼 경로 (언어 전환 버튼용) */
export function switchLangPath(pathname: string, target: Lang): string {
  const parts = pathname.split('/').filter(Boolean);
  if (parts[0] === '404') return localizePath(target, '/');
  if (parts.length && (langs as string[]).includes(parts[0])) parts.shift();
  const last = parts.at(-1) ?? '';
  const isFile = last.includes('.');
  return localizePath(target, `/${parts.join('/')}${parts.length && !isFile ? '/' : ''}`);
}

/** 날짜 표기: ko "2026. 11. 12.", en "Nov 12, 2026" */
export function formatDate(date: Date, lang: Lang, style: 'long' | 'short' = 'long'): string {
  const locale = lang === 'ko' ? 'ko-KR' : 'en-US';
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: style === 'long' ? (lang === 'ko' ? 'long' : 'short') : '2-digit',
    day: style === 'long' ? 'numeric' : '2-digit',
    timeZone: 'Asia/Seoul',
  }).format(date);
}

/** 콘텐츠 id("ko/my-project")를 언어와 slug로 분리 */
export function splitId(id: string): { lang: Lang; slug: string } {
  const [lang, ...rest] = id.split('/');
  return { lang: lang as Lang, slug: rest.join('/') };
}

export async function getProfile(lang: Lang) {
  const entry = (await getEntry('profile', lang)) ?? (await getEntry('profile', defaultLang));
  if (!entry) throw new Error('src/content/profile/ko.md 파일이 필요합니다.');
  return entry;
}

type Localizable = 'projects' | 'writing' | 'pages';

export type Localized<C extends Localizable> = {
  slug: string;
  entry: CollectionEntry<C>;
  /** 이 언어 번역이 없어 기본 언어(한국어) 원문을 대신 보여주는 경우 true */
  isFallback: boolean;
  /** 실제 콘텐츠의 언어 */
  contentLang: Lang;
};
export type LocalizedProject = Localized<'projects'>;
export type LocalizedPost = Localized<'writing'>;

/**
 * 해당 언어의 콘텐츠 목록. 번역이 없는 항목은 기본 언어(한국어) 원문으로 채웁니다.
 * draft: true 인 항목은 빠집니다.
 */
export async function getLocalized<C extends Localizable>(collection: C, lang: Lang): Promise<Localized<C>[]> {
  const all = (await getCollection(collection)) as CollectionEntry<C>[];
  const bySlug = new Map<string, Partial<Record<Lang, CollectionEntry<C>>>>();
  for (const entry of all) {
    if ('draft' in entry.data && entry.data.draft) continue;
    const { lang: l, slug } = splitId(entry.id);
    bySlug.set(slug, { ...bySlug.get(slug), [l]: entry });
  }
  const result: Localized<C>[] = [];
  for (const [slug, versions] of bySlug) {
    const entry = versions[lang] ?? versions[defaultLang] ?? Object.values(versions)[0];
    if (entry) result.push({ slug, entry, isFallback: !versions[lang], contentLang: splitId(entry.id).lang });
  }
  return result;
}

/** 프로젝트: date 최신순 → order 큰 순 → 제목순 */
export async function getProjects(lang: Lang): Promise<LocalizedProject[]> {
  const items = await getLocalized('projects', lang);
  return items.sort((a, b) => {
    const da = a.entry.data.date?.getTime() ?? 0;
    const db = b.entry.data.date?.getTime() ?? 0;
    if (db !== da) return db - da;
    if (b.entry.data.order !== a.entry.data.order) return b.entry.data.order - a.entry.data.order;
    return a.entry.data.title.localeCompare(b.entry.data.title);
  });
}

/** 글: 발행일 최신순 */
export async function getPosts(lang: Lang): Promise<LocalizedPost[]> {
  const items = await getLocalized('writing', lang);
  return items.sort((a, b) => b.entry.data.date.getTime() - a.entry.data.date.getTime());
}

export async function getPages(lang: Lang) {
  return getLocalized('pages', lang);
}

export type ExperienceKind = CollectionEntry<'experience'>['data']['kind'];

/**
 * 학력·경력·활동·수상 항목. kinds 로 종류를 골라 가져옵니다.
 * 해당 언어에 항목이 하나도 없으면 기본 언어(한국어) 항목을 대신 보여줍니다.
 * sort: 'order' = order 큰 순(타임라인), 'recent' = 시작일 최신순(활동·수상)
 */
export async function getExperience(lang: Lang, kinds?: readonly ExperienceKind[], sort: 'order' | 'recent' = 'order') {
  const all = (await getCollection('experience')).filter((e) => !kinds || kinds.includes(e.data.kind));
  let items = all.filter((e) => splitId(e.id).lang === lang);
  if (items.length === 0) items = all.filter((e) => splitId(e.id).lang === defaultLang);
  return items.sort((a, b) =>
    sort === 'recent'
      ? b.data.start.localeCompare(a.data.start) || b.data.order - a.data.order
      : b.data.order - a.data.order || b.data.start.localeCompare(a.data.start),
  );
}
