import { useState, useEffect } from 'react';
import { DateRange, Matcher } from 'react-day-picker';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

export interface DateRangePickerProps {
  value?: DateRange;
  onChange: (range: DateRange | undefined) => void;
  error?: string;
  label?: string;
  className?: string;
  disabled?: Matcher | Matcher[];
}

export default function DateRangePicker({ value, onChange, error, label, className, disabled }: DateRangePickerProps) {
  const [range, setRange] = useState<DateRange | undefined>(value);
  const [isOpen, setIsOpen] = useState(false);

  // Sync internal state with prop value
  useEffect(() => {
    setRange(value);
  }, [value]);

  const handleSelect = (selectedRange: DateRange | undefined) => {
    setRange(selectedRange);
    onChange(selectedRange);
    // ไม่ปิด popover - ให้ user กดปิดเองหรือกด confirm
  };

  const formatDisplayText = () => {
    if (!range?.from) return 'เลือกช่วงวันเดินทาง';
    if (!range.to) return format(range.from, 'd MMM yyyy', { locale: th });
    return `${format(range.from, 'd MMM', { locale: th })} - ${format(range.to, 'd MMM yyyy', { locale: th })}`;
  };

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
          {label}
        </label>
      )}

      {/* Popover Trigger Button */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl border transition-all",
            "bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800",
            error 
              ? "border-red-500 dark:border-red-600" 
              : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600",
            isOpen && "ring-2 ring-blue-500 ring-opacity-50 border-blue-500"
          )}
        >
          <div className="flex items-center gap-3">
            <CalendarIcon className="h-5 w-5 text-zinc-400" />
            <span className={cn(
              "text-sm font-medium",
              range?.from ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-400 dark:text-zinc-500"
            )}>
              {formatDisplayText()}
            </span>
          </div>
          <svg
            className={cn(
              "h-4 w-4 text-zinc-400 transition-transform",
              isOpen && "rotate-180"
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Calendar Popover */}
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Calendar Dropdown */}
            <div className="absolute z-50 mt-2 left-0 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-up">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {range?.from && range?.to 
                    ? `${format(range.from, 'd MMM', { locale: th })} - ${format(range.to, 'd MMM yyyy', { locale: th })}`
                    : range?.from 
                      ? `${format(range.from, 'd MMM yyyy', { locale: th })} - เลือกวันสิ้นสุด`
                      : 'เลือกวันเริ่มต้น'
                  }
                </span>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  <X className="h-4 w-4 text-zinc-500" />
                </button>
              </div>

              {/* Calendar with custom styling */}
              <div className="p-4">
                <style jsx global>{`
                  /* Range start & end - สีฟ้าเข้ม */
                  .date-range-calendar [data-range-start=true],
                  .date-range-calendar [data-range-end=true] {
                    background-color: #2563eb !important;
                    color: white !important;
                    border-radius: 9999px !important;
                  }
                  
                  /* Range middle - สีฟ้าอ่อน */
                  .date-range-calendar [data-range-middle=true] {
                    background-color: #dbeafe !important;
                    color: #1e40af !important;
                    border-radius: 0 !important;
                  }
                  
                  /* Dark mode range middle */
                  .dark .date-range-calendar [data-range-middle=true] {
                    background-color: #1e3a8a !important;
                    color: #93c5fd !important;
                  }
                  
                  /* Selected single day */
                  .date-range-calendar [data-selected-single=true] {
                    background-color: #2563eb !important;
                    color: white !important;
                    border-radius: 9999px !important;
                  }
                `}</style>
                
                <Calendar
                  mode="range"
                  selected={range}
                  onSelect={handleSelect}
                  locale={th}
                  numberOfMonths={1}
                  showOutsideDays={false}
                  className="date-range-calendar mx-auto"
                  disabled={disabled}
                />
              </div>

              {/* Footer with confirm button */}
              <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                <button
                  type="button"
                  onClick={() => {
                    setRange(undefined);
                    onChange(undefined);
                  }}
                  className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                >
                  ล้าง
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  ยืนยัน
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-500 font-medium">{error}</p>
      )}
    </div>
  );
}
