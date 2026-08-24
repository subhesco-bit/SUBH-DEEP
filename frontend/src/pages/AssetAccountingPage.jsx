import { useState } from 'react'
import { Landmark } from 'lucide-react'
import { assetAccountingAPI } from '../services/api'
import ManagementPageShell from './_shared/ManagementPageShell'
import CrudSection from './_shared/CrudSection'

/** AF-AA Asset Accounting — real backend at backend/src/routes/assetAccountingRoutes.js
 *  (mounted /erp/assets). Assets are scoped by companyId. */
function AssetAccountingPage() {
  const [companyId, setCompanyId] = useState('')

  return (
    <ManagementPageShell
      icon={Landmark}
      title="Asset Accounting"
      description="Fixed asset register and depreciation — AF-AA (erp/assets)"
      accent="indigo"
    >
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Company ID</label>
        <input
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
          placeholder="Enter a company ID to scope the asset register"
          className="w-full md:w-80 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <CrudSection
        queryKey="asset-accounting-assets"
        listParams={companyId}
        listFn={() => assetAccountingAPI.getAssets(companyId || undefined)}
        createFn={(data) => assetAccountingAPI.createAsset({ ...data, companyId: companyId || data.companyId })}
        entityLabel="Asset"
        accent="indigo"
        fields={[
          { name: 'asset_name', label: 'Asset name', required: true },
          { name: 'asset_class', label: 'Asset class', placeholder: 'e.g. Machinery, Vehicle, Building' },
          { name: 'acquisition_cost', label: 'Acquisition cost', type: 'number' },
          { name: 'acquisition_date', label: 'Acquisition date', type: 'date' },
        ]}
        columns={[
          { key: 'asset_name', label: 'Asset' },
          { key: 'asset_class', label: 'Class' },
          { key: 'acquisition_cost', label: 'Cost' },
          { key: 'acquisition_date', label: 'Acquired' },
        ]}
        emptyMessage="No assets registered yet. Enter a company ID above and add one."
      />
    </ManagementPageShell>
  )
}

export default AssetAccountingPage
