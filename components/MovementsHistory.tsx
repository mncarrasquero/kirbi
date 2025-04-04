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
import { Search, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

const ITEMS_PER_PAGE = 50;

type Movement = {
  id: string;
  material_name: string;
  location_name: string;
  quantity: number;
  entry_type: 'in' | 'out';
  worker_name: string | null;
  created_at: string;
  unit: string;
};

interface Material {
  name: string;
  unit: string;
}

interface Location {
  name: string;
}

interface RawMovement {
  id: any;
  quantity: any;
  entry_type: any;
  worker_name: any;
  created_at: any;
  materials: { name: any; unit: any; }[];
  locations: { name: any; }[];
}

export function MovementsHistory() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchMovements = async () => {
    try {
      setLoading(true);

      // First get total count
      const { count } = await supabase
        .from('inventory_entries')
        .select('*', { count: 'exact', head: true });

      if (count !== null) {
        setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
      }

      // Then fetch paginated data
      const { data, error } = await supabase
        .from('inventory_entries')
        .select(`
          id,
          quantity,
          entry_type,
          worker_name,
          created_at,
          materials(name, unit),
          locations(name)
        `)
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

      if (error) throw error;

      if (data) {
        const formattedMovements = data.map((movement: RawMovement) => ({
          id: movement.id,
          material_name: movement.materials[0]?.name || 'Unknown',
          location_name: movement.locations[0]?.name || 'Unknown',
          quantity: movement.quantity,
          entry_type: movement.entry_type,
          worker_name: movement.worker_name,
          created_at: movement.created_at,
          unit: movement.materials[0]?.unit || '',
        }));
        setMovements(formattedMovements);
      }
    } catch (error) {
      console.error('Error fetching movements:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, [currentPage]);

  useEffect(() => {
    const channel = supabase
      .channel('movements_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'inventory_entries'
        },
        () => {
          fetchMovements();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredMovements = movements.filter(movement =>
    movement.material_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    movement.location_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    movement.worker_name?.toLowerCase().includes(searchTerm.toLowerCase())
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
      <div className="relative">
        <Input
          placeholder="Search by material, location or worker..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
      </div>

      <div className="rounded-lg border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Material</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Worker</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredMovements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No movements found
                  </TableCell>
                </TableRow>
              ) : (
                filteredMovements.map((movement) => (
                  <TableRow key={movement.id}>
                    <TableCell>
                      {format(new Date(movement.created_at), "MMM d, HH:mm")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {movement.entry_type === 'in' ? (
                          <>
                            <ArrowDownToLine className="h-4 w-4 text-green-500" />
                            <span className="text-green-600">In</span>
                          </>
                        ) : (
                          <>
                            <ArrowUpFromLine className="h-4 w-4 text-blue-500" />
                            <span className="text-blue-600">Out</span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{movement.material_name}</TableCell>
                    <TableCell>{movement.location_name}</TableCell>
                    <TableCell>
                      {movement.quantity} {movement.unit}
                    </TableCell>
                    <TableCell>{movement.worker_name || '-'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
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