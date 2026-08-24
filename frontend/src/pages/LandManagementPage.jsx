import { Map } from 'lucide-react'
import {
  landLeaseAPI, gisLandMappingAPI, soilMappingAPI,
  waterResourceMappingAPI, geoBoundaryAPI, surveyManagementAPI,
} from '../services/api'
import ManagementPageShell from './_shared/ManagementPageShell'
import CrudSection from './_shared/CrudSection'

/** Land domain modules M033/M035-M039. Distinct from LandRegistryPage.jsx,
 *  which already covers M031 ownership records (landAPI) — this page covers
 *  the adjacent lease/mapping/survey concerns. None have a matching backend
 *  route mounted yet — see services/api.js comments for each. */
const TABS = [
  {
    id: 'leases', label: 'Land Leases (M033)', entityLabel: 'Lease',
    listFn: landLeaseAPI.getLeases, createFn: landLeaseAPI.createLease, deleteFn: landLeaseAPI.deleteLease,
    hint: 'No backend route mounts /land-leases yet.',
    fields: [{ name: 'parcel_id', label: 'Parcel ID', required: true }, { name: 'lessor', label: 'Lessor' }, { name: 'lessee', label: 'Lessee' }, { name: 'rent_amount', label: 'Rent amount', type: 'number' }, { name: 'start_date', label: 'Start date', type: 'date' }, { name: 'end_date', label: 'End date', type: 'date' }],
    columns: [{ key: 'parcel_id', label: 'Parcel' }, { key: 'lessor', label: 'Lessor' }, { key: 'lessee', label: 'Lessee' }, { key: 'rent_amount', label: 'Rent' }],
  },
  {
    id: 'gis', label: 'GIS Mapping (M035)', entityLabel: 'Mapping',
    listFn: gisLandMappingAPI.getMappings, createFn: gisLandMappingAPI.createMapping, deleteFn: gisLandMappingAPI.deleteMapping,
    hint: 'No backend route mounts /gis-land-mapping yet.',
    fields: [{ name: 'parcel_id', label: 'Parcel ID', required: true }, { name: 'latitude', label: 'Latitude', type: 'number' }, { name: 'longitude', label: 'Longitude', type: 'number' } ],
    columns: [{ key: 'parcel_id', label: 'Parcel' }, { key: 'latitude', label: 'Lat' }, { key: 'longitude', label: 'Lng' }],
  },
  {
    id: 'soil-mapping', label: 'Soil Mapping (M036)', entityLabel: 'Zone',
    listFn: soilMappingAPI.getZones, createFn: soilMappingAPI.createZone, deleteFn: soilMappingAPI.deleteZone,
    hint: 'No backend route mounts /soil-mapping yet.',
    fields: [{ name: 'zone_id', label: 'Zone ID', required: true }, { name: 'soil_type', label: 'Soil type' }, { name: 'ph', label: 'pH', type: 'number' } ],
    columns: [{ key: 'zone_id', label: 'Zone' }, { key: 'soil_type', label: 'Soil type' }, { key: 'ph', label: 'pH' }],
  },
  {
    id: 'water-resources', label: 'Water Resources (M037)', entityLabel: 'Resource',
    listFn: waterResourceMappingAPI.getResources, createFn: waterResourceMappingAPI.createResource, deleteFn: waterResourceMappingAPI.deleteResource,
    hint: 'No backend route mounts /water-resource-mapping yet.',
    fields: [{ name: 'name', label: 'Resource name', required: true }, { name: 'resource_type', label: 'Type', type: 'select', options: ['Well', 'Canal', 'Pond', 'River', 'Borewell'] } ],
    columns: [{ key: 'name', label: 'Name' }, { key: 'resource_type', label: 'Type' }],
  },
  {
    id: 'boundaries', label: 'Geo Boundaries (M038)', entityLabel: 'Boundary',
    listFn: geoBoundaryAPI.getBoundaries, createFn: geoBoundaryAPI.createBoundary, deleteFn: geoBoundaryAPI.deleteBoundary,
    hint: 'No backend route mounts /geo-boundaries yet.',
    fields: [{ name: 'name', label: 'Boundary name', required: true }, { name: 'boundary_type', label: 'Type', type: 'select', options: ['Village', 'Block', 'District', 'State'] } ],
    columns: [{ key: 'name', label: 'Name' }, { key: 'boundary_type', label: 'Type' }],
  },
  {
    id: 'surveys', label: 'Surveys (M039)', entityLabel: 'Survey',
    listFn: surveyManagementAPI.getSurveys, createFn: surveyManagementAPI.createSurvey, deleteFn: surveyManagementAPI.deleteSurvey,
    hint: 'No backend route mounts /land-surveys yet.',
    fields: [{ name: 'parcel_id', label: 'Parcel ID', required: true }, { name: 'surveyor', label: 'Surveyor' }, { name: 'scheduled_date', label: 'Scheduled date', type: 'date' }, { name: 'status', label: 'Status', type: 'select', options: ['Scheduled', 'In progress', 'Completed'] } ],
    columns: [{ key: 'parcel_id', label: 'Parcel' }, { key: 'surveyor', label: 'Surveyor' }, { key: 'status', label: 'Status' }],
  },
]

function LandManagementPage() {
  return (
    <ManagementPageShell
      icon={Map}
      title="Land Management"
      description="Leases, GIS mapping, soil zones, water resources, boundaries and surveys (M033-M039)"
      accent="teal"
      tabs={TABS.map((t) => ({ id: t.id, label: t.label }))}
    >
      {(tab) => {
        const active = TABS.find((t) => t.id === tab) || TABS[0]
        return (
          <CrudSection
            queryKey={`land-${active.id}`}
            listFn={active.listFn}
            createFn={active.createFn}
            deleteFn={active.deleteFn}
            entityLabel={active.entityLabel}
            accent="teal"
            notFoundHint={active.hint}
            fields={active.fields}
            columns={active.columns}
          />
        )
      }}
    </ManagementPageShell>
  )
}

export default LandManagementPage
