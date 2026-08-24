import { Users } from 'lucide-react'
import { farmerFamilyAPI } from '../services/api'
import ManagementPageShell from './_shared/ManagementPageShell'
import CrudSection from './_shared/CrudSection'

/** M023 — Farmer Family (household/dependent records). No backend route
 *  mounts /farmer-family yet — see services/api.js. */
function FarmerFamilyPage() {
  return (
    <ManagementPageShell
      icon={Users}
      title="Farmer Family"
      description="Household and dependent records linked to a farmer"
      accent="teal"
    >
      <CrudSection
        queryKey="farmer-family-members"
        listFn={farmerFamilyAPI.getMembers}
        createFn={farmerFamilyAPI.createMember}
        deleteFn={farmerFamilyAPI.deleteMember}
        entityLabel="Family member"
        accent="teal"
        notFoundHint="No backend route mounts /farmer-family yet."
        fields={[
          { name: 'farmer_id', label: 'Farmer ID', required: true },
          { name: 'name', label: 'Name', required: true },
          { name: 'relationship', label: 'Relationship', type: 'select', options: ['Spouse', 'Child', 'Parent', 'Sibling', 'Other'] },
          { name: 'age', label: 'Age', type: 'number' },
        ]}
        columns={[
          { key: 'farmer_id', label: 'Farmer' },
          { key: 'name', label: 'Name' },
          { key: 'relationship', label: 'Relationship' },
          { key: 'age', label: 'Age' },
        ]}
      />
    </ManagementPageShell>
  )
}

export default FarmerFamilyPage
