import { slugify } from './slugify';

export type MdSection = { id: string; title: string; body: string };
export type MdPage = { title: string; intro: string; sections: MdSection[] };

/**
 * Split a markdown document into a hero (the `# Title` plus everything before the
 * first `##`) and one section per `## Heading`. Each section becomes a full-width band.
 */
export function splitMarkdown(markdown: string): MdPage {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  let title = '';
  const intro: string[] = [];
  const sections: MdSection[] = [];
  let current: MdSection | null = null;
  let inFence = false;

  for (const line of lines) {
    if (/^```/.test(line)) inFence = !inFence;

    if (!inFence && !title && !current && /^#\s+/.test(line)) {
      title = line.replace(/^#\s+/, '').trim();
      continue;
    }
    if (!inFence && /^##\s+/.test(line)) {
      const heading = line.replace(/^##\s+/, '').trim();
      current = { id: slugify(heading), title: heading, body: '' };
      sections.push(current);
      continue;
    }
    if (current) current.body += line + '\n';
    else intro.push(line);
  }

  return { title, intro: intro.join('\n').trim(), sections: sections.map((s) => ({ ...s, body: s.body.trim() })) };
}
