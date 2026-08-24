import { useState } from 'react'
import { DollarSign } from 'lucide-react'
import { costControlAPI } from '../services/api'
import ManagementPageShell from './_shared/ManagementPageShell'
import CrudSection from './_shared/CrudSection'

/** AF-CO Cost Control — real backend at backend/src/routes/costControlRoutes.js
 *  (mounted /erp/controlling). Cost centres and budgets are scoped by companyId. */
function CostControlPage() {
  const [companyId, setCompanyId] = useState('')

  return (
    <ManagementPageShell
      icon={DollarSign}
      title="Cost Control"
      description="Cost centres, profit centres and budgets — AF-CO (erp/controlling)"
      accent="emerald"
      tabs={[{ id: 'cost-centers', label: 'Cost Centres' }, { id: 'budgets', label: 'Budgets' }]}
    >
      {(tab) => (
        <>
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Company ID</label>
            <input
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              placeholder="Enter a company ID to scope this data"
              className="w-full md:w-80 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {tab === 'cost-centers' ? (
            <CrudSection
              queryKey="cost-control-centers"
              listParams={companyId}
              listFn={() => costControlAPI.getCostCenters(companyId || undefined)}
              createFn={(data) => costControlAPI.createCostCenter({ ...data, companyId: companyId || data.companyId })}
              entityLabel="Cost Centre"
              accent="emerald"
              fields={[
                { name: 'name', label: 'Cost centre name', required: true },
                { name: 'code', label: 'Code' },
                { name: 'department', label: 'Department' },
              ]}
              columns={[{ key: 'name', label: 'Name' }, { key: 'code', label: 'Code' }, { key: 'department', label: 'Department' }]}
            />
          ) : (
            <CrudSection
              queryKey="cost-control-budgets"
              listParams={companyId}
              listFn={() => costControlAPI.getBudgets(companyId || undefined)}
              createFn={(data) => costControlAPI.createBudget({ ...data, companyId: companyId || data.companyId })}
              entityLabel="Budget"
              accent="emerald"
              fields={[
                { name: 'name', label: 'Budget name', required: true },
                { name: 'fiscal_year', label: 'Fiscal year' },
                { name: 'total_amount', label: 'Total amount', type: 'number' },
              ]}
              columns={[{ key: 'name', label: 'Name' }, { key: 'fiscal_year', label: 'Fiscal year' }, { key: 'total_amount', label: 'Amount' }]}
            />
          )}
        </>
      )}
    </ManagementPageShell>
  )
}

export default CostControlPage
