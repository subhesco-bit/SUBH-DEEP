import { PawPrint } from 'lucide-react'
import { goatAPI } from '../services/api'
import ManagementPageShell from './_shared/ManagementPageShell'
import CrudSection from './_shared/CrudSection'

/** M124 Goat Farming — real backend: backend/src/routes/goatRoutes.js
 *  (mounted /api/v1/goat). */
function GoatFarmingPage() {
  return (
    <ManagementPageShell
      icon={PawPrint}
      title="Goat Farming"
      description="Herd register, milk production and breeding — real backend at /goat"
      accent="amber"
    >
      <CrudSection
        queryKey="goat-herd"
        listFn={goatAPI.listHerd}
        createFn={goatAPI.createAnimal}
        deleteFn={goatAPI.deleteAnimal}
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

export default GoatFarmingPage
