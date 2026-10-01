/**
 * Markdown -> PDF, in the browser, with no dependencies.
 *
 * Covers what the rules document uses: headings, paragraphs with **bold** / _italic_ / `code`,
 * links (text only), bullet and numbered lists, block quotes, GFM tables, fenced code and
 * horizontal rules. Uses the PDF's built-in Helvetica / Courier fonts (Windows-1252 characters).
 */

/* ---- fonts -------------------------------------------------------------------------------- */

type FontKey = 'R' | 'B' | 'I' | 'BI' | 'M';

// Widths (1/1000 em) of Windows-1252 characters 32..255.
const HELV = '278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,1015,667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944,667,667,611,278,278,278,469,556,333,556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,556,556,333,500,278,556,500,722,500,500,500,334,260,334,584,761,556,0,222,556,333,1000,556,556,333,1000,667,333,1000,0,611,0,0,222,222,333,333,350,556,1000,333,1000,500,333,944,0,500,667,278,333,556,556,556,556,260,556,333,737,370,556,584,333,737,333,400,584,333,333,333,556,537,278,333,333,365,556,834,834,834,611,667,667,667,667,667,667,1000,722,667,667,667,667,278,278,278,278,722,722,778,778,778,778,778,584,778,722,722,722,722,667,667,611,556,556,556,556,556,556,889,500,556,556,556,556,278,278,278,278,556,556,556,556,556,556,556,584,611,556,556,556,556,500,556,500'
  .split(',')
  .map(Number);
const HELV_BOLD = '278,333,474,556,556,889,722,238,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,333,333,584,584,584,611,975,722,722,722,722,667,611,778,722,278,556,722,611,833,722,778,667,778,722,667,611,722,667,944,667,667,611,333,278,333,584,556,333,556,611,556,611,556,333,611,611,278,278,556,278,889,611,611,611,611,389,556,333,611,556,778,556,556,500,389,280,389,584,761,556,0,278,556,500,1000,556,556,333,1000,667,333,1000,0,611,0,0,278,278,500,500,350,556,1000,333,1000,556,333,944,0,500,667,278,333,556,556,556,556,280,556,333,737,370,556,584,333,737,333,400,584,333,333,333,611,556,278,333,333,365,556,834,834,834,611,722,722,722,722,722,722,1000,722,667,667,667,667,278,278,278,278,722,722,778,778,778,778,778,584,778,722,722,722,722,667,667,611,556,556,556,556,556,556,889,556,556,556,556,556,278,278,278,278,611,611,611,611,611,611,611,584,611,611,611,611,611,556,611,556'
  .split(',')
  .map(Number);

const FONTS: Record<FontKey, { name: string; widths: number[] | null }> = {
  R: { name: 'Helvetica', widths: HELV },
  B: { name: 'Helvetica-Bold', widths: HELV_BOLD },
  I: { name: 'Helvetica-Oblique', widths: HELV },
  BI: { name: 'Helvetica-BoldOblique', widths: HELV_BOLD },
  M: { name: 'Courier', widths: null }, // every character is 600 wide
};
const FONT_KEYS = Object.keys(FONTS) as FontKey[];

// Unicode -> Windows-1252 for the 0x80..0x9F block; 0xA0..0xFF map to themselves.
const CP1252: Record<string, number> = {
  '€': 0x80, '‚': 0x82, 'ƒ': 0x83, '„': 0x84, '…': 0x85, '†': 0x86, '‡': 0x87, 'ˆ': 0x88, '‰': 0x89,
  'Š': 0x8a, '‹': 0x8b, 'Œ': 0x8c, 'Ž': 0x8e, '‘': 0x91, '’': 0x92, '“': 0x93, '”': 0x94, '•': 0x95,
  '–': 0x96, '—': 0x97, '˜': 0x98, '™': 0x99, 'š': 0x9a, '›': 0x9b, 'œ': 0x9c, 'ž': 0x9e, 'Ÿ': 0x9f,
};
const FALLBACK: Record<string, string> = { '→': '->', '←': '<-', '≤': '<=', '≥': '>=', '≠': '!=', '✓': 'v', '×': 'x', ' ': ' ' };

