/**
 * 개조식 메모 파서.
 *   [성과]          ← 머리말 줄 (대괄호)
 *   - 항목 1         ← "- " 로 시작하는 항목
 *   - 항목 2
 * 를 [{ label: '성과', items: ['항목 1', '항목 2'] }] 로 바꿉니다.
 * 항목이 하나도 없는 머리말은 빠집니다 (템플릿만 있는 칸은 화면에 안 나옴).
 */
export type NoteSection = { label: string; items: string[] };

export function parseNotes(text?: string): NoteSection[] {
  if (!text) return [];
  const sections: NoteSection[] = [];
  let current: NoteSection | null = null;
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    const head = line.match(/^\[(.+?)\]\s*(.*)$/);
    if (head) {
      current = { label: head[1].trim(), items: [] };
      sections.push(current);
      if (head[2]) current.items.push(head[2]);
      continue;
    }
    const item = line.replace(/^[-•·]\s*/, '');
    if (!item) continue;
    if (!current) {
      current = { label: '', items: [] };
      sections.push(current);
    }
    current.items.push(item);
  }
  return sections.filter((s) => s.items.length > 0);
}

/** STAR 머리말(S/T/A/R)을 읽기 쉬운 이름으로 */
const starNames: Record<string, { ko: string; en: string }> = {
  S: { ko: '상황', en: 'Situation' },
  T: { ko: '과제', en: 'Task' },
  A: { ko: '행동', en: 'Action' },
  R: { ko: '결과', en: 'Result' },
};

export function displayLabel(label: string, lang: 'ko' | 'en'): string {
  const star = starNames[label.toUpperCase()];
  return star ? `${label.toUpperCase()} · ${star[lang]}` : label;
}
