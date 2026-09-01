const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const dayCells = Array.from({ length: 35 }, (_, index) => index + 1);

type Booking = {
  id: string;
  assetId: string;
  asset: string;
  customer: string;
  status: string;
  start: string;
  end: string;
  color: string;
};

export function CalendarView({ bookings }: { bookings: Booking[] }) {
  const normalizedBookings = bookings.map((booking) => {
    const start = new Date(booking.start);
    const end = new Date(booking.end);

    return {
      ...booking,
      startDay: start.getUTCDate(),
      endDay: end.getUTCDate(),
    };
  });

  return (
    <section className="rounded-2xl bg-white p-4 shadow-card">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Booking Calendar</h2>
          <p className="text-sm text-slate-500">September 2026</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700">Month</button>
          <button type="button" className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white">Week</button>
          <button type="button" className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700">Day</button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
        {weekDays.map((day) => (
          <div key={day} className="py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-2">
        {dayCells.map((day) => {
          const activeBooking = normalizedBookings.find((booking) => booking.startDay <= day && booking.endDay >= day);
          const isCurrentDay = day === 12;

          return (
            <div
              key={day}
              className={`relative min-h-[110px] rounded-xl border p-2 ${
                isCurrentDay ? 'border-brand-200 bg-brand-50' : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${isCurrentDay ? 'text-brand-700' : 'text-slate-600'}`}>
                  {day}
                </span>
                {isCurrentDay && <span className="rounded-full bg-brand-600 px-1.5 py-0.5 text-[10px] text-white">Today</span>}
              </div>

              {activeBooking && (
                <div
                  className="mt-2 rounded-lg px-2 py-1 text-left text-[11px] font-medium text-white shadow-sm"
                  style={{ backgroundColor: activeBooking.color }}
                >
                  <div>{activeBooking.asset}</div>
                  <div className="truncate opacity-90">{activeBooking.customer}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
