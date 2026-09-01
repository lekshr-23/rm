'use server';

import { revalidatePath } from 'next/cache';

import { supabase } from '@/lib/supabase';

export type BookingInput = {
  assetId: string;
  customerName: string;
  customerEmail?: string;
  startDate: string;
  endDate: string;
  notes?: string;
};

function toUtcIso(value: string) {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error('Invalid date provided.');
  }

  return parsed.toISOString();
}

export async function createBooking(input: BookingInput) {
  const cleaned = {
    asset_id: input.assetId,
    customer_name: input.customerName.trim(),
    customer_email: input.customerEmail?.trim() || null,
    start_time: toUtcIso(input.startDate),
    end_time: toUtcIso(input.endDate),
    notes: input.notes?.trim() || null,
    created_by: 'web-app',
    status: 'pending',
  };

  if (!cleaned.asset_id || !cleaned.customer_name || !cleaned.start_time || !cleaned.end_time) {
    throw new Error('Asset, customer name, start date, and end date are required.');
  }

  if (new Date(cleaned.end_time).getTime() <= new Date(cleaned.start_time).getTime()) {
    throw new Error('End date must be after the start date.');
  }

  const { error } = await supabase.from('r_bookings').insert(cleaned);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/');
  return { ok: true };
}

export async function updateBooking(id: string, input: BookingInput) {
  const cleaned = {
    asset_id: input.assetId,
    customer_name: input.customerName.trim(),
    customer_email: input.customerEmail?.trim() || null,
    start_time: toUtcIso(input.startDate),
    end_time: toUtcIso(input.endDate),
    notes: input.notes?.trim() || null,
    created_by: 'web-app',
  };

  if (new Date(cleaned.end_time).getTime() <= new Date(cleaned.start_time).getTime()) {
    throw new Error('End date must be after the start date.');
  }

  const { error } = await supabase.from('r_bookings').update(cleaned).eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/');
  return { ok: true };
}

export async function deleteBooking(id: string) {
  const { error } = await supabase.from('r_bookings').delete().eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/');
  return { ok: true };
}
