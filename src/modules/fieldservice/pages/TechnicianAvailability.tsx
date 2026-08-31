import api from '@shared/lib/api';
import React, { useEffect, useState } from 'react';
import { Calendar, Wrench, MapPin, Clock } from 'lucide-react';

interface AvailabilitySlot {
  start: string;
  end: string;
  status: string;
}

interface AvailabilityRecord {
  _id: string;
  technician: string;
  region?: string;
  slots: AvailabilitySlot[];
}

const HOURS = Array.from({ length: 10 }, (_, i) => 8 + i);

function slotLabel(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00`;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function TechnicianAvailability() {
  const [date, setDate] = useState(today());
  const [records, setRecords] = useState<AvailabilityRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [technician, setTechnician] = useState('');
  const [region, setRegion] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [formError, setFormError] = useState<string | null>(null);

  const [workOrderId, setWorkOrderId] = useState('');
  const [mapsUrl, setMapsUrl] = useState<string | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/ops/technician-availability?date=${date}`);
      setRecords(Array.isArray(res.data) ? res.data : res.data.records || []);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [date]);

  const cellStatus = (record: AvailabilityRecord, hour: number): string => {
    const hh = slotLabel(hour);
    const slot = record.slots?.find(
      (s) =>
        s.start.slice(0, 5) <= hh && hh < s.end.slice(0, 5)
    );
    return slot?.status || 'off';
  };

  const createAvailability = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!technician.trim()) {
      setFormError('Technician name is required.');
      return;
    }
    if (startTime >= endTime) {
      setFormError('Start time must be before end time.');
      return;
    }
    setFormError(null);
    try {
      await api.post('/ops/technician-availability', {
        technician,
        date,
        slots: [{ start: startTime, end: endTime, status: 'available' }],
        region,
      });
      setTechnician('');
      setRegion('');
      await load();
    } catch {
      setFormError('Failed to create availability.');
    }
  };

  const fetchRouteLink = async () => {
    if (!workOrderId.trim()) return;
    setRouteLoading(true);
    setRouteError(null);
    setMapsUrl(null);
    try {
      const res = await api.get(`/ops/work-orders/${workOrderId}/route-link`);
      setMapsUrl(res.data.mapsUrl || res.data.url || null);
      if (!res.data.mapsUrl && !res.data.url) {
        setRouteError('No route link returned.');
      }
    } catch {
      setRouteError('Failed to fetch route link.');
    } finally {
      setRouteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Calendar className="h-6 w-6 text-brand-600" />
        <h1 className="text-2xl font-bold text-gray-900">Technician Availability</h1>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700">Date:</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        {loading ? (
          <div className="py-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto" />
          </div>
        ) : records.length === 0 ? (
          <p className="py-12 text-center text-sm text-gray-500">No availability records for this date.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Technician</th>
                {HOURS.map((hour) => (
                  <th key={hour} className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    {slotLabel(hour)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.map((record) => (
                <tr key={record._id}>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">{record.technician}</span>
                      {record.region && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <MapPin className="h-3 w-3" /> {record.region}
                        </span>
                      )}
                    </div>
                  </td>
                  {HOURS.map((hour) => {
                    const status = cellStatus(record, hour);
                    return (
                      <td key={hour} className="px-1 py-2">
                        <div
                          className={`h-6 rounded ${
                            status === 'available'
                              ? 'bg-green-400'
                              : status === 'booked'
                              ? 'bg-blue-500'
                              : 'bg-gray-200'
                          }`}
                          title={`${slotLabel(hour)} ${status}`}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form onSubmit={createAvailability} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Clock className="h-5 w-5 text-brand-600" />
            Add Availability
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Technician name"
              value={technician}
              onChange={(e) => setTechnician(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <input
              type="text"
              placeholder="Region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Start</label>
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                {HOURS.map((hour) => (
                  <option key={hour} value={slotLabel(hour)}>{slotLabel(hour)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">End</label>
              <select
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                {HOURS.map((hour) => (
                  <option key={hour} value={slotLabel(hour)}>{slotLabel(hour)}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm font-medium"
          >
            Save Availability
          </button>
          {formError && <p className="text-sm text-red-600">{formError}</p>}
        </form>

        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <MapPin className="h-5 w-5 text-brand-600" />
            Work Order Route
          </h2>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Work order ID"
              value={workOrderId}
              onChange={(e) => setWorkOrderId(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button
              onClick={fetchRouteLink}
              disabled={routeLoading || !workOrderId.trim()}
              className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm font-medium disabled:opacity-50"
            >
              {routeLoading ? 'Loading...' : 'Get Route Link'}
            </button>
          </div>
          {mapsUrl && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-block text-sm text-brand-600 hover:text-brand-700 underline break-all"
            >
              Open route in maps
            </a>
          )}
          {routeError && <p className="text-sm text-red-600">{routeError}</p>}
        </div>
      </div>
    </div>
  );
}
