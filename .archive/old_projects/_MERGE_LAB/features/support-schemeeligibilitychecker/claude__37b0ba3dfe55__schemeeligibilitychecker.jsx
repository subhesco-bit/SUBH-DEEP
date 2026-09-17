import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ClipboardCheck, ShieldCheck, Info } from 'lucide-react';
import { schemeRegistryAPI } from '../../services/api';

/**
 * Scheme Eligibility Checker — real backend: schemeRegistryAPI.checkEligibility
 * (GET /api/v1/government/schemes/checker), backed by
 * backend/src/services/legacy/governmentSchemeService.js's checkSchemeEligibility(),
 * which answers strictly from the verified government_schemes registry (never
 * an expired/unverified scheme), mounted via setupRoutes(app) in backend/src/index.js.
 */
const SchemeEligibilityChecker = () => {
  const [form, setForm] = useState({ category: '', state: '', farm_size: '' });
  const [params, setParams] = useState(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['scheme-eligibility-checker', params],
    queryFn: () => schemeRegistryAPI.checkEligibility(params).then((r) => r.data?.data),
    enabled: !!params,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setParams({ ...form });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
        <ClipboardCheck className="w-7 h-7" /> Scheme Eligibility Checker
      </h1>
      <p className="text-gray-600 mb-6">Check which verified government schemes apply to your category, state, and farm size.</p>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Category</label>
          <input
            type="text"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            placeholder="e.g. insurance, horticulture"
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">State</label>
          <input
            type="text"
            value={form.state}
            onChange={(e) => setForm({ ...form, state: e.target.value })}
            placeholder="e.g. Assam"
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Farm Size (hectares)</label>
          <input
            type="number"
            step="0.1"
            value={form.farm_size}
            onChange={(e) => setForm({ ...form, farm_size: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <button type="submit" className="md:col-span-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Check Eligibility
        </button>
      </form>

      {isLoading && <p className="text-gray-500">Checking...</p>}
      {error && <p className="text-red-600">{error.message}</p>}

      {!isLoading && data && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4 text-blue-700 bg-blue-50 p-3 rounded-lg text-sm">
            <Info className="w-4 h-4" /> {data.reminder}
          </div>
          <h2 className="text-lg font-semibold mb-3">{data.eligible_count} eligible scheme(s)</h2>
          {data.eligible_schemes?.length > 0 ? (
            <div className="space-y-3">
              {data.eligible_schemes.map((s) => (
                <div key={s.code} className="border rounded-lg p-4 flex justify-between items-start">
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-green-600" /> {s.name}
                    </div>
                    <div className="text-sm text-gray-500">{s.ministry}</div>
                    {s.notes && <div className="text-sm text-gray-600 mt-1">{s.notes}</div>}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    s.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No eligible schemes found for these filters.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SchemeEligibilityChecker;
