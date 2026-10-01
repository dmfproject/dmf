/** Sub-folder the site is served from ('' locally, '/<repo>' on GitHub Pages). */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/**
 * Prefix a site-relative URL ("/cards/x.jpg") with the base path. Needed for plain <img src>
 * and fetch(); next/link adds it on its own. Full URLs are returned unchanged.
 */
export function withBase(url: string): string {
  return url.startsWith('/') && !url.startsWith('//') ? `${BASE_PATH}${url}` : url;
}
