import { Calendar } from 'lucide-react'
import { cropCalendarAPI } from '../services/api'
import ManagementPageShell from './_shared/ManagementPageShell'
import CrudSection from './_shared/CrudSection'

/** M062 — Crop Calendar. cropCalendarAPI targets /crop-calendar/entries; no
 *  backend route mounts that path yet (see services/api.js), so this page
 *  is wired and ready but will show the error banner until a route exists. */
function CropCalendarPage() {
  return (
    <ManagementPageShell
      icon={Calendar}
      title="Crop Calendar"
      description="Sowing and harvest windows by crop and season"
      accent="emerald"
    >
      <CrudSection
        queryKey="crop-calendar-entries"
        listFn={cropCalendarAPI.getEntries}
        createFn={cropCalendarAPI.createEntry}
        deleteFn={cropCalendarAPI.deleteEntry}
        entityLabel="Calendar entry"
        accent="emerald"
        notFoundHint="No backend route mounts /crop-calendar yet."
        fields={[
          { name: 'crop', label: 'Crop', required: true },
          { name: 'season', label: 'Season', type: 'select', options: ['Kharif', 'Rabi', 'Zaid', 'Year-round'] },
          { name: 'sowing_start', label: 'Sowing start', type: 'date' },
          { name: 'sowing_end', label: 'Sowing end', type: 'date' },
          { name: 'harvest_start', label: 'Harvest start', type: 'date' },
          { name: 'harvest_end', label: 'Harvest end', type: 'date' },
        ]}
        columns={[
          { key: 'crop', label: 'Crop' },
          { key: 'season', label: 'Season' },
          { key: 'sowing_start', label: 'Sowing from' },
          { key: 'harvest_start', label: 'Harvest from' },
        ]}
      />
    </ManagementPageShell>
  )
}

export default CropCalendarPage
