'use server';

import { revalidatePath } from 'next/cache';

import { supabase } from '@/lib/supabase';

export async function saveAsset(input: {
  id?: string;
  serialNumber: string;
  sku: string;
  productTypeId: string;
  categoryId: string;
  colorHex?: string;
  isActive?: number;
}) {
  const serialNumber = input.serialNumber.trim();
  const sku = input.sku.trim();

  if (!serialNumber) {
    throw new Error('Serial number is required.');
  }

  if (!sku) {
    throw new Error('SKU is required.');
  }

  if (!input.productTypeId) {
    throw new Error('Please select a product type.');
  }

  if (!input.categoryId) {
    throw new Error('Please select a category.');
  }

  const payload = {
    serial_number: serialNumber,
    sku,
    producttype_id: input.productTypeId,
    category_id: input.categoryId,
    color_hex: input.colorHex || '#3b82f6',
    created_by: 'web-app',
    is_active: typeof input.isActive === 'number' ? input.isActive : 1,
  };

  let result;
  if (input.id) {
    result = await supabase.from('r_assets').update(payload).eq('id', input.id);
  } else {
    result = await supabase.from('r_assets').insert(payload);
  }

  if (result.error) {
    throw new Error(result.error.message);
  }

  revalidatePath('/assets');
  return { ok: true };
}

export async function deleteAsset(id: string) {
  const { error } = await supabase.from('r_assets').delete().eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/assets');
  return { ok: true };
}
