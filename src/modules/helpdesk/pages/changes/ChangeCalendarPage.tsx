import api from '@shared/lib/api';
import { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';

interface ChangeCalendarRow {
  _id: string;
  title: string;
  start: string;
  end: string;
  type?: string;
}

interface MaintenanceWindowRow {
  _id: string;
  name: string;
  start: string;
  end: string;
}

interface CalEvent {
  id: string;
  label: string;
  type: 'change' | 'maintenance' | 'freeze';
  start: string;
  end: string;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const TYPE_STYLES: Record<CalEvent['type'], string> = {
  change: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
  maintenance: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
  freeze: 'bg-red-100 text-red-700 hover:bg-red-200',
};

const LEGEND_DOTS: Record<CalEvent['type'], string> = {
  change: 'bg-blue-500',
  maintenance: 'bg-purple-500',
  freeze: 'bg-red-500',
};

const currentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export default function ChangeCalendarPage() {
  const [month, setMonth] = useState(currentMonth);
  const [changeRows, setChangeRows] = useState<ChangeCalendarRow[]>([]);
  const [windows, setWindows] = useState<MaintenanceWindowRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const calRes = await api.get('/extra/change-calendar');
        const calData = calRes.data;
        setChangeRows(
          (Array.isArray(calData) ? calData : calData?.rows || calData?.events || []) as ChangeCalendarRow[]
        );
      } catch {
        setChangeRows([]);
      }
      try {
        const winRes = await api.get('/ops/maintenance-windows');
        const winData = winRes.data;
        setWindows(
          (Array.isArray(winData) ? winData : winData?.rows || winData?.windows || []) as MaintenanceWindowRow[]
        );
      } catch {
        setWindows([]);
      }
      setLoading(false);
    };
    load();
  }, []);

  const events: CalEvent[] = [
    ...changeRows.map((r) => ({
      id: `c-${r._id}`,
      label: r.title,
      type: (r.type === 'freeze' ? 'freeze' : r.type === 'maintenance' ? 'maintenance' : 'change') as CalEvent['type'],
      start: r.start,
      end: r.end,
    })),
    ...windows.map((r) => ({
      id: `m-${r._id}`,
      label: r.name,
      type: 'maintenance' as const,
      start: r.start,
      end: r.end,
    })),
  ];

  const [year, mon] = month.split('-').map(Number);
  const daysInMonth = new Date(year, mon, 0).getDate();
  const firstDayOffset = new Date(year, mon - 1, 1).getDay();
  const monthLabel = new Date(year, mon - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const eventsForDay = (day: number): CalEvent[] => {
    const monthStart = new Date(year, mon - 1, 1);
    const monthEnd = new Date(year, mon - 1, daysInMonth, 23, 59, 59);
    return events.filter((ev) => {
      const s = new Date(ev.start);
      const e = new Date(ev.end);
      if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return false;
      const inMonth = (d: Date) => d.getFullYear() === year && d.getMonth() === mon - 1;
      if (!inMonth(s) && !inMonth(e)) return s < monthStart && e > monthEnd;
      const from = inMonth(s) ? s.getDate() : 1;
      const to = inMonth(e) ? e.getDate() : daysInMonth;
      const lo = Math.min(from, to);
      const hi = Math.max(from, to);
      return day >= lo && day <= hi;
    });
  };

  const shiftMonth = (delta: number) => {
    const base = new Date(year, mon - 1 + delta, 1);
    setMonth(`${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, '0')}`);
  };

  const cells: (number | null)[] = [
    ...Array.from({ length: firstDayOffset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Calendar className="h-6 w-6 text-blue-600" />
          Change Calendar
        </h1>
        <div className="flex items-center gap-3">
          <button onClick={() => shiftMonth(-1)} className="btn-secondary">←</button>
          <span className="font-semibold text-gray-900 min-w-[10rem] text-center">{monthLabel}</span>
          <button onClick={() => shiftMonth(1)} className="btn-secondary">→</button>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-600">
        {(Object.keys(LEGEND_DOTS) as CalEvent['type'][]).map((t) => (
          <span key={t} className="flex items-center gap-1.5 capitalize">
            <span className={`h-2.5 w-2.5 rounded-full ${LEGEND_DOTS[t]}`} />
            {t}
          </span>
        ))}
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <p className="px-6 py-12 text-center text-sm text-gray-400 animate-pulse">Loading calendar…</p>
        ) : (
          <>
            <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
              {WEEKDAYS.map((d) => (
                <div key={d} className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {cells.map((day, idx) => (
                <div
                  key={idx}
                  className={`min-h-[6.5rem] border-b border-r border-gray-100 p-1.5 ${day === null ? 'bg-gray-50/60' : ''}`}
                >
                  {day !== null && (
                    <>
                      <span
                        className={`text-xs font-medium ${
                          day === new Date().getDate() &&
                          new Date().getFullYear() === year &&
                          new Date().getMonth() === mon - 1
                            ? 'inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white'
                            : 'text-gray-500'
                        }`}
                      >
                        {day}
                      </span>
                      <div className="mt-1 space-y-1">
                        {eventsForDay(day).slice(0, 2).map((ev) => (
                          <div
                            key={ev.id}
                            title={`${ev.label} (${ev.type})`}
                            className={`truncate rounded px-1.5 py-0.5 text-[10px] font-medium cursor-default ${TYPE_STYLES[ev.type]}`}
                          >
                            {ev.label}
                          </div>
                        ))}
                        {eventsForDay(day).length > 2 && (
                          <div className="px-1.5 text-[10px] font-semibold text-gray-500">
                            +{eventsForDay(day).length - 2} more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
