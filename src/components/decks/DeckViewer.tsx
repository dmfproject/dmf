'use client';

import NextLink from 'next/link';
import Box from '@mui/material/Box';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { dmf, fonts } from '@/theme';
import type { DeckList } from '@/lib/decklist';
import { GlitchDivider, GradientTitle, SlashLabel } from '../Decor';
import PageShell, { PAGE_TITLE_SIZE } from '../PageShell';
import CardBrowser, { type CardSection } from '../cards/CardBrowser';

export default function DeckViewer({ deck }: { deck: DeckList }) {
  // Main Deck always; Extra Deck only when it has cards. The Side Deck isn't shown.
  const sections: CardSection[] = [
    { key: 'main', label: 'Main Deck', cards: deck.main },
    { key: 'extra', label: 'Extra Deck', cards: deck.extra },
  ].filter((s) => s.key === 'main' || s.cards.length > 0);

  return (
    <PageShell>
        <Box
          component={NextLink}
          href="/decks"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            mb: 3,
            fontFamily: fonts.ui,
            fontWeight: 700,
            fontSize: '0.8rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: dmf.textMuted,
            textDecoration: 'none',
            '&:hover': { color: dmf.orange },
          }}
        >
          <ArrowBackIcon fontSize="small" /> All decks
        </Box>
        <SlashLabel>Deck</SlashLabel>
        <GradientTitle variant="h1" component="h1" sx={{ fontSize: PAGE_TITLE_SIZE }}>
          {deck.title}
        </GradientTitle>
        <GlitchDivider />

        <CardBrowser sections={sections} images={deck.images} />
    </PageShell>
  );
}