/** Text as a string of Windows-1252 byte values (one char per byte). */
function encode(text: string): string {
  let out = '';
  for (const ch of text) {
    const c = ch.codePointAt(0)!;
    if ((c >= 32 && c < 127) || (c >= 0xa0 && c <= 0xff)) out += ch;
    else if (CP1252[ch]) out += String.fromCharCode(CP1252[ch]);
    else if (FALLBACK[ch]) out += FALLBACK[ch];
    else if (c === 9) out += '    ';
    else out += '?';
  }
  return out;
}

function width(bytes: string, font: FontKey, size: number): number {
  const w = FONTS[font].widths;
  if (!w) return bytes.length * 0.6 * size;
  let sum = 0;
  for (let i = 0; i < bytes.length; i++) sum += w[bytes.charCodeAt(i) - 32] ?? 556;
  return (sum / 1000) * size;
}

/* ---- inline markdown ---------------------------------------------------------------------- */

type Style = { bold?: boolean; italic?: boolean; code?: boolean; link?: boolean };
type Run = Style & { text: string };

const isWord = (c: string | undefined) => !!c && /[\p{L}\p{N}]/u.test(c);

function parseInline(src: string, base: Style = {}): Run[] {
  const s = src.replace(/<br\s*\/?>/gi, ' ').replace(/<\/?[a-z][^>]*>/gi, '');
  const runs: Run[] = [];
  let bold = !!base.bold;
  let italic = !!base.italic;
  let buf = '';
  const flush = (extra: Style = {}) => {
    if (buf) runs.push({ ...base, bold, italic, ...extra, text: buf });
    buf = '';
  };

  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '\\' && i + 1 < s.length && /[\\`*_{}[\]()#+\-.!|~]/.test(s[i + 1])) {
      buf += s[++i];
    } else if (c === '`') {
      const end = s.indexOf('`', i + 1);
      if (end < 0) {
        buf += c;
        continue;
      }
      flush();
      buf = s.slice(i + 1, end);
      flush({ code: true });
      i = end;
    } else if (c === '!' && s[i + 1] === '[') {
      const m = /^!\[([^\]]*)\]\([^)]*\)/.exec(s.slice(i));
      if (m) {
        buf += m[1];
        i += m[0].length - 1;
      } else buf += c;
    } else if (c === '[') {
      const m = /^\[([^\]]*)\]\(([^)\s]*)[^)]*\)/.exec(s.slice(i));
      if (m) {
        flush();
        runs.push(...parseInline(m[1], { bold, italic, link: true }));
        i += m[0].length - 1;
      } else buf += c;
    } else if ((c === '*' || c === '_') && s[i + 1] === c) {
      const prev = s[i - 1];
      const next = s[i + 2];
      if (c === '_' && isWord(prev) && isWord(next)) {
        buf += '__';
      } else {
        flush();
        bold = !bold;
      }
      i++;
    } else if (c === '*' || c === '_') {
      const prev = s[i - 1];
      const next = s[i + 1];
      // "_" inside a word (snake_case) and a lone "*" between spaces are just text
      if ((c === '_' && isWord(prev) && isWord(next)) || (next === ' ' && (prev === ' ' || prev === undefined))) {
        buf += c;
      } else {
        flush();
        italic = !italic;
      }
    } else if (c === '~' && s[i + 1] === '~') {
      i++; // strikethrough: keep the text
    } else {
      buf += c;
    }
  }
  flush();
  return runs;
}

/* ---- blocks ------------------------------------------------------------------------------- */

type Block =
  | { type: 'heading'; level: number; text: string }
  | { type: 'para'; text: string }
  | { type: 'item'; marker: string; depth: number; text: string }
  | { type: 'quote'; text: string }
  | { type: 'code'; lines: string[] }
  | { type: 'table'; header: string[]; align: ('l' | 'c' | 'r')[]; rows: string[][] }
  | { type: 'hr' };

