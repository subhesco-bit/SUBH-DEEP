import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Layers3 } from 'lucide-react'
import { soilHealthAPI, nutrientManagementAPI, fertilityManagementAPI, soilTestingOpsAPI } from '../services/api'
import ManagementPageShell from './_shared/ManagementPageShell'
import CrudSection from './_shared/CrudSection'
import toast from 'react-hot-toast'

/** Soil domain modules M071/M073/M074, plus a Lab Testing tab wired to the
 *  real soilTestingService.js (M072 — individual lab sample results,
 *  action-based: submit sample / submit results / fertilizer recommendation
 *  / health-card), distinct from soilHealthAPI's still-unbacked
 *  plot/zone-level health cards. */
const CRUD_TABS = [
  {
    id: 'soil-health', label: 'Soil Health Cards (M071)', entityLabel: 'Health card',
    listFn: soilHealthAPI.getCards, createFn: soilHealthAPI.createCard, deleteFn: soilHealthAPI.deleteCard,
    hint: 'No backend route mounts /soil-health/cards yet.',
    fields: [{ name: 'plot_id', label: 'Plot / zone ID', required: true }, { name: 'organic_matter', label: 'Organic matter (%)', type: 'number' }, { name: 'ph', label: 'pH', type: 'number' }, { name: 'recommendation', label: 'Recommendation', type: 'textarea' }],
    columns: [{ key: 'plot_id', label: 'Plot' }, { key: 'organic_matter', label: 'OM (%)' }, { key: 'ph', label: 'pH' }],
  },
  {
    id: 'nutrient', label: 'Nutrient Management (M073)', entityLabel: 'Plan',
    listFn: nutrientManagementAPI.getPlans, createFn: nutrientManagementAPI.createPlan, deleteFn: nutrientManagementAPI.deletePlan,
    hint: 'No backend route mounts /nutrient-management yet.',
    fields: [{ name: 'plot_id', label: 'Plot / zone ID', required: true }, { name: 'crop', label: 'Crop' }, { name: 'n_kg_ha', label: 'N (kg/ha)', type: 'number' }, { name: 'p_kg_ha', label: 'P (kg/ha)', type: 'number' }, { name: 'k_kg_ha', label: 'K (kg/ha)', type: 'number' }],
    columns: [{ key: 'plot_id', label: 'Plot' }, { key: 'crop', label: 'Crop' }, { key: 'n_kg_ha', label: 'N' }, { key: 'p_kg_ha', label: 'P' }, { key: 'k_kg_ha', label: 'K' }],
  },
  {
    id: 'fertility', label: 'Fertility Management (M074)', entityLabel: 'Record',
    listFn: fertilityManagementAPI.getRecords, createFn: fertilityManagementAPI.createRecord, deleteFn: fertilityManagementAPI.deleteRecord,
    hint: 'No backend route mounts /fertility-management yet.',
    fields: [{ name: 'plot_id', label: 'Plot / zone ID', required: true }, { name: 'treatment', label: 'Treatment' }, { name: 'applied_date', label: 'Applied date', type: 'date' }],
    columns: [{ key: 'plot_id', label: 'Plot' }, { key: 'treatment', label: 'Treatment' }, { key: 'applied_date', label: 'Applied' }],
  },
]

function LabTestingTab() {
  const [form, setForm] = useState({ farmer_id: '', field_id: '', sample_type: 'Soil' })
  const [sampleId, setSampleId] = useState(null)

  const submitMutation = useMutation({
    mutationFn: (data) => soilTestingOpsAPI.submitSample(data),
    onSuccess: (res) => {
      const id = res?.data?.data?.id || res?.data?.id
      setSampleId(id)
      toast.success('Sample submitted for lab testing')
    },
    onError: (err) => toast.error(err?.response?.data?.error || 'Failed to submit sample (real backend at /soil-testing/samples)'),
  })

  const { data: healthCard, error: healthCardError } = useQuery({
    queryKey: ['soil-testing-health-card'],
    queryFn: async () => (await soilTestingOpsAPI.getHealthCard({})).data,
    retry: false,
  })

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold text-gray-800 mb-1">Submit a lab sample</h3>
        <p className="text-sm text-gray-500 mb-4">Real backend: soilTestingService.js (POST /soil-testing/samples)</p>
        <form
          onSubmit={(e) => { e.preventDefault(); submitMutation.mutate(form) }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Farmer ID</label>
            <input value={form.farmer_id} onChange={(e) => setForm({ ...form, farmer_id: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Field ID</label>
            <input value={form.field_id} onChange={(e) => setForm({ ...form, field_id: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sample type</label>
            <select value={form.sample_type} onChange={(e) => setForm({ ...form, sample_type: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500">
              <option>Soil</option><option>Water</option><option>Leaf</option>
            </select>
          </div>
          <button type="submit" disabled={submitMutation.isPending} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition disabled:opacity-60">
            {submitMutation.isPending ? 'Submitting...' : 'Submit sample'}
          </button>
        </form>
        {sampleId && <div className="mt-3 text-sm text-teal-700">Sample submitted — ID {sampleId}</div>}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold text-gray-800 mb-1">Health card (real — /soil-testing/health-card)</h3>
        {healthCardError && <div className="text-sm text-red-600">Error: {healthCardError.message}</div>}
        {healthCard && <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto mt-2">{JSON.stringify(healthCard, null, 2)}</pre>}
      </div>
    </div>
  )
}

function SoilManagementPage() {
  return (
    <ManagementPageShell
      icon={Layers3}
      title="Soil Management"
      description="Health cards, nutrient and fertility management (M071/M073/M074), plus real lab sample testing (M072)"
      accent="teal"
      tabs={[...CRUD_TABS.map((t) => ({ id: t.id, label: t.label })), { id: 'lab-testing', label: 'Lab Testing (M072, real)' }]}
    >
      {(tab) => {
        if (tab === 'lab-testing') return <LabTestingTab />
        const active = CRUD_TABS.find((t) => t.id === tab) || CRUD_TABS[0]
        return (
          <CrudSection
            queryKey={`soil-${active.id}`}
            listFn={active.listFn}
            createFn={active.createFn}
            deleteFn={active.deleteFn}
            entityLabel={active.entityLabel}
            accent="teal"
            notFoundHint={active.hint}
            fields={active.fields}
            columns={active.columns}
          />
        )
      }}
    </ManagementPageShell>
  )
}

export default SoilManagementPage
