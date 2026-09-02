'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { createBooking } from '@/app/actions/bookings';

type AssetOption = {
  id: string;
  serial_number: string;
  sku: string;
  color_hex?: string;
};

export function NewBookingForm({ assets }: { assets: AssetOption[] }) {
  const router = useRouter();
  const [customerName, setCustomerName] = useState('');
  const [referenceNo, setReferenceNo] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [assetId, setAssetId] = useState(assets[0]?.id ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!customerName.trim()) {
      window.alert('Customer name is required.');
      return;
    }

    if (!referenceNo.trim()) {
      window.alert('Reference number is required.');
      return;
    }

    if (!startDate || !endDate) {
      window.alert('Start date and end date are required.');
      return;
    }

    if (!assetId) {
      window.alert('Please select an available asset.');
      return;
    }

    if (new Date(endDate).getTime() <= new Date(startDate).getTime()) {
      window.alert('End date must be after the start date.');
      return;
    }

    setIsSubmitting(true);

    try {
      await createBooking({
        assetId,
        customerName,
        referenceNo,
        startDate,
        endDate,
      });

      setCustomerName('');
      setReferenceNo('');
      setStartDate('');
      setEndDate('');
      setAssetId(assets[0]?.id ?? '');
      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Could not save booking.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">New Booking</h2>
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Create</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-slate-700">
          Customer name
          <input
            value={customerName}
            onChange={(event) => setCustomerName(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none transition focus:border-brand-500"
            placeholder="John Smith"
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          Reference No
          <input
            value={referenceNo}
            onChange={(event) => setReferenceNo(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none transition focus:border-brand-500"
            placeholder="REF-1024"
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          Start date
          <input
            type="datetime-local"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none transition focus:border-brand-500"
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          End date
          <input
            type="datetime-local"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none transition focus:border-brand-500"
          />
        </label>
      </div>

      <div className="mt-4">
        <label className="space-y-2 text-sm font-medium text-slate-700">
          Select available asset
          <select
            value={assetId}
            onChange={(event) => setAssetId(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none transition focus:border-brand-500"
          >
            {assets.length === 0 ? (
              <option value="">No available assets</option>
            ) : (
              assets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.serial_number} • {asset.sku}
                </option>
              ))
            )}
          </select>
        </label>
      </div>

      <div className="mt-5 flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || assets.length === 0}
          className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isSubmitting ? 'Saving...' : 'Save booking'}
        </button>
      </div>
    </form>
  );
}
