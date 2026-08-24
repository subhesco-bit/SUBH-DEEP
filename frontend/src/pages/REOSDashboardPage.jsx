import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { LayoutDashboard } from 'lucide-react'
import {
  ruralEnterpriseAPI, renewableEnergyAPI, householdEconomyAPI, sharedInfrastructureAPI,
  machineryAccessAPI, ruralFinanceAPI, aiAdvisoryAPI, marketAccessAPI, mobilityRidesAPI,
} from '../services/api'

/** REOS — Rural Life OS. Real backend: each of these services
 *  self-registers via setupRoutes(app) in backend/src/index.js
 *  (ruralEnterpriseService, renewableEnergyService, householdEconomyService,
 *  sharedInfrastructureService, machineryAccessService, ruralFinanceService,
 *  aiAdvisoryService, marketAccessService, marketIntelligenceService,
 *  mobilityRidesService). Every panel below is village-scoped, so a village
 *  ID is required before any data loads. */
const PANELS = [
  { id: 'enterprises', label: 'Rural Enterprises', fn: ruralEnterpriseAPI.getEnterprisesByVillage },
  { id: 'renewable', label: 'Renewable Energy Systems', fn: renewableEnergyAPI.getSystemsByVillage },
  { id: 'household', label: 'Household Economy Summary', fn: householdEconomyAPI.getVillageSummary },
  { id: 'shared-infra', label: 'Shared Infrastructure Access', fn: sharedInfrastructureAPI.getVillageSummary },
  { id: 'machinery', label: 'Machinery Access', fn: machineryAccessAPI.getVillageSummary },
  { id: 'finance', label: 'Rural Finance', fn: ruralFinanceAPI.getVillageSummary },
  { id: 'advisories', label: 'AI Advisories', fn: aiAdvisoryAPI.getAdvisoriesByVillage },
  { id: 'market-access', label: 'Market Access', fn: marketAccessAPI.getVillageSummary },
  { id: 'mobility', label: 'Mobility Rides', fn: mobilityRidesAPI.getRidesByVillage },
]

function Panel({ label, fn, villageId }) {
  const { data, isLoading, error } = useQuery({
    queryKey: [`reos-${label}`, villageId],
    queryFn: async () => (await fn(villageId)).data,
    enabled: !!villageId,
  })
  return (
    <div className="bg-white rounded-lg shadow p-5">
      <h3 className="font-semibold text-gray-800 mb-3">{label}</h3>
      {!villageId && <div className="text-sm text-gray-500">Enter a village ID above to load this panel.</div>}
      {isLoading && <div className="animate-pulse h-16 bg-gray-200 rounded" />}
      {error && <div className="text-sm text-red-600">Error: {error.message}</div>}
      {data && <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto max-h-64">{JSON.stringify(data, null, 2)}</pre>}
    </div>
  )
}

function REOSDashboardPage() {
  const [villageIdInput, setVillageIdInput] = useState('')
  const [villageId, setVillageId] = useState('')

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
          <LayoutDashboard className="w-6 h-6 mr-2 text-teal-600" />
          REOS — Rural Life OS Dashboard
        </h1>
        <p className="text-gray-600">Village-level view across enterprises, energy, household economy, shared infrastructure, finance and mobility — real backend, self-registered services</p>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <form
          onSubmit={(e) => { e.preventDefault(); setVillageId(villageIdInput) }}
          className="flex flex-col md:flex-row gap-4 items-end"
        >
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Village ID</label>
            <input
              value={villageIdInput}
              onChange={(e) => setVillageIdInput(e.target.value)}
              placeholder="Enter a village ID to load its REOS dashboard"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition">
            Load village
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {PANELS.map((p) => (
          <Panel key={p.id} label={p.label} fn={p.fn} villageId={villageId} />
        ))}
      </div>
    </div>
  )
}

export default REOSDashboardPage
