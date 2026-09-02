'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { deleteProductType, saveProductType } from '@/app/actions/product-types';

type ProductType = {
  id: string;
  name: string;
  is_active: number;
};

export function ProductTypeForm({ productTypes }: { productTypes: ProductType[] }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string>('');
  const [name, setName] = useState('');
  const [isActive, setIsActive] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedProduct = productTypes.find((item) => item.id === selectedId) || null;

  const handleEdit = (product: ProductType) => {
    setSelectedId(product.id);
    setName(product.name);
    setIsActive(product.is_active ?? 1);
  };

  const handleReset = () => {
    setSelectedId('');
    setName('');
    setIsActive(1);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim()) {
      window.alert('Product type name is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      await saveProductType({
        id: selectedId || undefined,
        name,
        isActive,
      });

      handleReset();
      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Could not save product type.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProductType(id);
      if (selectedId === id) {
        handleReset();
      }
      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Could not delete product type.');
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Product Types</h2>
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">{productTypes.length} total</span>
        </div>

        <div className="space-y-3">
          {productTypes.length === 0 ? (
            <p className="text-sm text-slate-500">No product types found.</p>
          ) : (
            productTypes.map((product) => (
              <div key={product.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3">
                <div>
                  <p className="font-medium text-slate-800">{product.name}</p>
                  <p className="text-xs text-slate-500">{product.is_active === 1 ? 'Active' : 'Inactive'}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(product)}
                    className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(product.id)}
                    className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-medium text-rose-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">{selectedProduct ? 'Edit product type' : 'Add product type'}</h2>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            Product type name
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none transition focus:border-brand-500"
              placeholder="Portable Cabin"
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
              {isSubmitting ? 'Saving...' : selectedProduct ? 'Update' : 'Save'}
            </button>

            {selectedProduct ? (
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
