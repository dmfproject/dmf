'use client';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import type { SxProps, Theme } from '@mui/material/styles';
import { patternBg } from './Decor';

/**
 * Shared page frame: same width as the header/footer, same space below the header and
 * above the footer. Every content page (Decks, a deck, Errata, Rulings) uses these values.
 */
export const PAGE_MAX_WIDTH = 'lg' as const;
export const PAGE_PT = { xs: 6, md: 8 };
export const PAGE_PB = { xs: 8, md: 12 };
/** Page title (h1) size. */
export const PAGE_TITLE_SIZE = { xs: '2.75rem', md: '4.5rem' };

export default function PageShell({ children, sx }: { children: React.ReactNode; sx?: SxProps<Theme> }) {
  return (
    <Box sx={[{ ...patternBg, minHeight: 'calc(100vh - 72px)', pt: PAGE_PT, pb: PAGE_PB }, ...(Array.isArray(sx) ? sx : [sx])]}>
      <Container maxWidth={PAGE_MAX_WIDTH}>{children}</Container>
    </Box>
  );
}
