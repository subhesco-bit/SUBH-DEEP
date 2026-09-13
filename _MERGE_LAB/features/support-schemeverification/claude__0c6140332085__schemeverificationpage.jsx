import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BadgeCheck, AlertTriangle } from 'lucide-react';
import { schemeRegistryAPI } from '../../services/api';

const STATUS_OPTIONS = ['active', 'conditional', 'expired'];

/**
 * Scheme Verification Page — admin workflow for marking schemes verified /
 * conditional / expired. Real backend: schemeRegistryAPI.list/get/update
 * (GET/PUT /api/v1/government/schemes/registry(/:code)), backed by
 * backend/src/services/legacy/governmentSchemeService.js's listSchemeRegistry /
 * updateSchemeRegistry (status can't move to 'expired' without expiry_date —
 * enforced by a DB CHECK constraint), mounted via setupRoutes(app) in
 * backend/src/index.js.
 */
const SchemeVerificationPage = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ status: '', expiry_date: '', verification_source: '', notes: '' });

  const { data, isLoading, error } = useQuery({
    queryKey: ['scheme-registry', statusFilter],
    queryFn: () => schemeRegistryAPI.list(statusFilter ? { status: statusFilter } : {}).then((r) => r.data?.data ?? []),
  });

  const updateMutation = useMutation({
    mutationFn: ({ code, updates }) => schemeRegistryAPI.update(code, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheme-registry'] });
      setEditing(null);
    },
  });

  const startEdit = (scheme) => {
    setEditing(scheme.code);
    setForm({
      status: scheme.status || 'active',
      expiry_date: scheme.expiry_date ? String(scheme.expiry_date).slice(0, 10) : '',
      verification_source: scheme.verification_source || '',
      notes: scheme.notes || '',
    });
  };

  const submitEdit = (code) => {
    const updates = { ...form };
    if (!updates.expiry_date) delete updates.expiry_date;
    updateMutation.mutate({ code, updates });
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
        <BadgeCheck className="w-7 h-7" /> Scheme Verification
      </h1>
      <p className="text-gray-600 mb-6">Mark verified government schemes active, conditional or expired.</p>

      <div className="flex gap-4 mb-4">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 border rounded">
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {isLoading && <p className="text-gray-500">Loading registry...</p>}
      {error && <p className="text-red-600">{error.message}</p>}
      {!isLoading && (!data || data.length === 0) && <p className="text-gray-500">No schemes found.</p>}

      <div className="space-y-3">
        {data?.map((scheme) => (
          <div key={scheme.code} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-semibold">{scheme.name} <span className="text-gray-400 text-sm">({scheme.code})</span></div>
                <div className="text-sm text-gray-500">{scheme.ministry}</div>
                {scheme.expiry_date && (
                  <div className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Expiry: {String(scheme.expiry_date).slice(0, 10)}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  scheme.status === 'active' ? 'bg-green-100 text-green-800' :
                  scheme.status === 'conditional' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {scheme.status}
                </span>
                <button onClick={() => startEdit(scheme)} className="px-3 py-1 border rounded text-sm hover:bg-gray-50">
                  Update
                </button>
              </div>
            </div>

            {editing === scheme.code && (
              <div className="mt-4 border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 border rounded">
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Expiry Date {form.status === 'expired' && '(required)'}</label>
                  <input type="date" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} className="w-full px-3 py-2 border rounded" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Verification Source</label>
                  <input type="text" value={form.verification_source} onChange={(e) => setForm({ ...form, verification_source: e.target.value })} className="w-full px-3 py-2 border rounded" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Notes</label>
                  <input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full px-3 py-2 border rounded" />
                </div>
                <div className="md:col-span-2 flex gap-2">
                  <button
                    onClick={() => submitEdit(scheme.code)}
                    disabled={updateMutation.isPending}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {updateMutation.isPending ? 'Saving...' : 'Save'}
                  </button>
                  <button onClick={() => setEditing(null)} className="px-4 py-2 border rounded hover:bg-gray-50">
                    Cancel
                  </button>
                </div>
                {updateMutation.isError && (
                  <p className="md:col-span-2 text-red-600 text-sm">{updateMutation.error?.response?.data?.error || updateMutation.error.message}</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SchemeVerificationPage;
