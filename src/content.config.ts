/**
 * 콘텐츠 스키마 — 각 항목에 어떤 필드가 들어가는지 정의합니다.
 * 필드를 추가하고 싶으면 여기에 한 줄 추가하면 됩니다.
 * 필수 필드를 빠뜨리면 빌드할 때 어느 파일의 어느 필드인지 알려줍니다.
 *
 * 파일 위치 규칙: src/content/<컬렉션>/<언어>/<이름>.<확장자>
 *   예) src/content/projects/ko/my-project.md
 *       src/content/projects/en/my-project.md   ← 같은 파일명 = 같은 프로젝트의 번역
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  // `_`로 시작하는 파일은 무시합니다 (임시 메모, 초안 템플릿 등).
  loader: glob({ base: './src/content/projects', pattern: '**/[^_]*.{md,mdx}' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string(), // 목록에 보이는 한 줄 설명
      date: z.coerce.date().optional(), // 정렬 기준 (최근순). 예: 2025-06-01
      period: z.string().optional(), // 화면에 보이는 기간. 예: "2025.03 – 2025.06"
      role: z.string().optional(), // 예: "개인 프로젝트", "팀 리드 (4인)"
      tags: z.array(z.string()).default([]),
      featured: z.boolean().default(false), // true면 홈 화면에 노출
      order: z.number().default(0), // 같은 날짜일 때 우선순위 (클수록 위)
      repo: z.url().optional(),
      demo: z.url().optional(),
      thumbnail: image().optional(), // 같은 폴더 기준 상대 경로. 예: ./images/thumb.png
      draft: z.boolean().default(false), // true면 사이트에 나오지 않음
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

const profile = defineCollection({
  // src/content/profile/ko.yaml, en.yaml
  loader: glob({ base: './src/content/profile', pattern: '*.{yaml,yml}' }),
  schema: z.object({
    name: z.string(),
    eyebrow: z.string(), // 이름 위 작은 글씨. 예: "전자·컴퓨터공학 · 서울"
    greeting: z.string(), // 큰 제목 첫 줄. 예: "안녕하세요,"
    headline: z.string(), // 큰 제목 둘째 줄. 예: "홍길동입니다."
    intro: z.string(), // 제목 아래 소개 문단
    about: z.string(), // About 섹션 본문
    skills: z.array(z.string()).default([]),
    contactTitle: z.string(),
    links: z.object({
      github: z.url().optional(),
      email: z.email().optional(),
      linkedin: z.url().optional(),
      blog: z.url().optional(),
    }),
    resume: z.string().optional(), // public/ 기준 경로. 예: "/resume/resume-ko.pdf"
  }),
});

export const collections = { projects, experience, profile };
