export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/** Pull `## ` headings out of raw markdown for the table of contents. */
export function extractHeadings(markdown: string): { id: string; text: string }[] {
  const withoutCode = markdown.replace(/```[\s\S]*?```/g, '');
  return withoutCode
    .split(/\r?\n/)
    .filter((line) => /^##\s+/.test(line))
    .map((line) => {
      const text = line.replace(/^##\s+/, '').replace(/[*_`]/g, '').trim();
      return { id: slugify(text), text };
    });
}
