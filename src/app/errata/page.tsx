import type { Metadata } from 'next';
import ErrataPage from '@/components/pages/ErrataPage';

export const metadata: Metadata = { title: 'Errata' };

export default function Page() {
  return <ErrataPage />;
}
