import { Flower2 } from 'lucide-react'
import {
  precisionHorticultureAPI, horticultureAnalyticsAPI, vegetableProductionAPI,
  floricultureAPI, greenhouseAPI, polyhouseAPI, hydroponicsAPI, aeroponicsAPI,
} from '../services/api'
import ManagementPageShell from './_shared/ManagementPageShell'
import CrudSection from './_shared/CrudSection'

/** Horticulture domain modules M142-M148. greenhouseAPI's registry CRUD
 *  targets a conventional /greenhouse-registry path that isn't mounted yet
 *  (the real greenhouseService.js is action-based: design/optimize/monitor/
 *  predict-yield, exposed elsewhere); precisionHorticultureAPI is confirmed
 *  absent everywhere (safe net-new build). The rest have no backend route
 *  mounted — see services/api.js comments for each. */
const TABS = [
  {
    id: 'precision', label: 'Precision Horticulture (M148)', entityLabel: 'System',
    listFn: precisionHorticultureAPI.getSystems, createFn: precisionHorticultureAPI.createSystem, deleteFn: precisionHorticultureAPI.deleteSystem,
    hint: 'No backend route mounts /precision-horticulture yet.',
    fields: [{ name: 'plot_id', label: 'Plot ID', required: true }, { name: 'crop', label: 'Crop' }, { name: 'sensor_type', label: 'Sensor type' }],
    columns: [{ key: 'plot_id', label: 'Plot' }, { key: 'crop', label: 'Crop' }, { key: 'sensor_type', label: 'Sensor' }],
  },
  {
    id: 'vegetables', label: 'Vegetable Production (M142)', entityLabel: 'Record',
    listFn: vegetableProductionAPI.getRecords, createFn: vegetableProductionAPI.createRecord, deleteFn: vegetableProductionAPI.deleteRecord,
    hint: 'No backend route mounts /vegetable-production yet.',
    fields: [{ name: 'crop', label: 'Vegetable', required: true }, { name: 'area_ha', label: 'Area (ha)', type: 'number' }, { name: 'expected_yield_t', label: 'Expected yield (t)', type: 'number' }],
    columns: [{ key: 'crop', label: 'Vegetable' }, { key: 'area_ha', label: 'Area (ha)' }, { key: 'expected_yield_t', label: 'Expected yield (t)' }],
  },
  {
    id: 'floriculture', label: 'Floriculture (M143)', entityLabel: 'Record',
    listFn: floricultureAPI.getRecords, createFn: floricultureAPI.createRecord, deleteFn: floricultureAPI.deleteRecord,
    hint: 'No backend route mounts /floriculture yet.',
    fields: [{ name: 'flower', label: 'Flower / plant', required: true }, { name: 'area_ha', label: 'Area (ha)', type: 'number' } ],
    columns: [{ key: 'flower', label: 'Flower' }, { key: 'area_ha', label: 'Area (ha)' }],
  },
  {
    id: 'greenhouse', label: 'Greenhouse Registry (M144)', entityLabel: 'Greenhouse',
    listFn: greenhouseAPI.getRegistry, createFn: greenhouseAPI.createEntry, deleteFn: greenhouseAPI.deleteEntry,
    hint: 'The greenhouse action endpoints (design/optimize/monitor) are real (greenhouseService.js); this registry list is a conventional path not yet mounted.',
    fields: [{ name: 'name', label: 'Greenhouse name', required: true }, { name: 'area_sqm', label: 'Area (sq m)', type: 'number' }, { name: 'crop', label: 'Crop' }],
    columns: [{ key: 'name', label: 'Name' }, { key: 'area_sqm', label: 'Area (sqm)' }, { key: 'crop', label: 'Crop' }],
  },
  {
    id: 'polyhouse', label: 'Polyhouse (M145)', entityLabel: 'Record',
    listFn: polyhouseAPI.getRecords, createFn: polyhouseAPI.createRecord, deleteFn: polyhouseAPI.deleteRecord,
    hint: 'No backend route mounts /polyhouse-management yet.',
    fields: [{ name: 'name', label: 'Polyhouse name', required: true }, { name: 'area_sqm', label: 'Area (sq m)', type: 'number' }],
    columns: [{ key: 'name', label: 'Name' }, { key: 'area_sqm', label: 'Area (sqm)' }],
  },
  {
    id: 'hydroponics', label: 'Hydroponics (M146)', entityLabel: 'System',
    listFn: hydroponicsAPI.getSystems, createFn: hydroponicsAPI.createSystem, deleteFn: hydroponicsAPI.deleteSystem,
    hint: 'No backend route mounts /hydroponics yet.',
    fields: [{ name: 'name', label: 'System name', required: true }, { name: 'crop', label: 'Crop' }, { name: 'nutrient_solution', label: 'Nutrient solution' }],
    columns: [{ key: 'name', label: 'Name' }, { key: 'crop', label: 'Crop' }, { key: 'nutrient_solution', label: 'Solution' }],
  },
  {
    id: 'aeroponics', label: 'Aeroponics (M147)', entityLabel: 'System',
    listFn: aeroponicsAPI.getSystems, createFn: aeroponicsAPI.createSystem, deleteFn: aeroponicsAPI.deleteSystem,
    hint: 'No backend route mounts /aeroponics yet.',
    fields: [{ name: 'name', label: 'System name', required: true }, { name: 'crop', label: 'Crop' }],
    columns: [{ key: 'name', label: 'Name' }, { key: 'crop', label: 'Crop' }],
  },
  {
    id: 'analytics', label: 'Analytics', entityLabel: 'Metric',
    listFn: horticultureAnalyticsAPI.getMetrics, createFn: horticultureAnalyticsAPI.createMetric, deleteFn: horticultureAnalyticsAPI.deleteMetric,
    hint: 'No backend route mounts /horticulture-analytics yet.',
    fields: [{ name: 'plot_id', label: 'Plot ID', required: true }, { name: 'metric', label: 'Metric name' }, { name: 'value', label: 'Value', type: 'number' }],
    columns: [{ key: 'plot_id', label: 'Plot' }, { key: 'metric', label: 'Metric' }, { key: 'value', label: 'Value' }],
  },
]

function HorticultureManagementPage() {
  return (
    <ManagementPageShell
      icon={Flower2}
      title="Horticulture Management"
      description="Vegetables, floriculture, protected cultivation and precision horticulture (M142-M148)"
      accent="emerald"
      tabs={TABS.map((t) => ({ id: t.id, label: t.label }))}
    >
      {(tab) => {
        const active = TABS.find((t) => t.id === tab) || TABS[0]
        return (
          <CrudSection
            queryKey={`horticulture-${active.id}`}
            listFn={active.listFn}
            createFn={active.createFn}
            deleteFn={active.deleteFn}
            entityLabel={active.entityLabel}
            accent="emerald"
            notFoundHint={active.hint}
            fields={active.fields}
            columns={active.columns}
          />
        )
      }}
    </ManagementPageShell>
  )
}

export default HorticultureManagementPage
