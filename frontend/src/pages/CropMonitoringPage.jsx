import { ScanEye } from 'lucide-react'
import { cropMonitoringAPI } from '../services/api'
import ManagementPageShell from './_shared/ManagementPageShell'
import CrudSection from './_shared/CrudSection'

/** M068 — Crop Monitoring (field observation/scouting records). No backend
 *  route mounts /crop-monitoring yet — see services/api.js. */
function CropMonitoringPage() {
  return (
    <ManagementPageShell
      icon={ScanEye}
      title="Crop Monitoring"
      description="Field scouting observations — pest, disease, growth-stage notes"
      accent="emerald"
    >
      <CrudSection
        queryKey="crop-monitoring-observations"
        listFn={cropMonitoringAPI.getObservations}
        createFn={cropMonitoringAPI.createObservation}
        deleteFn={cropMonitoringAPI.deleteObservation}
        entityLabel="Observation"
        accent="emerald"
        notFoundHint="No backend route mounts /crop-monitoring yet."
        fields={[
          { name: 'field_id', label: 'Field / plot ID', required: true },
          { name: 'crop', label: 'Crop' },
          { name: 'observation_date', label: 'Date', type: 'date' },
          { name: 'growth_stage', label: 'Growth stage' },
          { name: 'notes', label: 'Notes', type: 'textarea' },
        ]}
        columns={[
          { key: 'field_id', label: 'Field' },
          { key: 'crop', label: 'Crop' },
          { key: 'growth_stage', label: 'Growth stage' },
          { key: 'observation_date', label: 'Date' },
        ]}
      />
    </ManagementPageShell>
  )
}

export default CropMonitoringPage
