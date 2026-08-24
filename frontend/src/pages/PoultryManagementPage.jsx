import { Egg } from 'lucide-react'
import { poultryAPI } from '../services/api'
import ManagementPageShell from './_shared/ManagementPageShell'
import CrudSection from './_shared/CrudSection'

/** M123 Poultry Management — real backend: backend/src/routes/poultryRoutes.js
 *  (mounted /api/v1/poultry). Uses poultryAPI (flocks), not the unbacked
 *  poultryManagementAPI (batches) — see services/api.js comments. */
function PoultryManagementPage() {
  return (
    <ManagementPageShell
      icon={Egg}
      title="Poultry Management"
      description="Flock register, egg production and mortality — real backend at /poultry"
      accent="amber"
    >
      <CrudSection
        queryKey="poultry-flocks"
        listFn={poultryAPI.listFlocks}
        createFn={poultryAPI.createFlock}
        deleteFn={poultryAPI.deleteFlock}
        entityLabel="Flock"
        accent="amber"
        fields={[
          { name: 'flock_name', label: 'Flock name', required: true },
          { name: 'breed', label: 'Breed' },
          { name: 'bird_count', label: 'Bird count', type: 'number' },
          { name: 'housed_date', label: 'Housed date', type: 'date' },
        ]}
        columns={[
          { key: 'flock_name', label: 'Flock' },
          { key: 'breed', label: 'Breed' },
          { key: 'bird_count', label: 'Birds' },
          { key: 'housed_date', label: 'Housed' },
        ]}
      />
    </ManagementPageShell>
  )
}

export default PoultryManagementPage
