'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { keyframes } from '@emotion/react';
import { dmf, fonts } from '@/theme';
import { withBase } from '@/lib/basePath';

// Two face-down cards: the front one slowly bobs and tilts, like a deck being shuffled
const bob = keyframes`
  0%, 100% { transform: translate(0, 0) rotate(-6deg); }
  50% { transform: translate(6px, -10px) rotate(3deg); }
`;

/** "Not here yet" panel, shown on Decks and Download while there are no decks. */
export default function ComingSoon({ title, text }: { title: string; text: string }) {
  const back = withBase('/back.jpg');
  const card = {
    position: 'absolute',
    width: 74,
    aspectRatio: '59 / 86',
    borderRadius: '3.5% / 2.4%',
    backgroundImage: `url(${back})`,
    backgroundSize: 'cover',
    boxShadow: '0 10px 24px rgba(0,0,0,0.55)',
  } as const;

  return (
    <Box
      sx={{
        mt: 5,
        p: { xs: 3, md: 4 },
        maxWidth: 820,
        display: 'flex',
        alignItems: 'center',
        gap: { xs: 3, md: 4 },
        border: '1px solid rgba(56,200,255,0.25)',
        bgcolor: 'rgba(6,14,28,0.7)',
        backgroundImage: 'radial-gradient(500px 200px at 100% 0%, rgba(255,138,61,0.1), transparent 70%)',
      }}
    >
      {/* face-down cards */}
      <Box aria-hidden sx={{ position: 'relative', width: 96, height: 120, flexShrink: 0, display: { xs: 'none', sm: 'block' } }}>
        <Box sx={{ ...card, left: 4, top: 10, transform: 'rotate(8deg)', opacity: 0.6 }} />
        <Box
          sx={{
            ...card,
            left: 14,
            top: 4,
            animation: `${bob} 3.2s ease-in-out infinite`,
            '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
          }}
        />
      </Box>
      <Box>
        <Typography sx={{ fontFamily: fonts.display, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '1.3rem', color: dmf.text }}>
          {title}
          <Box component="span" sx={{ color: dmf.orange, ml: 1 }}>
            {'//'}
          </Box>
        </Typography>
        <Typography sx={{ color: dmf.textMuted, mt: 1 }}>{text}</Typography>
      </Box>
    </Box>
  );
}
