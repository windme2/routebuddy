'use client';

import { useState } from 'react';
import { TripImage } from '@/generated/prisma/client';
import { Trash2, Image as ImageIcon, ExternalLink, Plus } from 'lucide-react';
import { deleteImage } from '@/app/actions/image.actions';
import AddImageDialog from './AddImageDialog';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

interface GalleryViewProps {
  images: TripImage[];
  tripId: string;
}

export default function GalleryView({ images, tripId }: GalleryViewProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { success, error } = useToast();

  const handleDelete = async (id: string) => {
    if (!confirm('ต้องการลบรูปภาพนี้?')) return;
    setDeletingId(id);
    const result = await deleteImage(id, tripId);
    setDeletingId(null);
    if (result.success) {
      success('ลบรูปภาพสำเร็จ');
    } else {
      error('ไม่สามารถลบรูปภาพได้');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <ImageIcon size={20} className="text-zinc-500" />
          แกลเลอรี่ ({images.length})
        </h2>
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={() => setIsAddDialogOpen(true)}
        >
          <Plus size={16} />
          เพิ่มรูปภาพ
        </Button>
      </div>

      {images.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-zinc-400 dark:text-zinc-600 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
          <ImageIcon size={48} className="mb-4 opacity-20" />
          <p>ยังไม่มีรูปภาพ</p>
          <button 
            onClick={() => setIsAddDialogOpen(true)}
            className="text-blue-500 hover:underline mt-2 text-sm"
          >
            เพิ่มรูปแรกเลย
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((image) => (
            <div key={image.id} className="group relative break-inside-avoid">
              <div className="aspect-[4/3] rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 relative shadow-sm hover:shadow-md transition-all">
                <img
                  src={image.url}
                  alt={image.caption || 'Trip image'}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                />
                
                {/* Overlay actions */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-start justify-end p-2 opacity-0 group-hover:opacity-100">
                    <button
                        onClick={() => handleDelete(image.id)}
                        disabled={deletingId === image.id}
                        className="p-1.5 bg-white/90 text-red-500 rounded-lg hover:bg-white transition-colors shadow-sm confirm-delete"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
                
                {/* External Link */}
                <a 
                   href={image.url} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="absolute bottom-2 right-2 p-1.5 bg-black/50 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                >
                    <ExternalLink size={14} />
                </a>
              </div>
              {image.caption && (
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                  {image.caption}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <AddImageDialog 
        isOpen={isAddDialogOpen} 
        onClose={() => setIsAddDialogOpen(false)} 
        tripId={tripId}
      />
    </div>
  );
}
