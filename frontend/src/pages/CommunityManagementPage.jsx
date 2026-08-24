import { Users2 } from 'lucide-react'
import {
  panchayatAPI, cooperativeAPI, blockManagementAPI, districtManagementAPI,
  stateManagementAPI, producerGroupAPI, communityAssetAPI, ruralDevelopmentAPI,
} from '../services/api'
import ManagementPageShell from './_shared/ManagementPageShell'
import CrudSection from './_shared/CrudSection'

/** Community domain modules M042-M050. Panchayats and Cooperatives are real
 *  (backend/src/routes/governanceModule.js, GET/POST only — no update/delete
 *  route exists, so those two tabs are create+list only); the rest have no
 *  backend route mounted — see services/api.js comments for each. */
const TABS = [
  {
    id: 'panchayats', label: 'Panchayats (M042)', entityLabel: 'Panchayat',
    listFn: panchayatAPI.getPanchayats, createFn: panchayatAPI.createPanchayat,
    fields: [{ name: 'name', label: 'Panchayat name', required: true }, { name: 'district', label: 'District' }, { name: 'state', label: 'State' }],
    columns: [{ key: 'name', label: 'Name' }, { key: 'district', label: 'District' }, { key: 'state', label: 'State' }],
  },
  {
    id: 'cooperatives', label: 'Cooperatives (M047)', entityLabel: 'Cooperative',
    listFn: cooperativeAPI.getCooperatives, createFn: cooperativeAPI.createCooperative,
    fields: [{ name: 'name', label: 'Cooperative name', required: true }, { name: 'registration_number', label: 'Registration number' }, { name: 'sector', label: 'Sector' }],
    columns: [{ key: 'name', label: 'Name' }, { key: 'registration_number', label: 'Reg. no.' }, { key: 'sector', label: 'Sector' }],
  },
  {
    id: 'blocks', label: 'Blocks (M043)', entityLabel: 'Block',
    listFn: blockManagementAPI.getBlocks, createFn: blockManagementAPI.createBlock, deleteFn: blockManagementAPI.deleteBlock,
    hint: 'No backend route mounts /blocks yet.',
    fields: [{ name: 'name', label: 'Block name', required: true }, { name: 'district', label: 'District' }],
    columns: [{ key: 'name', label: 'Name' }, { key: 'district', label: 'District' }],
  },
  {
    id: 'districts', label: 'Districts (M044)', entityLabel: 'District',
    listFn: districtManagementAPI.getDistricts, createFn: districtManagementAPI.createDistrict, deleteFn: districtManagementAPI.deleteDistrict,
    hint: 'No backend route mounts /districts yet.',
    fields: [{ name: 'name', label: 'District name', required: true }, { name: 'state', label: 'State' }],
    columns: [{ key: 'name', label: 'Name' }, { key: 'state', label: 'State' }],
  },
  {
    id: 'states', label: 'States (M045)', entityLabel: 'State',
    listFn: stateManagementAPI.getStates, createFn: stateManagementAPI.createState, deleteFn: stateManagementAPI.deleteState,
    hint: 'No backend route mounts /states yet.',
    fields: [{ name: 'name', label: 'State name', required: true }, { name: 'code', label: 'Code' }],
    columns: [{ key: 'name', label: 'Name' }, { key: 'code', label: 'Code' }],
  },
  {
    id: 'producer-groups', label: 'Producer Groups (M048)', entityLabel: 'Producer group',
    listFn: producerGroupAPI.getGroups, createFn: producerGroupAPI.createGroup, deleteFn: producerGroupAPI.deleteGroup,
    hint: 'No backend route mounts /producer-groups yet.',
    fields: [{ name: 'name', label: 'Group name', required: true }, { name: 'member_count', label: 'Members', type: 'number' }],
    columns: [{ key: 'name', label: 'Name' }, { key: 'member_count', label: 'Members' }],
  },
  {
    id: 'community-assets', label: 'Community Assets (M049)', entityLabel: 'Asset',
    listFn: communityAssetAPI.getAssets, createFn: communityAssetAPI.createAsset, deleteFn: communityAssetAPI.deleteAsset,
    hint: 'No backend route mounts /community-assets yet.',
    fields: [{ name: 'name', label: 'Asset name', required: true }, { name: 'asset_type', label: 'Type' }, { name: 'location', label: 'Location' }],
    columns: [{ key: 'name', label: 'Name' }, { key: 'asset_type', label: 'Type' }, { key: 'location', label: 'Location' }],
  },
  {
    id: 'rural-development', label: 'Rural Development (M050)', entityLabel: 'Project',
    listFn: ruralDevelopmentAPI.getProjects, createFn: ruralDevelopmentAPI.createProject, deleteFn: ruralDevelopmentAPI.deleteProject,
    hint: 'No backend route mounts /rural-development yet.',
    fields: [{ name: 'name', label: 'Project name', required: true }, { name: 'budget', label: 'Budget', type: 'number' }, { name: 'status', label: 'Status', type: 'select', options: ['Planned', 'In progress', 'Completed'] }],
    columns: [{ key: 'name', label: 'Name' }, { key: 'budget', label: 'Budget' }, { key: 'status', label: 'Status' }],
  },
]

function CommunityManagementPage() {
  return (
    <ManagementPageShell
      icon={Users2}
      title="Community Management"
      description="Panchayats, cooperatives, administrative units and community assets (M042-M050)"
      accent="teal"
      tabs={TABS.map((t) => ({ id: t.id, label: t.label }))}
    >
      {(tab) => {
        const active = TABS.find((t) => t.id === tab) || TABS[0]
        return (
          <CrudSection
            queryKey={`community-${active.id}`}
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

export default CommunityManagementPage
