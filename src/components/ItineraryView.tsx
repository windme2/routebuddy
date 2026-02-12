'use client';

import { useState, useMemo } from 'react';
import { format, addDays, differenceInDays } from 'date-fns';
import { th } from 'date-fns/locale';
import { Plus, MapPin, CalendarDays } from 'lucide-react';
import Button from '@/components/ui/Button';
import ActivityDialog from '@/components/ActivityDialog';
import ActivityItem from '@/components/ActivityItem';
import { Activity } from '@/generated/prisma/client';

interface ItineraryViewProps {
  tripId: string;
  startDate: Date;
  endDate: Date;
  activities: Activity[];
  timezone: string;
}

export default function ItineraryView({ tripId, startDate, endDate, activities, timezone }: ItineraryViewProps) {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false);
  const [activityToEdit, setActivityToEdit] = useState<Activity | undefined>();

  // Generate days array
  const days = useMemo(() => {
    const dayCount = differenceInDays(new Date(endDate), new Date(startDate)) + 1;
    return Array.from({ length: dayCount }, (_, i) => addDays(new Date(startDate), i));
  }, [startDate, endDate]);

  const selectedDate = days[selectedDayIndex];

  // Filter activities for selected day
  const dailyActivities = useMemo(() => {
    if (!selectedDate) return [];
    // For comparing, we should ideally compare with the date format in the destination timezone
    // Prisma date is stored in UTC, here we just do simple comparison string for now, but wait, date in DB is UTC.
    // However, since we construct it based on the day in timezone, we should convert the activity.date to the destination timezone.
    // Since we don't have formatInTimeZone from date-fns-tz imported here, let's just do it simple, we already saved it correctly.
    return activities.filter(a => {
      const aDateStr = new Date(a.date).toLocaleDateString("en-CA", { timeZone: timezone });
      const targetStr = selectedDate.toLocaleDateString("en-CA", { timeZone: timezone });
      return aDateStr === targetStr;
    });
  }, [activities, selectedDate, timezone]);

  const handleEditActivity = (activity: Activity) => {
    setActivityToEdit(activity);
    setIsActivityDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsActivityDialogOpen(false);
    setActivityToEdit(undefined);
  };

  return (
    <div className="space-y-6">
      {/* Date Tabs - Scrollable on mobile */}
      <div className="flex overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 gap-3 no-scrollbar">
        {days.map((day, index) => {
          const isSelected = index === selectedDayIndex;
          return (
            <button
              key={index}
              onClick={() => setSelectedDayIndex(index)}
              className={`flex-shrink-0 flex flex-col items-center justify-center min-w-[70px] p-3 rounded-2xl border transition-all ${
                isSelected 
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 shadow-lg' 
                  : 'bg-white dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
              }`}
            >
              <span className="text-xs font-medium opacity-60">วันที่ {index + 1}</span>
              <span className="text-sm font-bold">{format(day, 'd MMM', { locale: th })}</span>
            </button>
          );
        })}
      </div>

      {/* Header for Day actions */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <CalendarDays size={18} className="text-zinc-500" />
          {selectedDate && format(selectedDate, 'EEEE d MMMM yyyy', { locale: th })}
        </h3>
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={() => setIsActivityDialogOpen(true)}
        >
          <Plus size={16} />
          เพิ่มกิจกรรม
        </Button>
      </div>

      {/* Activities List */}
      <div className="space-y-4">
        {dailyActivities.length > 0 ? (
          dailyActivities.map((activity) => (
            <ActivityItem 
              key={activity.id} 
              activity={activity} 
              onEdit={handleEditActivity}
              timezone={timezone}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
            <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
              <MapPin size={24} className="text-zinc-400" />
            </div>
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">ยังไม่มีกิจกรรมวันนี้</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 text-center max-w-[200px]">
              เพิ่มสถานที่ท่องเที่ยว ร้านอาหาร หรือที่พักลงในแผนการเดินทาง
            </p>
            <Button 
              variant="primary" 
              size="sm"
              onClick={() => setIsActivityDialogOpen(true)}
            >
              <Plus size={16} />
              เพิ่มกิจกรรมแรก
            </Button>
          </div>
        )}
      </div>

      {/* Activity Dialog */}
      <ActivityDialog 
        isOpen={isActivityDialogOpen}
        onClose={handleCloseDialog}
        tripId={tripId}
        tripStartDate={days[selectedDayIndex]} // Default date to selected tab
        tripEndDate={endDate}
        activityToEdit={activityToEdit}
        timezone={timezone}
      />
    </div>
  );
}
