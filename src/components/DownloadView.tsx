'use client';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { dmf, fonts } from '@/theme';
import type { Pack } from '@/lib/download';
import { GlitchDivider, GradientTitle, NotchButton, SlashLabel } from './Decor';
import PageShell, { PAGE_TITLE_SIZE } from './PageShell';
import ComingSoon from './ComingSoon';

const EDOPRO_URL = 'https://projectignis.github.io/download.html';

function Folder({ children }: { children: React.ReactNode }) {
  return (
    <Box
      component="code"
      sx={{ fontFamily: 'ui-monospace, Consolas, monospace', fontSize: '0.9em', px: 0.75, py: 0.1, bgcolor: 'rgba(56,200,255,0.1)', color: dmf.ice }}
    >
      {children}
    </Box>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <Box component="li" sx={{ display: 'grid', gridTemplateColumns: '64px 1fr', gap: 2, py: 3, borderTop: '1px solid rgba(56,200,255,0.12)' }}>
      <Typography sx={{ fontFamily: fonts.display, fontWeight: 700, fontSize: '1.6rem', lineHeight: 1.1, color: dmf.ice }}>
        {String(n).padStart(2, '0')}
        <Box component="span" sx={{ color: dmf.orange, fontSize: '1rem', ml: 0.5 }}>
          {'//'}
        </Box>
      </Typography>
      <Box>
        <Typography component="h3" sx={{ fontFamily: fonts.display, fontWeight: 700, textTransform: 'uppercase', fontSize: '1.2rem', color: dmf.text, mb: 0.75 }}>
          {title}
        </Typography>
        <Typography component="div" sx={{ color: dmf.textMuted, lineHeight: 1.7 }}>
          {children}
        </Typography>
      </Box>
    </Box>
  );
}

export default function DownloadView({ pack, inDevelopment = false }: { pack: Pack | null; inDevelopment?: boolean }) {
  return (
    <PageShell>
        <SlashLabel>EDOPro</SlashLabel>
        <GradientTitle variant="h1" component="h1" sx={{ fontSize: PAGE_TITLE_SIZE }}>
          Download
        </GradientTitle>
        <GlitchDivider />
        <Typography sx={{ color: dmf.textMuted, maxWidth: 640 }}>
          Play DMF in EDOPro. One archive with every DMF deck and all DMF card errata, scripts included.
        </Typography>

        {inDevelopment ? (
          <ComingSoon title="Nothing to draw yet" text="The EDOPro pack with every DMF deck and erratum is still being put together. It gets dealt here soon." />
        ) : (
          <>
        {/* Download panel */}
        <Box
          sx={{
            mt: 5,
            maxWidth: 900,
            p: { xs: 3, md: 4 },
            border: '1px solid rgba(56,200,255,0.25)',
            bgcolor: 'rgba(6,14,28,0.7)',
            backgroundImage: 'radial-gradient(500px 200px at 100% 0%, rgba(255,138,61,0.1), transparent 70%)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 3,
          }}
        >
          {pack ? (
            <>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontFamily: fonts.display, fontWeight: 700, fontSize: '1.3rem', color: dmf.text, wordBreak: 'break-all' }}>
                  {pack.file}
                </Typography>
                <Typography sx={{ color: dmf.textMuted, mt: 0.5 }}>
                  Updated {pack.date} · {pack.sizeMb} MB
                </Typography>
                <Typography sx={{ fontFamily: fonts.display, fontWeight: 700, letterSpacing: '0.1em', color: dmf.textMuted, mt: 1.5, fontSize: '0.9rem' }}>
                  {pack.decks} DECKS{' '}
                  <Box component="span" sx={{ color: dmf.orange }}>
                    {'//'}
                  </Box>{' '}
                  {pack.cards} DMF CARDS
                </Typography>
              </Box>
              <NotchButton href={pack.url} download={pack.file}>
                Download .zip
              </NotchButton>
            </>
          ) : (
            <Typography sx={{ color: dmf.textMuted }}>The download isn&apos;t available yet. Check back soon.</Typography>
          )}
        </Box>

        {/* Install steps */}
        <Box sx={{ mt: 8, maxWidth: 900 }}>
          <SlashLabel>How to install</SlashLabel>
          <Box component="ol" sx={{ listStyle: 'none', p: 0, m: 0, borderBottom: '1px solid rgba(56,200,255,0.12)' }}>
            <Step n={1} title="Install EDOPro">
              Get EDOPro from the{' '}
              <Link href={EDOPRO_URL} target="_blank" rel="noopener noreferrer" sx={{ color: dmf.orange, fontWeight: 600 }}>
                official Project Ignis site
              </Link>{' '}
              and run it once, so it sets up its folders.
            </Step>
            <Step n={2} title="Download the archive">
              Click <b>Download .zip</b> above.
            </Step>
            <Step n={3} title="Open your EDOPro folder">
              This is the folder EDOPro is installed in, usually called <Folder>ProjectIgnis</Folder>. It already has the
              folders <Folder>deck</Folder>, <Folder>expansions</Folder>, <Folder>pics</Folder> and{' '}
              <Folder>script</Folder> in it.
            </Step>
            <Step n={4} title="Extract the archive into it">
              Extract the .zip straight into the EDOPro folder, so its <Folder>deck</Folder>, <Folder>expansions</Folder>,{' '}
              <Folder>pics</Folder> and <Folder>script</Folder> folders merge with the ones already there. If you&apos;re asked to replace files, choose
              yes. Only DMF files are replaced.
            </Step>
            <Step n={5} title="Restart EDOPro">
              The DMF decks show up in the Deck Editor with names starting with <Folder>dmf_</Folder>. DMF erratum cards are
              marked <b>~DMF erratum~</b> in their card text.
            </Step>
          </Box>
        </Box>

        {/* Notes */}
        <Box sx={{ mt: 6, maxWidth: 900, display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
          {[
            ['Updating', 'When a new version comes out, download it and extract it the same way. It overwrites the old DMF files.'],
            ['Playing with friends', 'Both players need the DMF pack installed to duel with DMF decks, since they use DMF erratum cards.'],
          ].map(([title, text]) => (
            <Box key={title} sx={{ p: 2.5, borderLeft: `3px solid ${dmf.orange}`, bgcolor: 'rgba(255,138,61,0.06)' }}>
              <Typography sx={{ fontFamily: fonts.display, fontWeight: 700, textTransform: 'uppercase', color: dmf.text, mb: 0.5 }}>
                {title}
              </Typography>
              <Typography sx={{ color: dmf.textMuted, fontSize: '0.95rem' }}>{text}</Typography>
            </Box>
          ))}
        </Box>
          </>
        )}
    </PageShell>
  );
}
