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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, ImageOff } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

const ITEMS_PER_PAGE = 50;

export function MaterialsTable() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [newMaterial, setNewMaterial] = useState({
    name: '',
    description: '',
    unit: '',
    min_quantity: 0,
    max_quantity: 0,
    primary_barcode: '',
    image_url: '',
    additional_barcodes: [] as string[],
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchMaterials();
    fetchSuppliers();
  }, [currentPage]);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      // First get total count
      const { count } = await supabase
        .from('materials')
        .select('*', { count: 'exact', head: true });

      if (count !== null) {
        setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
      }

      // Then fetch paginated data
      const { data: materialsData, error: materialsError } = await supabase
        .from('materials')
        .select('*')
        .order('name')
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

      if (materialsError) throw materialsError;

      if (materialsData) {
        const materialsWithBarcodes = await Promise.all(
          materialsData.map(async (material) => {
            const { data: barcodes } = await supabase
              .from('material_barcodes')
              .select('id, barcode, supplier_id')
              .eq('material_id', material.id);
            
            return {
              ...material,
              material_barcodes: barcodes || []
            };
          })
        );

        setMaterials(materialsWithBarcodes);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Could not load materials",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    const { data } = await supabase
      .from('suppliers')
      .select('*')
      .order('name');
    
    setSuppliers(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data: materialData, error: materialError } = await supabase
      .from('materials')
      .insert([{
        name: newMaterial.name,
        description: newMaterial.description,
        unit: newMaterial.unit,
        min_quantity: newMaterial.min_quantity,
        max_quantity: newMaterial.max_quantity,
        primary_barcode: newMaterial.primary_barcode,
        image_url: newMaterial.image_url,
      }])
      .select()
      .single();

    if (materialError) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not create material",
      });
      return;
    }

    if (newMaterial.additional_barcodes.length > 0) {
      const barcodesToInsert = newMaterial.additional_barcodes.map(barcode => ({
        material_id: materialData.id,
        barcode,
      }));

      const { error: barcodesError } = await supabase
        .from('material_barcodes')
        .insert(barcodesToInsert);

      if (barcodesError) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Material created but there was an error saving additional barcodes",
        });
      }
    }

    toast({
      title: "Success",
      description: "Material created successfully",
    });
    
    fetchMaterials();
    setNewMaterial({
      name: '',
      description: '',
      unit: '',
      min_quantity: 0,
      max_quantity: 0,
      primary_barcode: '',
      image_url: '',
      additional_barcodes: [],
    });
  };

  const filteredMaterials = materials.filter(material => 
    material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.primary_barcode?.includes(searchTerm) ||
    material.material_barcodes?.some((b: any) => b.barcode.includes(searchTerm))
  );

  const renderPagination = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 2 && i <= currentPage + 2)
      ) {
        pages.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => setCurrentPage(i)}
              isActive={currentPage === i}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      } else if (i === currentPage - 3 || i === currentPage + 3) {
        pages.push(
          <PaginationItem key={i}>
            <PaginationLink>...</PaginationLink>
          </PaginationItem>
        );
      }
    }
    return pages;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4">
        <div className="relative w-full sm:w-64">
          <Input
            type="text"
            placeholder="Search by name or barcode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="h-5 w-5 mr-2" />
              New Material
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Material</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newMaterial.name}
                    onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Input
                    id="unit"
                    value={newMaterial.unit}
                    onChange={(e) => setNewMaterial({ ...newMaterial, unit: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="min_quantity">Minimum Quantity</Label>
                  <Input
                    id="min_quantity"
                    type="number"
                    value={newMaterial.min_quantity}
                    onChange={(e) => setNewMaterial({ ...newMaterial, min_quantity: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_quantity">Maximum Quantity</Label>
                  <Input
                    id="max_quantity"
                    type="number"
                    value={newMaterial.max_quantity}
                    onChange={(e) => setNewMaterial({ ...newMaterial, max_quantity: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="primary_barcode">Primary Barcode</Label>
                  <Input
                    id="primary_barcode"
                    value={newMaterial.primary_barcode}
                    onChange={(e) => setNewMaterial({ ...newMaterial, primary_barcode: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image_url">Image URL</Label>
                  <Input
                    id="image_url"
                    type="url"
                    value={newMaterial.image_url}
                    onChange={(e) => setNewMaterial({ ...newMaterial, image_url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newMaterial.description}
                  onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Additional Barcodes</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add barcode"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const input = e.target as HTMLInputElement;
                        if (input.value.trim()) {
                          setNewMaterial({
                            ...newMaterial,
                            additional_barcodes: [...newMaterial.additional_barcodes, input.value.trim()]
                          });
                          input.value = '';
                        }
                      }
                    }}
                  />
                </div>
                {newMaterial.additional_barcodes.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newMaterial.additional_barcodes.map((barcode, index) => (
                      <div
                        key={index}
                        className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-2"
                      >
                        <span>{barcode}</span>
                        <button
                          type="button"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => {
                            setNewMaterial({
                              ...newMaterial,
                              additional_barcodes: newMaterial.additional_barcodes.filter((_, i) => i !== index)
                            });
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button type="submit" className="w-full">Save</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="hidden sm:table-cell">Description</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead className="hidden sm:table-cell">Min Quantity</TableHead>
              <TableHead className="hidden sm:table-cell">Max Quantity</TableHead>
              <TableHead>Barcodes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredMaterials.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No materials found
                </TableCell>
              </TableRow>
            ) : (
              filteredMaterials.map((material) => (
                <TableRow key={material.id} className="cursor-pointer hover:bg-gray-50">
                  <TableCell>
                    {material.image_url ? (
                      <img
                        src={material.image_url}
                        alt={material.name}
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
                    {material.image_url && (
                      <div className="w-10 h-10 rounded bg-gray-100 hidden flex items-center justify-center">
                        <ImageOff className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{material.name}</TableCell>
                  <TableCell className="hidden sm:table-cell">{material.description}</TableCell>
                  <TableCell>{material.unit}</TableCell>
                  <TableCell className="hidden sm:table-cell">{material.min_quantity}</TableCell>
                  <TableCell className="hidden sm:table-cell">{material.max_quantity}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {material.primary_barcode && (
                        <div className="font-medium">{material.primary_barcode}</div>
                      )}
                      {material.material_barcodes?.map((barcode: any) => (
                        <div key={barcode.id} className="text-sm text-gray-500">
                          {barcode.barcode}
                        </div>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              />
            </PaginationItem>
            {renderPagination()}
            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}