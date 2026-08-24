import { ListChecks } from 'lucide-react'
import {
  farmActivityAPI, farmTaskAPI, contractorManagementAPI, machineryOperationsAPI,
  equipmentSchedulingAPI, inputConsumptionAPI, farmProductivityAPI, farmOperationsDashboardAPI,
} from '../services/api'
import ManagementPageShell from './_shared/ManagementPageShell'
import CrudSection from './_shared/CrudSection'

/** Operations domain modules M091-M100. None have a matching backend route
 *  mounted yet — see services/api.js comments for each. */
const TABS = [
  {
    id: 'activities', label: 'Farm Activities (M091)', entityLabel: 'Activity',
    listFn: farmActivityAPI.getActivities, createFn: farmActivityAPI.createActivity, deleteFn: farmActivityAPI.deleteActivity,
    hint: 'No backend route mounts /farm-activities yet.',
    fields: [{ name: 'activity', label: 'Activity', required: true }, { name: 'field_id', label: 'Field / plot ID' }, { name: 'activity_date', label: 'Date', type: 'date' }],
    columns: [{ key: 'activity', label: 'Activity' }, { key: 'field_id', label: 'Field' }, { key: 'activity_date', label: 'Date' }],
  },
  {
    id: 'tasks', label: 'Task Scheduling (M092)', entityLabel: 'Task',
    listFn: farmTaskAPI.getTasks, createFn: farmTaskAPI.createTask, deleteFn: farmTaskAPI.deleteTask,
    hint: 'No backend route mounts /farm-tasks yet.',
    fields: [{ name: 'task', label: 'Task', required: true }, { name: 'assigned_to', label: 'Assigned to' }, { name: 'due_date', label: 'Due date', type: 'date' }],
    columns: [{ key: 'task', label: 'Task' }, { key: 'assigned_to', label: 'Assigned to' }, { key: 'due_date', label: 'Due' }],
  },
  {
    id: 'contractors', label: 'Contractors (M094)', entityLabel: 'Contractor',
    listFn: contractorManagementAPI.getContractors, createFn: contractorManagementAPI.createContractor, deleteFn: contractorManagementAPI.deleteContractor,
    hint: 'No backend route mounts /contractors yet.',
    fields: [{ name: 'name', label: 'Contractor name', required: true }, { name: 'specialty', label: 'Specialty' }, { name: 'phone', label: 'Phone' }],
    columns: [{ key: 'name', label: 'Name' }, { key: 'specialty', label: 'Specialty' }, { key: 'phone', label: 'Phone' }],
  },
  {
    id: 'machinery-ops', label: 'Machinery Ops (M095)', entityLabel: 'Operation',
    listFn: machineryOperationsAPI.getOperations, createFn: machineryOperationsAPI.createOperation, deleteFn: machineryOperationsAPI.deleteOperation,
    hint: 'No backend route mounts /machinery-operations yet.',
    fields: [{ name: 'equipment', label: 'Equipment', required: true }, { name: 'operation', label: 'Operation' }, { name: 'hours', label: 'Hours', type: 'number' }],
    columns: [{ key: 'equipment', label: 'Equipment' }, { key: 'operation', label: 'Operation' }, { key: 'hours', label: 'Hours' }],
  },
  {
    id: 'equipment-scheduling', label: 'Equipment Scheduling (M096)', entityLabel: 'Schedule',
    listFn: equipmentSchedulingAPI.getSchedules, createFn: equipmentSchedulingAPI.createSchedule, deleteFn: equipmentSchedulingAPI.deleteSchedule,
    hint: 'No backend route mounts /equipment-scheduling yet.',
    fields: [{ name: 'equipment', label: 'Equipment', required: true }, { name: 'scheduled_date', label: 'Scheduled date', type: 'date' }],
    columns: [{ key: 'equipment', label: 'Equipment' }, { key: 'scheduled_date', label: 'Scheduled' }],
  },
  {
    id: 'input-consumption', label: 'Input Consumption (M097)', entityLabel: 'Record',
    listFn: inputConsumptionAPI.getRecords, createFn: inputConsumptionAPI.createRecord, deleteFn: inputConsumptionAPI.deleteRecord,
    hint: 'No backend route mounts /input-consumption yet.',
    fields: [{ name: 'input', label: 'Input', required: true }, { name: 'quantity', label: 'Quantity', type: 'number' }, { name: 'field_id', label: 'Field / plot ID' }],
    columns: [{ key: 'input', label: 'Input' }, { key: 'quantity', label: 'Qty' }, { key: 'field_id', label: 'Field' }],
  },
  {
    id: 'productivity', label: 'Productivity (M099)', entityLabel: 'Metric',
    listFn: farmProductivityAPI.getMetrics, createFn: farmProductivityAPI.createMetric, deleteFn: farmProductivityAPI.deleteMetric,
    hint: 'No backend route mounts /farm-productivity yet.',
    fields: [{ name: 'field_id', label: 'Field / plot ID', required: true }, { name: 'metric', label: 'Metric name' }, { name: 'value', label: 'Value', type: 'number' }],
    columns: [{ key: 'field_id', label: 'Field' }, { key: 'metric', label: 'Metric' }, { key: 'value', label: 'Value' }],
  },
  {
    id: 'kpis', label: 'Dashboard KPIs (M100)', entityLabel: 'KPI',
    listFn: farmOperationsDashboardAPI.getKpis, createFn: farmOperationsDashboardAPI.createKpi, deleteFn: farmOperationsDashboardAPI.deleteKpi,
    hint: 'No backend route mounts /farm-operations-dashboard yet.',
    fields: [{ name: 'kpi_name', label: 'KPI name', required: true }, { name: 'value', label: 'Value', type: 'number' }, { name: 'target', label: 'Target', type: 'number' }],
    columns: [{ key: 'kpi_name', label: 'KPI' }, { key: 'value', label: 'Value' }, { key: 'target', label: 'Target' }],
  },
]

function OperationsManagementPage() {
  return (
    <ManagementPageShell
      icon={ListChecks}
      title="Operations Management"
      description="Farm activities, task scheduling, contractors and productivity KPIs (M091-M100)"
      accent="indigo"
      tabs={TABS.map((t) => ({ id: t.id, label: t.label }))}
    >
      {(tab) => {
        const active = TABS.find((t) => t.id === tab) || TABS[0]
        return (
          <CrudSection
            queryKey={`operations-${active.id}`}
            listFn={active.listFn}
            createFn={active.createFn}
            deleteFn={active.deleteFn}
            entityLabel={active.entityLabel}
            accent="indigo"
            notFoundHint={active.hint}
            fields={active.fields}
            columns={active.columns}
          />
        )
      }}
    </ManagementPageShell>
  )
}

export default OperationsManagementPage
