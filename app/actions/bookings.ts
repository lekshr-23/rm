'use server';

import { revalidatePath } from 'next/cache';

import { supabase } from '@/lib/supabase';

export type BookingInput = {
  assetId: string;
  customerName: string;
  customerEmail?: string;
  referenceNo?: string;
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
  const referenceNo = input.referenceNo?.trim() || null;
  const notesText = input.notes?.trim() || null;

  const cleaned = {
    asset_id: input.assetId,
    customer_name: input.customerName.trim(),
    customer_email: input.customerEmail?.trim() || null,
    reference_no: referenceNo,
    start_time: toUtcIso(input.startDate),
    end_time: toUtcIso(input.endDate),
    notes: notesText,
    created_by: 'web-app',
    status: 'pending',
  };

  if (!cleaned.asset_id || !cleaned.customer_name || !referenceNo || !cleaned.start_time || !cleaned.end_time) {
    throw new Error('Asset, customer name, reference number, start date, and end date are required.');
  }

  if (new Date(cleaned.end_time).getTime() <= new Date(cleaned.start_time).getTime()) {
    throw new Error('End date must be after the start date.');
  }

  const payload = {
    ...cleaned,
    notes: notesText || (referenceNo ? `Reference No: ${referenceNo}` : null),
  };

  const { error } = await supabase.from('r_bookings').insert(payload);

  if (error && /reference_no.*does not exist|column .*reference_no.*does not exist/i.test(error.message)) {
    const fallbackPayload = {
      ...payload,
      reference_no: undefined,
      notes: [notesText, referenceNo ? `Reference No: ${referenceNo}` : null].filter(Boolean).join(' | ') || null,
    };

    const retry = await supabase.from('r_bookings').insert(fallbackPayload);
    if (retry.error) {
      throw new Error(retry.error.message);
    }
  } else if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/bookings');
  return { ok: true };
}

export async function updateBooking(id: string, input: BookingInput) {
  const referenceNo = input.referenceNo?.trim() || null;
  const notesText = input.notes?.trim() || null;

  const cleaned = {
    asset_id: input.assetId,
    customer_name: input.customerName.trim(),
    customer_email: input.customerEmail?.trim() || null,
    reference_no: referenceNo,
    start_time: toUtcIso(input.startDate),
    end_time: toUtcIso(input.endDate),
    notes: notesText,
    created_by: 'web-app',
  };

  if (new Date(cleaned.end_time).getTime() <= new Date(cleaned.start_time).getTime()) {
    throw new Error('End date must be after the start date.');
  }

  const payload = {
    ...cleaned,
    notes: notesText || (referenceNo ? `Reference No: ${referenceNo}` : null),
  };

  const { error } = await supabase.from('r_bookings').update(payload).eq('id', id);

  if (error && /reference_no.*does not exist|column .*reference_no.*does not exist/i.test(error.message)) {
    const fallbackPayload = {
      ...payload,
      reference_no: undefined,
      notes: [notesText, referenceNo ? `Reference No: ${referenceNo}` : null].filter(Boolean).join(' | ') || null,
    };

    const retry = await supabase.from('r_bookings').update(fallbackPayload).eq('id', id);
    if (retry.error) {
      throw new Error(retry.error.message);
    }
  } else if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/bookings');
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
