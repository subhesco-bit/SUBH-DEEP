import { Droplets } from 'lucide-react'
import { waterBudgetingAPI, waterQualityAPI, rainwaterHarvestingAPI, watershedManagementAPI, waterAnalyticsAPI } from '../services/api'
import ManagementPageShell from './_shared/ManagementPageShell'
import CrudSection from './_shared/CrudSection'

/** Water domain modules M076-M080. None have a matching backend route
 *  mounted yet — see services/api.js comments for each. Distinct from
 *  irrigationAPI (M075, IrrigationManagementPage.jsx). */
const TABS = [
  {
    id: 'budgeting', label: 'Water Budgeting (M076)', entityLabel: 'Budget',
    listFn: waterBudgetingAPI.getBudgets, createFn: waterBudgetingAPI.createBudget, deleteFn: waterBudgetingAPI.deleteBudget,
    hint: 'No backend route mounts /water-budgeting yet.',
    fields: [{ name: 'field_id', label: 'Field / plot ID', required: true }, { name: 'crop', label: 'Crop' }, { name: 'demand_m3', label: 'Demand (m³)', type: 'number' }, { name: 'supply_m3', label: 'Supply (m³)', type: 'number' }],
    columns: [{ key: 'field_id', label: 'Field' }, { key: 'crop', label: 'Crop' }, { key: 'demand_m3', label: 'Demand (m³)' }, { key: 'supply_m3', label: 'Supply (m³)' }],
  },
  {
    id: 'quality', label: 'Water Quality (M077)', entityLabel: 'Reading',
    listFn: waterQualityAPI.getReadings, createFn: waterQualityAPI.createReading, deleteFn: waterQualityAPI.deleteReading,
    hint: 'No backend route mounts /water-quality yet.',
    fields: [{ name: 'source', label: 'Water source', required: true }, { name: 'ph', label: 'pH', type: 'number' }, { name: 'tds_ppm', label: 'TDS (ppm)', type: 'number' }, { name: 'reading_date', label: 'Date', type: 'date' }],
    columns: [{ key: 'source', label: 'Source' }, { key: 'ph', label: 'pH' }, { key: 'tds_ppm', label: 'TDS (ppm)' }, { key: 'reading_date', label: 'Date' }],
  },
  {
    id: 'rainwater', label: 'Rainwater Harvesting (M078)', entityLabel: 'Structure',
    listFn: rainwaterHarvestingAPI.getStructures, createFn: rainwaterHarvestingAPI.createStructure, deleteFn: rainwaterHarvestingAPI.deleteStructure,
    hint: 'No backend route mounts /rainwater-harvesting yet.',
    fields: [{ name: 'name', label: 'Structure name', required: true }, { name: 'structure_type', label: 'Type', type: 'select', options: ['Farm pond', 'Check dam', 'Percolation tank', 'Rooftop harvesting'] }, { name: 'capacity_m3', label: 'Capacity (m³)', type: 'number' }],
    columns: [{ key: 'name', label: 'Name' }, { key: 'structure_type', label: 'Type' }, { key: 'capacity_m3', label: 'Capacity (m³)' }],
  },
  {
    id: 'watershed', label: 'Watershed Management (M079)', entityLabel: 'Watershed',
    listFn: watershedManagementAPI.getWatersheds, createFn: watershedManagementAPI.createWatershed, deleteFn: watershedManagementAPI.deleteWatershed,
    hint: 'No backend route mounts /watersheds yet.',
    fields: [{ name: 'name', label: 'Watershed name', required: true }, { name: 'area_ha', label: 'Area (ha)', type: 'number' }],
    columns: [{ key: 'name', label: 'Name' }, { key: 'area_ha', label: 'Area (ha)' }],
  },
  {
    id: 'analytics', label: 'Water Analytics (M080)', entityLabel: 'Metric',
    listFn: waterAnalyticsAPI.getRecords, createFn: waterAnalyticsAPI.createRecord, deleteFn: waterAnalyticsAPI.deleteRecord,
    hint: 'No backend route mounts /water-analytics yet.',
    fields: [{ name: 'field_id', label: 'Field / plot ID', required: true }, { name: 'metric', label: 'Metric name' }, { name: 'value', label: 'Value', type: 'number' }],
    columns: [{ key: 'field_id', label: 'Field' }, { key: 'metric', label: 'Metric' }, { key: 'value', label: 'Value' }],
  },
]

function WaterManagementPage() {
  return (
    <ManagementPageShell
      icon={Droplets}
      title="Water Management"
      description="Water budgeting, quality, rainwater harvesting and watershed management (M076-M080)"
      accent="sky"
      tabs={TABS.map((t) => ({ id: t.id, label: t.label }))}
    >
      {(tab) => {
        const active = TABS.find((t) => t.id === tab) || TABS[0]
        return (
          <CrudSection
            queryKey={`water-${active.id}`}
            listFn={active.listFn}
            createFn={active.createFn}
            deleteFn={active.deleteFn}
            entityLabel={active.entityLabel}
            accent="sky"
            notFoundHint={active.hint}
            fields={active.fields}
            columns={active.columns}
          />
        )
      }}
    </ManagementPageShell>
  )
}

export default WaterManagementPage
