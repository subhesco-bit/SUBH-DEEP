import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Building } from 'lucide-react'
import { enterpriseControlAPI } from '../services/api'
import ManagementPageShell from './_shared/ManagementPageShell'
import toast from 'react-hot-toast'

/** Enterprise Control Layer (993) — real backend at
 *  backend/src/services/enterpriseControlService.js, mounted /api/v1/control.
 *  Workflow approvals, CRM pipeline, legal calendar, risk heatmap and
 *  emergency incidents — every call here is a real, mounted endpoint. */
function ReadOnlyPanel({ title, hookKey, fn }) {
  const { data, isLoading, error } = useQuery({ queryKey: [hookKey], queryFn: async () => (await fn()).data })
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="font-semibold text-gray-800 mb-3">{title}</h3>
      {isLoading && <div className="animate-pulse h-24 bg-gray-200 rounded" />}
      {error && <div className="text-red-600 text-sm">Error: {error.message}</div>}
      {data && <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto max-h-96">{JSON.stringify(data, null, 2)}</pre>}
    </div>
  )
}

function LeadForm() {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({ name: '', company: '', value: '' })
  const mutation = useMutation({
    mutationFn: (data) => enterpriseControlAPI.createLead(data),
    onSuccess: () => { toast.success('Lead created'); queryClient.invalidateQueries({ queryKey: ['control-pipeline'] }); setForm({ name: '', company: '', value: '' }) },
    onError: (err) => toast.error(err?.response?.data?.error || 'Failed to create lead'),
  })
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="font-semibold text-gray-800 mb-3">New CRM lead</h3>
      <form onSubmit={(e) => { e.preventDefault(); if (!form.name) { toast.error('Name is required'); return } mutation.mutate({ ...form, value: form.value ? Number(form.value) : undefined }) }} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Lead name" className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
        <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Company" className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
        <input value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} type="number" placeholder="Deal value" className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
        <button type="submit" disabled={mutation.isPending} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-60">{mutation.isPending ? 'Saving...' : 'Create lead'}</button>
      </form>
    </div>
  )
}

function IncidentForm() {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({ title: '', description: '' })
  const mutation = useMutation({
    mutationFn: (data) => enterpriseControlAPI.raiseIncident(data),
    onSuccess: () => { toast.success('Incident raised'); queryClient.invalidateQueries({ queryKey: ['control-active-incidents'] }); setForm({ title: '', description: '' }) },
    onError: (err) => toast.error(err?.response?.data?.error || 'Failed to raise incident'),
  })
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="font-semibold text-gray-800 mb-3">Raise emergency incident</h3>
      <form onSubmit={(e) => { e.preventDefault(); if (!form.title) { toast.error('Title is required'); return } mutation.mutate(form) }} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Incident title" className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500" />
        <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500" />
        <button type="submit" disabled={mutation.isPending} className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition disabled:opacity-60">{mutation.isPending ? 'Raising...' : 'Raise incident'}</button>
      </form>
    </div>
  )
}

function EnterpriseControlPage() {
  return (
    <ManagementPageShell
      icon={Building}
      title="Enterprise Control"
      description="Workflow approvals, CRM pipeline, legal calendar, risk heatmap and emergency incidents — real backend at /control"
      accent="indigo"
      tabs={[
        { id: 'approvals', label: 'Approvals' },
        { id: 'crm', label: 'CRM Pipeline' },
        { id: 'legal', label: 'Legal Calendar' },
        { id: 'risk', label: 'Risk Heatmap' },
        { id: 'emergency', label: 'Emergency' },
      ]}
    >
      {(tab) => {
        if (tab === 'crm') return <div className="space-y-6"><LeadForm /><ReadOnlyPanel title="Pipeline" hookKey="control-pipeline" fn={enterpriseControlAPI.pipeline} /></div>
        if (tab === 'legal') return <ReadOnlyPanel title="Legal calendar" hookKey="control-legal-calendar" fn={() => enterpriseControlAPI.legalCalendar({})} />
        if (tab === 'risk') return <ReadOnlyPanel title="Risk heatmap" hookKey="control-risk-heatmap" fn={enterpriseControlAPI.riskHeatmap} />
        if (tab === 'emergency') return <div className="space-y-6"><IncidentForm /><ReadOnlyPanel title="Active incidents" hookKey="control-active-incidents" fn={enterpriseControlAPI.activeIncidents} /></div>
        return <ReadOnlyPanel title="Pending approvals" hookKey="control-pending-approvals" fn={() => enterpriseControlAPI.pendingApprovals({})} />
      }}
    </ManagementPageShell>
  )
}

export default EnterpriseControlPage
