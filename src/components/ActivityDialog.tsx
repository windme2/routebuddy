'use client';

import { useState, useEffect } from 'react';
import { createActivity, updateActivity, deleteActivity } from '@/app/actions/activity.actions';
import { ActivityFormData } from '@/types/forms';
import Dialog from '@/components/ui/Dialog';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { 
  Utensils, Car, Bed, MapPin, ShoppingBag, 
  HelpCircle, Trash2
} from 'lucide-react';
import { formatInTimeZone, toDate } from 'date-fns-tz';

import { Activity } from '@/generated/prisma/client';
import { useToast } from '@/components/ui/Toast';
import HoverMap from '@/components/HoverMap';

interface ActivityDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
  tripStartDate: Date;
  tripEndDate: Date;
  activityToEdit?: Activity;
  timezone: string;
}

const CATEGORIES = [
  { id: 'food', label: 'อาหาร', icon: Utensils, color: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20' },
  { id: 'transport', label: 'เดินทาง', icon: Car, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
  { id: 'accommodation', label: 'ที่พัก', icon: Bed, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
  { id: 'attraction', label: 'ท่องเที่ยว', icon: MapPin, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' },
  { id: 'shopping', label: 'ช้อปปิ้ง', icon: ShoppingBag, color: 'text-pink-500 bg-pink-50 dark:bg-pink-900/20' },
  { id: 'other', label: 'อื่นๆ', icon: HelpCircle, color: 'text-gray-500 bg-gray-50 dark:bg-gray-900/20' },
];

export default function ActivityDialog({ 
  isOpen, 
  onClose, 
  tripId, 
  tripStartDate,
  tripEndDate,
  activityToEdit,
  timezone
}: ActivityDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { success, error: toastError } = useToast();
  
  // Form State
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [category, setCategory] = useState('food');
  const [location, setLocation] = useState('');
  const [debouncedLocation, setDebouncedLocation] = useState('');
  const [notes, setNotes] = useState('');

  // Debounce location for the map
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedLocation(location);
    }, 1000);
    return () => clearTimeout(timer);
  }, [location]);

  // Reset or fill form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (activityToEdit) {
          setName(activityToEdit.name);
          setDate(formatInTimeZone(new Date(activityToEdit.date), timezone, 'yyyy-MM-dd'));
          setStartTime(formatInTimeZone(new Date(activityToEdit.startTime), timezone, 'HH:mm'));
          setEndTime(formatInTimeZone(new Date(activityToEdit.endTime), timezone, 'HH:mm'));
          setCategory(activityToEdit.category);
          setLocation(activityToEdit.location || '');
          setNotes(activityToEdit.notes || '');
        } else {
          // Default to trip start date or today if within range
          const todayUtc = new Date();
          const todayTzStr = formatInTimeZone(todayUtc, timezone, 'yyyy-MM-dd');
          const startTzStr = formatInTimeZone(tripStartDate, timezone, 'yyyy-MM-dd');
          const endTzStr = formatInTimeZone(tripEndDate, timezone, 'yyyy-MM-dd');
          
          let defaultDateStr = startTzStr;
          if (todayTzStr >= startTzStr && todayTzStr <= endTzStr) {
            defaultDateStr = todayTzStr;
          }
            
          setName('');
          setDate(defaultDateStr);
          setStartTime('09:00');
          setEndTime('10:00');
          setCategory('food');
          setLocation('');
          setNotes('');
        }
        setErrors({});
      }, 0);
    }
  }, [isOpen, activityToEdit, tripStartDate, tripEndDate, timezone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Validation
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'กรุณาระบุชื่อกิจกรรม';
    if (!date) newErrors.date = 'กรุณาระบุวันที่';
    if (!startTime) newErrors.startTime = 'กรุณาระบุเวลาเริ่ม';
    if (!endTime) newErrors.endTime = 'กรุณาระบุเวลาสิ้นสุด';
    
    // Simple time validation
    if (startTime && endTime && startTime > endTime) {
      newErrors.endTime = 'เวลาสิ้นสุดต้องอยู่หลังเวลาเริ่ม';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    // The user selected `date`, `startTime`, `endTime` in the destination timezone.
    const startDateTimeString = `${date}T${startTime}:00`;
    const endDateTimeString = `${date}T${endTime}:00`;
    
    // Create Date objects representing the exact moment in UTC
    const startMoment = toDate(startDateTimeString, { timeZone: timezone });
    const endMoment = toDate(endDateTimeString, { timeZone: timezone });
    const dateMoment = toDate(`${date}T00:00:00`, { timeZone: timezone });

    const data: ActivityFormData = {
      name: name.trim(),
      date: dateMoment.toISOString(),
      startTime: startMoment.toISOString(),
      endTime: endMoment.toISOString(),
      category,
      location: location.trim() || undefined,
      notes: notes.trim() || undefined,
      tripId,
    };

    let result;
    if (activityToEdit) {
      result = await updateActivity(activityToEdit.id, tripId, {
        ...data,
      });
    } else {
      result = await createActivity(data);
    }

    setIsLoading(false);

    if (result.success) {
      success(activityToEdit ? 'แก้ไขกิจกรรมสำเร็จ' : 'สร้างกิจกรรมสำเร็จ');
      onClose();
    } else {
      setErrors({ form: result.error || 'เกิดข้อผิดพลาด' });
    }
  };

  const isEditing = !!activityToEdit;

  return (
    <Dialog 
      isOpen={isOpen} 
      onClose={onClose} 
      title={isEditing ? "แก้ไขกิจกรรม" : "สร้างกิจกรรมใหม่"}
      size="3xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-y-auto">
        {errors.form && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-200 dark:border-red-800">
            {errors.form}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
          {/* Left Column: Details */}
          <div className="space-y-4">
             <Input
              label="ชื่อกิจกรรม"
              placeholder="เช่น ทานมื้อเช้า, เที่ยววัด"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
            />

            <Input
              label="วันที่"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              error={errors.date}
              min={formatInTimeZone(tripStartDate, timezone, 'yyyy-MM-dd')}
              max={formatInTimeZone(tripEndDate, timezone, 'yyyy-MM-dd')}
            />

            <div className="grid grid-cols-2 gap-2">
              <Input
                label="เริ่ม"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                error={errors.startTime}
              />
              <Input
                label="ถึง"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                error={errors.endTime}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                หมวดหมู่
              </label>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${
                        isSelected 
                          ? `${cat.color} border-current ring-1 ring-current` 
                          : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                      }`}
                    >
                      <Icon size={20} />
                      <span className="text-xs font-medium">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Location & Notes */}
          <div className="space-y-4">
            <Input
              label="สถานที่ (Location)"
              placeholder="ระบุชื่อสถานที่"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />

            {debouncedLocation.trim() && (
              <div className="mt-2 mb-4 h-48 w-full rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 relative">
                <HoverMap location={debouncedLocation} />
              </div>
            )}

            <div className="space-y-1 h-full">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                หมายเหตุ (Optional)
              </label>
              <textarea
                className="w-full h-[120px] px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition-all resize-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                placeholder="รายละเอียดเพิ่มเติม..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800 shrink-0 bg-white dark:bg-zinc-900 pb-2">
          {isEditing && (
             <Button
              type="button"
              variant="ghost"
              onClick={async () => {
                if (!confirm('ต้องการลบกิจกรรมนี้?')) return;
                setIsLoading(true);
                const result = await deleteActivity(activityToEdit.id, tripId);
                setIsLoading(false);
                if (result.success) {
                  success('ลบกิจกรรมสำเร็จ');
                  onClose();
                } else {
                  toastError('ไม่สามารถลบกิจกรรมได้');
                }
              }}
              className="px-3 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 size={20} />
            </Button>
          )}
          <div className="flex-1"></div>
          <Button type="button" variant="secondary" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {isEditing ? 'บันทึกแก้ไข' : 'บันทึก'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
