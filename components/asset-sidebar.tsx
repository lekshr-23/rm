type Asset = {
  id: string;
  name: string;
  type: string;
  categoryName?: string;
  status: 'available' | 'booked' | 'maintenance';
  color: string;
};

const statusStyles = {
  available: 'bg-emerald-100 text-emerald-700',
  booked: 'bg-amber-100 text-amber-700',
  maintenance: 'bg-rose-100 text-rose-700',
};

export function AssetSidebar({ assets }: { assets: Asset[] }) {
  return (
    <aside className="rounded-2xl bg-white p-4 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Assets</h2>
        <button type="button" className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600">
          Filters
        </button>
      </div>

      <div className="mb-4 flex gap-2 text-xs">
        {['All', 'Available', 'Booked', 'Maintenance'].map((filter, index) => (
          <button
            key={filter}
            type="button"
            className={`rounded-full px-2.5 py-1.5 font-medium ${
              index === 0 ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {assets.map((asset) => (
          <button
            key={asset.id}
            type="button"
            className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-3 text-left transition hover:border-brand-200 hover:bg-brand-50"
          >
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: asset.color }}
              aria-label={`${asset.name} status`}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-slate-800">{asset.name}</p>
              <p className="text-xs text-slate-500">{asset.categoryName || asset.type}</p>
            </div>
            <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase ${statusStyles[asset.status]}`}>
              {asset.status}
            </span>
          </button>
        ))}
      </div>
    </aside>
  );
}
