import { useQuery } from '@tanstack/react-query'
import { BarChart3 } from 'lucide-react'
import { comprehensiveERPAPI, completeERPIntegrationAPI } from '../services/api'

/** ERP Dashboard — real backends: comprehensiveERPRoutes.js (Oracle/SAP-style
 *  FI/CO/MM/SD/PP/QM/PM/HR/PS/TR/AM/BI modules) and
 *  completeERPIntegrationRoutes.js (cross-module sync status). */
function Panel({ title, hookKey, fn }) {
  const { data, isLoading, error } = useQuery({ queryKey: [hookKey], queryFn: async () => (await fn({})).data })
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="font-semibold text-gray-800 mb-3">{title}</h3>
      {isLoading && <div className="animate-pulse h-24 bg-gray-200 rounded" />}
      {error && <div className="text-red-600 text-sm">Error: {error.message}</div>}
      {data && <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto max-h-80">{JSON.stringify(data, null, 2)}</pre>}
    </div>
  )
}

function ERPDashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
          <BarChart3 className="w-6 h-6 mr-2 text-indigo-600" />
          ERP Dashboard
        </h1>
        <p className="text-gray-600">Executive summary and integration status across the full ERP suite — real backend at /comprehensive-erp and /complete-erp-integration</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel title="Executive dashboard (BI)" hookKey="erp-executive-dashboard" fn={comprehensiveERPAPI.getExecutiveDashboard} />
        <Panel title="Cash position (Treasury)" hookKey="erp-cash-position" fn={comprehensiveERPAPI.getCashPosition} />
        <Panel title="Integration status" hookKey="erp-integration-status" fn={completeERPIntegrationAPI.getERPIntegrationStatus} />
        <Panel title="Inventory overview (MM)" hookKey="erp-inventory-overview" fn={comprehensiveERPAPI.getInventoryOverview} />
      </div>
    </div>
  )
}

export default ERPDashboard
