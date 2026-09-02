import { CalendarView } from '@/components/calendar-view';

async function getBookings() {
  const response = await fetch('http://localhost:3000/api/assets', {
    cache: 'no-store',
  });

  if (!response.ok) {
    return [];
  }

  const json = await response.json();
  return json.bookings ?? [];
}

export default async function BookingsPage() {
  const bookings = await getBookings();

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 rounded-2xl bg-white p-5 shadow-card">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-brand-600">Booking Calendar</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">Schedule Overview</h1>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-card">
          <CalendarView bookings={bookings} />
        </div>
      </div>
    </main>
  );
}
