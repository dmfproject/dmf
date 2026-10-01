'use client';

import { useId } from 'react';
import NextLink from 'next/link';
import Box from '@mui/material/Box';
import Typography, { type TypographyProps } from '@mui/material/Typography';
import { keyframes } from '@emotion/react';
import { dmf, fonts } from '@/theme';

/** Subtle diagonal-line texture used on dark bands. */
export const patternBg = {
  backgroundColor: dmf.bg,
  backgroundImage: `repeating-linear-gradient(135deg, rgba(56,200,255,0.035) 0 2px, transparent 2px 22px),
    radial-gradient(900px 400px at 85% 0%, rgba(56,200,255,0.08), transparent 70%)`,
};

/** Heading filled with the orange → ice gradient. */
export function GradientTitle({ sx, component = 'h2', ...props }: TypographyProps & { component?: React.ElementType }) {
  return (
    <Typography
      component={component}
      {...props}
      sx={[
        {
          background: dmf.gradient,
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
          filter: 'drop-shadow(0 3px 0 rgba(0,0,0,0.45))',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    />
  );
}

/** Slow blink of the DMF diamond (divider and header logo). */
export const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
`;

/**
 * Heading underline: solid bar → "//" slashes → fading rail with ticks → DMF diamond.
 * Scales proportionally (no stretching), so the slashes and diamond keep their shape.
 */
export function GlitchDivider({ color = dmf.orange, accent }: { color?: string; accent?: string }) {
  const id = useId().replace(/:/g, '');
  const second = accent ?? (color === dmf.ink ? dmf.ink : dmf.ice);
  const slash = (x: number) => `${x + 6},1 ${x + 12},1 ${x + 6},15 ${x},15`;
  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 520,
        my: 3,
        lineHeight: 0,
        '& .dmf-pulse': { animation: `${pulse} 2.4s ease-in-out infinite` },
      }}
    >
      <svg viewBox="0 0 520 16" width="100%" aria-hidden style={{ display: 'block', overflow: 'visible' }}>
        <defs>
          <linearGradient id={`${id}-rail`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={second} stopOpacity="0.25" />
          </linearGradient>
        </defs>

        {/* Lead block + main bar */}
        <rect x="0" y="5" width="6" height="6" fill={color} />
        <rect x="12" y="5" width="148" height="6" fill={color} />

        {/* The "//" motif */}
        <polygon points={slash(168)} fill={color} />
        <polygon points={slash(182)} fill={color} />

        {/* Fading rail with ticks */}
        <rect x="204" y="7.25" width="262" height="1.5" fill={`url(#${id}-rail)`} />
        <rect x="290" y="4" width="2" height="8" fill={second} opacity="0.6" />
        <rect x="370" y="5" width="2" height="6" fill={second} opacity="0.45" />
        <rect x="430" y="6" width="2" height="4" fill={second} opacity="0.35" />

        {/* DMF diamond */}
        <polygon points="490,1 497,8 490,15 483,8" fill="none" stroke={second} strokeWidth="2" />
        <polygon className="dmf-pulse" points="490,5 493,8 490,11 487,8" fill={color} />

        {/* Trailing bits */}
        <rect x="506" y="6.5" width="3" height="3" fill={second} opacity="0.7" />
        <rect x="514" y="6.5" width="3" height="3" fill={second} opacity="0.4" />
      </svg>
    </Box>
  );
}

/** Double-border CTA with small corner notches, like the reference's primary button. */
export function NotchButton({
  href,
  children,
  variant = 'solid',
  download,
  onClick,
}: {
  /** Link target; leave out and pass onClick for a plain <button>. */
  href?: string;
  children: React.ReactNode;
  variant?: 'solid' | 'ghost';
  /** File download: renders a plain <a download> (href must already include the base path). */
  download?: string;
  onClick?: () => void;
}) {
  const solid = variant === 'solid';
  const as = !href ? 'button' : download ? 'a' : NextLink;
  return (
    <Box
      component={as}
      {...(href ? { href } : { type: 'button' })}
      {...(download ? { download } : {})}
      onClick={onClick}
      sx={{
        position: 'relative',
        display: 'inline-block',
        p: '3px',
        border: `2px solid ${dmf.orange}`,
        bgcolor: 'transparent',
        cursor: 'pointer',
        font: 'inherit',
        textDecoration: 'none',
        transition: 'border-color 150ms, transform 150ms',
        '&:hover': { borderColor: '#ffd2b0', transform: 'translateY(-2px)' },
        '&:hover > span': { bgcolor: solid ? '#ffa565' : 'rgba(255,138,61,0.12)' },
        '&::before, &::after': {
          content: '""',
          position: 'absolute',
          width: 7,
          height: 7,
          bgcolor: dmf.orange,
        },
        '&::before': { top: -2, left: -2 },
        '&::after': { bottom: -2, right: -2 },
      }}
    >
      <Box
        component="span"
        sx={{
          display: 'block',
          px: { xs: 3, md: 4 },
          py: 1.5,
          fontFamily: fonts.ui,
          fontWeight: 700,
          fontSize: '0.95rem',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: solid ? dmf.ink : dmf.orange,
          bgcolor: solid ? dmf.orange : 'transparent',
          transition: 'background-color 150ms',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

/** A scatter of pixel squares that "dissolves" an edge between two bands. */
export function PixelEdge({ color = dmf.bg, flip = false }: { color?: string; flip?: boolean }) {
  // Deterministic pseudo-random layout so server and client markup match.
  const squares: { x: number; y: number; s: number }[] = [];
  let seed = 7;
  const rand = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  for (let i = 0; i < 70; i++) {
    const x = Math.floor(rand() * 100);
    const y = Math.floor(rand() * rand() * 36);
    const s = [2, 3, 4][Math.floor(rand() * 3)];
    squares.push({ x, y, s });
  }
  return (
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        left: 0,
        right: 0,
        [flip ? 'top' : 'bottom']: 0,
        height: 60,
        pointerEvents: 'none',
        transform: flip ? 'scaleY(-1)' : undefined,
      }}
    >
      <svg viewBox="0 0 100 40" preserveAspectRatio="none" width="100%" height="100%">
        <rect x="0" y="36" width="100" height="4" fill={color} />
        {squares.map((q, i) => (
          <rect key={i} x={q.x} y={36 - q.y - q.s * 0.6} width={q.s * 0.35} height={q.s * 0.9} fill={color} />
        ))}
      </svg>
    </Box>
  );
}

/** Overline label with the "//" motif, e.g. "// Updates". */
export function SlashLabel({ children, color = dmf.ice }: { children: React.ReactNode; color?: string }) {
  return (
    <Typography variant="overline" component="p" sx={{ color, display: 'block', mb: 2, lineHeight: 1.5 }}>
      <Box component="span" sx={{ color: dmf.orange, mr: 1, fontFamily: fonts.display, letterSpacing: '0.05em' }}>
        {'//'}
      </Box>
      {children}
    </Typography>
  );
}
