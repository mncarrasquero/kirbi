'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Send, ImageOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type RequestItem = {
  material_id: string;
  material_name: string;
  quantity: number;
  unit: string;
  image_url?: string | null;
};

interface MaterialRequestProps {
  selectedMaterials: RequestItem[];
  onUpdateMaterials: (materials: RequestItem[]) => void;
}

export function MaterialRequest({ selectedMaterials, onUpdateMaterials }: MaterialRequestProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleQuantityChange = (materialId: string, quantity: number) => {
    onUpdateMaterials(
      selectedMaterials.map(item =>
        item.material_id === materialId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const handleRemoveItem = (materialId: string) => {
    onUpdateMaterials(selectedMaterials.filter(item => item.material_id !== materialId));
  };

  const handleSendRequest = async () => {
    if (selectedMaterials.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please add at least one item to the request",
      });
      return;
    }

    // Format the email content with a more professional layout
    const emailContent = `
Material Request List:

${selectedMaterials.map(item => `• ${item.material_name}
  Quantity: ${item.quantity} ${item.unit}`).join('\n\n')}

Thank you.
    `;

    // Open email client with pre-filled content
    const mailtoLink = `mailto:?subject=Material Request&body=${encodeURIComponent(emailContent)}`;
    window.location.href = mailtoLink;

    // Clear the form
    onUpdateMaterials([]);
    setOpen(false);

    toast({
      title: "Success",
      description: "Material request has been prepared",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-5 w-5 mr-2" />
          New Request {selectedMaterials.length > 0 && `(${selectedMaterials.length})`}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Material Request</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {selectedMaterials.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Select materials from the stock list below to add them to your request
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedMaterials.map((item) => (
                <div
                  key={item.material_id}
                  className="flex flex-col p-4 border rounded-lg space-y-4"
                >
                  <div className="flex items-center gap-4">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.material_name}
                        className="w-16 h-16 object-cover rounded"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded bg-gray-100 flex items-center justify-center">
                        <ImageOff className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    {item.image_url && (
                      <div className="w-16 h-16 rounded bg-gray-100 hidden flex items-center justify-center">
                        <ImageOff className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium">{item.material_name}</h4>
                      <div className="flex items-center gap-2 mt-2">
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.material_id, Number(e.target.value))}
                          className="w-24"
                        />
                        <span className="text-sm text-muted-foreground">{item.unit}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(item.material_id)}
                      className="self-start"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            onClick={handleSendRequest}
            disabled={selectedMaterials.length === 0}
          >
            <Send className="h-4 w-4 mr-2" />
            Send Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}