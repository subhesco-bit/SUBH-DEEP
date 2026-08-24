import { ClipboardList } from 'lucide-react'
import { cropRegistrationAPI } from '../services/api'
import ManagementPageShell from './_shared/ManagementPageShell'
import CrudSection from './_shared/CrudSection'

/** M063 — Crop Registration (master/reference registry). No backend route
 *  mounts /crop-registration yet — see services/api.js. */
function CropRegistrationPage() {
  return (
    <ManagementPageShell
      icon={ClipboardList}
      title="Crop Registration"
      description="Master registry of crops grown across the platform"
      accent="emerald"
    >
      <CrudSection
        queryKey="crop-registration-crops"
        listFn={cropRegistrationAPI.getCrops}
        createFn={cropRegistrationAPI.registerCrop}
        deleteFn={cropRegistrationAPI.deleteCrop}
        entityLabel="Crop"
        accent="emerald"
        notFoundHint="No backend route mounts /crop-registration yet."
        fields={[
          { name: 'name', label: 'Crop name', required: true },
          { name: 'scientific_name', label: 'Scientific name' },
          { name: 'category', label: 'Category', type: 'select', options: ['Cereal', 'Pulse', 'Oilseed', 'Vegetable', 'Fruit', 'Fibre', 'Spice', 'Other'] },
          { name: 'duration_days', label: 'Duration (days)', type: 'number' },
        ]}
        columns={[
          { key: 'name', label: 'Crop' },
          { key: 'scientific_name', label: 'Scientific name' },
          { key: 'category', label: 'Category' },
          { key: 'duration_days', label: 'Duration (days)' },
        ]}
      />
    </ManagementPageShell>
  )
}

export default CropRegistrationPage
