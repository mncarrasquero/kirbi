'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MovementsHistory } from '@/components/MovementsHistory';
import { Auth } from '@/components/Auth';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function MovementsPage() {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="container mx-auto max-w-6xl p-4 lg:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Movement History</CardTitle>
        </CardHeader>
        <CardContent>
          <MovementsHistory />
        </CardContent>
      </Card>
    </div>
  );
}