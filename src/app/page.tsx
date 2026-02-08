import { getTrips } from '@/app/actions/trip.actions';
import DashboardClient from '@/components/DashboardClient';

export default async function HomePage() {
  const trips = await getTrips();

  return (
    <DashboardClient trips={trips} />
  );
}
