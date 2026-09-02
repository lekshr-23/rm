'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { deleteAsset, saveAsset } from '@/app/actions/assets';

type ProductType = {
  id: string;
  name: string;
};

type ProductCategory = {
  id: string;
  name: string;
  producttype_id: string;
};

type AssetRecord = {
  id: string;
  serial_number: string;
  sku: string;
  producttype_id: string;
  category_id: string;
  color_hex: string;
  is_active: number;
};

type BookingRecord = {
  id: string;
  asset_id: string;
  customer_name: string;
  status: string;
  start_time: string;
  end_time: string;
};

export function AssetForm({
  assets,
  bookings,
  productTypes,
  categories,
}: {
  assets: AssetRecord[];
  bookings: BookingRecord[];
  productTypes: ProductType[];
  categories: ProductCategory[];
}) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [sku, setSku] = useState('');
  const [productTypeId, setProductTypeId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [colorHex, setColorHex] = useState('#3b82f6');
  const [isActive, setIsActive] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredCategories = categories.filter((category) => category.producttype_id === productTypeId);
  const bookingMap = new Map<string, BookingRecord>();

  bookings.forEach((booking) => {
    const current = bookingMap.get(booking.asset_id);
    if (!current || new Date(booking.start_time).getTime() > new Date(current.start_time).getTime()) {
      bookingMap.set(booking.asset_id, booking);
    }
  });

  const handleProductTypeChange = (nextProductTypeId: string) => {
    setProductTypeId(nextProductTypeId);
    setCategoryId('');
  };

  const handleReset = () => {
    setSelectedId('');
    setSerialNumber('');
    setSku('');
    setProductTypeId(productTypes[0]?.id ?? '');
    setCategoryId('');
    setColorHex('#3b82f6');
    setIsActive(1);
  };

  const handleEdit = (asset: AssetRecord) => {
    setSelectedId(asset.id);
    setSerialNumber(asset.serial_number);
    setSku(asset.sku);
    setProductTypeId(asset.producttype_id);
    setCategoryId(asset.category_id);
    setColorHex(asset.color_hex || '#3b82f6');
    setIsActive(asset.is_active ?? 1);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!serialNumber.trim()) {
      window.alert('Serial number is required.');
      return;
    }

    if (!sku.trim()) {
      window.alert('SKU is required.');
      return;
    }

    if (!productTypeId) {
      window.alert('Please select a product type.');
      return;
    }

    if (!productTypeId) {
      window.alert('Please select a product type.');
      return;
    }

    if (!categoryId) {
      window.alert('Please select a category for the chosen product type.');
      return;
    }

    const validCategory = filteredCategories.some((category) => category.id === categoryId);
    if (!validCategory) {
      window.alert('The selected category does not belong to the chosen product type.');
      return;
    }

    setIsSubmitting(true);

    try {
      await saveAsset({
        id: selectedId || undefined,
        serialNumber,
        sku,
        productTypeId,
        categoryId,
        colorHex,
        isActive,
      });

      handleReset();
      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Could not save asset.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAsset(id);
      if (selectedId === id) {
        handleReset();
      }
      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Could not delete asset.');
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Asset Register</h2>
            {assets.length > 0 ? (
              <p className="mt-1 text-xs text-slate-500">
                {assets[0].serial_number} • {assets[0].sku}
              </p>
            ) : null}
          </div>
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">{assets.length} total</span>
        </div>

        <div className="space-y-3">
          {assets.length === 0 ? (
            <p className="text-sm text-slate-500">No assets found.</p>
          ) : (
            assets.map((asset) => {
              const latestBooking = bookingMap.get(asset.id);
              const isBooked = !!latestBooking && (latestBooking.status === 'pending' || latestBooking.status === 'confirmed' || latestBooking.status === 'active');
              const statusLabel = isBooked ? 'Booked' : asset.is_active === 1 ? 'Available' : 'Maintenance';
              const statusClass = isBooked
                ? 'bg-amber-100 text-amber-700'
                : asset.is_active === 1
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-rose-100 text-rose-700';

              return (
                <div key={asset.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3">
                  <div className="flex items-center gap-3">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: asset.color_hex || '#3b82f6' }} />
                    <div>
                      <p className="font-medium text-slate-800">{asset.serial_number}</p>
                      <p className="text-xs text-slate-500">{asset.sku}</p>
                      {isBooked ? (
                        <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500">
                          Assigned to {latestBooking.customer_name}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase ${statusClass}`}>
                      {statusLabel}
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(asset)}
                        className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(asset.id)}
                        className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-medium text-rose-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">{selectedId ? 'Edit asset' : 'Add asset'}</h2>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            Serial number
            <input
              value={serialNumber}
              onChange={(event) => setSerialNumber(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none transition focus:border-brand-500"
              placeholder="PORT-1001"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            SKU
            <input
              value={sku}
              onChange={(event) => setSku(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none transition focus:border-brand-500"
              placeholder="PT-001"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Product type
            <select
              value={productTypeId}
              onChange={(event) => handleProductTypeChange(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none transition focus:border-brand-500"
            >
              <option value="">Select product type</option>
              {productTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Category
            <select
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              disabled={!productTypeId || filteredCategories.length === 0}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none transition focus:border-brand-500 disabled:cursor-not-allowed disabled:bg-slate-200"
            >
              <option value="">
                {productTypeId
                  ? filteredCategories.length === 0
                    ? 'No categories available for this product type'
                    : 'Select category'
                  : 'Choose a product type first'}
              </option>
              {filteredCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Color
            <input
              type="color"
              value={colorHex}
              onChange={(event) => setColorHex(event.target.value)}
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 p-1"
            />
          </label>

          <label className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
            Active
            <input
              type="checkbox"
              checked={isActive === 1}
              onChange={(event) => setIsActive(event.target.checked ? 1 : 0)}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
          </label>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isSubmitting ? 'Saving...' : selectedId ? 'Update' : 'Save'}
            </button>

            {selectedId ? (
              <button
                type="button"
                onClick={handleReset}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
              >
                Cancel
              </button>
            ) : null}
          </div>
        </div>
      </form>
    </div>
  );
}
