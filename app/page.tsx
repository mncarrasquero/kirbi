import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Use dynamic import with ssr: false for components that might be causing hydration issues
const MovementsHistory = dynamic(
  () => import('@/components/MovementsHistory').then((mod) => ({ default: mod.MovementsHistory })),
  { ssr: false }
);

export default function Home() {
  return (
    <main className="container mx-auto py-6 space-y-8">
      <h1 className="text-2xl font-bold">Inventory Movements</h1>

      <Suspense fallback={<div>Loading movements...</div>}>
        <MovementsHistory />
      </Suspense>
    </main>
  );
}