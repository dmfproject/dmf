'use client';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { dmf, fonts } from '@/theme';
import type { Deck, Update } from '@/lib/content';
import { GlitchDivider, GradientTitle, SlashLabel, patternBg } from '../Decor';
import { PAGE_MAX_WIDTH, PAGE_PB, PAGE_PT, PAGE_TITLE_SIZE } from '../PageShell';
import UpdatesSection from './UpdatesSection';
import DeckGrid from './DeckGrid';
import ComingSoon from '../ComingSoon';

export default function DecksView({ decks, updates }: { decks: Deck[]; updates: Update[] }) {
  return (
    <>
      {/* Header + updates */}
      <Box
        component="section"
        sx={{
          ...patternBg,
          pt: PAGE_PT,
          pb: decks.length ? { xs: 6, md: 8 } : PAGE_PB,
          // With no decks this is the whole page, so it fills the screen
          minHeight: decks.length ? undefined : 'calc(100vh - 72px)',
          backgroundImage: `${patternBg.backgroundImage}, radial-gradient(600px 300px at 10% 100%, rgba(255,138,61,0.1), transparent 70%)`,
        }}
      >
        <Container maxWidth={PAGE_MAX_WIDTH}>
          <SlashLabel>The DMF pool</SlashLabel>
          <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 3, flexWrap: 'wrap' }}>
            <GradientTitle variant="h1" component="h1" sx={{ fontSize: PAGE_TITLE_SIZE }}>
              Decks
            </GradientTitle>
            {decks.length > 0 && (
              <Typography sx={{ fontFamily: fonts.display, fontWeight: 700, color: dmf.textMuted, letterSpacing: '0.12em', pb: 1.5 }}>
                <Box component="span" sx={{ color: dmf.orange }}>{'// '}</Box>
                {decks.length} {decks.length === 1 ? 'DECK' : 'DECKS'}
              </Typography>
            )}
          </Box>
          <GlitchDivider />
          {decks.length === 0 ? (
            <ComingSoon title="Still shuffling" text="The first DMF decks are on the testing table, duel after duel, until every one of them can beat every other. They join the pool soon." />
          ) : (
            <Box sx={{ mt: 5 }}>
              <UpdatesSection updates={updates} />
            </Box>
          )}
        </Container>
      </Box>

      {/* Deck grid */}
      {decks.length > 0 && (
        <Box component="section" sx={{ bgcolor: dmf.surface, pt: { xs: 7, md: 10 }, pb: PAGE_PB }}>
          <Container maxWidth={PAGE_MAX_WIDTH}>
            <DeckGrid decks={decks} />
          </Container>
        </Box>
      )}
    </>
  );
}
