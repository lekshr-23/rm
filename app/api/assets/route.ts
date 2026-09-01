import { NextResponse } from 'next/server';

import { supabase } from '@/lib/supabase';

export async function GET() {
  const { data: assetRows, error: assetError } = await supabase
    .from('r_assets')
    .select('id, serial_number, sku, color_hex, category_id, is_active, created_at')
    .order('created_at', { ascending: true })
    .limit(50);

  if (assetError) {
    return NextResponse.json({ error: assetError.message }, { status: 500 });
  }

  const categoryIds = [...new Set((assetRows ?? []).map((asset) => asset.category_id).filter(Boolean))];

  let categoryRows: Array<{ id: string; name: string }> = [];
  if (categoryIds.length > 0) {
    const { data, error } = await supabase.from('r_productcategory').select('id, name').in('id', categoryIds);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    categoryRows = data ?? [];
  }

  const categoryMap = new Map(categoryRows.map((category) => [category.id, category.name]));

  const assets = (assetRows ?? []).map((asset) => ({
    id: asset.id,
    name: asset.serial_number || asset.sku || 'Unnamed asset',
    type: asset.sku || 'Rental asset',
    categoryName: categoryMap.get(asset.category_id) || 'Unassigned category',
    status: asset.is_active === 1 ? 'available' : 'maintenance',
    color: asset.color_hex || '#3b82f6',
  }));

  const { data: bookingRows, error: bookingError } = await supabase
    .from('r_bookings')
    .select('id, asset_id, customer_name, start_time, end_time, status, notes, created_at')
    .order('start_time', { ascending: true })
    .limit(200);

  if (bookingError) {
    return NextResponse.json({ error: bookingError.message }, { status: 500 });
  }

  const assetMap = new Map(assets.map((asset) => [asset.id, asset]));

  const bookings = (bookingRows ?? []).map((booking) => {
    const asset = assetMap.get(booking.asset_id);
    const start = new Date(booking.start_time);
    const end = new Date(booking.end_time);

    return {
      id: booking.id,
      assetId: booking.asset_id,
      asset: asset?.name || 'Asset',
      customer: booking.customer_name,
      status: booking.status || 'pending',
      start: start.toISOString(),
      end: end.toISOString(),
      color: asset?.color || '#3b82f6',
    };
  });

  return NextResponse.json({ assets, bookings });
}
