import { BadgeCheck } from 'lucide-react'
import { farmerVerificationAPI } from '../services/api'
import ManagementPageShell from './_shared/ManagementPageShell'
import CrudSection from './_shared/CrudSection'

/** M025 — Farmer Verification (field/peer verification of land, cropping and
 *  membership claims). Distinct from M024 Farmer KYC (document identity).
 *  No backend route mounts /farmer-verification yet — see services/api.js. */
function FarmerVerificationPage() {
  return (
    <ManagementPageShell
      icon={BadgeCheck}
      title="Farmer Verification"
      description="Field verification requests for farmer land, cropping and membership claims"
      accent="teal"
    >
      <CrudSection
        queryKey="farmer-verification-requests"
        listFn={farmerVerificationAPI.getRequests}
        createFn={farmerVerificationAPI.submitRequest}
        entityLabel="Verification request"
        accent="teal"
        notFoundHint="No backend route mounts /farmer-verification yet."
        fields={[
          { name: 'farmer_id', label: 'Farmer ID', required: true },
          { name: 'claim_type', label: 'Claim type', type: 'select', options: ['Land ownership', 'Cropping pattern', 'FPO membership', 'Other'], required: true },
          { name: 'details', label: 'Details', type: 'textarea' },
        ]}
        columns={[
          { key: 'farmer_id', label: 'Farmer' },
          { key: 'claim_type', label: 'Claim' },
          { key: 'status', label: 'Status' },
          { key: 'details', label: 'Details' },
        ]}
      />
    </ManagementPageShell>
  )
}

export default FarmerVerificationPage
