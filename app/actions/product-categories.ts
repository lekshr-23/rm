'use server';

import { revalidatePath } from 'next/cache';

import { supabase } from '@/lib/supabase';

export async function saveProductCategory(input: {
  id?: string;
  name: string;
  productTypeId: string;
  isActive?: number;
}) {
  const name = input.name.trim();

  if (!name) {
    throw new Error('Category name is required.');
  }

  if (!input.productTypeId) {
    throw new Error('Please select a product type.');
  }

  const payload = {
    name,
    producttype_id: input.productTypeId,
    created_by: 'web-app',
    is_active: typeof input.isActive === 'number' ? input.isActive : 1,
  };

  let result;
  if (input.id) {
    result = await supabase.from('r_productcategory').update(payload).eq('id', input.id);
  } else {
    result = await supabase.from('r_productcategory').insert(payload);
  }

  if (result.error) {
    throw new Error(result.error.message);
  }

  revalidatePath('/assets');
  return { ok: true };
}

export async function deleteProductCategory(id: string) {
  const { error } = await supabase.from('r_productcategory').delete().eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/assets');
  return { ok: true };
}
