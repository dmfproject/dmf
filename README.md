# Vault Format Web

The public website for Vault Format, a fixed-format Yu-Gi-Oh! with premade decks. Built with Next.js (App Router) and Material UI, and published as a static site on GitHub Pages.

The site holds **no content of its own**. Decks, card images and texts, covers, the `.json`/`.md` files and the EDOPro pack live on a **file server**: the private admin repo (`dmf_admin`), which also has the admin pages for adding and editing all of it. Every page loads its content from there in the browser, on every visit, so content changes show up right away without rebuilding this site.

## Run locally

1. Start the file server: in `dmf_admin`, `npm run dev -- -p 3002`
2. In this repo, copy `.env.example` to `.env` (it points at `http://localhost:3002/`)
3. Run the site:

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static site -> out/
npm run preview    # serve out/ on http://localhost:4173
```

`.env` is not committed. `FILE_SERVER` is built into the site, so restart `npm run dev` (or rebuild) after changing it.

## How pages load

- **Loading screen:** on the first visit, and when moving between pages inside the site, a loading screen fades in (the header stays visible), the page loads its content behind it, and the screen fades out. It stays up at least 0.3 s, so it never just flickers.
- **What a page waits for:** only what it needs to show itself.
  - Main page: `philosophy.md`. The hero cards start face-down and flip up once the card list and their images are in; with no decks there are no cards. The update note appears when it's loaded.
  - Deck page and Errata: the deck lists. Card images load as they appear; card texts load in the background (a card opened early says "Loading card text…").
- **File server down:** visitors land on the 500 page ("The deck slipped") with a **Try again** button that reloads the page they were on.
- **Deck page address:** `/deck/?d=<deck_id>` (the static site can't have one page per deck, since decks are only known on the file server).

## What the site expects on the file server

| What | Path |
| --- | --- |
| Main page / Rules / Errata intro | `content/philosophy.md`, `content/rulings.md`, `content/errata.md` |
| Decks and updates | `content/decks.json`, `content/updates.json`, `content/updates/<id>.md` |
| Deck lists | `decks/<deck_id>.ydk` |
| Card images and texts | `cards/<card_id>.jpg`, `card_texts/<card_id>.txt` |
| Deck covers | `covers/<card_id>.jpg`, `covers/crops/<deck>--<card>-<x>-<y>-<size>.jpg` |
| EDOPro pack | `downloads/vault_format_edopro.json` + the zip it names |

The file server must allow other sites to read these files (CORS); `dmf_admin` does. Cards with ids `900000000`-`900009999` are **Vault Format errata**; the Errata page lists every one used in a deck.

Pages with nothing to show yet say so instead of showing an empty page: Decks and Errata with no decks, Errata with no errata cards, Download with no decks or no archive.

## Content formats

**Main page (`content/philosophy.md`):**

- `# Title` and the text before the first `##`: the hero at the top
- each `## Heading`: its own full-width section
- `> quote`: large callout
- `**bold**`: highlighted text

**Rules (`content/rulings.md`):**

- `# Title`, an intro, then one `## n. Section` per section (shown in the Contents list)
- rules start with a bold number, `**2.5** ...`; any `§2.5` or `§6` in the text becomes a link to that rule or section

**Card texts (`card_texts/<card_id>.txt`):** a line of only dashes (`---`) is shown as a divider, e.g. between a Spellform card's spell and monster effects.

**Rules PDF:** the Rulings page's **Download rules** button turns `rulings.md` into a PDF in the browser, named `Vault_Format_rules_<version>.pdf` from the `Version 1.0` line. Change that line when the rules change.

**New tag and update note:** decks from the **latest** update show **New** for 30 days after its date, and the Main page shows a note about that update for the same 30 days. Neither shows while there's only one update.

## Project layout

| Where | What |
| --- | --- |
| `src/app/` | the routes: `/`, `/decks`, `/deck`, `/errata`, `/rulings`, `/download`, `/server-error` (the 500 page), 404 |
| `src/components/pages/` | each page's loader (fetches from the file server, then renders the view) |
| `src/components/` | views and shared pieces (`LoadingScreen`, `Decor`, `Markdown`, cards, decks) |
| `src/lib/fileServer.ts` | all file server access |
| `src/lib/` | content parsing: decks, updates, deck lists, errata, rules PDF |
| `public/` | site assets only: `back.jpg` (card back), `brand/` (logo), `.nojekyll` |

Content folders under `public/` are in `.gitignore`, so card images and texts can't end up in this repo by accident.

## Publish

Push to `master`. The GitHub Actions workflow in `.github/workflows/deploy.yml` builds the site and publishes it to GitHub Pages. One-time setup:

- **Settings > Pages > Source**: **GitHub Actions**
- **Settings > Secrets and variables > Actions > Variables**: add `FILE_SERVER` with the file server's public URL (the hosted admin repo)

The build doesn't contact the file server, so it can't fail because the file server is down. Content changes don't need a rebuild; rebuild only when the site's code changes or `FILE_SERVER` moves.
