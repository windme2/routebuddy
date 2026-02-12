'use client';

import dynamic from 'next/dynamic';
import { Activity } from '@/generated/prisma/client';
import { MapPin } from 'lucide-react';

interface MapViewProps {
  activities: Activity[];
  tripName: string;
}

// Dynamic import — Leaflet must not run on server side
const RouteMapView = dynamic(() => import('@/components/RouteMapView'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900" style={{ minHeight: '420px' }}>
      <div className="flex flex-col items-center gap-3 text-zinc-400">
        <MapPin size={28} className="animate-pulse" />
        <p className="text-sm">กำลังโหลดแผนที่...</p>
      </div>
    </div>
  ),
});

export default function MapView({ activities, tripName }: MapViewProps) {
  return <RouteMapView activities={activities} tripName={tripName} />;
}
