import type { Metadata } from 'next';
import RulingsPage from '@/components/pages/RulingsPage';

export const metadata: Metadata = { title: 'Rulings' };

export default function Page() {
  return <RulingsPage />;
}
