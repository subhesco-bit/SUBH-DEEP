import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { farmCostingAPI } from '../services/api';
import { Calculator, Plus, X, Trash2, IndianRupee, Lightbulb, Mic, TrendingDown } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../components/common/Modal';

const CATEGORIES = ['Seeds', 'Fertilizer', 'Labour', 'Irrigation', 'Machinery', 'Pesticides', 'Transport', 'Other'];

const emptyForm = { crop: '', field_name: '', season: '', category: 'Seeds', amount: '', expected_revenue: '', notes: '' };

function buildCostInsights({ records, byCategory, totalCost, margin }) {
  const topCategory = [...byCategory].sort((a, b) => b.total - a.total)[0];
  const insights = [];

  if (!records.length) {
    insights.push({
      title: 'Start with voice entry',
      detail: 'Ask crop, field, item, amount, and expected selling price one by one.',
      savingPct: 0,
      tone: 'blue',
    });
  }

  if (topCategory && ['Seeds', 'Fertilizer'].includes(topCategory.category)) {
    insights.push({
      title: 'Pool input purchase',
      detail: 'Combine demand through FPO or nearby farmers before supplier negotiation.',
      savingPct: 8,
      tone: 'green',
    });
  }

  const transport = byCategory.find((item) => item.category === 'Transport');
  if (transport && totalCost && transport.total / totalCost >= 0.12) {
    insights.push({
      title: 'Pool vehicle route',
      detail: 'Match loads by route, crop perishability, and delivery date before booking.',
      savingPct: 6,
      tone: 'amber',
    });
  }

  const irrigation = byCategory.find((item) => item.category === 'Irrigation');
  if (irrigation && totalCost && irrigation.total / totalCost >= 0.1) {
    insights.push({
      title: 'Reduce water timing loss',
      detail: 'Shift irrigation to cooler hours and record water cost per acre.',
      savingPct: 5,
      tone: 'cyan',
    });
  }

  if (margin < 0) {
    insights.push({
      title: 'Stop-loss review',
      detail: 'Check expected price and crop stage before adding more input spend.',
      savingPct: 10,
      tone: 'red',
    });
  }

  if (!insights.length) {
    insights.push({
      title: 'Cost pattern stable',
      detail: 'Keep adding entries; stronger recommendations appear when a cost bucket crosses risk thresholds.',
      savingPct: 0,
      tone: 'slate',
    });
  }

  const estimatedSaving = insights.reduce((sum, item) => sum + totalCost * (item.savingPct / 100), 0);
  const voicePrompt = topCategory
    ? `Your biggest cost is ${topCategory.category}. Ask if this purchase was made alone or as a group.`
    : 'Which crop are you growing, what did you spend on today, and how much did it cost?';

  return { insights, estimatedSaving, voicePrompt };
}

function FarmCostingPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  // v5 react-query object syntax (see LoginPage.jsx)
  const { data, isLoading, error } = useQuery({
    queryKey: ['farm-costing-records'],
    queryFn: async () => (await farmCostingAPI.getRecords()).data?.data ?? [],
  });

  const saveMutation = useMutation({
    mutationFn: (payload) => farmCostingAPI.createRecord(payload),
    onSuccess: () => {
      toast.success('Cost record added');
      queryClient.invalidateQueries({ queryKey: ['farm-costing-records'] });
      setShowForm(false);
      setForm(emptyForm);
    },
    onError: (err) => toast.error(err?.response?.data?.error || 'Failed to save cost record'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => farmCostingAPI.deleteRecord(id),
    onSuccess: () => { toast.success('Record removed'); queryClient.invalidateQueries({ queryKey: ['farm-costing-records'] }); },
    onError: () => toast.error('Failed to remove record'),
  });

  const records = data || [];
  const totalCost = records.reduce((s, r) => s + (Number(r.amount) || 0), 0);
  const totalRevenue = records.reduce((s, r) => s + (Number(r.expected_revenue) || 0), 0);
  const margin = totalRevenue - totalCost;
  const byCategory = CATEGORIES.map((c) => ({
    category: c,
    total: records.filter((r) => r.category === c).reduce((s, r) => s + (Number(r.amount) || 0), 0),
  })).filter((c) => c.total > 0);
  const costInsights = useMemo(
    () => buildCostInsights({ records, byCategory, totalCost, margin }),
    [records, byCategory, totalCost, margin],
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
            <Calculator className="w-6 h-6 mr-2 text-purple-600" />
            Farm Costing
          </h1>
          <p className="text-gray-600">Record input costs per crop and field, and track margin against expected revenue</p>
        </div>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition flex items-center">
          <Plus className="w-5 h-5 mr-2" />Add Cost Entry
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Total cost</div>
          <div className="text-2xl font-bold text-gray-800 flex items-center"><IndianRupee className="w-5 h-5" />{totalCost.toFixed(0)}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Expected revenue</div>
          <div className="text-2xl font-bold text-gray-800 flex items-center"><IndianRupee className="w-5 h-5" />{totalRevenue.toFixed(0)}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Projected margin</div>
          <div className={`text-2xl font-bold flex items-center ${margin >= 0 ? 'text-green-700' : 'text-red-700'}`}><IndianRupee className="w-5 h-5" />{margin.toFixed(0)}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-5 mb-6 border-l-4 border-green-500">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-green-600" />
              Cost optimization advisor
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Estimated avoidable cost: ₹{costInsights.estimatedSaving.toFixed(0)}
            </p>
          </div>
          <div className="bg-blue-50 text-blue-900 rounded-md px-3 py-2 text-sm max-w-xl flex gap-2">
            <Mic className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{costInsights.voicePrompt}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          {costInsights.insights.map((item) => (
            <div key={item.title} className="border border-gray-200 rounded-md p-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-medium text-gray-800 text-sm">{item.title}</h3>
                {item.savingPct > 0 && (
                  <span className="text-xs font-semibold text-green-700 flex items-center">
                    <TrendingDown className="w-3 h-3 mr-1" />
                    {item.savingPct}%
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">{item.detail}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Planning guidance only. Confirm supplier rate, quality, quantity, transport charge, and payment terms before buying.
        </p>
      </div>

      {byCategory.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="font-semibold text-gray-800 mb-4">Cost breakdown by category</h2>
          <div className="space-y-3">
            {byCategory.map((c) => (
              <div key={c.category}>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>{c.category}</span>
                  <span>₹{c.total.toFixed(0)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${totalCost ? (c.total / totalCost) * 100 : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isLoading && <div className="animate-pulse h-40 bg-gray-200 rounded-lg" />}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
          Error loading cost records: {error.message}. Backend endpoint /farm-costing/records has not been built yet — this page is wired and ready once it is. (Note: economicAPI.costBreakup exists for corridor-level cost models, a different granularity from per-farm entries.)
        </div>
      )}
      {!isLoading && !error && (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Crop / Field</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Season</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-500">No cost entries yet.</td></tr>}
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{r.crop}</div>
                    <div className="text-xs text-gray-500">{r.field_name || '—'}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{r.season || '—'}</td>
                  <td className="px-4 py-3"><span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800">{r.category}</span></td>
                  <td className="px-4 py-3 text-gray-700">₹{r.amount}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { if (confirm('Remove this entry?')) deleteMutation.mutate(r.id); }} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <Modal onClose={() => setShowForm(false)}>
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Add Cost Entry</h2>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!form.crop || !form.amount) { toast.error('Crop and amount are required'); return; }
                  saveMutation.mutate({
                    ...form,
                    amount: Number(form.amount),
                    expected_revenue: form.expected_revenue === '' ? null : Number(form.expected_revenue),
                  });
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="classname-w-full-px-3-py-2-border-border" className="block text-sm font-medium text-gray-700 mb-1">Crop *</label>
                    <input id="classname-w-full-px-3-py-2-border-border" value={form.crop} onChange={(e) => setForm({ ...form, crop: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div>
                    <label htmlFor="classname-w-full-px-3-py-2-border-border-2" className="block text-sm font-medium text-gray-700 mb-1">Field name</label>
                    <input id="classname-w-full-px-3-py-2-border-border-2" value={form.field_name} onChange={(e) => setForm({ ...form, field_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="classname-w-full-px-3-py-2-border-border-3" className="block text-sm font-medium text-gray-700 mb-1">Season</label>
                    <input id="classname-w-full-px-3-py-2-border-border-3" value={form.season} onChange={(e) => setForm({ ...form, season: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" placeholder="e.g., Kharif 2026" />
                  </div>
                  <div>
                    <label htmlFor="classname-w-full-px-3-py-2-border-border-4" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select id="classname-w-full-px-3-py-2-border-border-4" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="classname-w-full-px-3-py-2-border-border-5" className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
                    <input id="classname-w-full-px-3-py-2-border-border-5" type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div>
                    <label htmlFor="classname-w-full-px-3-py-2-border-border-6" className="block text-sm font-medium text-gray-700 mb-1">Expected revenue (₹)</label>
                    <input id="classname-w-full-px-3-py-2-border-border-6" type="number" step="0.01" value={form.expected_revenue} onChange={(e) => setForm({ ...form, expected_revenue: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
                  </div>
                </div>
                <div>
                  <label htmlFor="classname-w-full-px-3-py-2-border-border-7" className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea id="classname-w-full-px-3-py-2-border-border-7" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
                </div>
                <div className="flex justify-end space-x-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">Cancel</button>
                  <button type="submit" disabled={saveMutation.isPending} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-60">
                    {saveMutation.isPending ? 'Saving...' : 'Add Entry'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default FarmCostingPage;
