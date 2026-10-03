"use client";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { keyframes } from "@emotion/react";
import { dmf, fonts } from "@/theme";
import { GradientTitle, NotchButton, PixelEdge, SlashLabel } from "./Decor";
import Markdown from "./Markdown";
import { FlipFan } from "./cards/CardAnimations";

const rise = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: none; }
`;

export default function Hero({
  title,
  intro,
  cards,
}: {
  title: string;
  intro: string;
  /** null while the card list is loading (cards show face-down); [] = no cards, no fan */
  cards: string[] | null;
}) {
  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        overflow: "hidden",
        minHeight: { xs: "calc(100vh - 64px)", md: "calc(100vh - 72px)" },
        display: "flex",
        alignItems: "center",
        py: { xs: 10, md: 12 },
        bgcolor: dmf.bgDeep,
        backgroundImage: `
          radial-gradient(max(320px, 48vw) max(230px, 34vw) at 80% 40%, rgba(56,200,255,0.18), transparent 70%),
          radial-gradient(max(280px, 42vw) max(190px, 28vw) at 10% 90%, rgba(255,138,61,0.12), transparent 70%),
          linear-gradient(rgba(56,200,255,0.06) 1px, transparent 1px),
          linear-gradient(90deg, rgba(56,200,255,0.06) 1px, transparent 1px)`,
        backgroundSize: "auto, auto, 48px 48px, 48px 48px",
      }}
    >
      {/* Giant watermark */}
      <Typography
        aria-hidden
        sx={{
          position: "absolute",
          right: "-2vw",
          bottom: "-6vw",
          fontFamily: fonts.display,
          fontWeight: 700,
          fontSize: "32vw",
          lineHeight: 1,
          color: "transparent",
          WebkitTextStroke: "1px rgba(56,200,255,0.08)",
          userSelect: "none",
          pointerEvents: "none",
        }}
      >
        VAULT
      </Typography>

      <Container maxWidth="lg" sx={{ position: "relative" }}>
        <Stack
          direction="row"
          sx={{ alignItems: "center", justifyContent: "space-between", gap: 6 }}
        >
          <Box sx={{ maxWidth: 680, animation: `${rise} 700ms ease both` }}>
            <SlashLabel>A fixed Yu-Gi-Oh! format</SlashLabel>
            <GradientTitle
              variant="h1"
              component="h1"
              sx={{
                fontSize: { xs: "3.25rem", sm: "4.5rem", md: "6rem" },
                mb: 4,
              }}
            >
              {title}
            </GradientTitle>
            {intro && (
              <Box sx={{ maxWidth: 600, mb: 5 }}>
                <Markdown>{intro}</Markdown>
              </Box>
            )}
            {/* Both buttons as wide as the wider one: side by side, or stacked on phones */}
            <Box sx={{ display: "inline-grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5 }}>
              <NotchButton href="/decks">Browse Decks</NotchButton>
              <NotchButton href="/rulings" variant="ghost">
                Read Rulings
              </NotchButton>
            </Box>
          </Box>
          {/* Click-to-flip cards (desktop only). Shown face-down while the card list loads, flipped up
              once it and the images are in; left out when there are no cards at all (no decks). */}
          {(cards === null || cards.length > 0) && (
            <Box sx={{ display: { xs: "none", md: "block" }, flexShrink: 0 }}>
              <FlipFan cards={cards ?? []} />
            </Box>
          )}
        </Stack>
      </Container>

      <PixelEdge color={dmf.bg} />
    </Box>
  );
}
