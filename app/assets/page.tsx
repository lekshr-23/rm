import { AssetForm } from '@/components/asset-form';
import { ProductCategoryForm } from '@/components/product-category-form';
import { ProductTypeForm } from '@/components/product-type-form';
import { supabase } from '@/lib/supabase';

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

export default async function AssetsPage() {
  const assets = await getAssets();
  const productTypes = await getProductTypes();
  const productCategories = await getProductCategories();
  const bookings = await getBookings();

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 rounded-2xl bg-white p-5 shadow-card">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-brand-600">Asset Register</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">Inventory Master</h1>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Catalog Setup</h2>
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Metadata</span>
            </div>
            <div className="grid gap-6 xl:grid-cols-2">
              <ProductTypeForm productTypes={productTypes} />
              <ProductCategoryForm categories={productCategories} productTypes={productTypes} />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Asset Inventory</h2>
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Assets</span>
            </div>
            <AssetForm assets={assets} bookings={bookings} productTypes={productTypes} categories={productCategories} />
          </section>
        </div>
      </div>
    </main>
  );
}
