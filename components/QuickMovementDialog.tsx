'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { ArrowDownToLine, ArrowUpFromLine, Settings } from 'lucide-react';

type QuickMovementDialogProps = {
  material: {
    material_id: string;
    material_name: string;
    location_id: string;
    location_name: string;
    unit: string;
    current_stock: number;
  };
  onMovementComplete: () => void;
};

export function QuickMovementDialog({ material, onMovementComplete }: QuickMovementDialogProps) {
  const [open, setOpen] = useState(false);
  const [movement, setMovement] = useState({
    quantity: 1,
    entry_type: 'in',
    worker_name: '',
    reason: '',
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to make movements",
      });
      return;
    }

    try {
      // If current stock is insufficient for an out movement
      if (movement.entry_type === 'out' && material.current_stock < movement.quantity) {
        // Calculate how much stock we need to add to reach the required quantity
        const adjustmentQuantity = movement.quantity;
        
        // First make the adjustment to set stock to exactly what we need
        const { error: adjustmentError } = await supabase
          .from('inventory_entries')
          .insert([{
            material_id: material.material_id,
            location_id: material.location_id,
            quantity: adjustmentQuantity,
            entry_type: 'adjustment',
            reason: `Stock adjustment to match physical inventory: ${movement.reason || 'No reason provided'}`,
            user_id: user.id,
          }]);

        if (adjustmentError) throw adjustmentError;
      }

      // Then make the actual movement
      const { error: movementError } = await supabase
        .from('inventory_entries')
        .insert([{
          material_id: material.material_id,
          location_id: material.location_id,
          quantity: movement.quantity,
          entry_type: movement.entry_type,
          worker_name: movement.worker_name,
          reason: movement.reason,
          user_id: user.id,
        }]);

      if (movementError) throw movementError;

      toast({
        title: "Success",
        description: "Movement registered successfully",
      });

      setMovement({
        quantity: 1,
        entry_type: 'in',
        worker_name: '',
        reason: '',
      });
      setOpen(false);
      onMovementComplete();

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Could not register movement",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          {movement.entry_type === 'in' ? (
            <ArrowDownToLine className="h-4 w-4" />
          ) : (
            <ArrowUpFromLine className="h-4 w-4" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Quick Movement: {material.material_name}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Movement Type</Label>
            <Select
              value={movement.entry_type}
              onValueChange={(value) => setMovement({ ...movement, entry_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in">In</SelectItem>
                <SelectItem value="out">Out</SelectItem>
                <SelectItem value="adjustment">
                  <div className="flex items-center">
                    <Settings className="w-4 h-4 mr-2" />
                    Adjustment
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Quantity ({material.unit})</Label>
            <Input
              type="number"
              min="1"
              value={movement.quantity}
              onChange={(e) => setMovement({ ...movement, quantity: Number(e.target.value) })}
              required
            />
          </div>

          {movement.entry_type === 'out' && (
            <div className="space-y-2">
              <Label>Worker</Label>
              <Input
                value={movement.worker_name}
                onChange={(e) => setMovement({ ...movement, worker_name: e.target.value })}
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Reason</Label>
            <Textarea
              value={movement.reason}
              onChange={(e) => setMovement({ ...movement, reason: e.target.value })}
              placeholder="Explain why this movement is necessary..."
            />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {movement.entry_type === 'adjustment' ? 'Make Adjustment' : 
               movement.entry_type === 'in' ? 'Register In' : 'Register Out'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}