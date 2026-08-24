import { GraduationCap } from 'lucide-react'
import api from '../services/api'
import ManagementPageShell from './_shared/ManagementPageShell'
import CrudSection from './_shared/CrudSection'

/** M026 — Farmer Skill Management. services/api.js's farmerSkillAPI targets
 *  an unbacked /farmer-skills path — but a real, mounted backend exists at
 *  backend/src/routes/agriculture/farmerTrainingRoutes.js (/api/v1/training,
 *  plain CRUD, GET is public). This page calls that real path directly. */
function FarmerSkillPage() {
  return (
    <ManagementPageShell
      icon={GraduationCap}
      title="Farmer Skill Management"
      description="Training and skill records — real backend at /training"
      accent="amber"
    >
      <CrudSection
        queryKey="farmer-skills-training"
        listFn={() => api.get('/training')}
        createFn={(data) => api.post('/training', data)}
        deleteFn={(id) => api.delete(`/training/${id}`)}
        entityLabel="Training record"
        accent="amber"
        fields={[
          { name: 'farmer_id', label: 'Farmer ID', required: true },
          { name: 'skill', label: 'Skill / training', required: true },
          { name: 'level', label: 'Proficiency', type: 'select', options: ['Beginner', 'Intermediate', 'Advanced', 'Certified'] },
          { name: 'completed_date', label: 'Completed', type: 'date' },
        ]}
        columns={[
          { key: 'farmer_id', label: 'Farmer' },
          { key: 'skill', label: 'Skill' },
          { key: 'level', label: 'Level' },
          { key: 'completed_date', label: 'Completed' },
        ]}
      />
    </ManagementPageShell>
  )
}

export default FarmerSkillPage
