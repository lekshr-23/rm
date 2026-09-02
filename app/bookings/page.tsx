import { CalendarView } from '@/components/calendar-view';
import { NewBookingForm } from '@/components/new-booking-form';
import { supabase } from '@/lib/supabase';

async function getAssets() {
  const { data, error } = await supabase
    .from('r_assets')
    .select('id, serial_number, sku, color_hex, is_active')
    .eq('is_active', 1)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch available assets:', error.message);
    return [];
  }

  return data ?? [];
}

async function getBookings() {
  const { data, error } = await supabase
    .from('r_bookings')
    .select('id, asset_id, customer_name, customer_email, start_time, end_time, status, notes')
    .order('start_time', { ascending: true });

  if (error) {
    console.error('Failed to fetch bookings:', error.message);
    return [];
  }

  const assetMap = new Map((await getAssets()).map((asset) => [asset.id, asset]));

  return (data ?? []).map((booking) => {
    const asset = assetMap.get(booking.asset_id);
    const referenceNo = (booking.notes || '').match(/Reference No:\s*(.*)/i)?.[1] || '';

    return {
      id: booking.id,
      assetId: booking.asset_id,
      asset: asset ? `${asset.serial_number} • ${asset.sku}` : 'Asset',
      customer: booking.customer_name,
      status: booking.status || 'pending',
      start: new Date(booking.start_time).toISOString(),
      end: new Date(booking.end_time).toISOString(),
      color: asset?.color_hex || '#3b82f6',
      referenceNo,
    };
  });
}

export default async function BookingsPage() {
  const assets = await getAssets();
  const bookings = await getBookings();

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 rounded-2xl bg-white p-5 shadow-card">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-brand-600">Booking Calendar</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">Schedule Overview</h1>
        </div>

        <div className="space-y-6">
          <NewBookingForm assets={assets} />

          <div className="rounded-2xl bg-white p-5 shadow-card">
            <CalendarView bookings={bookings} />
          </div>
        </div>
      </div>
    </main>
  );
}
