'use client';

import { AssetSidebar } from '@/components/asset-sidebar';
import { BookingModal } from '@/components/booking-modal';
import { CalendarView } from '@/components/calendar-view';
import { LoginPanel } from '@/components/login-panel';
import { useState } from 'react';

type Asset = {
  id: string;
  name: string;
  type: string;
  categoryName?: string;
  status: 'available' | 'booked' | 'maintenance';
  color: string;
};

type Booking = {
  id: string;
  assetId: string;
  asset: string;
  customer: string;
  status: string;
  start: string;
  end: string;
  color: string;
};

export function SchedulerShell({ assets, bookings }: { assets: Asset[]; bookings: Booking[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-card md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-brand-600">Rental Management</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900">Asset Scheduler</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
            >
              New booking
            </button>
            <LoginPanel />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <AssetSidebar assets={assets} />
          <div className="space-y-6">
            <CalendarView bookings={bookings} />
          </div>
        </div>
      </div>

      <BookingModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        assets={assets.map((asset) => ({ id: asset.id, name: asset.name, categoryName: asset.categoryName }))}
      />
    </main>
  );
}