const splitRow = (line: string) =>
  line
    .trim()
    .replace(/^\|/, '')
    .replace(/(?<!\\)\|$/, '')
    .split(/(?<!\\)\|/)
    .map((c) => c.trim().replace(/\\\|/g, '|'));

function parseBlocks(md: string): Block[] {
  const lines = md.replace(/\r\n?/g, '\n').split('\n');
  const blocks: Block[] = [];
  let para: string[] = [];
  const endPara = () => {
    if (para.length) blocks.push({ type: 'para', text: para.join(' ') });
    para = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const t = line.trim();
    let m: RegExpExecArray | null;

    if (/^(```|~~~)/.test(t)) {
      endPara();
      const fence = t.slice(0, 3);
      const code: string[] = [];
      while (++i < lines.length && !lines[i].trim().startsWith(fence)) code.push(lines[i]);
      blocks.push({ type: 'code', lines: code });
    } else if (!t) {
      endPara();
    } else if ((m = /^(#{1,6})\s+(.*?)\s*#*\s*$/.exec(t))) {
      endPara();
      blocks.push({ type: 'heading', level: m[1].length, text: m[2] });
    } else if (/^([-*_])(\s*\1){2,}$/.test(t)) {
      endPara();
      blocks.push({ type: 'hr' });
    } else if (t.startsWith('|') && i + 1 < lines.length && /^\s*\|?\s*:?-{2,}/.test(lines[i + 1])) {
      endPara();
      const header = splitRow(t);
      const align = splitRow(lines[i + 1]).map((c) => (/^:-+:$/.test(c) ? 'c' : /-:$/.test(c) ? 'r' : 'l') as 'l' | 'c' | 'r');
      i++;
      const rows: string[][] = [];
      while (i + 1 < lines.length && lines[i + 1].trim().startsWith('|')) rows.push(splitRow(lines[++i]));
      blocks.push({ type: 'table', header, align, rows });
    } else if ((m = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/.exec(line))) {
      endPara();
      let text = m[3];
      // Lazy continuation lines
      while (i + 1 < lines.length && lines[i + 1].trim() && !/^\s*([-*+]|\d+[.)])\s+|^\s*(#|>|\||```)/.test(lines[i + 1])) {
        text += ' ' + lines[++i].trim();
      }
      const marker = /\d/.test(m[2]) ? m[2].replace(')', '.') : '•';
      blocks.push({ type: 'item', marker, depth: Math.floor(m[1].replace(/\t/g, '  ').length / 2), text });
    } else if (t.startsWith('>')) {
      endPara();
      const q = [t.replace(/^>\s?/, '')];
      while (i + 1 < lines.length && lines[i + 1].trim().startsWith('>')) q.push(lines[++i].trim().replace(/^>\s?/, ''));
      blocks.push({ type: 'quote', text: q.join(' ') });
    } else {
      para.push(t);
    }
  }
  endPara();
  return blocks;
}

/* ---- layout ------------------------------------------------------------------------------- */

type Seg = { text: string; font: FontKey; size: number; color: string; w: number };
type Line = { segs: Seg[]; w: number };

const PAGE_W = 595.28; // A4
const PAGE_H = 841.89;
const MARGIN_X = 56;
const MARGIN_TOP = 64;
const MARGIN_BOTTOM = 64;
const CONTENT_W = PAGE_W - MARGIN_X * 2;

// Print-friendly take on the site palette
const C = {
  text: '0.10 0.13 0.18',
  muted: '0.40 0.45 0.52',
  navy: '0.04 0.09 0.16',
  orange: '1 0.54 0.24',
  ice: '0.13 0.55 0.75',
  rule: '0.80 0.85 0.90',
  head: '0.92 0.95 0.98',
  code: '0.95 0.96 0.97',
};

type TextOpts = { size: number; color?: string };

function fontOf(r: Run): FontKey {
  if (r.code) return 'M';
  if (r.bold && r.italic) return 'BI';
  if (r.bold) return 'B';
  if (r.italic) return 'I';
  return 'R';
}

