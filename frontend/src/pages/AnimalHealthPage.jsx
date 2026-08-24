import { Heart } from 'lucide-react'
import { animalHealthAPI } from '../services/api'
import ManagementPageShell from './_shared/ManagementPageShell'
import CrudSection from './_shared/CrudSection'

const TABS = [
  {
    id: 'examinations', label: 'Examinations', entityLabel: 'Examination',
    listFn: animalHealthAPI.listExaminations, createFn: animalHealthAPI.createExamination, deleteFn: animalHealthAPI.deleteExamination,
    fields: [
      { name: 'animal_id', label: 'Animal ID', required: true },
      { name: 'species', label: 'Species', type: 'select', options: ['Cattle', 'Goat', 'Sheep', 'Pig', 'Poultry'], required: true },
      { name: 'exam_date', label: 'Exam date', type: 'date', required: true },
      { name: 'findings', label: 'Findings', type: 'textarea' },
    ],
    columns: [{ key: 'animal_id', label: 'Animal' }, { key: 'species', label: 'Species' }, { key: 'exam_date', label: 'Date' }, { key: 'findings', label: 'Findings' }],
  },
  {
    id: 'treatments', label: 'Treatments', entityLabel: 'Treatment',
    listFn: animalHealthAPI.listTreatments, createFn: animalHealthAPI.createTreatment, deleteFn: animalHealthAPI.deleteTreatment,
    fields: [
      { name: 'animal_id', label: 'Animal ID', required: true },
      { name: 'treatment', label: 'Treatment', required: true },
      { name: 'dosage', label: 'Dosage' },
      { name: 'treatment_date', label: 'Date', type: 'date' },
    ],
    columns: [{ key: 'animal_id', label: 'Animal' }, { key: 'treatment', label: 'Treatment' }, { key: 'dosage', label: 'Dosage' }, { key: 'treatment_date', label: 'Date' }],
  },
  {
    id: 'outbreaks', label: 'Disease Outbreaks', entityLabel: 'Outbreak',
    listFn: animalHealthAPI.listDiseaseOutbreaks, createFn: animalHealthAPI.createOutbreak, deleteFn: animalHealthAPI.deleteOutbreak,
    fields: [
      { name: 'disease', label: 'Disease', required: true },
      { name: 'location', label: 'Location', required: true },
      { name: 'reported_date', label: 'Reported', type: 'date' },
      { name: 'severity', label: 'Severity', type: 'select', options: ['Low', 'Moderate', 'High', 'Critical'] },
    ],
    columns: [{ key: 'disease', label: 'Disease' }, { key: 'location', label: 'Location' }, { key: 'severity', label: 'Severity' }, { key: 'reported_date', label: 'Reported' }],
  },
  {
    id: 'quarantines', label: 'Quarantine', entityLabel: 'Quarantine record',
    listFn: animalHealthAPI.listQuarantineRecords, createFn: animalHealthAPI.createQuarantine, deleteFn: animalHealthAPI.deleteQuarantine,
    fields: [
      { name: 'animal_id', label: 'Animal ID', required: true },
      { name: 'reason', label: 'Reason', required: true },
      { name: 'start_date', label: 'Start date', type: 'date' },
      { name: 'end_date', label: 'End date', type: 'date' },
    ],
    columns: [{ key: 'animal_id', label: 'Animal' }, { key: 'reason', label: 'Reason' }, { key: 'start_date', label: 'Start' }, { key: 'end_date', label: 'End' }],
  },
]

function AnimalHealthPage() {
  return (
    <ManagementPageShell
      icon={Heart}
      title="Animal Health Management"
      description="Examinations, treatments, disease outbreaks and quarantine records across the herd"
      accent="rose"
      tabs={TABS.map((t) => ({ id: t.id, label: t.label }))}
    >
      {(tab) => {
        const active = TABS.find((t) => t.id === tab) || TABS[0]
        return (
          <CrudSection
            queryKey={`animal-health-${active.id}`}
            listFn={active.listFn}
            createFn={active.createFn}
            deleteFn={active.deleteFn}
            fields={active.fields}
            columns={active.columns}
            entityLabel={active.entityLabel}
            accent="rose"
          />
        )
      }}
    </ManagementPageShell>
  )
}

export default AnimalHealthPage
