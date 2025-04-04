'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Search, ImageOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { QuickMovementDialog } from './QuickMovementDialog';
import { Checkbox } from '@/components/ui/checkbox';

type StockItem = {
  material_id: string;
  material_name: string;
  location_id: string;
  location_name: string;
  current_stock: number;
  max_quantity: number;
  min_quantity: number;
  unit: string;
  image_url: string | null;
};

type SelectedMaterial = {
  material_id: string;
  material_name: string;
  quantity: number;
  unit: string;
  image_url?: string | null;
};

interface StockLevelsProps {
  selectedMaterials: SelectedMaterial[];
  onMaterialSelect: (material: SelectedMaterial) => void;
}

export function StockLevels({ selectedMaterials, onMaterialSelect }: StockLevelsProps) {
  const [stockLevels, setStockLevels] = useState<StockItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);

  const fetchStockLevels = async () => {
    try {
      const { data: stockData, error: stockError } = await supabase
        .from('stock_by_location')
        .select('*')
        .order('material_name');
      
      if (stockError) throw stockError;
      
      if (stockData) {
        setStockLevels(stockData);
      }
    } catch (error) {
      console.error('Error fetching stock levels:', error);
    }
  };

  useEffect(() => {
    fetchStockLevels();
    const interval = setInterval(fetchStockLevels, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('stock_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'inventory_entries'
        },
        () => {
          fetchStockLevels();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getProgressColor = (current: number, min: number, max: number) => {
    if (current <= min) return 'bg-red-500';
    if (current >= max) return 'bg-yellow-500';
    const ratio = current / max;
    if (ratio < 0.25) return 'bg-red-400';
    if (ratio < 0.5) return 'bg-orange-400';
    if (ratio < 0.75) return 'bg-green-400';
    return 'bg-green-500';
  };

  const getStatusText = (current: number, min: number, max: number) => {
    if (current <= min) return 'Critical';
    if (current >= max) return 'Excess';
    const ratio = current / max;
    if (ratio < 0.25) return 'Very Low';
    if (ratio < 0.5) return 'Low';
    if (ratio < 0.75) return 'Normal';
    return 'Optimal';
  };

  const filteredStock = stockLevels.filter(stock =>
    stock.material_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.location_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const searchResults = stockLevels.filter(stock => {
    const searchLower = searchTerm.toLowerCase();
    return (
      stock.material_name.toLowerCase().includes(searchLower) ||
      stock.location_name.toLowerCase().includes(searchLower) ||
      stock.unit.toLowerCase().includes(searchLower)
    );
  });

  const isSelected = (materialId: string) => 
    selectedMaterials.some(m => m.material_id === materialId);

  const handleCheckboxChange = (stock: StockItem) => {
    onMaterialSelect({
      material_id: stock.material_id,
      material_name: stock.material_name,
      quantity: 1,
      unit: stock.unit,
      image_url: stock.image_url
    });
  };

  return (
    <div className="space-y-6">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Input
              placeholder="Search by material, location or unit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </PopoverTrigger>
        {searchTerm.length > 0 && (
          <PopoverContent className="p-0" align="start">
            <Command>
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup>
                  {searchResults.map((stock) => (
                    <CommandItem
                      key={`${stock.material_id}-${stock.location_id}`}
                      onSelect={() => {
                        setSearchTerm(stock.material_name);
                        setOpen(false);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        {stock.image_url ? (
                          <img
                            src={stock.image_url}
                            alt={stock.material_name}
                            className="w-8 h-8 object-cover rounded"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : (
                          <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center">
                            <ImageOff className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        {stock.image_url && (
                          <div className="w-8 h-8 rounded bg-gray-100 hidden flex items-center justify-center">
                            <ImageOff className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{stock.material_name}</div>
                          <div className="text-sm text-gray-500">{stock.location_name}</div>
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        )}
      </Popover>

      <div className="bg-white rounded-lg border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead className="w-8"></TableHead>
                <TableHead>Material</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="hidden sm:table-cell">Unit</TableHead>
                <TableHead className="w-[250px]">Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStock.map((stock) => (
                <TableRow key={`${stock.material_id}-${stock.location_id}`}>
                  <TableCell>
                    {stock.image_url ? (
                      <img
                        src={stock.image_url}
                        alt={stock.material_name}
                        className="w-10 h-10 object-cover rounded"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
                        <ImageOff className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    {stock.image_url && (
                      <div className="w-10 h-10 rounded bg-gray-100 hidden flex items-center justify-center">
                        <ImageOff className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Checkbox
                      checked={isSelected(stock.material_id)}
                      onCheckedChange={() => handleCheckboxChange(stock)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{stock.material_name}</TableCell>
                  <TableCell>{stock.location_name}</TableCell>
                  <TableCell>{stock.current_stock}</TableCell>
                  <TableCell className="hidden sm:table-cell">{stock.unit}</TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          {getStatusText(stock.current_stock, stock.min_quantity, stock.max_quantity)}
                        </span>
                        <span className="text-sm text-gray-600">
                          {stock.current_stock}/{stock.max_quantity}
                        </span>
                      </div>
                      <Progress 
                        value={(stock.current_stock / stock.max_quantity) * 100}
                        className="h-2"
                        indicatorClassName={getProgressColor(
                          stock.current_stock,
                          stock.min_quantity,
                          stock.max_quantity
                        )}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <QuickMovementDialog 
                        material={stock}
                        onMovementComplete={fetchStockLevels}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}