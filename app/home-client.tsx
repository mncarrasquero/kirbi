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

    useEffect(() => {
        if (session) {
            const fetchLowStock = async () => {
                const { data, error } = await supabase
                    .from('stock_by_location')
                    .select('*');

                if (!error && data) {
                    setLowStockMaterials(data.filter(item => item.current_stock < item.min_quantity));
                }
            };

            fetchLowStock();
        }
    }, [session]);

    const handleMaterialSelect = (material: SelectedMaterial) => {
        setSelectedMaterials(prev => {
            const exists = prev.some(m => m.material_id === material.material_id);
            if (exists) {
                return prev.filter(m => m.material_id !== material.material_id);
            }
            return [...prev, { ...material, quantity: 1 }];
        });
    };

    if (!session) {
        return <Auth />;
    }

    return (
        <div className="container mx-auto max-w-6xl p-4 lg:p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    {lowStockMaterials.length > 0 && (
                        <Alert variant="destructive" className="mb-6">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                There {lowStockMaterials.length === 1 ? 'is' : 'are'} {lowStockMaterials.length} material{lowStockMaterials.length === 1 ? '' : 's'} below minimum stock level!
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
                <MaterialRequest
                    selectedMaterials={selectedMaterials}
                    onUpdateMaterials={setSelectedMaterials}
                />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Total Stock</CardTitle>
                </CardHeader>
                <CardContent>
                    <StockLevels
                        selectedMaterials={selectedMaterials}
                        onMaterialSelect={handleMaterialSelect}
                    />
                </CardContent>
            </Card>
        </div>
    );
} 