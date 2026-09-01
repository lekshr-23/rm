import { SchedulerShell } from '@/components/scheduler-shell';

async function getData() {
  const response = await fetch('http://localhost:3000/api/assets', {
    cache: 'no-store',
  });

  if (!response.ok) {
    return { assets: [], bookings: [] };
  }

  const json = await response.json();
  return {
    assets: json.assets ?? [],
    bookings: json.bookings ?? [],
  };
}

export default async function HomePage() {
  const { assets, bookings } = await getData();

  return <SchedulerShell assets={assets} bookings={bookings} />;
}
