/**
 * Static export for GitHub Pages: `npm run build` writes the whole site to ./out
 *
 * BASE_PATH is the sub-folder the site is served from. On GitHub Pages a project site lives at
 * https://<user>.github.io/<repo>/, so BASE_PATH=/<repo> (the deploy workflow sets it).
 * Leave it empty for a user site (<user>.github.io) or a custom domain, and for local dev.
 *
 * FILE_SERVER (.env, or a repository variable in the deploy workflow) is where the content lives:
 * decks, card images and texts, covers, the .json/.md files and the EDOPro pack. It's read at build
 * time, and images and downloads are linked from it.
 */
const basePath = process.env.BASE_PATH ?? '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  basePath,
  // /decks/alien/ -> out/decks/alien/index.html, which GitHub Pages serves directly
  trailingSlash: true,
  env: {
    // Let client code build asset URLs (fetch, <img src>) with the same prefix
    NEXT_PUBLIC_BASE_PATH: basePath,
    // The browser also needs the file server (e.g. the Main page loads philosophy.md from it)
    NEXT_PUBLIC_FILE_SERVER: process.env.FILE_SERVER ?? '',
  },
  // Tree-shake MUI icon/material imports for faster dev builds
  experimental: {
    optimizePackageImports: ['@mui/material', '@mui/icons-material'],
  },
};

export default nextConfig;
