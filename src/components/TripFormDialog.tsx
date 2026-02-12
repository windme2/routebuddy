'use client';

import { useState, useEffect } from 'react';
import { createTrip, updateTrip } from '@/app/actions/trip.actions';
import { getAllUniqueMembers, addMember } from '@/app/actions/member.actions';
import { TripFormData, TripWithMemberCount } from '@/types/trip';
import Dialog from '@/components/ui/Dialog';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import DateRangePicker from '@/components/ui/DateRangePicker';
import type { DateRange } from 'react-day-picker';

interface TripFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tripToEdit?: TripWithMemberCount;
}

export default function TripFormDialog({ isOpen, onClose, tripToEdit }: TripFormDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [name, setName] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [timezone, setTimezone] = useState('Asia/Bangkok');
  const [budget, setBudget] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  
  // Member suggestions
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen && !tripToEdit) {
      getAllUniqueMembers().then(setSuggestions);
    }
  }, [isOpen, tripToEdit]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (tripToEdit) {
          setName(tripToEdit.name);
          setDateRange({
            from: new Date(tripToEdit.startDate),
            to: new Date(tripToEdit.endDate),
          });
          setTimezone(tripToEdit.timezone);
          setBudget((tripToEdit.budget / 100).toString());
          setDescription(tripToEdit.description || '');
          setCoverImage(tripToEdit.coverImage || '');
        } else {
          setName('');
          setDateRange(undefined);
          setTimezone('Asia/Bangkok');
          setBudget('');
          setDescription('');
          setCoverImage('');
        }
        setErrors({});
      }, 0);
    }
  }, [isOpen, tripToEdit]);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Validation
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'กรุณาระบุชื่อทริป';
    if (!dateRange?.from) newErrors.dateRange = 'กรุณาเลือกวันเริ่มต้น';
    if (!dateRange?.to) newErrors.dateRange = 'กรุณาเลือกวันสิ้นสุด';
    
    // Check if start date is in the past (only for new trips)
    if (!tripToEdit && dateRange?.from) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startDate = new Date(dateRange.from);
      startDate.setHours(0, 0, 0, 0);
      
      if (startDate < today) {
        newErrors.dateRange = 'ไม่สามารถสร้างทริปย้อนหลังได้';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    const data: TripFormData = {
      name: name.trim(),
      startDate: dateRange!.from!.toISOString(),
      endDate: dateRange!.to!.toISOString(),
      timezone,
      budget: Math.round((parseFloat(budget) || 0) * 100), // Convert to Satang
      description: description.trim(),
      ...(coverImage.trim() && { coverImage: coverImage.trim() }),
    };

    let result;
    if (tripToEdit) {
      result = await updateTrip(tripToEdit.id, data);
    } else {
      result = await createTrip(data);
    }
    
    setIsLoading(false);

    if (result.success) {
      // Add selected members if creating new trip
      if (!tripToEdit && selectedMembers.length > 0 && result.data) {
        await Promise.all(
          selectedMembers.map((name, index) => 
            addMember(result.data.id, name, index === 0 ? 'LEADER' : 'MEMBER')
          )
        );
      }

      // Reset form
      setName('');
      setDateRange(undefined);
      setTimezone('Asia/Bangkok');
      setBudget('');
      setDescription('');
      setCoverImage('');
      setSelectedMembers([]);
      onClose();
    } else {
      setErrors({ form: result.error || 'เกิดข้อผิดพลาด' });
    }
  };

  return (
    <Dialog 
      isOpen={isOpen} 
      onClose={onClose} 
      title={tripToEdit ? "แก้ไขทริป" : "สร้างทริปใหม่"} 
      size="3xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[85vh]">
        {errors.form && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-200 dark:border-red-800 shrink-0">
            {errors.form}
          </div>
        )}

        <div className="flex-1 overflow-y-auto pb-4 px-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">

        <Input
          label="ชื่อทริป"
          placeholder="เช่น เที่ยวเชียงใหม่"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
        />

        <div className="space-y-1">

          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            error={errors.dateRange}
            disabled={!tripToEdit ? { before: new Date() } : undefined}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Timezone ของจุดหมายปลายทาง
          </label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full py-2 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800 transition-colors focus:outline-none focus:border-zinc-500 cursor-pointer"
          >
            <optgroup label="Asia">
              <option value="Asia/Bangkok">Asia/Bangkok (ไทย)</option>
              <option value="Asia/Tokyo">Asia/Tokyo (ญี่ปุ่น)</option>
              <option value="Asia/Seoul">Asia/Seoul (เกาหลีใต้)</option>
              <option value="Asia/Taipei">Asia/Taipei (ไต้หวัน)</option>
              <option value="Asia/Hong_Kong">Asia/Hong Kong</option>
              <option value="Asia/Singapore">Asia/Singapore</option>
              <option value="Asia/Dubai">Asia/Dubai</option>
            </optgroup>
            <optgroup label="Europe">
              <option value="Europe/London">Europe/London</option>
              <option value="Europe/Paris">Europe/Paris</option>
              <option value="Europe/Berlin">Europe/Berlin</option>
              <option value="Europe/Rome">Europe/Rome</option>
            </optgroup>
            <optgroup label="America & Other">
              <option value="America/New_York">America/New York</option>
              <option value="America/Los_Angeles">America/Los Angeles</option>
              <option value="Australia/Sydney">Australia/Sydney</option>
              <option value="UTC">UTC</option>
            </optgroup>
          </select>
        </div>

        <Input
          label="งบประมาณ (บาท)"
          type="number"
          placeholder="0"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          min="0"
          className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        </div>

        {/* Right Column */}
        <div className="space-y-4">
        {!tripToEdit && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              สมาชิก
            </label>
            <div className="flex flex-wrap gap-2">
              {suggestions.length > 0 ? (
                suggestions.map(name => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => {
                      if (selectedMembers.includes(name)) {
                        setSelectedMembers(selectedMembers.filter(n => n !== name));
                      } else {
                        setSelectedMembers([...selectedMembers, name]);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                      selectedMembers.includes(name)
                        ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
                        : 'bg-zinc-50 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {name}
                  </button>
                ))
              ) : (
                <p className="text-xs text-zinc-400">ไม่มีประวัติสมาชิก</p>
              )}
            </div>
            {selectedMembers.length > 0 && (
               <p className="text-xs text-zinc-500">
                 เพิ่ม {selectedMembers.length} คน: {selectedMembers.join(', ')}
               </p>
            )}
          </div>
        )}

        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            รูปภาพหน้าปกทริป (Optional)
          </label>
          <div 
            className={`relative w-full border-2 border-dashed rounded-xl transition-colors ${
              coverImage ? 'border-transparent' : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const file = e.dataTransfer.files?.[0];
              if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (event) => setCoverImage(event.target?.result as string);
                reader.readAsDataURL(file);
              }
            }}
          >
            {coverImage ? (
              <div className="relative group rounded-xl overflow-hidden h-32 w-full ring-1 ring-zinc-200 dark:ring-zinc-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coverImage} alt="Cover Preview" className="w-full h-full object-cover bg-zinc-100 dark:bg-zinc-900" />
                <button
                  type="button"
                  onClick={() => setCoverImage('')}
                  className="absolute top-2 right-2 px-2 py-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg transition-colors opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs backdrop-blur-md"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  ลบรูปภาพ
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center py-6 px-4 text-center cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400 mb-2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">ลากไฟล์รูปภาพมาวางที่นี่ หรือคลิกเพื่ออัปโหลด</span>
                <span className="text-xs text-zinc-500">รองรับไฟล์ JPG, PNG หรือจะวางลิงก์รูปภาพในกล่องด้านล่างก็ได้</span>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && file.type.startsWith('image/')) {
                      const reader = new FileReader();
                      reader.onload = (event) => setCoverImage(event.target?.result as string);
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            )}
          </div>
          <Input
            placeholder="หรือใส่ Link รูปภาพ (https://...)"
            value={coverImage.startsWith('data:') ? '' : coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            รายละเอียดทริป (Optional)
          </label>
          <textarea
            className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition-all resize-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
            rows={3}
            placeholder="เพิ่มรายละเอียดเกี่ยวกับทริปนี้..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        </div>
        </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800 shrink-0 bg-white dark:bg-zinc-900 mt-auto">
          <div className="flex-1"></div>
          <Button type="button" variant="secondary" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {tripToEdit ? 'บันทึกแก้ไข' : 'สร้างทริป'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
