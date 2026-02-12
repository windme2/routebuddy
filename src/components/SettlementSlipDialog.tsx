'use client';

import { useState, useRef } from 'react';
import Dialog from '@/components/ui/Dialog';
import Button from '@/components/ui/Button';
import { createSettlement } from '@/app/actions/settlement.actions';
import { Upload, Link as LinkIcon, Image as ImageIcon, X } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface SettlementSlipDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
  debtorId: string;
  creditorId: string;
  amount: number; // In satang
  debtorName: string;
  creditorName: string;
}

export default function SettlementSlipDialog({
  isOpen,
  onClose,
  tripId,
  debtorId,
  creditorId,
  amount,
  debtorName,
  creditorName,
}: SettlementSlipDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [url, setUrl] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { success, error: toastError } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) { setError('ไฟล์ใหญ่เกิน 4MB'); return; }
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setError('');
  };

  const resetForm = () => {
    setMode('upload');
    setUrl('');
    setPreview(null);
    setSelectedFile(null);
    setError('');
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');

    try {
      let slipUrl: string | undefined;

      if (mode === 'upload' && selectedFile) {
        // Convert to base64 for storage (no UploadThing key needed)
        const reader = new FileReader();
        slipUrl = await new Promise((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(selectedFile);
        });
      } else if (mode === 'url' && url.trim()) {
        slipUrl = url.trim();
      }

      const result = await createSettlement({
        tripId,
        debtorId,
        creditorId,
        amount,
        currency: 'THB',
        slipUrl,
      });

      if (result.success) {
        success(`แจ้งโอน ฿${(amount / 100).toLocaleString()} แล้ว รอการยืนยัน`);
        resetForm();
        onClose();
      } else {
        toastError(result.error || 'เกิดข้อผิดพลาด');
        setError(result.error || 'เกิดข้อผิดพลาด');
      }
    } catch {
      toastError('เกิดข้อผิดพลาด กรุณาลองใหม่');
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่');
    }

    setIsLoading(false);
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={() => { resetForm(); onClose(); }}
      title="แจ้งโอนเงิน"
      size="md"
    >
      <div className="space-y-4">
        {/* Summary */}
        <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 text-xs font-bold flex items-center justify-center">
                {debtorName.charAt(0)}
              </div>
              <span className="text-sm font-medium">{debtorName}</span>
            </div>
            <span className="text-xs text-zinc-400">→ โอนให้</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{creditorName}</span>
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 text-xs font-bold flex items-center justify-center">
                {creditorName.charAt(0)}
              </div>
            </div>
          </div>
          <div className="text-center mt-3">
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              ฿{(amount / 100).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Optional slip section */}
        <div>
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
            แนบสลิปโอนเงิน (ไม่บังคับ)
          </p>

          {/* Mode Toggle */}
          <div className="flex gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl mb-3">
            <button
              type="button"
              onClick={() => setMode('upload')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 transition-colors ${mode === 'upload' ? 'bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-white' : 'text-zinc-500 hover:text-zinc-700'}`}
            >
              <Upload size={14} /> อัปโหลดไฟล์
            </button>
            <button
              type="button"
              onClick={() => setMode('url')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 transition-colors ${mode === 'url' ? 'bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-white' : 'text-zinc-500 hover:text-zinc-700'}`}
            >
              <LinkIcon size={14} /> ใส่ URL
            </button>
          </div>

          {mode === 'upload' && (
            <div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              {preview ? (
                <div className="relative rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 aspect-video bg-zinc-100 dark:bg-zinc-800">
                  <img src={preview} alt="Slip preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => { setPreview(null); setSelectedFile(null); }}
                    className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-lg hover:bg-black/70"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-8 flex flex-col items-center justify-center border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-400 hover:text-zinc-600 hover:border-zinc-400 transition-colors"
                >
                  <ImageIcon size={28} className="mb-2 opacity-40" />
                  <span className="text-sm">คลิกเพื่อเลือกรูปสลิป</span>
                  <span className="text-xs mt-1">PNG, JPG สูงสุด 4MB</span>
                </button>
              )}
            </div>
          )}

          {mode === 'url' && (
            <div>
              <input
                type="url"
                placeholder="https://..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500"
              />
              {url && (
                <div className="mt-2 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 aspect-video bg-zinc-100 dark:bg-zinc-800">
                  <img src={url} alt="Preview" className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={() => { resetForm(); onClose(); }}>
            ยกเลิก
          </Button>
          <Button type="button" variant="primary" className="flex-1" isLoading={isLoading} onClick={handleSubmit}>
            แจ้งโอนแล้ว
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
