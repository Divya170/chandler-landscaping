/**
 * Turns the privacy-policy text from Admin → Settings into simple blocks.
 * Format: a blank line starts a new paragraph; a line starting with "## " is a heading;
 * lines starting with "- " form a bullet list. Rendered as React elements (never as raw HTML).
 */
export type PolicyBlock =
  | { kind: 'h'; text: string }
  | { kind: 'p'; text: string }
  | { kind: 'ul'; items: string[] };

export function parsePolicy(source: string): PolicyBlock[] {
  const blocks: PolicyBlock[] = [];
  for (const chunk of source.replace(/\r\n?/g, '\n').split(/\n{2,}/)) {
    const lines = chunk.split('\n').map((l) => l.trimEnd()).filter((l) => l.trim());
    if (!lines.length) continue;
    let para: string[] = [];
    let list: string[] = [];
    const flushPara = () => { if (para.length) blocks.push({ kind: 'p', text: para.join('\n') }); para = []; };
    const flushList = () => { if (list.length) blocks.push({ kind: 'ul', items: list }); list = []; };
    for (const line of lines) {
      if (/^##\s+/.test(line)) { flushPara(); flushList(); blocks.push({ kind: 'h', text: line.replace(/^##\s+/, '').trim() }); }
      else if (/^-\s+/.test(line)) { flushPara(); list.push(line.replace(/^-\s+/, '').trim()); }
      else { flushList(); para.push(line.trim()); }
    }
    flushPara(); flushList();
  }
  return blocks;
}
