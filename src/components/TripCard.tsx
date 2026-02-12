'use client';

import { Calendar, Users, ArrowRight, MapPin } from 'lucide-react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { TripWithMemberCount } from '@/types/trip';
import { getTripStatus } from '@/lib/trip-utils';

interface TripCardProps {
  trip: TripWithMemberCount;
}

export default function TripCard({ trip }: TripCardProps) {
  const status = getTripStatus(trip.startDate, trip.endDate);
  
  const statusConfig = {
    upcoming: { label: 'กำลังจะไป', variant: 'info' as const },
    ongoing: { label: 'กำลังเที่ยว', variant: 'success' as const },
    completed: { label: 'เสร็จสิ้น', variant: 'default' as const },
  };

  const config = statusConfig[status];

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
    });
  };

  const getDuration = () => {
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return `${days} วัน`;
  };

  const coverImage = trip.coverImage || trip.images?.[0]?.url;

  const totalExpense = trip.expenses?.reduce((sum, exp) => sum + exp.thbAmount, 0) || 0;
  const budget = trip.budget;
  const percentUsed = budget > 0 ? Math.min((totalExpense / budget) * 100, 100) : 0;
  const isOverBudget = budget > 0 && totalExpense > budget;

  return (
    <Link href={`/trips/${trip.id}`} className="block h-full">
      <Card 
        className="group cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-600 transition-all duration-150 overflow-hidden flex flex-col h-full"
      >
        {/* Cover Image */}
        {coverImage ? (
          <div className="relative w-full h-32 bg-zinc-100 dark:bg-zinc-800 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={coverImage} 
              alt={trip.name} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        ) : (
          <div className="relative w-full h-32 bg-gradient-to-br from-blue-500/10 to-sky-500/10 dark:from-blue-500/20 dark:to-sky-500/20 shrink-0 flex items-center justify-center">
            <MapPin className="text-blue-500/30 w-8 h-8 group-hover:scale-110 transition-transform duration-300" />
          </div>
        )}

        <div className="p-4 flex-1 flex flex-col">
          {/* Header */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-2 line-clamp-1">
                  {trip.name}
                </h3>
                <Badge variant={config.variant}>
                  {config.label}
                </Badge>
              </div>
              <ArrowRight 
                size={18} 
                className="text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 group-hover:translate-x-0.5 transition-all shrink-0" 
              />
            </div>

          {/* Info */}
          <div className="space-y-1.5 text-sm text-zinc-600 dark:text-zinc-400 mb-3 flex-1">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="shrink-0" />
              <span className="truncate">{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
              <span className="text-zinc-400 dark:text-zinc-500 shrink-0">({getDuration()})</span>
            </div>
            <div className="flex items-center gap-2">
              <Users size={14} className="shrink-0" />
              <span>{trip._count.members} คน</span>
            </div>
          </div>

          {/* Budget */}
          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 mt-auto">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-zinc-500 dark:text-zinc-400">งบประมาณ</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                ฿{(budget / 100).toLocaleString('th-TH')}
              </span>
            </div>
            {budget > 0 && (
              <div className="w-full">
                <div className="flex justify-between text-[10px] mb-1.5 font-medium">
                  <span className="text-zinc-500 dark:text-zinc-400">ใช้ไป ฿{(totalExpense / 100).toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                  <span className={`${isOverBudget ? 'text-red-500 font-bold' : 'text-zinc-400 dark:text-zinc-500'}`}>
                    {isOverBudget ? 'เกินงบ!' : `เหลือ ฿${((budget - totalExpense) / 100).toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${isOverBudget ? 'bg-red-500' : 'bg-emerald-500'}`}
                    style={{ width: `${percentUsed}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
