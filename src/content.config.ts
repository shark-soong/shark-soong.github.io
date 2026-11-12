/**
 * 콘텐츠 스키마 — 각 항목에 어떤 필드가 들어가는지 정의합니다.
 * 필드를 추가하고 싶으면 여기에 한 줄 추가하면 됩니다.
 * 필수 필드를 빠뜨리면 빌드할 때 어느 파일의 어느 필드인지 알려줍니다.
 *
 * 파일 위치 규칙: src/content/<컬렉션>/<언어>/<이름>.<확장자>
 *   예) src/content/writing/ko/my-post.md
 *       src/content/writing/en/my-post.md   ← 같은 파일명 = 같은 글의 번역
 * 번역이 없으면 영어 페이지에서 한국어 원문을 대신 보여줍니다.
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// `_`로 시작하는 파일은 무시합니다 (임시 메모, 템플릿 등).
const md = (dir: string) => glob({ base: `./src/content/${dir}`, pattern: '**/[^_]*.{md,mdx}' });

/** 홈 상단 소개. 본문(마크다운)이 소개 문단이 됩니다 — 링크를 자유롭게 넣을 수 있어요. */
const profile = defineCollection({
  loader: glob({ base: './src/content/profile', pattern: '*.md' }), // ko.md, en.md
  schema: z.object({
    name: z.string(),
    role: z.string(), // 이름 아래 한 줄. 예: "Electrical & Computer Engineering @ Ajou University"
    location: z.string().optional(),
    skills: z.array(z.string()).default([]),
    links: z.object({
      github: z.url().optional(),
      linkedin: z.url().optional(),
      email: z.email().optional(),
      x: z.url().optional(),
    }),
    resume: z.string().optional(), // public/ 기준 경로. 예: "/resume/SoongWe-Lee-Resume.pdf"
  }),
});

const writing = defineCollection({
  loader: md('writing'),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(), // 목록·검색·공유 미리보기에 쓰이는 한두 문장
      date: z.coerce.date(), // 발행일. 예: 2026-11-12
      updated: z.coerce.date().optional(),
      tags: z.array(z.string()).default([]),
      cover: image().optional(),
      draft: z.boolean().default(false), // true면 사이트·RSS에 나오지 않음
    }),
});

const projects = defineCollection({
  loader: md('projects'),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string(), // 목록에 보이는 한 줄 설명
      date: z.coerce.date().optional(), // 정렬 기준 (최근순)
      period: z.string().optional(), // 화면에 보이는 기간. 예: "2025.03 – 2025.06"
      role: z.string().optional(), // 예: "개인 프로젝트", "팀 리드 (4인)"
      tags: z.array(z.string()).default([]),
      featured: z.boolean().default(false), // true면 홈 화면에 노출
      order: z.number().default(0), // 같은 날짜일 때 우선순위 (클수록 위)
      repo: z.url().optional(),
      demo: z.url().optional(),
      thumbnail: image().optional(),
      draft: z.boolean().default(false),
    }),
});

const experience = defineCollection({
  loader: glob({ base: './src/content/experience', pattern: '**/[^_]*.{yaml,yml}' }),
  schema: z.object({
    kind: z.enum(['education', 'work', 'activity', 'award']),
    org: z.string(), // 학교·회사·기관명
    role: z.string(), // 전공·직무·역할
    start: z.string(), // 예: "2023.03"
    end: z.string().optional(), // 비워두면 "현재"
    description: z.string().optional(),
    order: z.number().default(0), // 클수록 위
  }),
});

/** 단독 페이지 (now, uses 등). 파일명이 주소가 됩니다: pages/ko/now.md → /ko/now/ */
const pages = defineCollection({
  loader: md('pages'),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    updated: z.coerce.date().optional(), // "마지막 업데이트" 표시
    nav: z.boolean().default(false), // true면 상단 메뉴에 표시
    navOrder: z.number().default(0),
  }),
});

export const collections = { profile, writing, projects, experience, pages };
