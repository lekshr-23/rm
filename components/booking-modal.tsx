'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { createBooking, deleteBooking, updateBooking } from '@/app/actions/bookings';

type AssetOption = {
  id: string;
  name: string;
  categoryName?: string;
};

type BookingModalProps = {
  assets: AssetOption[];
  booking?: {
    id: string;
    assetId: string;
    customerName: string;
    customerEmail?: string;
    startDate: string;
    endDate: string;
    notes?: string;
  };
  open: boolean;
  onClose: () => void;
};

const emptyForm = (assetId = '') => ({
  customerName: '',
  customerEmail: '',
  startDate: '',
  endDate: '',
  assetId,
  notes: '',
});

export function BookingModal({ assets, booking, open, onClose }: BookingModalProps) {
  const router = useRouter();
  const defaultAssetId = booking?.assetId || assets[0]?.id || '';
  const [formValues, setFormValues] = useState({
    customerName: booking?.customerName ?? '',
    customerEmail: booking?.customerEmail ?? '',
    startDate: booking?.startDate ? booking.startDate.slice(0, 16) : '',
    endDate: booking?.endDate ? booking.endDate.slice(0, 16) : '',
    assetId: defaultAssetId,
    notes: booking?.notes ?? '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!open) {
    return null;
  }

  const onChange = (field: keyof typeof formValues, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formValues.customerName.trim()) {
      window.alert('Customer name is required.');
      return;
    }

    if (!formValues.assetId) {
      window.alert('Please select an asset.');
      return;
    }

    if (!formValues.startDate || !formValues.endDate) {
      window.alert('Start and end dates are required.');
      return;
    }

    if (formValues.endDate < formValues.startDate) {
      window.alert('End date cannot be earlier than the start date.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        assetId: formValues.assetId,
        customerName: formValues.customerName,
        customerEmail: formValues.customerEmail,
        startDate: formValues.startDate,
        endDate: formValues.endDate,
        notes: formValues.notes,
      };

      if (booking?.id) {
        await updateBooking(booking.id, payload);
      } else {
        await createBooking(payload);
      }

      setFormValues(emptyForm(defaultAssetId));
      onClose();
      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Booking could not be saved.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!booking?.id) {
      return;
    }

    try {
      await deleteBooking(booking.id);
      onClose();
      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Booking could not be deleted.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">{booking ? 'Edit booking' : 'Add booking'}</h3>
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-2 py-1 text-sm text-slate-600">
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-slate-50 p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Customer name
              <input
                value={formValues.customerName}
                onChange={(event) => onChange('customerName', event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none transition focus:border-brand-500"
                placeholder="Jane Smith"
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-slate-700">
              Customer email
              <input
                type="email"
                value={formValues.customerEmail}
                onChange={(event) => onChange('customerEmail', event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none transition focus:border-brand-500"
                placeholder="jane@example.com"
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Start date
              <input
                type="datetime-local"
                value={formValues.startDate}
                onChange={(event) => onChange('startDate', event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none transition focus:border-brand-500"
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-slate-700">
              End date
              <input
                type="datetime-local"
                value={formValues.endDate}
                onChange={(event) => onChange('endDate', event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none transition focus:border-brand-500"
              />
            </label>
          </div>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            Asset
            <select
              value={formValues.assetId}
              onChange={(event) => onChange('assetId', event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none transition focus:border-brand-500"
            >
              {assets.length === 0 ? (
                <option value="">No assets available</option>
              ) : (
                assets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.name} {asset.categoryName ? `• ${asset.categoryName}` : ''}
                  </option>
                ))
              )}
            </select>
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            Notes
            <textarea
              value={formValues.notes}
              onChange={(event) => onChange('notes', event.target.value)}
              className="min-h-[96px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none transition focus:border-brand-500"
              placeholder="Access instructions, delivery notes, etc."
            />
          </label>

          <div className="flex items-center justify-between gap-3 pt-2">
            <div>
              {booking?.id ? (
                <button type="button" onClick={handleDelete} className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700">
                  Delete
                </button>
              ) : null}
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700">
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || assets.length === 0}
                className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {isSubmitting ? 'Saving...' : booking ? 'Update booking' : 'Save booking'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
