import { HeartPulse } from 'lucide-react'
import api from '../services/api'
import ManagementPageShell from './_shared/ManagementPageShell'
import CrudSection from './_shared/CrudSection'

/** M029 — Farmer Health & Welfare. services/api.js's farmerWelfareAPI targets
 *  an unbacked /farmer-welfare/records path — but a REAL backend exists at a
 *  different address: backend/src/routes/agriculture/farmerHealthRoutes.js,
 *  mounted at /api/v1/farmer-health (health-records CRUD + welfare-programs +
 *  welfare-enrollments). This page calls that real path directly via the
 *  shared axios client rather than the stale helper. */
function FarmerHealthWelfarePage() {
  return (
    <ManagementPageShell
      icon={HeartPulse}
      title="Farmer Health & Welfare"
      description="Personal health records and welfare-scheme enrolments — real backend at /farmer-health"
      accent="rose"
      tabs={[{ id: 'records', label: 'Health Records' }, { id: 'programs', label: 'Welfare Programs' }]}
    >
      {(tab) => (tab === 'records' ? (
        <CrudSection
          queryKey="farmer-health-records"
          listFn={() => api.get('/farmer-health/health-records')}
          createFn={(data) => api.post('/farmer-health/health-records', data)}
          deleteFn={(id) => api.delete(`/farmer-health/health-records/${id}`)}
          entityLabel="Health record"
          accent="rose"
          fields={[
            { name: 'farmer_id', label: 'Farmer ID', required: true },
            { name: 'condition', label: 'Condition / note', required: true },
            { name: 'record_date', label: 'Date', type: 'date' },
          ]}
          columns={[
            { key: 'farmer_id', label: 'Farmer' },
            { key: 'condition', label: 'Condition' },
            { key: 'record_date', label: 'Date' },
          ]}
        />
      ) : (
        <CrudSection
          queryKey="farmer-welfare-programs"
          listFn={() => api.get('/farmer-health/welfare-programs')}
          createFn={(data) => api.post('/farmer-health/welfare-enrollments', data)}
          entityLabel="Enrolment"
          accent="rose"
          fields={[
            { name: 'farmer_id', label: 'Farmer ID', required: true },
            { name: 'program_id', label: 'Program ID', required: true },
          ]}
          columns={[
            { key: 'name', label: 'Program' },
            { key: 'description', label: 'Description' },
          ]}
          emptyMessage="No welfare programs published yet."
        />
      ))}
    </ManagementPageShell>
  )
}

export default FarmerHealthWelfarePage
