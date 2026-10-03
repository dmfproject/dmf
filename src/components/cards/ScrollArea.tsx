'use client';

import { useCallback, useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react';
import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';
import { dmf } from '@/theme';

/** Visible thumb size; the touch area around it is larger. */
const THUMB_MIN = 40;
const THUMB_WIDTH = 6;
const HIT_WIDTH = 28;
const TRACK_INSET = 6;

/**
 * A scroll box with its own scroll indicator on the right that can be held and dragged
 * (phones hide the native scrollbar and don't let you grab it). Tapping the track jumps there.
 * The indicator is hidden when the content fits.
 */
export default function ScrollArea({ children, sx }: { children: ReactNode; sx?: SxProps<Theme> }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ y: number; top: number; ratio: number } | null>(null);
  const [thumb, setThumb] = useState<{ top: number; height: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  const update = useCallback(() => {
    const el = scrollRef.current;
    const track = trackRef.current;
    if (!el || !track) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    if (scrollHeight <= clientHeight + 1) return setThumb(null);
    const trackH = track.clientHeight;
    const height = Math.max(THUMB_MIN, (clientHeight / scrollHeight) * trackH);
    const top = (scrollTop / (scrollHeight - clientHeight)) * (trackH - height);
    setThumb({ top, height });
  }, []);

  useEffect(() => {
    update();
    const ro = new ResizeObserver(update);
    if (scrollRef.current) ro.observe(scrollRef.current);
    if (contentRef.current) ro.observe(contentRef.current); // text loading in changes the height
    return () => ro.disconnect();
  }, [update]);

  /** px of scroll per px of thumb movement */
  const ratio = () => {
    const el = scrollRef.current!;
    const trackH = trackRef.current!.clientHeight;
    const free = trackH - (thumb?.height ?? THUMB_MIN);
    return free > 0 ? (el.scrollHeight - el.clientHeight) / free : 0;
  };

  const onThumbDown = (e: PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { y: e.clientY, top: scrollRef.current!.scrollTop, ratio: ratio() };
    setDragging(true);
  };
  const onThumbMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    scrollRef.current!.scrollTop = d.top + (e.clientY - d.y) * d.ratio;
  };
  const onThumbUp = () => {
    drag.current = null;
    setDragging(false);
  };

  // Tap on the track: put the thumb's middle there
  const onTrackDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!thumb) return;
    const rect = trackRef.current!.getBoundingClientRect();
    const target = e.clientY - rect.top - thumb.height / 2;
    scrollRef.current!.scrollTop = target * ratio();
  };

  return (
    <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', minHeight: 0, ...sx }}>
      <Box
        ref={scrollRef}
        onScroll={update}
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          overscrollBehavior: 'contain',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
          pr: thumb ? `${HIT_WIDTH - 6}px` : 0,
        }}
      >
        <Box ref={contentRef}>{children}</Box>
      </Box>

      {/* Track + draggable thumb */}
      <Box
        ref={trackRef}
        onPointerDown={onTrackDown}
        aria-hidden
        sx={{
          position: 'absolute',
          top: TRACK_INSET,
          bottom: TRACK_INSET,
          right: 0,
          width: HIT_WIDTH,
          display: thumb ? 'block' : 'none',
          touchAction: 'none',
          // thin guide line
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: '50%',
            width: 2,
            ml: '-1px',
            bgcolor: 'rgba(56,200,255,0.12)',
          },
        }}
      >
        {thumb && (
          <Box
            onPointerDown={onThumbDown}
            onPointerMove={onThumbMove}
            onPointerUp={onThumbUp}
            onPointerCancel={onThumbUp}
            sx={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: thumb.top,
              height: thumb.height,
              cursor: 'grab',
              touchAction: 'none',
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: '50%',
                width: dragging ? THUMB_WIDTH + 2 : THUMB_WIDTH,
                transform: 'translateX(-50%)',
                borderRadius: 3,
                bgcolor: dragging ? dmf.ice : `${dmf.ice}99`,
                boxShadow: dragging ? `0 0 10px ${dmf.ice}88` : 'none',
                transition: 'width 120ms, background-color 120ms, box-shadow 120ms',
              },
            }}
          />
        )}
      </Box>
    </Box>
  );
}
