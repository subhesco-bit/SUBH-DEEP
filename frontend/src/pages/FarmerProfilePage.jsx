import { UserCircle } from 'lucide-react'
import { farmerProfileAPI } from '../services/api'
import ManagementPageShell from './_shared/ManagementPageShell'
import CrudSection from './_shared/CrudSection'

/** M022 — Farmer Profile create/update/delete. farmersAPI already covers
 *  read-only lookup; no route handles profile CRUD — see services/api.js. */
function FarmerProfilePage() {
  return (
    <ManagementPageShell
      icon={UserCircle}
      title="Farmer Profile"
      description="Create and maintain extended farmer profile records"
      accent="teal"
    >
      <CrudSection
        queryKey="farmer-profiles"
        listFn={farmerProfileAPI.getProfiles}
        createFn={farmerProfileAPI.createProfile}
        deleteFn={farmerProfileAPI.deleteProfile}
        entityLabel="Profile"
        accent="teal"
        notFoundHint="No backend route mounts /farmer-profiles yet."
        fields={[
          { name: 'full_name', label: 'Full name', required: true },
          { name: 'phone', label: 'Phone' },
          { name: 'village', label: 'Village' },
          { name: 'primary_crop', label: 'Primary crop' },
          { name: 'landholding_ha', label: 'Landholding (ha)', type: 'number' },
        ]}
        columns={[
          { key: 'full_name', label: 'Name' },
          { key: 'village', label: 'Village' },
          { key: 'primary_crop', label: 'Primary crop' },
          { key: 'landholding_ha', label: 'Land (ha)' },
        ]}
      />
    </ManagementPageShell>
  )
}

export default FarmerProfilePage
