import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { langs, type Lang } from '@/i18n/ui';
import { getPosts, getProfile, localizePath, useTranslations } from '@/i18n/utils';

export function getStaticPaths() {
  return langs.map((lang) => ({ params: { lang } }));
}

/** /ko/rss.xml, /en/rss.xml — 영어 피드에는 번역된 글만 들어갑니다. */
export async function GET(context: APIContext) {
  const lang = context.params.lang as Lang;
  const t = useTranslations(lang);
  const profile = await getProfile(lang);
  const posts = (await getPosts(lang)).filter((p) => !p.isFallback);

  return rss({
    title: `${profile.data.name} — ${t('nav.writing')}`,
    description: t('writing.pageIntro'),
    site: context.site!,
    items: posts.map(({ slug, entry }) => ({
      title: entry.data.title,
      description: entry.data.description,
      pubDate: entry.data.date,
      categories: entry.data.tags,
      link: localizePath(lang, `/writing/${slug}/`),
    })),
    customData: `<language>${lang === 'ko' ? 'ko-KR' : 'en-US'}</language>`,
  });
}
