'use client';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { dmf } from '@/theme';
import { withBase } from '@/lib/basePath';
import { GlitchDivider, GradientTitle, NotchButton, SlashLabel, patternBg } from './Decor';
import { RETURN_KEY } from '@/lib/serverError';

/** 500 page: the file server is down, so cards and decks can't be shown right now. */
export default function ServerErrorView() {
  const retry = () => {
    let to = '/';
    try {
      to = window.sessionStorage.getItem(RETURN_KEY) || '/';
    } catch {
      /* storage blocked: go home */
    }
    // A full reload, so the page checks the file server again
    window.location.href = to.startsWith('/') ? (to.startsWith(withBase('/')) ? to : withBase(to)) : withBase('/');
  };

  return (
    <Box sx={{ ...patternBg, minHeight: 'calc(100vh - 72px)', display: 'flex', alignItems: 'center', py: { xs: 8, md: 10 } }}>
      <Container maxWidth="lg">
        <SlashLabel>Error 500</SlashLabel>
        <GradientTitle variant="h1" component="h1" sx={{ fontSize: { xs: '3rem', md: '5rem' } }}>
          The deck slipped
        </GradientTitle>
        <GlitchDivider />
        <Typography sx={{ color: dmf.textMuted, maxWidth: 560, mb: 4 }}>
          The cards and decks live on a separate server, and it isn&apos;t answering right now. It&apos;s not you: try again in a few minutes.
        </Typography>
        <NotchButton onClick={retry}>Try again</NotchButton>
      </Container>
    </Box>
  );
}
