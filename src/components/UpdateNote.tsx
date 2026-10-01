'use client';

import { useEffect, useState } from 'react';
import NextLink from 'next/link';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { dmf, fonts } from '@/theme';
import type { UpdateNews } from '@/lib/content';

/**
 * Main page note about the latest update, shown for 30 days after its date. The built page
 * decides with the build date; in the browser it's re-checked against today, so the note goes
 * away on time even without a rebuild.
 */
export default function UpdateNote({ news }: { news: UpdateNews }) {
  const [show, setShow] = useState(news.recent);
  useEffect(() => setShow(Date.now() < news.until), [news.until]);
  if (!show) return null;

  const name = news.title.trim();
  const decks = news.decks.length;

  return (
    // Full-width strip laid over the top of the page (height 0 wrapper), so it doesn't push the content down
    <Box sx={{ position: 'relative', height: 0, zIndex: 2 }}>
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bgcolor: 'rgba(10,22,40,0.72)',
          backgroundImage: 'linear-gradient(rgba(255,138,61,0.12), rgba(255,138,61,0.12))',
          backdropFilter: 'blur(6px)',
          borderBottom: `1px solid rgba(255,138,61,0.35)`,
        }}
      >
      <Container maxWidth="lg">
        <Box
          component={NextLink}
          href="/decks"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            columnGap: 1.25,
            rowGap: 0.25,
            py: 1.25,
            color: dmf.text,
            textDecoration: 'none',
            fontFamily: fonts.ui,
            fontSize: '0.875rem',
            fontWeight: 600,
            '&:hover .name': { color: dmf.orange },
            '&:hover .arrow': { transform: 'translateX(3px)' },
          }}
        >
          {/* With a name: "NEW// Ancient Legacy update ..."; without: "NEW UPDATE// ..." */}
          <Box component="span" sx={{ fontFamily: fonts.display, fontWeight: 700, color: dmf.orange, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {name ? 'New' : 'New update'}
            {'//'}
          </Box>
          {name && (
            <Box component="span" className="name" sx={{ transition: 'color 150ms' }}>
              {name} update
            </Box>
          )}
          <Box component="span" sx={{ color: dmf.textMuted, fontWeight: 500 }}>
            {news.date}
            {decks > 0 && ` · ${decks} new deck${decks === 1 ? '' : 's'}`}
          </Box>
          <ArrowForwardIcon className="arrow" sx={{ fontSize: '1rem', color: dmf.orange, transition: 'transform 150ms' }} />
        </Box>
        </Container>
      </Box>
    </Box>
  );
}
