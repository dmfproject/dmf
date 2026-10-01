'use client';

import { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { dmf, fonts } from '@/theme';
import { GlitchDivider, GradientTitle, PixelEdge, patternBg } from './Decor';
import Markdown from './Markdown';

export type BandVariant = 'pattern' | 'surface' | 'ice';

export const bandColor: Record<BandVariant, string> = {
  pattern: dmf.bg,
  surface: dmf.surface,
  ice: dmf.ice,
};

const backgrounds: Record<BandVariant, object> = {
  pattern: patternBg,
  surface: {
    backgroundColor: dmf.surface,
    backgroundImage: 'radial-gradient(800px 400px at 0% 100%, rgba(255,138,61,0.06), transparent 70%)',
  },
  ice: {
    backgroundColor: dmf.ice,
    backgroundImage: `linear-gradient(180deg, #5ad6ff 0%, #1f9fe0 100%),
      repeating-linear-gradient(135deg, rgba(10,22,40,0.06) 0 2px, transparent 2px 22px)`,
    backgroundBlendMode: 'multiply',
  },
};

/** Fade/slide in once the band scrolls into view. */
function useReveal<T extends Element>() {
  const ref = useRef<T | null>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, shown };
}

export default function SectionBand({
  id,
  index,
  title,
  body,
  variant,
  prevColor,
  nextColor,
}: {
  id: string;
  index: number;
  title: string;
  body: string;
  variant: BandVariant;
  prevColor?: string;
  nextColor?: string;
}) {
  const { ref, shown } = useReveal<HTMLDivElement>();
  const ice = variant === 'ice';
  const tone = ice ? 'ice' : 'dark';

  return (
    <Box
      component="section"
      id={id}
      sx={{
        position: 'relative',
        overflow: 'clip',
        scrollMarginTop: 72,
        py: { xs: ice ? 12 : 9, md: ice ? 16 : 13 },
        ...backgrounds[variant],
      }}
    >
      {ice && prevColor && <PixelEdge color={prevColor} flip />}

      <Container maxWidth="lg">
        <Grid
          ref={ref}
          container
          spacing={{ xs: 2, md: 8 }}
          sx={{
            opacity: shown ? 1 : 0,
            transform: shown ? 'none' : 'translateY(32px)',
            transition: 'opacity 700ms ease, transform 700ms ease',
          }}
        >
          <Grid size={{ xs: 12, md: 5 }}>
            <Box sx={{ position: { md: 'sticky' }, top: { md: 110 } }}>
              <Typography
                sx={{
                  fontFamily: fonts.display,
                  fontWeight: 700,
                  fontSize: '1rem',
                  letterSpacing: '0.2em',
                  color: ice ? dmf.ink : dmf.ice,
                  mb: 1.5,
                }}
              >
                {String(index + 1).padStart(2, '0')} //
              </Typography>
              {ice ? (
                <Typography variant="h2" component="h2" sx={{ color: dmf.ink, fontSize: { xs: '2.5rem', md: '3.25rem' } }}>
                  {title}
                </Typography>
              ) : (
                <GradientTitle variant="h2" component="h2" sx={{ fontSize: { xs: '2.5rem', md: '3.25rem' } }}>
                  {title}
                </GradientTitle>
              )}
              <GlitchDivider color={ice ? dmf.ink : dmf.orange} />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 7 }} sx={{ pt: { md: 5 } }}>
            <Markdown tone={tone}>{body}</Markdown>
          </Grid>
        </Grid>
      </Container>

      {ice && nextColor && <PixelEdge color={nextColor} />}
    </Box>
  );
}
