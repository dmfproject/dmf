'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import { keyframes } from '@emotion/react';
import { dmf } from '@/theme';
import { BASE_PATH } from '@/lib/basePath';
import { patternBg } from './Decor';

/**
 * Loading screen with fade transitions. It covers the page but not the header.
 *
 * - First visit: the screen is up from the start, and fades out once the page's content is in.
 * - Clicking a link inside the site: the screen fades in over the current page, the new page loads
 *   behind it, and the screen fades out when that page is ready.
 *
 * A page counts as "loading" while it renders <PageLoading /> (see useLoadingScreen below); pages
 * that don't load anything are ready right away.
 */

const FADE_MS = 280;
/** Keep the screen up at least this long once shown, so it never just flickers. */
const MIN_SHOWN_MS = 300;

type Ctx = { register: () => () => void };
const LoadingCtx = createContext<Ctx>({ register: () => () => {} });

/** Call while a page is loading its content; the loading screen stays up until it unmounts. */
export function useLoadingScreen() {
  const { register } = useContext(LoadingCtx);
  useEffect(() => register(), [register]);
}

const spin = keyframes`from { transform: rotate(45deg); } to { transform: rotate(405deg); }`;
// Core shrinks while the outline turns (same timing), back to full size when it lines up again
const shrink = keyframes`
  0%, 100% { transform: rotate(45deg) scale(1); }
  50% { transform: rotate(45deg) scale(0.45); }
`;

/** Same-site link we should animate to, or null (external, new tab, download, same page, #anchor...). */
function internalTarget(e: MouseEvent): string | null {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return null;
  const a = (e.target as Element | null)?.closest?.('a');
  if (!a || !a.href || a.hasAttribute('download') || (a.target && a.target !== '_self')) return null;
  const url = new URL(a.href, window.location.href);
  if (url.origin !== window.location.origin) return null;
  if (url.pathname === window.location.pathname && url.search === window.location.search) return null; // same page / #anchor
  if (BASE_PATH && !url.pathname.startsWith(BASE_PATH)) return null;
  const path = url.pathname.slice(BASE_PATH.length) || '/';
  return path + url.search + url.hash;
}

export default function LoadingScreen({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [loaders, setLoaders] = useState(0); // pages currently loading
  const [navigating, setNavigating] = useState(true); // first visit counts as a navigation
  const [visible, setVisible] = useState(true);
  const shownAt = useRef(Date.now());

  const register = useCallback(() => {
    // A page started loading: the navigation has arrived (this also covers /deck/?d=a -> ?d=b,
    // where only the query changes); the loader now keeps the screen up
    setLoaders((n) => n + 1);
    setNavigating(false);
    return () => setLoaders((n) => n - 1);
  }, []);

  // A new page is on screen: the navigation is over (its <PageLoading /> already registered if it loads)
  useEffect(() => {
    setNavigating(false);
  }, [pathname]);

  // Safety net: never stay up forever if a navigation doesn't end the usual way
  useEffect(() => {
    if (!navigating) return;
    const t = setTimeout(() => setNavigating(false), 10000);
    return () => clearTimeout(t);
  }, [navigating]);

  // Show while navigating or loading; hide (after the minimum time) when both are done
  const busy = navigating || loaders > 0;
  useEffect(() => {
    if (busy) {
      if (!visible) {
        shownAt.current = Date.now();
        setVisible(true);
      }
      return;
    }
    const wait = Math.max(0, MIN_SHOWN_MS - (Date.now() - shownAt.current));
    const t = setTimeout(() => setVisible(false), wait);
    return () => clearTimeout(t);
  }, [busy, visible]);

  // Internal link clicks: fade the screen in first, then change page
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const to = internalTarget(e);
      if (!to) return;
      e.preventDefault();
      shownAt.current = Date.now();
      setNavigating(true);
      setVisible(true);
      setTimeout(() => router.push(to), FADE_MS);
    };
    document.addEventListener('click', onClick, true); // capture: before next/link handles it
    return () => document.removeEventListener('click', onClick, true);
  }, [router]);

  return (
    <LoadingCtx.Provider value={{ register }}>
      {children}
      <Box
        aria-hidden={!visible}
        role="status"
        aria-label="Loading"
        sx={{
          ...patternBg,
          position: 'fixed',
          inset: 0,
          // Under the header (AppBar is 1100), over everything else: the header stays visible and clickable
          zIndex: 1050,
          pt: { xs: '64px', md: '72px' }, // centre the content in the space below the header
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: dmf.bgDeep,
          backgroundImage: `${patternBg.backgroundImage}, radial-gradient(500px 360px at 50% 50%, rgba(56,200,255,0.12), transparent 70%)`,
          opacity: visible ? 1 : 0,
          visibility: visible ? 'visible' : 'hidden',
          pointerEvents: visible ? 'auto' : 'none',
          transition: `opacity ${FADE_MS}ms ease, visibility 0s linear ${visible ? 0 : FADE_MS}ms`,
        }}
      >
        {/* The header logo's diamond, scaled up (same proportions): the outline turns, the core shrinks meanwhile */}
        <Box sx={{ width: 64, height: 64, display: 'grid', placeItems: 'center' }}>
          <Box sx={{ position: 'relative', width: 18, height: 18, transform: 'scale(3.2)' }}>
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                border: `2px solid ${dmf.ice}`,
                transform: 'rotate(45deg)',
                animation: `${spin} 1.6s cubic-bezier(0.65, 0, 0.35, 1) infinite`,
              }}
            />
            {/* core: 8x8, like the logo's (18 - 2*2 border - 2*3 gap) */}
            <Box
              sx={{
                position: 'absolute',
                left: 5,
                top: 5,
                width: 8,
                height: 8,
                bgcolor: dmf.orange,
                transform: 'rotate(45deg)',
                animation: `${shrink} 1.6s cubic-bezier(0.65, 0, 0.35, 1) infinite`,
              }}
            />
          </Box>
        </Box>
      </Box>
    </LoadingCtx.Provider>
  );
}
