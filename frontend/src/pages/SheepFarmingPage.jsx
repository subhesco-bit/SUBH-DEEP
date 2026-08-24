import { PawPrint } from 'lucide-react'
import { sheepAPI } from '../services/api'
import ManagementPageShell from './_shared/ManagementPageShell'
import CrudSection from './_shared/CrudSection'

/** M125 Sheep Farming — real backend: backend/src/routes/sheepRoutes.js
 *  (mounted /api/v1/sheep). */
function SheepFarmingPage() {
  return (
    <ManagementPageShell
      icon={PawPrint}
      title="Sheep Farming"
      description="Flock register, wool production and breeding — real backend at /sheep"
      accent="amber"
    >
      <CrudSection
        queryKey="sheep-flock"
        listFn={sheepAPI.listFlock}
        createFn={sheepAPI.createAnimal}
        deleteFn={sheepAPI.deleteAnimal}
        entityLabel="Animal"
        accent="amber"
        fields={[
          { name: 'tag_id', label: 'Tag ID', required: true },
          { name: 'breed', label: 'Breed' },
          { name: 'dob', label: 'Date of birth', type: 'date' },
          { name: 'sex', label: 'Sex', type: 'select', options: ['Female', 'Male'] },
        ]}
        columns={[
          { key: 'tag_id', label: 'Tag ID' },
          { key: 'breed', label: 'Breed' },
          { key: 'sex', label: 'Sex' },
          { key: 'dob', label: 'DOB' },
        ]}
      />
    </ManagementPageShell>
  )
}

export default SheepFarmingPage
