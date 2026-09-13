import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlarmClock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { schemeRegistryAPI, governmentSchemeAPI } from '../../services/api';

const STATE_STYLES = {
  LAPSED: 'bg-red-100 text-red-800',
  'EXPIRING SOON': 'bg-yellow-100 text-yellow-800',
  ACTIVE: 'bg-green-100 text-green-800',
};

/**
 * Deadline Tracker — real backends:
 *  - schemeRegistryAPI.getExpiring(days) -> GET /government/schemes/registry/expiring
 *  - governmentSchemeAPI.getExpiryStatus() -> GET /government/schemes/expiry-status
 *  both backed by backend/src/services/legacy/governmentSchemeService.js
 *  (government_schemes table), mounted via setupRoutes(app) in backend/src/index.js.
 */
const DeadlineTracker = () => {
  const [days, setDays] = useState(90);

  const { data: expiring, isLoading: expiringLoading, error: expiringError } = useQuery({
    queryKey: ['scheme-registry-expiring', days],
    queryFn: () => schemeRegistryAPI.getExpiring(days).then((r) => r.data?.data ?? []),
  });

  const { data: expiryStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['scheme-expiry-status'],
    queryFn: () => governmentSchemeAPI.getExpiryStatus().then((r) => r.data?.data ?? []),
  });

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
        <AlarmClock className="w-7 h-7" /> Deadline Tracker
      </h1>
      <p className="text-gray-600 mb-6">Verified government schemes approaching or past their expiry date.</p>

      <div className="flex items-center gap-3 mb-6">
        <label className="text-sm text-gray-600">Window (days):</label>
        <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="px-3 py-1.5 border rounded">
          {[30, 60, 90, 180].map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Expiring / Lapsed Schemes</h2>
        {expiringLoading && <p className="text-gray-500">Loading...</p>}
        {expiringError && <p className="text-red-600">{expiringError.message}</p>}
        {!expiringLoading && !expiringError && (!expiring || expiring.length === 0) && (
          <p className="text-gray-500">No schemes expiring within {days} days.</p>
        )}
        {!expiringLoading && expiring?.length > 0 && (
          <div className="space-y-2">
            {expiring.map((s) => (
              <div key={s.code || s.id} className="flex items-center justify-between border rounded-lg p-3">
                <div>
                  <div className="font-medium">{s.name || s.code}</div>
                  <div className="text-sm text-gray-500">{s.ministry}</div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  Expires {s.expiry_date}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Full Expiry Status</h2>
        {statusLoading && <p className="text-gray-500">Loading...</p>}
        {!statusLoading && (!expiryStatus || expiryStatus.length === 0) && (
          <p className="text-gray-500">No schemes with a recorded expiry date.</p>
        )}
        {!statusLoading && expiryStatus?.length > 0 && (
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Scheme</th>
                <th className="p-2 text-left">Expiry</th>
                <th className="p-2 text-left">Days Left</th>
                <th className="p-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {expiryStatus.map((s) => (
                <tr key={s.id} className="border-b">
                  <td className="p-2">{s.label}</td>
                  <td className="p-2">{s.expiry ? new Date(s.expiry).toLocaleDateString() : 'N/A'}</td>
                  <td className="p-2">{s.days}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATE_STYLES[s.state] || 'bg-gray-100 text-gray-800'}`}>
                      {s.state === 'ACTIVE' && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
                      {s.state}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default DeadlineTracker;
