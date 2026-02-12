'use client';

import { useState, useRef } from 'react';
import Dialog from '@/components/ui/Dialog';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { addImage } from '@/app/actions/image.actions';
import { Upload, Link as LinkIcon, Image as ImageIcon, X, Loader2 } from 'lucide-react';

interface AddImageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
}

export default function AddImageDialog({ isOpen, onClose, tripId }: AddImageDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [url, setUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        setError('ไฟล์ใหญ่เกิน 4MB');
        return;
      }
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let imageUrl = url.trim();

      if (mode === 'upload' && selectedFile) {
        // Upload to UploadThing
        const formData = new FormData();
        formData.append('file', selectedFile);

        const res = await fetch('/api/uploadthing', {
          method: 'POST',
          headers: { 'x-uploadthing-package': '@uploadthing/react' },
          body: formData,
        });

        if (!res.ok) {
          // Fallback: convert to base64 data URL and save directly
          const reader = new FileReader();
          imageUrl = await new Promise((resolve) => {
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(selectedFile);
          });
        } else {
          const data = await res.json();
          imageUrl = data?.[0]?.url || data?.url;
        }
      }

      if (!imageUrl) {
        setError('กรุณาเลือกรูปภาพหรือใส่ URL');
        setIsLoading(false);
        return;
      }

      const result = await addImage(tripId, imageUrl, caption.trim() || undefined);

      if (result.success) {
        resetForm();
        onClose();
      } else {
        setError(result.error || 'ไม่สามารถเพิ่มรูปภาพได้');
      }
    } catch {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่');
    }

    setIsLoading(false);
  };

  const resetForm = () => {
    setUrl('');
    setCaption('');
    setPreview(null);
    setSelectedFile(null);
    setError('');
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={() => { resetForm(); onClose(); }}
      title="เพิ่มรูปภาพ"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        {/* Mode Toggle */}
        <div className="flex gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 transition-colors ${
              mode === 'upload'
                ? 'bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-white'
                : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            <Upload size={14} />
            อัปโหลดไฟล์
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 transition-colors ${
              mode === 'url'
                ? 'bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-white'
                : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            <LinkIcon size={14} />
            ใส่ URL
          </button>
        </div>

        {/* Upload Mode */}
        {mode === 'upload' && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            {preview ? (
              <div className="relative rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 aspect-video bg-zinc-100 dark:bg-zinc-800">
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => { setPreview(null); setSelectedFile(null); }}
                  className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-12 flex flex-col items-center justify-center border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-400 hover:text-zinc-600 hover:border-zinc-400 transition-colors"
              >
                <ImageIcon size={36} className="mb-2 opacity-40" />
                <span className="text-sm font-medium">คลิกเพื่อเลือกรูปภาพ</span>
                <span className="text-xs mt-1">PNG, JPG สูงสุด 4MB</span>
              </button>
            )}
          </div>
        )}

        {/* URL Mode */}
        {mode === 'url' && (
          <>
            <Input
              label="ลิงก์รูปภาพ (URL)"
              placeholder="https://example.com/image.jpg"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required={mode === 'url'}
            />
            {url && (
              <div className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 aspect-video bg-zinc-100 dark:bg-zinc-800">
                <img
                  src={url}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </>
        )}

        <Input
          label="คำอธิบาย (ไม่บังคับ)"
          placeholder="เช่น ใบเสร็จค่าอาหาร..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={() => { resetForm(); onClose(); }}>
            ยกเลิก
          </Button>
          <Button type="submit" variant="primary" className="flex-1" isLoading={isLoading}>
            {isLoading ? <Loader2 size={16} className="animate-spin mr-1.5" /> : null}
            บันทึก
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
