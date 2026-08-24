import { Share2 } from 'lucide-react'
import { sharedInfraAPI } from '../services/api'
import ManagementPageShell from './_shared/ManagementPageShell'
import CrudSection from './_shared/CrudSection'

/** Shared Infrastructure asset marketplace — real backend at
 *  backend/src/services/sharedInfraService.js (mounted /shared-infra):
 *  register/search/book shared equipment, second-life equipment listings,
 *  community battery listings, renewable-support lookup. Previously
 *  referenced in App.jsx with no import and no page file at all — this page
 *  fixes that gap and replaces the old "coming soon" placeholder that used
 *  to live in FarmerSharedDoorPage.jsx. */
function SharedInfraPage() {
  return (
    <ManagementPageShell
      icon={Share2}
      title="Shared Infrastructure"
      description="Register and book shared farm equipment, second-life gear and community batteries — real backend at /shared-infra"
      accent="teal"
      tabs={[{ id: 'assets', label: 'Shared Assets' }, { id: 'second-life', label: 'Second-Life Equipment' }, { id: 'batteries', label: 'Community Batteries' }]}
    >
      {(tab) => {
        if (tab === 'second-life') {
          return (
            <CrudSection
              queryKey="shared-infra-second-life"
              listFn={() => sharedInfraAPI.searchSecondLife({})}
              createFn={(data) => sharedInfraAPI.listSecondLife(data)}
              entityLabel="Listing"
              accent="teal"
              fields={[
                { name: 'equipment_name', label: 'Equipment name', required: true },
                { name: 'condition', label: 'Condition', type: 'select', options: ['Good', 'Fair', 'Needs repair'] },
                { name: 'asking_price', label: 'Asking price', type: 'number' },
              ]}
              columns={[{ key: 'equipment_name', label: 'Equipment' }, { key: 'condition', label: 'Condition' }, { key: 'asking_price', label: 'Price' }]}
            />
          )
        }
        if (tab === 'batteries') {
          return (
            <CrudSection
              queryKey="shared-infra-batteries"
              listFn={() => sharedInfraAPI.getRenewableSupport({})}
              createFn={(data) => sharedInfraAPI.listBatteries(data)}
              entityLabel="Battery listing"
              accent="teal"
              fields={[
                { name: 'capacity_kwh', label: 'Capacity (kWh)', type: 'number', required: true },
                { name: 'location', label: 'Location' },
                { name: 'rate_per_hour', label: 'Rate per hour', type: 'number' },
              ]}
              columns={[{ key: 'capacity_kwh', label: 'Capacity (kWh)' }, { key: 'location', label: 'Location' }, { key: 'rate_per_hour', label: 'Rate/hr' }]}
              emptyMessage="No community battery / renewable-support data available for this query."
            />
          )
        }
        return (
          <CrudSection
            queryKey="shared-infra-assets"
            listFn={() => sharedInfraAPI.searchAssets({})}
            createFn={(data) => sharedInfraAPI.registerAsset(data)}
            entityLabel="Shared asset"
            accent="teal"
            fields={[
              { name: 'asset_name', label: 'Asset name', required: true },
              { name: 'asset_type', label: 'Type', type: 'select', options: ['Tractor', 'Harvester', 'Sprayer', 'Cold storage', 'Solar pump', 'Other'] },
              { name: 'rate_per_day', label: 'Rate per day', type: 'number' },
              { name: 'location', label: 'Location' },
            ]}
            columns={[{ key: 'asset_name', label: 'Asset' }, { key: 'asset_type', label: 'Type' }, { key: 'rate_per_day', label: 'Rate/day' }, { key: 'location', label: 'Location' }]}
          />
        )
      }}
    </ManagementPageShell>
  )
}

export default SharedInfraPage
