'use client';

import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import NextLink from 'next/link';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { dmf, fonts } from '@/theme';

export type Tone = 'dark' | 'ice';

function palette(tone: Tone) {
  return tone === 'ice'
    ? { text: dmf.ink, muted: 'rgba(10,22,40,0.8)', accent: dmf.ink, strong: '#000', line: 'rgba(10,22,40,0.25)' }
    : { text: dmf.text, muted: dmf.textMuted, accent: dmf.orange, strong: dmf.ice, line: 'rgba(232,238,247,0.12)' };
}

type HastNode = { type: string; tagName?: string; value?: string; children?: HastNode[] };

/** "rule-2-5" for a paragraph that starts with **2.5**, else undefined. */
function ruleId(node: HastNode | undefined): string | undefined {
  const first = node?.children?.find((n) => !(n.type === 'text' && !n.value?.trim()));
  if (!first || first.type !== 'element' || first.tagName !== 'strong') return undefined;
  const text = (first.children ?? []).map((n) => n.value ?? '').join('').trim();
  const m = /^(\d+)\.(\d+)$/.exec(text);
  return m ? `rule-${m[1]}-${m[2]}` : undefined;
}

function buildComponents(tone: Tone): Components {
  const c = palette(tone);
  return {
    h1: ({ children }) => <Typography variant="h2" component="h2" sx={{ color: c.text, mb: 2 }}>{children}</Typography>,
    h2: ({ children }) => <Typography variant="h3" component="h3" sx={{ color: c.text, mt: 4, mb: 2 }}>{children}</Typography>,
    h3: ({ children }) => <Typography variant="h4" component="h3" sx={{ color: c.accent, mt: 4, mb: 1.5 }}>{children}</Typography>,
    h4: ({ children }) => <Typography variant="h5" component="h4" sx={{ color: c.text, mt: 3, mb: 1 }}>{children}</Typography>,
    p: ({ node, children }) => (
      // A paragraph that starts with a bold rule number ("**2.5** ...") gets id="rule-2-5", so
      // references like §2.5 can link to it.
      <Typography
        variant="body1"
        id={ruleId(node)}
        sx={{
          color: c.muted,
          mb: 2.5,
          '&:last-child': { mb: 0 },
          scrollMarginTop: 96,
          transition: 'background-color 600ms',
          '&:target': { bgcolor: 'rgba(255,138,61,0.12)', outline: '6px solid rgba(255,138,61,0.12)' },
        }}
      >
        {children}
      </Typography>
    ),
    strong: ({ children }) => (
      <Box component="strong" sx={{ color: c.strong, fontWeight: 700 }}>
        {children}
      </Box>
    ),
    em: ({ children }) => <Box component="em" sx={{ color: c.text, fontStyle: 'italic' }}>{children}</Box>,
    a: ({ href, children }) => {
      const external = !!href && /^https?:\/\//.test(href);
      // Links inside the site ("/errata") go through next/link so they get the base path.
      const internal = !!href && href.startsWith('/') && !href.startsWith('//');
      return (
        <Link
          href={href}
          {...(internal ? { component: NextLink } : {})}
          underline="always"
          sx={{ color: c.accent, textDecorationThickness: 2, textUnderlineOffset: 4, fontWeight: 600 }}
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {children}
        </Link>
      );
    },
    ul: ({ children }) => (
      <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, mb: 2.5, display: 'grid', gap: 1.75 }}>
        {children}
      </Box>
    ),
    ol: ({ children }) => (
      <Box
        component="ol"
        sx={{ listStyle: 'none', p: 0, m: 0, mb: 2.5, display: 'grid', gap: 1.75, counterReset: 'step' }}
      >
        {children}
      </Box>
    ),
    li: ({ children }) => {
      return (
        <Typography
          component="li"
          variant="body1"
          sx={{
            color: c.muted,
            position: 'relative',
            pl: 4,
            '& > p': { mb: 0 },
            // Square bullet for <ul>
            'ul > &::before': {
              content: '""',
              position: 'absolute',
              left: 4,
              top: '0.6em',
              width: 9,
              height: 9,
              bgcolor: c.accent,
              transform: 'rotate(45deg)',
            },
            // Numbered badge for <ol>
            'ol > &': { counterIncrement: 'step' },
            'ol > &::before': {
              content: 'counter(step, decimal-leading-zero)',
              position: 'absolute',
              left: 0,
              top: '0.1em',
              fontFamily: fonts.display,
              fontWeight: 700,
              color: c.accent,
            },
          }}
        >
          {children}
        </Typography>
      );
    },
    blockquote: ({ children }) => (
      <Box
        component="blockquote"
        sx={{
          m: 0,
          my: 4,
          pl: 3,
          borderLeft: `4px solid ${c.accent}`,
          '& p': {
            fontFamily: fonts.display,
            fontWeight: 700,
            textTransform: 'uppercase',
            fontSize: { xs: '1.35rem', md: '1.75rem' },
            lineHeight: 1.2,
            color: c.text,
            mb: 0,
          },
        }}
      >
        {children}
      </Box>
    ),
    hr: () => <Box component="hr" sx={{ border: 0, borderTop: `1px solid ${c.line}`, my: 5 }} />,
    code: ({ children }) => (
      <Box
        component="code"
        sx={{ fontFamily: 'ui-monospace, Consolas, monospace', fontSize: '0.9em', px: 0.75, bgcolor: 'rgba(0,0,0,0.25)' }}
      >
        {children}
      </Box>
    ),
    pre: ({ children }) => (
      <Box component="pre" sx={{ p: 2, mb: 2.5, overflowX: 'auto', bgcolor: 'rgba(0,0,0,0.3)', '& code': { bgcolor: 'transparent', px: 0 } }}>
        {children}
      </Box>
    ),
    table: ({ children }) => (
      <TableContainer sx={{ mb: 3, border: `1px solid ${c.line}` }}>
        <Table size="small">{children}</Table>
      </TableContainer>
    ),
    thead: ({ children }) => <TableHead>{children}</TableHead>,
    tbody: ({ children }) => <TableBody>{children}</TableBody>,
    tr: ({ children }) => <TableRow>{children}</TableRow>,
    th: ({ children }) => (
      <TableCell sx={{ fontFamily: fonts.display, fontWeight: 700, textTransform: 'uppercase', color: c.accent, borderColor: c.line }}>
        {children}
      </TableCell>
    ),
    td: ({ children }) => <TableCell sx={{ color: c.muted, borderColor: c.line }}>{children}</TableCell>,
    img: ({ src, alt }) => (
      <Box component="img" src={typeof src === 'string' ? src : undefined} alt={alt ?? ''} sx={{ maxWidth: '100%', display: 'block', my: 3 }} />
    ),
  };
}

const cache: Partial<Record<Tone, Components>> = {};

export default function Markdown({ children, tone = 'dark' }: { children: string; tone?: Tone }) {
  const components = (cache[tone] ??= buildComponents(tone));
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {children}
    </ReactMarkdown>
  );
}
