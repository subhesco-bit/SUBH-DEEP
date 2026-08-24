import { Sprout } from 'lucide-react'
import { nurseryAPI } from '../services/api'
import ManagementPageShell from './_shared/ManagementPageShell'
import CrudSection from './_shared/CrudSection'

/** M066 — Nursery Management. No backend route mounts /nurseries yet — see
 *  services/api.js. */
function NurseryManagementPage() {
  return (
    <ManagementPageShell
      icon={Sprout}
      title="Nursery Management"
      description="Seedling nurseries — raising stock ahead of transplanting"
      accent="emerald"
    >
      <CrudSection
        queryKey="nurseries"
        listFn={nurseryAPI.getNurseries}
        createFn={nurseryAPI.createNursery}
        deleteFn={nurseryAPI.deleteNursery}
        entityLabel="Nursery"
        accent="emerald"
        notFoundHint="No backend route mounts /nurseries yet."
        fields={[
          { name: 'name', label: 'Nursery name', required: true },
          { name: 'crop', label: 'Crop / species', required: true },
          { name: 'sowing_date', label: 'Sowing date', type: 'date' },
          { name: 'ready_date', label: 'Ready for transplant', type: 'date' },
          { name: 'seedling_count', label: 'Seedling count', type: 'number' },
        ]}
        columns={[
          { key: 'name', label: 'Nursery' },
          { key: 'crop', label: 'Crop' },
          { key: 'seedling_count', label: 'Seedlings' },
          { key: 'ready_date', label: 'Ready date' },
        ]}
      />
    </ManagementPageShell>
  )
}

export default NurseryManagementPage