/** Greedy word wrap of styled runs into lines no wider than maxW. */
function wrap(runs: Run[], maxW: number, { size, color = C.text }: TextOpts): Line[] {
  // Split into "words" that keep their trailing space, each piece carrying its style.
  type Piece = Seg & { space: boolean };
  const words: Piece[][] = [];
  let cur: Piece[] = [];
  for (const r of runs) {
    const font = fontOf(r);
    const col = r.link ? C.ice : color;
    const sz = r.code ? size * 0.92 : size;
    for (const part of encode(r.text).split(/( +)/)) {
      if (!part) continue;
      if (part.startsWith(' ')) {
        if (cur.length) {
          cur[cur.length - 1].space = true;
          words.push(cur);
          cur = [];
        }
      } else {
        cur.push({ text: part, font, size: sz, color: col, w: width(part, font, sz), space: false });
      }
    }
  }
  if (cur.length) words.push(cur);

  const lines: Line[] = [];
  let line: Seg[] = [];
  let lineW = 0;
  const push = () => {
    // drop the trailing space
    const last = line[line.length - 1];
    if (last && last.text.endsWith(' ')) {
      last.text = last.text.slice(0, -1);
      last.w = width(last.text, last.font, last.size);
    }
    lines.push({ segs: line, w: line.reduce((n, s) => n + s.w, 0) });
    line = [];
    lineW = 0;
  };
  const add = (p: Piece) => {
    const prev = line[line.length - 1];
    if (prev && prev.font === p.font && prev.size === p.size && prev.color === p.color) {
      prev.text += p.text;
      prev.w += p.w;
    } else line.push({ text: p.text, font: p.font, size: p.size, color: p.color, w: p.w });
    lineW += p.w;
  };

  for (const word of words) {
    const wordW = word.reduce((n, p) => n + p.w, 0);
    if (line.length && lineW + wordW > maxW) push();
    if (wordW > maxW) {
      // A single word wider than the line: break it by characters.
      for (const p of word) {
        for (const ch of p.text) {
          const cw = width(ch, p.font, p.size);
          if (lineW + cw > maxW && line.length) push();
          add({ ...p, text: ch, w: cw });
        }
      }
    } else {
      for (const p of word) add(p);
    }
    if (word[word.length - 1].space) {
      const last = word[word.length - 1];
      const sw = width(' ', last.font, last.size);
      add({ ...last, text: ' ', w: sw });
    }
  }
  if (line.length) push();
  return lines.length ? lines : [{ segs: [], w: 0 }];
}

/* ---- PDF writer --------------------------------------------------------------------------- */

const esc = (bytes: string) => bytes.replace(/[\\()]/g, (c) => '\\' + c);
const n = (v: number) => (Math.round(v * 100) / 100).toString();

class Doc {
  pages: string[][] = [];
  ops: string[] = [];
  y = 0;

  constructor() {
    this.newPage();
  }

  newPage() {
    this.ops = [];
    this.pages.push(this.ops);
    this.y = PAGE_H - MARGIN_TOP;
  }

  /** Start a new page unless `h` more points fit. */
  need(h: number) {
    if (this.y - h < MARGIN_BOTTOM) this.newPage();
  }

  text(line: Line, x: number, baseline: number) {
    let cx = x;
    for (const s of line.segs) {
      if (s.text) {
        this.ops.push(`BT ${s.color} rg /F${FONT_KEYS.indexOf(s.font) + 1} ${n(s.size)} Tf ${n(cx)} ${n(baseline)} Td (${esc(s.text)}) Tj ET`);
      }
      cx += s.w;
    }
  }

  rect(x: number, y: number, w: number, h: number, color: string) {
    this.ops.push(`${color} rg ${n(x)} ${n(y)} ${n(w)} ${n(h)} re f`);
  }

  hline(x1: number, x2: number, y: number, color: string, lw = 0.6) {
    this.ops.push(`${color} RG ${n(lw)} w ${n(x1)} ${n(y)} m ${n(x2)} ${n(y)} l S`);
  }

