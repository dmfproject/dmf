'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { dmf, fonts } from '@/theme';
import type { Update } from '@/lib/content';
import Markdown from '../Markdown';
import { SlashLabel } from '../Decor';

function UpdateEntry({ update, latest = false }: { update: Update; latest?: boolean }) {
  return (
    <Box
      component="article"
      sx={{
        position: 'relative',
        pl: { xs: 3, md: 4 },
        pb: 4,
        // Timeline line + diamond marker
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 5,
          top: 10,
          bottom: 0,
          width: 2,
          bgcolor: 'rgba(56,200,255,0.2)',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          left: 0,
          top: 6,
          width: 12,
          height: 12,
          transform: 'rotate(45deg)',
          bgcolor: latest ? dmf.orange : dmf.ice,
          boxShadow: latest ? `0 0 16px ${dmf.orange}` : 'none',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 1 }}>
        <Typography
          component="time"
          sx={{ fontFamily: fonts.display, fontWeight: 700, letterSpacing: '0.12em', color: dmf.ice, fontSize: '0.95rem' }}
        >
          {update.date}
        </Typography>
        {latest && (
          <Box
            component="span"
            sx={{
              px: 1,
              py: 0.25,
              fontFamily: fonts.ui,
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: dmf.ink,
              bgcolor: dmf.orange,
            }}
          >
            Latest
          </Box>
        )}
      </Box>
      <Typography variant="h4" component="h3" sx={{ color: dmf.text, mb: 1.5 }}>
        {update.title}
      </Typography>
      {update.description && (
        <Box sx={{ '& p, & li': { fontSize: '1rem' } }}>
          <Markdown>{update.description}</Markdown>
        </Box>
      )}
    </Box>
  );
}

/** Changelog: only the newest update is shown until the user expands the list. */
export default function UpdatesSection({ updates }: { updates: Update[] }) {
  const [open, setOpen] = useState(false);
  if (updates.length === 0) return null;
  const [latest, ...older] = updates;

  return (
    <Box
      sx={{
        border: '1px solid rgba(56,200,255,0.18)',
        bgcolor: 'rgba(6,14,28,0.6)',
        p: { xs: 3, md: 5 },
        pb: { xs: 1, md: 2 },
      }}
    >
      <SlashLabel>Updates</SlashLabel>

      <UpdateEntry update={latest} latest />

      {older.length > 0 && (
        <>
          <Collapse in={open} unmountOnExit>
            {older.map((u) => (
              <UpdateEntry key={u.id} update={u} />
            ))}
          </Collapse>
          <ButtonBase
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            sx={{
              mb: 3,
              gap: 1,
              px: 2,
              py: 1,
              fontFamily: fonts.ui,
              fontWeight: 700,
              fontSize: '0.8rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: dmf.ice,
              border: '1px solid rgba(56,200,255,0.35)',
              transition: 'background-color 150ms, border-color 150ms',
              '&:hover': { bgcolor: 'rgba(56,200,255,0.08)', borderColor: dmf.ice },
            }}
          >
            {open ? 'Hide older updates' : `Show all updates (${updates.length})`}
            <ExpandMoreIcon fontSize="small" sx={{ transition: 'transform 200ms', transform: open ? 'rotate(180deg)' : 'none' }} />
          </ButtonBase>
        </>
      )}
    </Box>
  );
}
