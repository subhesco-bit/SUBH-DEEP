import { PawPrint } from 'lucide-react'
import { cattleRegistryAPI, breedingManagementAPI, livestockAnalyticsAPI } from '../services/api'
import ManagementPageShell from './_shared/ManagementPageShell'
import CrudSection from './_shared/CrudSection'

/** Livestock cross-cutting modules M122/M129/M130. Species-specific
 *  management (dairy/goat/sheep/pig/poultry) already has its own dedicated
 *  page — this page covers the general cattle registry, cross-species
 *  breeding records and herd analytics. None have a matching backend route
 *  mounted yet — see services/api.js comments for each. */
const TABS = [
  {
    id: 'cattle', label: 'Cattle Registry (M122)', entityLabel: 'Animal',
    listFn: cattleRegistryAPI.getAnimals, createFn: cattleRegistryAPI.createAnimal, deleteFn: cattleRegistryAPI.deleteAnimal,
    hint: 'No backend route mounts /cattle-registry yet (dairyRoutes.js covers dairy cattle specifically — see DairyManagementPage.jsx).',
    fields: [{ name: 'tag_id', label: 'Tag ID', required: true }, { name: 'breed', label: 'Breed' }, { name: 'dob', label: 'Date of birth', type: 'date' }, { name: 'purpose', label: 'Purpose', type: 'select', options: ['Draught', 'Beef', 'Breeding stock', 'Other'] }],
    columns: [{ key: 'tag_id', label: 'Tag ID' }, { key: 'breed', label: 'Breed' }, { key: 'purpose', label: 'Purpose' }, { key: 'dob', label: 'DOB' }],
  },
  {
    id: 'breeding', label: 'Breeding (M129)', entityLabel: 'Breeding record',
    listFn: breedingManagementAPI.getRecords, createFn: breedingManagementAPI.createRecord, deleteFn: breedingManagementAPI.deleteRecord,
    hint: 'No backend route mounts /breeding/records yet (species-specific breeding — goat/sheep/pig — is real; see those dedicated pages).',
    fields: [{ name: 'animal_id', label: 'Animal ID', required: true }, { name: 'breeding_date', label: 'Breeding date', type: 'date' }, { name: 'sire_id', label: 'Sire ID' }, { name: 'expected_date', label: 'Expected date', type: 'date' }],
    columns: [{ key: 'animal_id', label: 'Animal' }, { key: 'sire_id', label: 'Sire' }, { key: 'breeding_date', label: 'Bred' }, { key: 'expected_date', label: 'Expected' }],
  },
  {
    id: 'analytics', label: 'Analytics (M130)', entityLabel: 'Metric',
    listFn: livestockAnalyticsAPI.getRecords, createFn: livestockAnalyticsAPI.createRecord, deleteFn: livestockAnalyticsAPI.deleteRecord,
    hint: 'No backend route mounts /livestock-analytics yet.',
    fields: [{ name: 'herd_id', label: 'Herd / flock ID', required: true }, { name: 'metric', label: 'Metric name' }, { name: 'value', label: 'Value', type: 'number' }],
    columns: [{ key: 'herd_id', label: 'Herd' }, { key: 'metric', label: 'Metric' }, { key: 'value', label: 'Value' }],
  },
]

function LivestockManagementPage() {
  return (
    <ManagementPageShell
      icon={PawPrint}
      title="Livestock Management"
      description="Cross-species cattle registry, breeding records and herd analytics (M122, M129, M130)"
      accent="amber"
      tabs={TABS.map((t) => ({ id: t.id, label: t.label }))}
    >
      {(tab) => {
        const active = TABS.find((t) => t.id === tab) || TABS[0]
        return (
          <CrudSection
            queryKey={`livestock-${active.id}`}
            listFn={active.listFn}
            createFn={active.createFn}
            deleteFn={active.deleteFn}
            entityLabel={active.entityLabel}
            accent="amber"
            notFoundHint={active.hint}
            fields={active.fields}
            columns={active.columns}
          />
        )
      }}
    </ManagementPageShell>
  )
}

export default LivestockManagementPage
