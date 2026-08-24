import { Sprout } from 'lucide-react'
import { cropVarietyAPI } from '../services/api'
import ManagementPageShell from './_shared/ManagementPageShell'
import CrudSection from './_shared/CrudSection'

/** M064 — Crop Variety Management. No backend route mounts /crop-varieties
 *  yet — see services/api.js. */
function CropVarietyPage() {
  return (
    <ManagementPageShell
      icon={Sprout}
      title="Crop Variety Management"
      description="Seed varieties and cultivars, by crop"
      accent="emerald"
    >
      <CrudSection
        queryKey="crop-varieties"
        listFn={cropVarietyAPI.getVarieties}
        createFn={cropVarietyAPI.createVariety}
        deleteFn={cropVarietyAPI.deleteVariety}
        entityLabel="Variety"
        accent="emerald"
        notFoundHint="No backend route mounts /crop-varieties yet."
        fields={[
          { name: 'crop', label: 'Crop', required: true },
          { name: 'variety_name', label: 'Variety name', required: true },
          { name: 'maturity_days', label: 'Maturity (days)', type: 'number' },
          { name: 'yield_potential', label: 'Yield potential (t/ha)', type: 'number' },
          { name: 'notes', label: 'Notes', type: 'textarea' },
        ]}
        columns={[
          { key: 'crop', label: 'Crop' },
          { key: 'variety_name', label: 'Variety' },
          { key: 'maturity_days', label: 'Maturity (days)' },
          { key: 'yield_potential', label: 'Yield (t/ha)' },
        ]}
      />
    </ManagementPageShell>
  )
}

export default CropVarietyPage
