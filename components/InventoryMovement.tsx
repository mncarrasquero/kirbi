'use client';

import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export function InventoryMovement() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [movement, setMovement] = useState({
    material_id: '',
    location_id: '',
    quantity: 0,
    entry_type: 'in',
    worker_name: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchMaterials();
    fetchLocations();
  }, []);

  const fetchMaterials = async () => {
    const { data } = await supabase
      .from('materials')
      .select('*')
      .order('name');
    setMaterials(data || []);
  };

  const fetchLocations = async () => {
    const { data } = await supabase
      .from('locations')
      .select('*')
      .order('name');
    setLocations(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debe iniciar sesión para realizar movimientos",
      });
      return;
    }

    const { error } = await supabase
      .from('inventory_entries')
      .insert([{
        ...movement,
        user_id: user.id,
      }]);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo registrar el movimiento",
      });
      return;
    }

    toast({
      title: "Éxito",
      description: "Movimiento registrado correctamente",
    });

    setMovement({
      material_id: '',
      location_id: '',
      quantity: 0,
      entry_type: 'in',
      worker_name: '',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Tipo de Movimiento</Label>
        <Select
          value={movement.entry_type}
          onValueChange={(value) => setMovement({ ...movement, entry_type: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccione tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="in">Entrada</SelectItem>
            <SelectItem value="out">Salida</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Material</Label>
        <Select
          value={movement.material_id}
          onValueChange={(value) => setMovement({ ...movement, material_id: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccione material" />
          </SelectTrigger>
          <SelectContent>
            {materials.map((material) => (
              <SelectItem key={material.id} value={material.id}>
                {material.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Ubicación</Label>
        <Select
          value={movement.location_id}
          onValueChange={(value) => setMovement({ ...movement, location_id: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccione ubicación" />
          </SelectTrigger>
          <SelectContent>
            {locations.map((location) => (
              <SelectItem key={location.id} value={location.id}>
                {location.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Cantidad</Label>
        <Input
          type="number"
          value={movement.quantity}
          onChange={(e) => setMovement({ ...movement, quantity: Number(e.target.value) })}
          required
        />
      </div>

      {movement.entry_type === 'out' && (
        <div className="space-y-2">
          <Label>Trabajador</Label>
          <Input
            value={movement.worker_name}
            onChange={(e) => setMovement({ ...movement, worker_name: e.target.value })}
            required
          />
        </div>
      )}

      <Button type="submit">Registrar Movimiento</Button>
    </form>
  );
}