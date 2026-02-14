import { notFound } from 'next/navigation';
import { getTripById } from '@/app/actions/trip.actions';
import { getTripStatus } from '@/lib/trip-utils';
import TripDetailClient from './TripDetailClient';

interface TripPageProps {
  params: Promise<{ id: string }>;
}

export default async function TripPage({ params }: TripPageProps) {
  const { id } = await params;
  const trip = await getTripById(id);

  if (!trip) {
    notFound();
  }

  const status = getTripStatus(trip.startDate, trip.endDate);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-violet-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-violet-950">
      <TripDetailClient trip={trip} status={status} />
    </div>
  );
}
