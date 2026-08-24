import { Wheat } from 'lucide-react'
import { seedPlanningAPI } from '../services/api'
import ManagementPageShell from './_shared/ManagementPageShell'
import CrudSection from './_shared/CrudSection'

/** M065 — Seed Planning. No backend route mounts /seed-planning yet — see
 *  services/api.js. Distinct from seedVaultAPI (SeedVaultPage.jsx). */
function SeedPlanningPage() {
  return (
    <ManagementPageShell
      icon={Wheat}
      title="Seed Planning"
      description="Seed requirement planning by crop, season and area"
      accent="amber"
    >
      <CrudSection
        queryKey="seed-planning-plans"
        listFn={seedPlanningAPI.getPlans}
        createFn={seedPlanningAPI.createPlan}
        deleteFn={seedPlanningAPI.deletePlan}
        entityLabel="Seed plan"
        accent="amber"
        notFoundHint="No backend route mounts /seed-planning yet."
        fields={[
          { name: 'crop', label: 'Crop', required: true },
          { name: 'season', label: 'Season', type: 'select', options: ['Kharif', 'Rabi', 'Zaid'] },
          { name: 'area_hectares', label: 'Area (ha)', type: 'number' },
          { name: 'seed_rate_kg_ha', label: 'Seed rate (kg/ha)', type: 'number' },
        ]}
        columns={[
          { key: 'crop', label: 'Crop' },
          { key: 'season', label: 'Season' },
          { key: 'area_hectares', label: 'Area (ha)' },
          { key: 'seed_rate_kg_ha', label: 'Seed rate (kg/ha)' },
        ]}
      />
    </ManagementPageShell>
  )
}

export default SeedPlanningPage
