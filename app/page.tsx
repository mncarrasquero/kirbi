import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Import the client component with SSR disabled
const HomeClient = dynamic(() => import('./home-client').then(mod => ({ default: mod.HomeClient })), {
  ssr: false,
  loading: () => <div className="flex justify-center items-center min-h-screen">Loading...</div>
});

export default function Home() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
      <HomeClient />
    </Suspense>
  );
}