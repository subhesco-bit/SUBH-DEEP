import { Wrench } from 'lucide-react'
import {
  implementManagementAPI, equipmentInventoryAPI, equipmentRentalAPI, fleetManagementAPI,
  preventiveMaintenanceAPI, breakdownMaintenanceAPI, fuelManagementAPI, sparePartsAPI, assetLifecycleAPI,
} from '../services/api'
import ManagementPageShell from './_shared/ManagementPageShell'
import CrudSection from './_shared/CrudSection'

/** Machinery domain modules M102-M110. Fleet Management (M105) is real:
 *  backend/src/routes/logisticsEnhancements.js (mounted /logistics), no
 *  DELETE route exists so that tab has no remove action. The rest have no
 *  backend route mounted yet — see services/api.js comments for each. */
const TABS = [
  {
    id: 'fleet', label: 'Fleet (M105)', entityLabel: 'Vehicle',
    listFn: fleetManagementAPI.getFleet, createFn: fleetManagementAPI.addVehicle,
    hint: 'Real backend at /logistics/fleet — no DELETE route exists yet.',
    fields: [{ name: 'registration_number', label: 'Registration number', required: true }, { name: 'vehicle_type', label: 'Vehicle type' }, { name: 'capacity_tons', label: 'Capacity (t)', type: 'number' }],
    columns: [{ key: 'registration_number', label: 'Reg. no.' }, { key: 'vehicle_type', label: 'Type' }, { key: 'capacity_tons', label: 'Capacity (t)' }],
  },
  {
    id: 'implements', label: 'Implements (M102)', entityLabel: 'Implement',
    listFn: implementManagementAPI.getImplements, createFn: implementManagementAPI.createImplement, deleteFn: implementManagementAPI.deleteImplement,
    hint: 'No backend route mounts /machinery-implements yet.',
    fields: [{ name: 'name', label: 'Implement name', required: true }, { name: 'implement_type', label: 'Type' }],
    columns: [{ key: 'name', label: 'Name' }, { key: 'implement_type', label: 'Type' }],
  },
  {
    id: 'equipment', label: 'Equipment Inventory (M103)', entityLabel: 'Equipment',
    listFn: equipmentInventoryAPI.getEquipment, createFn: equipmentInventoryAPI.createEquipment, deleteFn: equipmentInventoryAPI.deleteEquipment,
    hint: 'No backend route mounts /equipment-inventory yet.',
    fields: [{ name: 'name', label: 'Equipment name', required: true }, { name: 'quantity', label: 'Quantity', type: 'number' }],
    columns: [{ key: 'name', label: 'Name' }, { key: 'quantity', label: 'Qty' }],
  },
  {
    id: 'rental', label: 'Rental (M104)', entityLabel: 'Rental',
    listFn: equipmentRentalAPI.getRentals, createFn: equipmentRentalAPI.createRental, deleteFn: equipmentRentalAPI.deleteRental,
    hint: 'No backend route mounts /equipment-rental yet.',
    fields: [{ name: 'equipment', label: 'Equipment', required: true }, { name: 'renter', label: 'Renter' }, { name: 'rate_per_day', label: 'Rate per day', type: 'number' }],
    columns: [{ key: 'equipment', label: 'Equipment' }, { key: 'renter', label: 'Renter' }, { key: 'rate_per_day', label: 'Rate/day' }],
  },
  {
    id: 'preventive', label: 'Preventive Maint. (M106)', entityLabel: 'Record',
    listFn: preventiveMaintenanceAPI.getRecords, createFn: preventiveMaintenanceAPI.createRecord, deleteFn: preventiveMaintenanceAPI.deleteRecord,
    hint: 'No backend route mounts /preventive-maintenance yet.',
    fields: [{ name: 'equipment', label: 'Equipment', required: true }, { name: 'scheduled_date', label: 'Scheduled date', type: 'date' }],
    columns: [{ key: 'equipment', label: 'Equipment' }, { key: 'scheduled_date', label: 'Scheduled' }],
  },
  {
    id: 'breakdown', label: 'Breakdown Maint. (M107)', entityLabel: 'Record',
    listFn: breakdownMaintenanceAPI.getRecords, createFn: breakdownMaintenanceAPI.createRecord, deleteFn: breakdownMaintenanceAPI.deleteRecord,
    hint: 'No backend route mounts /breakdown-maintenance yet.',
    fields: [{ name: 'equipment', label: 'Equipment', required: true }, { name: 'issue', label: 'Issue', type: 'textarea' }, { name: 'reported_date', label: 'Reported date', type: 'date' }],
    columns: [{ key: 'equipment', label: 'Equipment' }, { key: 'issue', label: 'Issue' }, { key: 'reported_date', label: 'Reported' }],
  },
  {
    id: 'fuel', label: 'Fuel (M108)', entityLabel: 'Log',
    listFn: fuelManagementAPI.getLogs, createFn: fuelManagementAPI.createLog, deleteFn: fuelManagementAPI.deleteLog,
    hint: 'No backend route mounts /fuel-management yet.',
    fields: [{ name: 'equipment', label: 'Equipment', required: true }, { name: 'liters', label: 'Liters', type: 'number' }, { name: 'filled_date', label: 'Date', type: 'date' }],
    columns: [{ key: 'equipment', label: 'Equipment' }, { key: 'liters', label: 'Liters' }, { key: 'filled_date', label: 'Date' }],
  },
  {
    id: 'spare-parts', label: 'Spare Parts (M109)', entityLabel: 'Part',
    listFn: sparePartsAPI.getParts, createFn: sparePartsAPI.createPart, deleteFn: sparePartsAPI.deletePart,
    hint: 'No backend route mounts /spare-parts yet.',
    fields: [{ name: 'name', label: 'Part name', required: true }, { name: 'stock_qty', label: 'Stock qty', type: 'number' }],
    columns: [{ key: 'name', label: 'Part' }, { key: 'stock_qty', label: 'Stock' }],
  },
  {
    id: 'lifecycle', label: 'Asset Lifecycle (M110)', entityLabel: 'Asset',
    listFn: assetLifecycleAPI.getAssets, createFn: assetLifecycleAPI.createAsset, deleteFn: assetLifecycleAPI.deleteAsset,
    hint: 'No backend route mounts /asset-lifecycle yet.',
    fields: [{ name: 'name', label: 'Asset name', required: true }, { name: 'purchase_date', label: 'Purchase date', type: 'date' }, { name: 'expected_life_years', label: 'Expected life (yrs)', type: 'number' }],
    columns: [{ key: 'name', label: 'Asset' }, { key: 'purchase_date', label: 'Purchased' }, { key: 'expected_life_years', label: 'Life (yrs)' }],
  },
]

function MachineryManagementPage() {
  return (
    <ManagementPageShell
      icon={Wrench}
      title="Machinery Management"
      description="Fleet, implements, equipment, maintenance, fuel and spare parts (M102-M110)"
      accent="amber"
      tabs={TABS.map((t) => ({ id: t.id, label: t.label }))}
    >
      {(tab) => {
        const active = TABS.find((t) => t.id === tab) || TABS[0]
        return (
          <CrudSection
            queryKey={`machinery-${active.id}`}
            listFn={active.listFn}
            createFn={active.createFn}
            deleteFn={active.deleteFn}
            entityLabel={active.entityLabel}
            accent="amber"
            notFoundHint={active.hint}
            fields={active.fields}
            columns={active.columns}
          />
        )
      }}
    </ManagementPageShell>
  )
}

export default MachineryManagementPage
