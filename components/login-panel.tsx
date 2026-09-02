import Link from 'next/link';

const roles = [
  { name: 'Admin', description: 'Manage catalog and inventories', accent: 'bg-brand-600' },
  { name: 'User', description: 'Create and update bookings', accent: 'bg-emerald-500' },
  { name: 'Driver', description: 'View assigned asset schedules', accent: 'bg-amber-500' },
];

export function LoginPanel() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {roles.map((role) => (
        <Link
          key={role.name}
          href="/login"
          className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left transition hover:border-brand-200 hover:bg-brand-50"
        >
          <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-semibold text-white ${role.accent}`}>
            {role.name.slice(0, 1)}
          </span>
          <span>
            <span className="block text-sm font-semibold text-slate-800">{role.name}</span>
            <span className="block text-xs text-slate-500">{role.description}</span>
          </span>
        </Link>
      ))}
    </div>
  );
}