  /** Flowing paragraph; lines may continue onto the next page. */
  lines(lines: Line[], x: number, size: number, leading: number, align: 'l' | 'c' | 'r' = 'l', maxW = CONTENT_W) {
    for (const l of lines) {
      this.need(leading);
      const dx = align === 'c' ? (maxW - l.w) / 2 : align === 'r' ? maxW - l.w : 0;
      this.text(l, x + dx, this.y - size);
      this.y -= leading;
    }
  }
}

/** Build the PDF bytes. */
function assemble(pages: string[][], title: string, footer: string): Uint8Array {
  const objs: string[] = [];
  const add = (body: string) => objs.push(body) - 1 + 1; // 1-based object number

  const catalog = add(''); // placeholders, filled below
  const pagesObj = add('');
  const fontObjs = FONT_KEYS.map((k) =>
    add(`<< /Type /Font /Subtype /Type1 /BaseFont /${FONTS[k].name}${k === 'M' ? '' : ' /Encoding /WinAnsiEncoding'} >>`),
  );
  const fontRes = FONT_KEYS.map((_, i) => `/F${i + 1} ${fontObjs[i]} 0 R`).join(' ');

  const pageObjs: number[] = [];
  pages.forEach((ops, i) => {
    const foot = encode(`${footer}`);
    const num = encode(`${i + 1} / ${pages.length}`);
    const fy = MARGIN_BOTTOM - 30;
    const all = [
      ...ops,
      `${C.rule} RG 0.6 w ${n(MARGIN_X)} ${n(fy + 12)} m ${n(PAGE_W - MARGIN_X)} ${n(fy + 12)} l S`,
      `BT ${C.muted} rg /F1 8 Tf ${n(MARGIN_X)} ${n(fy)} Td (${esc(foot)}) Tj ET`,
      `BT ${C.muted} rg /F2 8 Tf ${n(PAGE_W - MARGIN_X - width(num, 'B', 8))} ${n(fy)} Td (${esc(num)}) Tj ET`,
    ].join('\n');
    const content = add(`<< /Length ${all.length} >>\nstream\n${all}\nendstream`);
    pageObjs.push(
      add(
        `<< /Type /Page /Parent ${pagesObj} 0 R /MediaBox [0 0 ${n(PAGE_W)} ${n(PAGE_H)}] /Resources << /Font << ${fontRes} >> >> /Contents ${content} 0 R >>`,
      ),
    );
  });

  objs[catalog - 1] = `<< /Type /Catalog /Pages ${pagesObj} 0 R >>`;
  objs[pagesObj - 1] = `<< /Type /Pages /Kids [${pageObjs.map((p) => `${p} 0 R`).join(' ')}] /Count ${pageObjs.length} >>`;

  // Title as UTF-16BE so any character survives in the document properties.
  let hex = 'FEFF';
  for (let i = 0; i < title.length; i++) hex += title.charCodeAt(i).toString(16).padStart(4, '0');
  const info = add(`<< /Title <${hex}> /Producer (Vault Format) >>`);

  let out = '%PDF-1.4\n%\xe2\xe3\xcf\xd3\n';
  const offsets: number[] = [];
  objs.forEach((body, i) => {
    offsets.push(out.length);
    out += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xref = out.length;
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  for (const o of offsets) out += `${String(o).padStart(10, '0')} 00000 n \n`;
  out += `trailer\n<< /Size ${objs.length + 1} /Root ${catalog} 0 R /Info ${info} 0 R >>\nstartxref\n${xref}\n%%EOF\n`;

  const bytes = new Uint8Array(out.length);
  for (let i = 0; i < out.length; i++) bytes[i] = out.charCodeAt(i) & 0xff;
  return bytes;
}

/* ---- markdown -> pages -------------------------------------------------------------------- */

const BODY = 10;
const LEAD = 14.5;

function table(doc: Doc, b: Extract<Block, { type: 'table' }>) {
  const cols = Math.max(b.header.length, ...b.rows.map((r) => r.length));
  const pad = 5;
  const size = 9;
  const lead = 12.5;
  const cellRuns = (row: string[], bold: boolean) =>
    Array.from({ length: cols }, (_, c) => parseInline(row[c] ?? '', bold ? { bold: true } : {}));
  const head = cellRuns(b.header, true);
  const body = b.rows.map((r) => cellRuns(r, false));

  // Column widths: between the longest word and the whole text, scaled to fit the page.
  const natural = Array(cols).fill(0);
  const minimum = Array(cols).fill(0);
  for (const row of [head, ...body]) {
    row.forEach((runs, c) => {
      const one = wrap(runs, Infinity, { size })[0];
      natural[c] = Math.max(natural[c], one.w + pad * 2);
      for (const s of one.segs) for (const word of s.text.split(' ')) minimum[c] = Math.max(minimum[c], width(word, s.font, s.size) + pad * 2);
    });
  }
  const sumNat = natural.reduce((a, v) => a + v, 0);
  const sumMin = minimum.reduce((a, v) => a + v, 0);
  let widths: number[];
  if (sumNat <= CONTENT_W) widths = natural.map((v) => (v / sumNat) * CONTENT_W);
  else if (sumMin >= CONTENT_W) widths = minimum.map((v) => (v / sumMin) * CONTENT_W);
  else widths = natural.map((v, c) => minimum[c] + ((v - minimum[c]) * (CONTENT_W - sumMin)) / (sumNat - sumMin));

  const layout = (row: Run[][]) => {
    const cells = row.map((runs, c) => wrap(runs, widths[c] - pad * 2, { size }));
    return { cells, h: Math.max(...cells.map((l) => l.length)) * lead + pad * 2 - (lead - size) + 2 };
  };
  const headRow = layout(head);

  const drawRow = (row: ReturnType<typeof layout>, isHead: boolean) => {
    const top = doc.y;
    if (isHead) doc.rect(MARGIN_X, top - row.h, CONTENT_W, row.h, C.head);
    let x = MARGIN_X;
    row.cells.forEach((lines, c) => {
      lines.forEach((l, k) => {
        const a = b.align[c] ?? 'l';
        const inner = widths[c] - pad * 2;
        const dx = a === 'c' ? (inner - l.w) / 2 : a === 'r' ? inner - l.w : 0;
        doc.text(l, x + pad + dx, top - pad - size + 1 - k * lead);
      });
      x += widths[c];
    });
    doc.y -= row.h;
    doc.hline(MARGIN_X, MARGIN_X + CONTENT_W, doc.y, isHead ? C.ice : C.rule, isHead ? 1 : 0.6);
  };

  doc.need(headRow.h + 30);
  drawRow(headRow, true);
  for (const r of body) {
    const row = layout(r);
    if (doc.y - row.h < MARGIN_BOTTOM) {
      doc.newPage();
      drawRow(headRow, true); // repeat the header on the new page
    }
    drawRow(row, false);
  }
  doc.y -= 12;
}

export function markdownToPdf(markdown: string, { title, footer }: { title: string; footer: string }): Uint8Array {
  const doc = new Doc();
  const blocks = parseBlocks(markdown);
  let first = true;

  blocks.forEach((b, i) => {
    const atTop = doc.y >= PAGE_H - MARGIN_TOP - 0.1;
    switch (b.type) {
      case 'heading': {
        const size = b.level === 1 ? (first ? 24 : 18) : b.level === 2 ? 14.5 : b.level === 3 ? 12 : 10.5;
        const lead = size * 1.25;
        const lines = wrap(parseInline(b.text, { bold: true }), CONTENT_W, { size, color: C.navy });
        const before = atTop ? 0 : b.level <= 2 ? 16 : 10;
        // Keep the heading with at least a few lines of what follows it.
        doc.need(before + lines.length * lead + LEAD * 3);
        if (doc.y < PAGE_H - MARGIN_TOP - 0.1) doc.y -= before;
        doc.lines(lines, MARGIN_X, size, lead);
        if (b.level === 1 && first) {
          doc.rect(MARGIN_X, doc.y - 2, 48, 3, C.orange);
          doc.rect(MARGIN_X + 52, doc.y - 2, 20, 3, C.ice);
          doc.y -= 14;
        } else if (b.level <= 2) {
          doc.hline(MARGIN_X, MARGIN_X + CONTENT_W, doc.y - 1, C.rule);
          doc.y -= 11;
        } else doc.y -= 3;
        first = false;
        break;
      }
      case 'para': {
        doc.lines(wrap(parseInline(b.text), CONTENT_W, { size: BODY }), MARGIN_X, BODY, LEAD);
        doc.y -= 6;
        break;
      }
      case 'item': {
        const indent = 16 + b.depth * 16;
        const marker = wrap([{ text: b.marker, bold: b.marker !== '•' }], indent, { size: BODY, color: C.orange })[0];
        const lines = wrap(parseInline(b.text), CONTENT_W - indent, { size: BODY });
        doc.need(LEAD);
        doc.text(marker, MARGIN_X + indent - 12 - (b.marker === '•' ? 0 : marker.w - 6), doc.y - BODY);
        doc.lines(lines, MARGIN_X + indent, BODY, LEAD, 'l', CONTENT_W - indent);
        const next = blocks[i + 1];
        doc.y -= next?.type === 'item' ? 2 : 6;
        break;
      }
      case 'quote': {
        const lines = wrap(parseInline(b.text, { italic: true }), CONTENT_W - 16, { size: BODY, color: C.muted });
        doc.need(LEAD);
        const top = doc.y;
        const startPage = doc.pages.length;
        doc.lines(lines, MARGIN_X + 14, BODY, LEAD, 'l', CONTENT_W - 16);
        if (doc.pages.length === startPage) doc.rect(MARGIN_X, doc.y + 3, 2.5, top - doc.y - 3, C.orange);
        doc.y -= 6;
        break;
      }
      case 'code': {
        const size = 8.5;
        const lead = 11.5;
        for (const raw of b.lines.length ? b.lines : ['']) {
          for (const l of wrap([{ text: raw || ' ', code: true }], CONTENT_W - 16, { size: size / 0.92 })) {
            doc.need(lead);
            doc.rect(MARGIN_X, doc.y - lead, CONTENT_W, lead, C.code);
            doc.text(l, MARGIN_X + 8, doc.y - size - 1);
            doc.y -= lead;
          }
        }
        doc.y -= 8;
        break;
      }
      case 'table':
        doc.y -= 2;
        table(doc, b);
        break;
      case 'hr':
        doc.need(20);
        doc.y -= 8;
        doc.hline(MARGIN_X, MARGIN_X + CONTENT_W, doc.y, C.rule);
        doc.y -= 12;
        break;
    }
  });

  // Drop a trailing blank page if the last block ended exactly at a page break.
  if (doc.pages.length > 1 && doc.pages[doc.pages.length - 1].length === 0) doc.pages.pop();
  return assemble(doc.pages, title, footer);
}

/* ---- helpers for the page ----------------------------------------------------------------- */

/** "1.0" from a line like "**Vault Format Rules** - Version 1.0", or null. */
export function rulesVersion(markdown: string): string | null {
  const m = /\bversion\s*:?\s*v?(\d+(?:\.\d+)*[\w.-]*)/i.exec(markdown);
  return m ? m[1] : null;
}

/** Turn the markdown into a PDF and download it as Vault_Format_rules_<version>.pdf. */
export function downloadRulesPdf(markdown: string, docTitle: string) {
  const version = rulesVersion(markdown);
  const name = version ? `Vault_Format_rules_${version}` : 'Vault_Format_rules';
  const bytes = markdownToPdf(markdown, {
    title: version ? `${docTitle} (v${version})` : docTitle,
    footer: version ? `${docTitle}  //  Version ${version}` : docTitle,
  });
  const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: 'application/pdf' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
