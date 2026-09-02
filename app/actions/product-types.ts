'use server';

import { revalidatePath } from 'next/cache';

import { supabase } from '@/lib/supabase';

export async function saveProductType(input: {
  id?: string;
  name: string;
  isActive?: number;
}) {
  const name = input.name.trim();

  if (!name) {
    throw new Error('Product type name is required.');
  }

  const payload = {
    name,
    created_by: 'web-app',
    is_active: typeof input.isActive === 'number' ? input.isActive : 1,
  };

  let result;
  if (input.id) {
    result = await supabase.from('r_producttype').update(payload).eq('id', input.id);
  } else {
    result = await supabase.from('r_producttype').insert(payload);
  }

  if (result.error) {
    throw new Error(result.error.message);
  }

  revalidatePath('/assets');
  return { ok: true };
}

export async function deleteProductType(id: string) {
  const { error } = await supabase.from('r_producttype').delete().eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/assets');
  return { ok: true };
}
