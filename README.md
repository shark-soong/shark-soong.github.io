# shark-soong.github.io

SoongWe Lee의 개인 사이트입니다. 만든 것(프로젝트)과 배운 것(글)을 기록합니다.
[Astro](https://astro.build)로 만들었고, `main` 브랜치에 push하면 GitHub Actions가 자동으로 GitHub Pages에 배포합니다.

- 🇰🇷 https://shark-soong.github.io/ko/ (기본)
- 🇺🇸 https://shark-soong.github.io/en/

## 로컬 실행

Node.js **22.23.4 이상**이 필요합니다.

```bash
npm install
npm run dev      # http://localhost:4321 (저장하면 바로 반영)
npm run build    # dist/ 에 정적 사이트 생성
npm run check    # 타입·스키마 검사
```

## 폴더 구조

```
src/
├─ content/                    ← 내용 (가장 자주 고치는 곳)
│  ├─ profile/{ko,en}.md       ← 이름, 한 줄 소개, 링크 + 본문이 홈 소개 문단
│  ├─ writing/{ko,en}/*.md     ← 글 1개 = 파일 1개
│  ├─ projects/{ko,en}/*.md    ← 프로젝트 1개 = 파일 1개
│  ├─ experience/{ko,en}/*.yaml← 학력·경력·활동 1개 = 파일 1개
│  └─ pages/{ko,en}/*.md       ← 단독 페이지 (now 등)
├─ content.config.ts           ← 각 콘텐츠에 들어갈 필드 정의 (스키마)
├─ config/site.ts              ← 홈 섹션 순서, 노출 개수
├─ i18n/ui.ts                  ← 메뉴·버튼 같은 고정 문구 번역
├─ styles/tokens.css           ← 색·글꼴·간격 (디자인 바꿀 때)
├─ components/                 ← 헤더, 푸터, 목록 행 등 부품
│  └─ sections/                ← 홈 섹션 (Intro, Writing, Projects, Experience)
├─ views/HomePage.astro        ← 섹션 이름 → 컴포넌트 연결
└─ pages/[lang]/               ← /ko/..., /en/... 경로가 자동 생성됨
public/                        ← 그대로 복사되는 파일 (favicon, 이력서 PDF)
```

**번역 규칙**: `ko/`와 `en/`에 **같은 파일 이름**이 있으면 같은 콘텐츠의 번역입니다. 영어 버전이 없으면 영어 페이지에서 한국어 원문이 안내 문구·배지와 함께 보입니다 (영어 RSS에는 번역된 글만 들어감).

## 자주 하는 작업

### 글 쓰기

`src/content/writing/ko/<글-주소>.md` — 파일 이름이 URL이 됩니다 (`/ko/writing/<글-주소>/`).

```md
---
title: 글 제목
description: 목록·공유 미리보기에 보일 한두 문장
date: 2026-11-12
tags: [astro, 회고]
# updated: 2026-12-01
# cover: ./images/cover.png      # 이 .md 파일 기준 상대 경로
# draft: true                    # 공개 전까지 숨김
---

본문...
```

공개된 글이 하나도 없으면 홈의 Recent Writing 섹션은 자동으로 숨겨집니다.
RSS: `/ko/rss.xml`, `/en/rss.xml`

### 새 프로젝트 추가

`src/content/projects/ko/<프로젝트-이름>.md`:

```md
---
title: 프로젝트 이름
summary: 목록에 보일 한 줄 설명
date: 2026-03-01            # 정렬 기준 (최근순)
period: "2026.03 – 2026.06" # 화면에 보일 기간
role: 개인 프로젝트
tags: [Python, FastAPI]
featured: true              # 홈 화면에 노출
repo: https://github.com/shark-soong/...
# demo: https://...
# thumbnail: ./images/my-project.png
# draft: true
---

## 개요
...
```

### 경력·학력 추가

`src/content/experience/ko/<이름>.yaml` (영어는 `en/`):

```yaml
kind: work          # education | work | military | activity | award
org: 회사·기관명
role: 역할
start: "2026.07"
end: "2026.08"      # 생략하면 "현재"
description: 한 일 한 줄 (선택)
order: 20           # 클수록 위
```

### 홈 소개 문단 고치기

`src/content/profile/ko.md`(영어는 `en.md`)의 **본문**이 홈 상단 소개 문단입니다. 마크다운이라 `[링크](https://...)`를 문장 안에 넣을 수 있어요. 이름, 한 줄 소개, 기술, 링크(GitHub/LinkedIn/Email/X)는 위쪽 frontmatter에서 고칩니다.

### /now 페이지 업데이트

`src/content/pages/ko/now.md`의 본문과 `updated:` 날짜를 고칩니다.
같은 방식으로 `pages/ko/uses.md`를 만들면 `/ko/uses/` 페이지가 생기고, `nav: true`를 주면 상단 메뉴에도 나타납니다.

### 이력서 PDF 연결

1. `public/resume/SoongWe-Lee-Resume.pdf`를 넣고
2. `src/content/profile/ko.md`, `en.md`의 `resume:` 줄 주석을 풉니다. 그러면 홈 링크와 상단 메뉴에 Resume가 생깁니다.

### 홈 화면 섹션 순서 바꾸기 / 빼기

`src/config/site.ts`의 `homeSections` 배열을 수정합니다.

### 새 섹션 만들기 (예: 수상, 발표)

1. `src/components/sections/Talks.astro` 생성 (`lang` prop을 받도록)
2. `src/views/HomePage.astro`의 `sectionMap`에 `talks: Talks` 등록
3. `src/config/site.ts`의 `homeSections`에 `'talks'` 추가

### 콘텐츠에 새 필드 추가

`src/content.config.ts`의 스키마에 한 줄 추가합니다 (예: `team: z.number().optional()`). 그다음 화면에 보여줄 컴포넌트에서 `data.team`을 사용하면 됩니다.

### 디자인 바꾸기

- 색·글꼴·간격: `src/styles/tokens.css`
- 공통 스타일(버튼, 태그, 글 본문): `src/styles/global.css`
- 각 부품의 세부 스타일: 해당 `.astro` 파일 아래쪽의 `<style>`

### 메뉴·버튼 문구 바꾸기 / 언어 추가

`src/i18n/ui.ts`에서 수정합니다. 새 언어를 추가하려면 `languages`와 `ui`에 항목을 추가하고, 콘텐츠 폴더마다 해당 언어 폴더를 만드세요.

## 배포

`.github/workflows/deploy.yml`이 `main`에 push될 때마다 빌드하고 배포합니다.
처음 한 번만 저장소 **Settings → Pages → Build and deployment → Source**를 **GitHub Actions**로 설정하면 됩니다.
