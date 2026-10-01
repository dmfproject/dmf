'use client';

/**
 * Card animations: FlipFan (Main page hero) and ShuffleStack (404 page).
 * Both take a pool of card image URLs and cycle through them.
 */

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import Box from '@mui/material/Box';
import { keyframes } from '@emotion/react';
import { dmf } from '@/theme';
import { withBase } from '@/lib/basePath';

const RADIUS = '3.5% / 2.4%';
const RATIO = '590 / 860';
const SHADOW = `drop-shadow(0 18px 30px rgba(0,0,0,0.55)) drop-shadow(0 0 24px ${dmf.ice}33)`;

/** Run `fn` every `ms`, unless the viewer prefers reduced motion. */
function useTicker(fn: () => void, ms: number) {
  const saved = useRef(fn);
  saved.current = fn;
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => saved.current(), ms);
    return () => clearInterval(t);
  }, [ms]);
}

function CardImg({ src, style }: { src: string; style?: CSSProperties }) {
  return (
    <Box
      component="img"
      src={src}
      alt=""
      draggable={false}
      decoding="async"
      style={style}
      sx={{ display: 'block', width: '100%', height: 'auto', aspectRatio: RATIO, objectFit: 'cover', borderRadius: RADIUS, userSelect: 'none' }}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Flip fan - the 3-card fan; click a card to flip it over to a new one */
/*    over to reveal a different card.                                 */
/* ------------------------------------------------------------------ */

const float = keyframes`
  0%, 100% { transform: translateY(0) rotate(var(--r)); }
  50% { transform: translateY(-14px) rotate(var(--r)); }
`;

// z = stacking: right card on top, middle in the middle, left at the back.
const FAN = [
  { r: '-12deg', x: 0, y: 70, d: '0s', z: 1 },
  { r: '3deg', x: 130, y: 0, d: '-1.2s', z: 2 },
  { r: '15deg', x: 265, y: 80, d: '-2.4s', z: 3 },
];

const FLIP_MS = 450;
/** The card stays face-down for at least this long once the flip to the back has finished. */
const MIN_BACK_MS = 500;
const BACK = withBase('/back.jpg');

/** Download + decode an image; resolves true when it's ready to show. */
function loadImage(url: string): Promise<boolean> {
  const img = new Image();
  img.decoding = 'async';
  img.src = url;
  return img.decode().then(
    () => true,
    () => false,
  );
}

/** First deal: each card waits face-down at least this long (plus a small stagger) before flipping up. */
const FIRST_DEAL_MS = 700;
const DEAL_STAGGER_MS = 180;

/**
 * Three cards, no automatic changes. They start face-down; each one flips face-up once its card
 * image has loaded and a short minimum wait has passed (whichever comes later). Clicking a card
 * flips it to the card back, loads a new card, and flips it back face-up. Each card flips
 * independently; a card ignores clicks until its own flip has finished.
 */
export function FlipFan({ cards }: { cards: string[] }) {
  // `turns` = half-turns so far; odd = face-down. Each flip adds 2 (over to the back, then on
  // round to the front), so the card always keeps spinning the same way instead of turning back.
  // Start face-down (turns 1) with no card on the front yet.
  const [slots, setSlots] = useState(() => FAN.map(() => ({ src: BACK, turns: 1 })));
  // Each card flips on its own: a card ignores clicks only while it's mid-flip itself.
  const [busy, setBusy] = useState<boolean[]>(() => FAN.map(() => true));
  const busyRef = useRef<boolean[]>(FAN.map(() => true));
  const slotsRef = useRef(slots);
  slotsRef.current = slots;
  const pending = useRef(new Set<string>()); // cards on their way in, so two flips don't pick the same one
  const next = useRef(0); // next card in `cards` to use

  const setBusyAt = (i: number, value: boolean) => {
    busyRef.current[i] = value;
    setBusy((b) => b.map((v, k) => (k === i ? value : v)));
  };

  /** The next card that isn't already on the table (or on its way there). */
  const pickIncoming = (fallback: string) => {
    const showing = new Set([...slotsRef.current.map((s) => s.src), ...pending.current]);
    for (let tries = 0; tries < cards.length; tries++) {
      const candidate = cards[next.current % cards.length];
      next.current += 1;
      if (!showing.has(candidate)) return candidate;
    }
    return fallback;
  };

  /** Load a new card (trying a few if some fail); null if none loaded. */
  const loadNext = async (fallback: string): Promise<string | null> => {
    for (let attempt = 0; attempt < 3 && cards.length > 0; attempt++) {
      const incoming = pickIncoming(fallback);
      pending.current.add(incoming);
      const ok = await loadImage(incoming);
      pending.current.delete(incoming);
      if (ok) return incoming;
    }
    return null;
  };

  // First deal: the three cards are face-down; flip each one up when its image is ready.
  // Waits until the card list has arrived (it may load after the page is shown).
  const hasCards = cards.length > 0;
  useEffect(() => {
    if (!hasCards) return;
    let alive = true;
    FAN.forEach((_, i) => {
      void (async () => {
        const [card] = await Promise.all([loadNext(BACK), new Promise((r) => setTimeout(r, FIRST_DEAL_MS + i * DEAL_STAGGER_MS))]);
        if (!alive || !card) return; // nothing loaded: stay face-down
        setSlots((prev) => prev.map((s, k) => (k === i ? { src: card, turns: s.turns + 1 } : s)));
        setTimeout(() => alive && setBusyAt(i, false), FLIP_MS);
      })();
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasCards]);

  const flip = async (i: number) => {
    if (busyRef.current[i] || cards.length === 0) return;
    setBusyAt(i, true);

    // 1. flip to the card back, while the new card downloads; stay face-down for at least
    //    MIN_BACK_MS (longer if the download takes longer)
    setSlots((prev) => prev.map((s, k) => (k === i ? { ...s, turns: s.turns + 1 } : s)));
    const [loaded] = await Promise.all([loadNext(slotsRef.current[i].src), new Promise((r) => setTimeout(r, FLIP_MS + MIN_BACK_MS))]);

    // 2. put the new card on the front (keep the old one if none loaded) and flip back
    setSlots((prev) => prev.map((s, k) => (k === i ? { src: loaded ?? s.src, turns: s.turns + 1 } : s)));

    // 3. this card can be flipped again once its flip has finished
    setTimeout(() => setBusyAt(i, false), FLIP_MS);
  };

  return (
    <Box sx={{ position: 'relative', width: 470, height: 480 }}>
      {FAN.map((f, i) => (
        <Box
          key={i}
          style={{ '--r': f.r } as CSSProperties}
          sx={{
            position: 'absolute',
            left: f.x,
            top: f.y,
            zIndex: f.z,
            width: 205,
            perspective: '1200px',
            animation: `${float} 6s ease-in-out ${f.d} infinite`,
            // The shadow lives here, not on the flipping element: a `filter` there would
            // flatten the 3D flip, and the card back would never show.
            filter: SHADOW,
          }}
        >
          <Box
            component="button"
            type="button"
            aria-label="Flip card"
            onClick={() => flip(i)}
            sx={{
              display: 'block',
              width: '100%',
              p: 0,
              border: 0,
              background: 'none',
              cursor: busy[i] ? 'default' : 'pointer',
              position: 'relative',
              transformStyle: 'preserve-3d',
              transition: `transform ${FLIP_MS}ms cubic-bezier(.4,.1,.3,1)`,
              '&:focus-visible': { outline: `2px solid ${dmf.orange}`, outlineOffset: 4 },
            }}
            style={{ transform: `rotateY(${slots[i].turns * 180}deg)` }}
          >
            {/* front */}
            <Box sx={{ backfaceVisibility: 'hidden' }}>
              <CardImg src={slots[i].src} />
            </Box>
            {/* back */}
            <Box sx={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
              <CardImg src={BACK} />
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  );
}

/* ------------------------------------------------------------------ */
/* Shuffle - a stack of cards; the top card slides out and tucks      */
/*    back in at the bottom.                                           */
/* ------------------------------------------------------------------ */

const STACK = 8;

export function ShuffleStack({ cards, complete = false }: { cards: string[]; complete?: boolean }) {
  // Fixed card positions ("slots"); each slot shows one image. order[0] = slot on top.
  const [srcs, setSrcs] = useState(() => cards.slice(0, Math.min(STACK, cards.length)));
  const [order, setOrder] = useState(() => srcs.map((_, i) => i));
  const [leaving, setLeaving] = useState<number | null>(null);
  const used = useRef(new Set<string>(srcs));

  // Latest values for the scheduler below (it runs outside React's render cycle).
  const latest = useRef({ cards, srcs, order, complete });
  latest.current = { cards, srcs, order, complete };
  const busy = useRef(false);
  const lastShuffle = useRef(0);

  // Shuffle only when (a) a newly loaded card is ready to come in and (b) at least
  // MIN_GAP has passed since the last shuffle. Once every card is loaded (`complete`),
  // keep cycling through them.
  const MIN_GAP = 2000;
  useTicker(() => {
    const now = Date.now();
    if (busy.current || now - lastShuffle.current < MIN_GAP) return;
    const { cards: pool, srcs: current, order: o, complete: allLoaded } = latest.current;
    const inStack = new Set(current);
    let incoming = pool.find((c) => !used.current.has(c) && !inStack.has(c));
    if (!incoming && allLoaded) {
      used.current = new Set(current); // everything has been shown: start over
      incoming = pool.find((c) => !inStack.has(c));
    }
    if (!incoming || o.length === 0) return; // wait for the next card to load

    used.current.add(incoming);
    busy.current = true;
    lastShuffle.current = now;

    const top = o[0];
    // The card 3rd from the back gets the new image right as it starts its step forward.
    const swapSlot = o.length >= 3 ? o[o.length - 3] : null;
    const card = incoming;

    // 1. the top card slides out
    setLeaving(top);
    // 2. it tucks back in at the bottom and every other card steps forward (+ the swap)
    setTimeout(() => {
      setOrder((prev) => [...prev.slice(1), prev[0]]);
      setLeaving(null);
      if (swapSlot !== null) {
        setSrcs((prev) => {
          const next = [...prev];
          next[swapSlot] = card;
          return next;
        });
      }
    }, 420);
    // 3. done once the step forward has finished
    setTimeout(() => {
      busy.current = false;
    }, 900);
  }, 250);

  return (
    <Box sx={{ position: 'relative', width: 300, height: 460 }}>
      {srcs.map((src, slot) => {
        const depth = order.indexOf(slot);
        const out = leaving === slot;
        // The front card has its own spot; the rest of the stack sits a clear gap behind it,
        // slightly smaller, so stepping up to the front is a visible lift forward.
        const back = depth - 1;
        const transform = out
          ? 'translate(78%, -6%) rotate(14deg)'
          : depth === 0
            ? 'translate(-6px, 8px) rotate(-2deg) scale(1)'
            : `translate(${20 + back * 7}px, ${-20 - back * 7}px) rotate(${(depth % 2 ? 1 : -1) * (1.5 + back * 1.5)}deg) scale(${0.95 - back * 0.01})`;
        return (
          <Box
            key={slot}
            sx={{
              position: 'absolute',
              left: 20,
              top: 40,
              width: 240,
              filter: depth === 0 || out ? SHADOW : 'brightness(0.75)',
              transition: 'transform 420ms cubic-bezier(.3,.7,.2,1), filter 300ms',
              zIndex: out ? 50 : 20 - depth,
            }}
            style={{ transform }}
          >
            <CardImg src={src} />
          </Box>
        );
      })}
    </Box>
  );
}

