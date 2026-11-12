# shark-soong.github.io

개인 포트폴리오·이력서 사이트입니다. [Astro](https://astro.build)로 만들었고, `main` 브랜치에 push하면 GitHub Actions가 자동으로 GitHub Pages에 배포합니다.

- 🇰🇷 https://shark-soong.github.io/ko/
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
├─ content/               ← 내용 (가장 자주 고치는 곳)
│  ├─ profile/ko.yaml     ← 이름, 소개, 기술, 연락처
│  ├─ profile/en.yaml
│  ├─ projects/ko/*.md    ← 프로젝트 1개 = 파일 1개
│  ├─ projects/en/*.md    ← 같은 파일명 = 같은 프로젝트의 영어 버전
│  └─ experience/{ko,en}/*.yaml  ← 학력·경력·활동 1개 = 파일 1개
├─ content.config.ts      ← 각 콘텐츠에 들어갈 필드 정의 (스키마)
├─ config/site.ts         ← 홈 섹션 순서, 대표 프로젝트 개수
├─ i18n/ui.ts             ← 메뉴·버튼 같은 고정 문구 번역
├─ styles/tokens.css      ← 색·글꼴·간격 (디자인 바꿀 때)
├─ components/            ← 헤더, 푸터, 프로젝트 행 등 부품
│  └─ sections/           ← 홈 화면 섹션 (Hero, About, Projects ...)
├─ views/HomePage.astro   ← 섹션 이름 → 컴포넌트 연결
└─ pages/[lang]/          ← /ko/..., /en/... 경로가 자동 생성됨
public/                   ← 그대로 복사되는 파일 (favicon, 이력서 PDF)
```

## 자주 하는 작업

### 새 프로젝트 추가

`src/content/projects/ko/<프로젝트-이름>.md` 파일을 만듭니다. 파일 이름이 URL이 됩니다 (`/ko/projects/<프로젝트-이름>/`).

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
# thumbnail: ./images/my-project.png   # 이 .md 파일 기준 상대 경로
# draft: true                          # 사이트에 안 보이게
---

## 개요
...
```

영어 버전은 `src/content/projects/en/`에 **같은 파일 이름**으로 만듭니다. 영어 버전이 없으면 영어 페이지에서 한국어 원문이 "아직 번역되지 않음" 안내와 함께 보입니다.

### 경력·학력 추가

`src/content/experience/ko/<이름>.yaml` (영어는 `en/`):

```yaml
kind: work          # education | work | activity | award
org: 회사·기관명
role: 역할
start: "2026.07"
end: "2026.08"      # 생략하면 "현재"
description: 한 일 한 줄 (선택)
order: 20           # 클수록 위
```

### 이력서 PDF 연결

1. `public/resume/resume-ko.pdf`, `public/resume/resume-en.pdf` 파일을 넣고
2. `src/content/profile/ko.yaml`, `en.yaml`의 `resume:` 줄 주석을 풉니다. 그러면 홈 화면에 버튼이 생깁니다.

### 홈 화면 섹션 순서 바꾸기 / 빼기

`src/config/site.ts`의 `homeSections` 배열을 수정합니다.

### 새 섹션 만들기 (예: 수상, 블로그)

1. `src/components/sections/Awards.astro` 생성 (`lang` prop을 받도록)
2. `src/views/HomePage.astro`의 `sectionMap`에 `awards: Awards` 등록
3. `src/config/site.ts`의 `homeSections`에 `'awards'` 추가

### 콘텐츠에 새 필드 추가

`src/content.config.ts`의 스키마에 한 줄 추가합니다 (예: `team: z.number().optional()`). 그다음 화면에 보여줄 컴포넌트에서 `data.team`을 사용하면 됩니다.

### 디자인 바꾸기

- 색·글꼴·간격: `src/styles/tokens.css`
- 공통 스타일(버튼, 태그, 본문): `src/styles/global.css`
- 각 부품의 세부 스타일: 해당 `.astro` 파일 아래쪽의 `<style>`

### 메뉴·버튼 문구 바꾸기 / 언어 추가

`src/i18n/ui.ts`에서 수정합니다. 새 언어를 추가하려면 `languages`와 `ui`에 항목을 추가하고, 콘텐츠 폴더마다 해당 언어 폴더를 만드세요.

## 배포

`.github/workflows/deploy.yml`이 `main`에 push될 때마다 빌드하고 배포합니다.
처음 한 번만 저장소 **Settings → Pages → Build and deployment → Source**를 **GitHub Actions**로 설정하면 됩니다.
