import { PawPrint } from 'lucide-react'
import { pigAPI } from '../services/api'
import ManagementPageShell from './_shared/ManagementPageShell'
import CrudSection from './_shared/CrudSection'

/** M126 Pig Farming — real backend: backend/src/routes/pigRoutes.js
 *  (mounted /api/v1/pig). */
function PigFarmingPage() {
  return (
    <ManagementPageShell
      icon={PawPrint}
      title="Pig Farming"
      description="Herd register, weight tracking and breeding — real backend at /pig"
      accent="amber"
    >
      <CrudSection
        queryKey="pig-herd"
        listFn={pigAPI.listHerd}
        createFn={pigAPI.createAnimal}
        deleteFn={pigAPI.deleteAnimal}
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

export default PigFarmingPage
