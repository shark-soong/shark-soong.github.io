// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// 저장소 이름이 `shark-soong.github.io`이므로 base 경로는 필요 없습니다.
// 다른 이름의 저장소(예: `portfolio`)에 배포한다면 `base: '/portfolio'`를 추가하세요.
export default defineConfig({
  site: 'https://shark-soong.github.io',
  trailingSlash: 'always',
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'ko',
        locales: { ko: 'ko-KR', en: 'en-US' },
      },
    }),
  ],
});
