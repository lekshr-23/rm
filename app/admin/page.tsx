import Link from 'next/link';

import { AssetTable } from '@/components/asset-table';
import { CalendarView } from '@/components/calendar-view';
import { NewBookingForm } from '@/components/new-booking-form';
import { ProductCategoryForm } from '@/components/product-category-form';
import { ProductTypeForm } from '@/components/product-type-form';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

async function getAssets() {
  const { data, error } = await supabase
    .from('r_assets')
    .select('id, serial_number, sku, producttype_id, category_id, color_hex, is_active')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch assets:', error.message);
    return [];
  }

  return data ?? [];
}

async function getProductTypes() {
  const { data, error } = await supabase
    .from('r_producttype')
    .select('id, name, is_active')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch product types:', error.message);
    return [];
  }

  return data ?? [];
}

async function getProductCategories() {
  const { data, error } = await supabase
    .from('r_productcategory')
    .select('id, name, producttype_id, is_active')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch product categories:', error.message);
    return [];
  }

  return data ?? [];
}

async function getBookings() {
  const { data, error } = await supabase
    .from('r_bookings')
    .select('id, asset_id, customer_name, status, start_time, end_time')
    .order('start_time', { ascending: false });

  if (error) {
    console.error('Failed to fetch bookings:', error.message);
    return [];
  }

  return data ?? [];
}

export default async function AdminDashboardPage() {
  const [assets, productTypes, productCategories, bookings] = await Promise.all([
    getAssets(),
    getProductTypes(),
    getProductCategories(),
    getBookings(),
  ]);

  const availableAssets = assets.filter((asset) => asset.is_active === 1);

  const calendarBookings = bookings
    .slice()
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    .map((booking) => {
      const asset = assets.find((item) => item.id === booking.asset_id);

      return {
        id: booking.id,
        assetId: booking.asset_id,
        asset: asset ? `${asset.serial_number} • ${asset.sku}` : 'Asset',
        customer: booking.customer_name,
        status: booking.status || 'pending',
        start: new Date(booking.start_time).toISOString(),
        end: new Date(booking.end_time).toISOString(),
        color: asset?.color_hex || '#3b82f6',
      };
    });

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="mx-auto max-w-[1800px]">
        <div className="mb-6 flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-card md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-brand-600">Rental Management</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          </div>
          <nav className="flex items-center gap-2 text-sm font-medium text-slate-600">
            <Link href="/" className="rounded-lg px-3 py-2 transition hover:bg-slate-100">
              Home
            </Link>
            <Link href="/assets" className="rounded-lg px-3 py-2 transition hover:bg-slate-100">
              Assets
            </Link>
            <Link href="/bookings" className="rounded-lg px-3 py-2 transition hover:bg-slate-100">
              Bookings
            </Link>
          </nav>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Catalog Setup</h2>
                <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Metadata</span>
              </div>
              <div className="space-y-6">
                <ProductTypeForm productTypes={productTypes} />
                <ProductCategoryForm categories={productCategories} productTypes={productTypes} />
              </div>
            </section>
          </div>

          <div>
            <AssetTable assets={assets} bookings={bookings} productTypes={productTypes} categories={productCategories} />
          </div>

          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Scheduling Board</h2>
                <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Bookings</span>
              </div>
              <div className="space-y-6">
                <NewBookingForm assets={availableAssets} />
                <CalendarView bookings={calendarBookings} />
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
