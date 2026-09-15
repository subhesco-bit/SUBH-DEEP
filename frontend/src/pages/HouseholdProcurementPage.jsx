import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

const errorText = error => error?.response?.data?.error || 'Household procurement is unavailable. Try again later.';

export default function HouseholdProcurementPage() {
  const [plans, setPlans] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [form, setForm] = useState({ household_id: '', consumption_period_start: '', consumption_period_end: '', budget_limit: '', delivery_frequency: 'monthly' });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function refresh() {
    setLoading(true); setError('');
    try {
      const [planResponse, subscriptionResponse] = await Promise.all([
        api.get('/strategic/household/procurement-plans'), api.get('/strategic/household/subscriptions'),
      ]);
      setPlans(planResponse.data.data || []);
      setSubscriptions(subscriptionResponse.data.data || []);
    } catch (failure) { setError(errorText(failure)); }
    finally { setLoading(false); }
  }

  useEffect(() => { refresh(); }, []);

  async function createPlan(event) {
    event.preventDefault(); setBusy(true); setError(''); setNotice('');
    try {
      if (form.consumption_period_end < form.consumption_period_start) throw new Error('The end date must follow the start date.');
      const response = await api.post('/strategic/household/procurement-plans', {
        ...form, budget_limit: form.budget_limit ? Number(form.budget_limit) : null,
        preferred_varieties: {}, dietary_restrictions: {}, quality_requirements: {},
      });
      setNotice(`Plan ${response.data?.data?.plan?.id || ''} saved by the household service.`);
      await refresh();
    } catch (failure) { setError(failure?.response ? errorText(failure) : failure.message); }
    finally { setBusy(false); }
  }

  const input = (label, key, props = {}) => <label key={key} className="block text-sm font-medium text-slate-800">{label}
    <input {...props} value={form[key]} onChange={event => setForm(old => ({ ...old, [key]: event.target.value }))}
      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-600" />
  </label>;

  return <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6" aria-labelledby="household-title">
    <header className="rounded-3xl bg-slate-950 p-6 text-white sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-widest text-emerald-300">Household and farmer commerce</p>
      <h1 id="household-title" className="mt-2 text-3xl font-bold sm:text-4xl">Plan family demand, then compare national supply</h1>
      <p className="mt-3 max-w-3xl text-slate-200">A household plan records the consumption window and budget. The linked purchasing workflow compares approved supplier terms across India. Planning does not place an order.</p>
      <Link to="/farmer-procurement" className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-emerald-500 px-5 py-3 font-semibold text-slate-950">Compare household and farm-input offers</Link>
    </header>
    {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-red-900">{error}</p>}
    {notice && <p role="status" className="mt-5 rounded-xl bg-emerald-50 p-4 text-emerald-900">{notice}</p>}
    <div className="mt-7 grid gap-7 lg:grid-cols-2">
      <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold">My procurement plans</h2>
        {loading ? <p className="mt-4" role="status">Loading household records…</p> : plans.length ? <ul className="mt-4 space-y-3">{plans.map(plan => <li key={plan.id} className="rounded-xl border p-4">
          <strong>Plan {plan.id.slice(0, 8)}</strong><p className="mt-1 text-sm text-slate-600">{String(plan.consumption_period_start).slice(0, 10)} to {String(plan.consumption_period_end).slice(0, 10)} · {plan.delivery_frequency} · {plan.status}</p>
          <p className="mt-1 text-sm">Budget: {plan.budget_limit == null ? 'Not specified' : `₹${plan.budget_limit}`}</p>
        </li>)}</ul> : <p className="mt-4 text-slate-600">No plans recorded for your household account.</p>}
        <h3 className="mt-8 font-semibold">Create a household plan</h3>
        <p className="mt-1 text-sm text-slate-600">Enter a household record where you are the verified head. No example dates or family size are supplied for you.</p>
        <form onSubmit={createPlan} className="mt-4 grid gap-4">
          {input('Household ID', 'household_id', { required: true })}
          <div className="grid gap-4 sm:grid-cols-2">{input('Period start', 'consumption_period_start', { type: 'date', required: true })}{input('Period end', 'consumption_period_end', { type: 'date', required: true })}</div>
          {input('Budget limit in rupees, if known', 'budget_limit', { type: 'number', min: '0', step: '0.01' })}
          <label className="text-sm font-medium">Delivery frequency<select value={form.delivery_frequency} onChange={event => setForm(old => ({ ...old, delivery_frequency: event.target.value }))} className="mt-1 w-full rounded-lg border px-3 py-3"><option value="weekly">Weekly</option><option value="biweekly">Every two weeks</option><option value="monthly">Monthly</option></select></label>
          <button disabled={busy} className="min-h-11 rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white disabled:opacity-50">Save plan</button>
        </form>
      </section>
      <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold">My subscriptions</h2>
        {loading ? <p className="mt-4" role="status">Loading subscriptions…</p> : subscriptions.length ? <ul className="mt-4 space-y-3">{subscriptions.map(item => <li key={item.id} className="rounded-xl border p-4"><strong>{item.frequency} supply</strong><p className="mt-1 text-sm text-slate-600">Quantity {item.quantity} · {item.status} · product {item.product_id}</p></li>)}</ul> : <p className="mt-4 text-slate-600">No subscriptions recorded.</p>}
        <div className="mt-8 rounded-xl bg-slate-100 p-4 text-sm text-slate-700">For machinery, seeds, fertilizer, piping, drip and pumps, compare national supplier quotes through the linked purchasing workflow. Final tax, subsidy, freight and payment are confirmed separately.</div>
      </section>
    </div>
  </main>;
}
