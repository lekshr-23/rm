'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

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

type SortKey = 'serial_number' | 'sku' | 'type' | 'category' | 'status';
type SortDir = 'asc' | 'desc';

const emptyForm = {
  serialNumber: '',
  sku: '',
  productTypeId: '',
  categoryId: '',
  colorHex: '#3b82f6',
  isActive: 1,
};

export function AssetTable({
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
  const [sortKey, setSortKey] = useState<SortKey>('serial_number');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [showForm, setShowForm] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const typeNameById = useMemo(() => new Map(productTypes.map((type) => [type.id, type.name])), [productTypes]);
  const categoryNameById = useMemo(() => new Map(categories.map((category) => [category.id, category.name])), [categories]);

  const bookingByAssetId = useMemo(() => {
    const map = new Map<string, BookingRecord>();
    bookings.forEach((booking) => {
      const current = map.get(booking.asset_id);
      if (!current || new Date(booking.start_time).getTime() > new Date(current.start_time).getTime()) {
        map.set(booking.asset_id, booking);
      }
    });
    return map;
  }, [bookings]);

  const rows = useMemo(() => {
    return assets.map((asset) => {
      const latestBooking = bookingByAssetId.get(asset.id);
      const isBooked =
        !!latestBooking && (latestBooking.status === 'pending' || latestBooking.status === 'confirmed' || latestBooking.status === 'active');
      const statusLabel = isBooked ? 'Booked' : asset.is_active === 1 ? 'Available' : 'Maintenance';

      return {
        asset,
        typeName: typeNameById.get(asset.producttype_id) || 'Unassigned',
        categoryName: categoryNameById.get(asset.category_id) || 'Unassigned',
        statusLabel,
        customer: isBooked ? latestBooking?.customer_name : undefined,
      };
    });
  }, [assets, bookingByAssetId, typeNameById, categoryNameById]);

  const sortedRows = useMemo(() => {
    const withValue = rows.map((row) => {
      const value =
        sortKey === 'serial_number'
          ? row.asset.serial_number
          : sortKey === 'sku'
            ? row.asset.sku
            : sortKey === 'type'
              ? row.typeName
              : sortKey === 'category'
                ? row.categoryName
                : row.statusLabel;

      return { row, value: value.toLowerCase() };
    });

    withValue.sort((a, b) => {
      const comparison = a.value.localeCompare(b.value);
      return sortDir === 'asc' ? comparison : -comparison;
    });

    return withValue.map((entry) => entry.row);
  }, [rows, sortKey, sortDir]);

  const filteredCategories = categories.filter((category) => category.producttype_id === form.productTypeId);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((direction) => (direction === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const resetForm = () => {
    setSelectedId('');
    setForm(emptyForm);
  };

  const handleAddNew = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEdit = (asset: AssetRecord) => {
    setSelectedId(asset.id);
    setForm({
      serialNumber: asset.serial_number,
      sku: asset.sku,
      productTypeId: asset.producttype_id,
      categoryId: asset.category_id,
      colorHex: asset.color_hex || '#3b82f6',
      isActive: asset.is_active ?? 1,
    });
    setShowForm(true);
  };

  const handleProductTypeChange = (productTypeId: string) => {
    setForm((current) => ({ ...current, productTypeId, categoryId: '' }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.serialNumber.trim()) {
      window.alert('Serial number is required.');
      return;
    }

    if (!form.sku.trim()) {
      window.alert('SKU is required.');
      return;
    }

    if (!form.productTypeId) {
      window.alert('Please select a product type.');
      return;
    }

    if (!form.categoryId) {
      window.alert('Please select a category for the chosen product type.');
      return;
    }

    const validCategory = filteredCategories.some((category) => category.id === form.categoryId);
    if (!validCategory) {
      window.alert('The selected category does not belong to the chosen product type.');
      return;
    }

    setIsSubmitting(true);

    try {
      await saveAsset({
        id: selectedId || undefined,
        serialNumber: form.serialNumber,
        sku: form.sku,
        productTypeId: form.productTypeId,
        categoryId: form.categoryId,
        colorHex: form.colorHex,
        isActive: form.isActive,
      });

      resetForm();
      setShowForm(false);
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
        resetForm();
        setShowForm(false);
      }
      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Could not delete asset.');
    }
  };

  const columns: { key: SortKey; label: string }[] = [
    { key: 'serial_number', label: 'Serial number' },
    { key: 'sku', label: 'SKU' },
    { key: 'type', label: 'Type' },
    { key: 'category', label: 'Category' },
    { key: 'status', label: 'Status' },
  ];

  const statusClass = (status: string) =>
    status === 'Booked'
      ? 'bg-amber-100 text-amber-700'
      : status === 'Available'
        ? 'bg-emerald-100 text-emerald-700'
        : 'bg-rose-100 text-rose-700';

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Asset Inventory</h2>
          <p className="text-xs text-slate-500">{assets.length} total &middot; click a column to sort</p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (showForm) {
              setShowForm(false);
              resetForm();
            } else {
              handleAddNew();
            }
          }}
          className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white"
        >
          {showForm ? 'Close' : 'Add asset'}
        </button>
      </div>

      {showForm ? (
        <form onSubmit={handleSubmit} className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-900">{selectedId ? 'Edit asset' : 'Add asset'}</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs font-medium text-slate-700">
              Serial number
              <input
                value={form.serialNumber}
                onChange={(event) => setForm((current) => ({ ...current, serialNumber: event.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-brand-500"
                placeholder="PORT-1001"
              />
            </label>

            <label className="block text-xs font-medium text-slate-700">
              SKU
              <input
                value={form.sku}
                onChange={(event) => setForm((current) => ({ ...current, sku: event.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-brand-500"
                placeholder="PT-001"
              />
            </label>

            <label className="block text-xs font-medium text-slate-700">
              Product type
              <select
                value={form.productTypeId}
                onChange={(event) => handleProductTypeChange(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-brand-500"
              >
                <option value="">Select product type</option>
                {productTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-xs font-medium text-slate-700">
              Category
              <select
                value={form.categoryId}
                onChange={(event) => setForm((current) => ({ ...current, categoryId: event.target.value }))}
                disabled={!form.productTypeId || filteredCategories.length === 0}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-brand-500 disabled:cursor-not-allowed disabled:bg-slate-200"
              >
                <option value="">
                  {form.productTypeId
                    ? filteredCategories.length === 0
                      ? 'No categories for this type'
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

            <label className="block text-xs font-medium text-slate-700">
              Color
              <input
                type="color"
                value={form.colorHex}
                onChange={(event) => setForm((current) => ({ ...current, colorHex: event.target.value }))}
                className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white p-1"
              />
            </label>

            <label className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">
              Active
              <input
                type="checkbox"
                checked={form.isActive === 1}
                onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked ? 1 : 0 }))}
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
            </label>
          </div>

          <div className="mt-4 flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isSubmitting ? 'Saving...' : selectedId ? 'Update' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {columns.map((column) => (
                <th key={column.key} className="py-2 pr-3">
                  <button type="button" onClick={() => handleSort(column.key)} className="flex items-center gap-1 hover:text-slate-800">
                    {column.label}
                    <span className="text-[10px]">
                      {sortKey === column.key ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                    </span>
                  </button>
                </th>
              ))}
              <th className="py-2 pl-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="py-6 text-center text-sm text-slate-500">
                  No assets found.
                </td>
              </tr>
            ) : (
              sortedRows.map(({ asset, typeName, categoryName, statusLabel, customer }) => (
                <tr key={asset.id} className="border-b border-slate-100 last:border-0">
                  <td className="py-2.5 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: asset.color_hex || '#3b82f6' }} />
                      <span className="font-medium text-slate-800">{asset.serial_number}</span>
                    </div>
                    {customer ? <p className="pl-4 text-[10px] text-slate-500">Assigned to {customer}</p> : null}
                  </td>
                  <td className="py-2.5 pr-3 text-slate-600">{asset.sku}</td>
                  <td className="py-2.5 pr-3 text-slate-600">{typeName}</td>
                  <td className="py-2.5 pr-3 text-slate-600">{categoryName}</td>
                  <td className="py-2.5 pr-3">
                    <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase ${statusClass(statusLabel)}`}>
                      {statusLabel}
                    </span>
                  </td>
                  <td className="py-2.5 pl-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(asset)}
                        className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(asset.id)}
                        className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
