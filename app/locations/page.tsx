'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LocationsTable } from '@/components/LocationsTable';
import { Auth } from '@/components/Auth';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function LocationsPage() {
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
    <div className="p-4 lg:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Locations Management</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <LocationsTable />
        </CardContent>
      </Card>
    </div>
  );
}