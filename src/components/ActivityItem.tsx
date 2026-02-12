'use client';

import { useState } from 'react';
import HoverMap from './HoverMap';
import { 
  Utensils, Car, Bed, MapPin, ShoppingBag, 
  HelpCircle, Clock, ExternalLink
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity } from '@/generated/prisma/client';
import { formatInTimeZone } from 'date-fns-tz';

interface ActivityItemProps {
  activity: Activity;
  onEdit: (activity: Activity) => void;
  timezone: string;
}

const CATEGORIES: Record<string, { label: string, icon: React.ElementType, color: string }> = {
  food: { label: 'อาหาร', icon: Utensils, color: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20' },
  transport: { label: 'เดินทาง', icon: Car, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
  accommodation: { label: 'ที่พัก', icon: Bed, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
  attraction: { label: 'ท่องเที่ยว', icon: MapPin, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' },
  shopping: { label: 'ช้อปปิ้ง', icon: ShoppingBag, color: 'text-pink-500 bg-pink-50 dark:bg-pink-900/20' },
  other: { label: 'อื่นๆ', icon: HelpCircle, color: 'text-gray-500 bg-gray-50 dark:bg-gray-900/20' },
};

export default function ActivityItem({ activity, onEdit, timezone }: ActivityItemProps) {
  const [isHovering, setIsHovering] = useState(false);
  const categoryConfig = CATEGORIES[activity.category] || CATEGORIES.other;
  const CategoryIcon = categoryConfig.icon;

  const startTimeFormatted = formatInTimeZone(new Date(activity.startTime), timezone, 'HH:mm');
  const endTimeFormatted = formatInTimeZone(new Date(activity.endTime), timezone, 'HH:mm');

  const getDuration = () => {
    const diffMinutes = Math.floor(
      (new Date(activity.endTime).getTime() - new Date(activity.startTime).getTime()) / 60000
    );
    if (diffMinutes <= 0) return '0 นาที';
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    if (hours > 0 && minutes > 0) return `${hours} ชม. ${minutes} นาที`;
    if (hours > 0) return `${hours} ชม.`;
    return `${minutes} นาที`;
  };

  const mapsUrl = activity.location
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.location)}`
    : null;

  return (
    <div 
      onClick={() => onEdit(activity)}
      className="group relative flex gap-4 p-4 rounded-2xl bg-white dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700 transition-all cursor-pointer hover:shadow-sm"
    >
      {/* Time Column */}
      <div className="flex flex-col items-center min-w-[60px] pt-1">
        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {startTimeFormatted}
        </span>
        <div className="w-0.5 h-full bg-zinc-100 dark:bg-zinc-800 my-1" />
        <span className="text-xs text-zinc-400 dark:text-zinc-500">
          {endTimeFormatted}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <div className={`p-1.5 rounded-lg ${categoryConfig.color}`}>
            <CategoryIcon size={14} />
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
            {categoryConfig.label}
          </span>
        </div>

        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
          {activity.name}
        </h3>
        
        {/* Location — simple link, no Google Maps embed (no API key needed) */}
        {activity.location && mapsUrl && (
          <div 
            className="relative"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400 mt-1 hover:text-blue-500 hover:underline w-fit max-w-full group/loc"
            >
              <MapPin size={12} className="shrink-0" />
              <span className="truncate">{activity.location}</span>
              <ExternalLink size={10} className="shrink-0 opacity-0 group-hover/loc:opacity-100 transition-opacity" />
            </a>

            <AnimatePresence>
              {isHovering && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-0 top-full mt-2 w-64 sm:w-80 h-48 bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden z-50 pointer-events-none"
                >
                  <HoverMap location={activity.location} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {activity.notes && (
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-2 line-clamp-2">
            {activity.notes}
          </p>
        )}
        
        <div className="flex items-center gap-1.5 mt-3 text-xs text-zinc-400 dark:text-zinc-500">
          <Clock size={12} />
          <span>{getDuration()}</span>
        </div>
      </div>
    </div>
  );
}
