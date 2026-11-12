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
  return localizePath(target, `/${parts.join('/')}${parts.length ? '/' : ''}`);
}

/** 콘텐츠 id("ko/my-project")를 언어와 slug로 분리 */
export function splitId(id: string): { lang: Lang; slug: string } {
  const [lang, ...rest] = id.split('/');
  return { lang: lang as Lang, slug: rest.join('/') };
}

export async function getProfile(lang: Lang) {
  const entry = (await getEntry('profile', lang)) ?? (await getEntry('profile', defaultLang));
  if (!entry) throw new Error('src/content/profile/ko.yaml 파일이 필요합니다.');
  return entry.data;
}

export type LocalizedProject = {
  slug: string;
  entry: CollectionEntry<'projects'>;
  /** 이 언어 번역이 없어 기본 언어 원문을 대신 보여주는 경우 true */
  isFallback: boolean;
};

/**
 * 해당 언어의 프로젝트 목록. 번역이 없는 프로젝트는 기본 언어(한국어) 원문으로 채웁니다.
 * 정렬: date 최신순 → order 큰 순 → 제목순
 */
export async function getProjects(lang: Lang): Promise<LocalizedProject[]> {
  const all = await getCollection('projects', ({ data }) => !data.draft);
  const bySlug = new Map<string, Partial<Record<Lang, CollectionEntry<'projects'>>>>();
  for (const entry of all) {
    const { lang: l, slug } = splitId(entry.id);
    bySlug.set(slug, { ...bySlug.get(slug), [l]: entry });
  }
  const result: LocalizedProject[] = [];
  for (const [slug, versions] of bySlug) {
    const entry = versions[lang] ?? versions[defaultLang] ?? Object.values(versions)[0];
    if (entry) result.push({ slug, entry, isFallback: !versions[lang] });
  }
  return result.sort((a, b) => {
    const da = a.entry.data.date?.getTime() ?? 0;
    const db = b.entry.data.date?.getTime() ?? 0;
    if (db !== da) return db - da;
    if (b.entry.data.order !== a.entry.data.order) return b.entry.data.order - a.entry.data.order;
    return a.entry.data.title.localeCompare(b.entry.data.title);
  });
}

export async function getExperience(lang: Lang) {
  const all = await getCollection('experience');
  let items = all.filter((e) => splitId(e.id).lang === lang);
  if (items.length === 0) items = all.filter((e) => splitId(e.id).lang === defaultLang);
  return items.sort((a, b) => b.data.order - a.data.order || b.data.start.localeCompare(a.data.start));
}
