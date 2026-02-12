'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';

type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
}

interface ToastContextType {
  toast: (message: string, variant?: ToastVariant, duration?: number) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

const ICONS: Record<ToastVariant, React.ElementType> = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const STYLES: Record<ToastVariant, string> = {
  success: 'bg-white dark:bg-zinc-900 border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400',
  error: 'bg-white dark:bg-zinc-900 border-red-200 dark:border-red-800/60 text-red-600 dark:text-red-400',
  warning: 'bg-white dark:bg-zinc-900 border-amber-200 dark:border-amber-800/60 text-amber-600 dark:text-amber-400',
  info: 'bg-white dark:bg-zinc-900 border-blue-200 dark:border-blue-800/60 text-blue-600 dark:text-blue-400',
};

const BAR_STYLES: Record<ToastVariant, string> = {
  success: 'bg-emerald-500',
  error: 'bg-red-500',
  warning: 'bg-amber-500',
  info: 'bg-blue-500',
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [visible, setVisible] = useState(false);
  const [animateOut, setAnimateOut] = useState(false);
  const duration = toast.duration ?? 3500;
  const Icon = ICONS[toast.variant];

  useEffect(() => {
    // Animate in
    const inTimer = setTimeout(() => setVisible(true), 10);
    // Animate out
    const outTimer = setTimeout(() => {
      setAnimateOut(true);
      setTimeout(() => onRemove(toast.id), 300);
    }, duration);
    return () => {
      clearTimeout(inTimer);
      clearTimeout(outTimer);
    };
  }, [toast.id, duration, onRemove]);

  const handleClose = () => {
    setAnimateOut(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  return (
    <div
      className={`flex items-start gap-3 w-full max-w-sm px-4 py-3 rounded-2xl border shadow-lg shadow-black/5 relative overflow-hidden transition-all duration-300 ${STYLES[toast.variant]} ${
        visible && !animateOut
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 translate-y-2 scale-95 pointer-events-none'
      }`}
    >
      <Icon size={18} className="shrink-0 mt-0.5" />
      <p className="flex-1 text-sm font-medium text-zinc-800 dark:text-zinc-100 leading-snug">
        {toast.message}
      </p>
      <button
        onClick={handleClose}
        className="shrink-0 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
      >
        <X size={14} />
      </button>
      {/* Progress bar */}
      <div
        className={`absolute bottom-0 left-0 h-0.5 ${BAR_STYLES[toast.variant]} animate-[shrink_var(--dur)_linear_forwards]`}
        style={{ '--dur': `${duration}ms` } as React.CSSProperties}
      />
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 0);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, variant: ToastVariant = 'info', duration?: number) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev.slice(-4), { id, message, variant, duration }]);
  }, []);

  const value: ToastContextType = {
    toast: addToast,
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    warning: (msg) => addToast(msg, 'warning'),
    info: (msg) => addToast(msg, 'info'),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {mounted && createPortal(
        <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 items-end">
          {toasts.map(t => (
            <ToastItem key={t.id} toast={t} onRemove={removeToast} />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
