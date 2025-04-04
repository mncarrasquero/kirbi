'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { StockLevels } from '@/components/StockLevels';
import { MaterialRequest } from '@/components/MaterialRequest';
import { Auth } from '@/components/Auth';

type SelectedMaterial = {
    material_id: string;
    material_name: string;
    quantity: number;
    unit: string;
    image_url?: string | null;
};

export function HomeClient() {
    const [lowStockMaterials, setLowStockMaterials] = useState<any[]>([]);
    const [session, setSession] = useState<any>(null);
    const [selectedMaterials, setSelectedMaterials] = useState<SelectedMaterial[]>([]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            supabase.auth.getSession().then(({ data: { session } }) => {
                setSession(session);
            });

            const {
                data: { subscription },
            } = supabase.auth.onAuthStateChange((_event, session) => {
                setSession(session);
            });

            return () => subscription.unsubscribe();
        }
    }, []);

    // Rest of your component...

    if (!session) {
        return <Auth />;
    }

    return (
        <div className="container mx-auto max-w-6xl p-4 lg:p-6">
            {/* Your existing JSX */}
        </div>
    );
} 