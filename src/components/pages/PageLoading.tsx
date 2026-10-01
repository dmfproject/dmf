'use client';

import Box from '@mui/material/Box';
import { useLoadingScreen } from '../LoadingScreen';

/**
 * A page that's still loading its content renders this: it keeps the full-screen loading screen
 * up (see LoadingScreen) and holds the page's place so the footer doesn't jump.
 */
export default function PageLoading() {
  useLoadingScreen();
  return <Box sx={{ minHeight: '100vh' }} />;
}
