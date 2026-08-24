import { Package } from 'lucide-react'
import {
  biofertilizerAPI, pesticideInventoryAPI, bioPesticideAPI, micronutrientAPI,
  organicInputAPI, inputProcurementAPI, inputDistributionAPI, inputTraceabilityAPI,
} from '../services/api'
import ManagementPageShell from './_shared/ManagementPageShell'
import CrudSection from './_shared/CrudSection'

/** Input Supply domain modules M113-M120. None have a matching backend
 *  route mounted yet — see services/api.js comments for each. */
const TABS = [
  {
    id: 'biofertilizer', label: 'Biofertilizer (M113)', entityLabel: 'Item',
    listFn: biofertilizerAPI.getItems, createFn: biofertilizerAPI.createItem, deleteFn: biofertilizerAPI.deleteItem,
    hint: 'No backend route mounts /biofertilizers yet.',
    fields: [{ name: 'name', label: 'Product name', required: true }, { name: 'stock_qty', label: 'Stock qty', type: 'number' }, { name: 'unit', label: 'Unit' }],
    columns: [{ key: 'name', label: 'Product' }, { key: 'stock_qty', label: 'Stock' }, { key: 'unit', label: 'Unit' }],
  },
  {
    id: 'pesticide', label: 'Pesticide Inventory (M114)', entityLabel: 'Item',
    listFn: pesticideInventoryAPI.getItems, createFn: pesticideInventoryAPI.createItem, deleteFn: pesticideInventoryAPI.deleteItem,
    hint: 'No backend route mounts /pesticide-inventory yet.',
    fields: [{ name: 'name', label: 'Product name', required: true }, { name: 'stock_qty', label: 'Stock qty', type: 'number' }, { name: 'expiry_date', label: 'Expiry date', type: 'date' }],
    columns: [{ key: 'name', label: 'Product' }, { key: 'stock_qty', label: 'Stock' }, { key: 'expiry_date', label: 'Expiry' }],
  },
  {
    id: 'bio-pesticide', label: 'Bio-Pesticide (M115)', entityLabel: 'Item',
    listFn: bioPesticideAPI.getItems, createFn: bioPesticideAPI.createItem, deleteFn: bioPesticideAPI.deleteItem,
    hint: 'No backend route mounts /bio-pesticides yet.',
    fields: [{ name: 'name', label: 'Product name', required: true }, { name: 'stock_qty', label: 'Stock qty', type: 'number' }],
    columns: [{ key: 'name', label: 'Product' }, { key: 'stock_qty', label: 'Stock' }],
  },
  {
    id: 'micronutrients', label: 'Micronutrients (M116)', entityLabel: 'Item',
    listFn: micronutrientAPI.getItems, createFn: micronutrientAPI.createItem, deleteFn: micronutrientAPI.deleteItem,
    hint: 'No backend route mounts /micronutrients yet.',
    fields: [{ name: 'name', label: 'Product name', required: true }, { name: 'stock_qty', label: 'Stock qty', type: 'number' }],
    columns: [{ key: 'name', label: 'Product' }, { key: 'stock_qty', label: 'Stock' }],
  },
  {
    id: 'organic', label: 'Organic Inputs (M117)', entityLabel: 'Item',
    listFn: organicInputAPI.getItems, createFn: organicInputAPI.createItem, deleteFn: organicInputAPI.deleteItem,
    hint: 'No backend route mounts /organic-inputs yet.',
    fields: [{ name: 'name', label: 'Product name', required: true }, { name: 'stock_qty', label: 'Stock qty', type: 'number' }],
    columns: [{ key: 'name', label: 'Product' }, { key: 'stock_qty', label: 'Stock' }],
  },
  {
    id: 'procurement', label: 'Procurement (M118)', entityLabel: 'Order',
    listFn: inputProcurementAPI.getOrders, createFn: inputProcurementAPI.createOrder, deleteFn: inputProcurementAPI.deleteOrder,
    hint: 'No backend route mounts /input-procurement yet (vendorRoutes.js covers vendor profiles, not purchase orders).',
    fields: [{ name: 'supplier', label: 'Supplier', required: true }, { name: 'item', label: 'Item' }, { name: 'quantity', label: 'Quantity', type: 'number' } ],
    columns: [{ key: 'supplier', label: 'Supplier' }, { key: 'item', label: 'Item' }, { key: 'quantity', label: 'Qty' }],
  },
  {
    id: 'distribution', label: 'Distribution (M119)', entityLabel: 'Record',
    listFn: inputDistributionAPI.getRecords, createFn: inputDistributionAPI.createRecord, deleteFn: inputDistributionAPI.deleteRecord,
    hint: 'No backend route mounts /input-distribution yet.',
    fields: [{ name: 'recipient', label: 'Recipient (farmer/dealer)', required: true }, { name: 'item', label: 'Item' }, { name: 'quantity', label: 'Quantity', type: 'number' } ],
    columns: [{ key: 'recipient', label: 'Recipient' }, { key: 'item', label: 'Item' }, { key: 'quantity', label: 'Qty' }],
  },
  {
    id: 'traceability', label: 'Traceability (M120)', entityLabel: 'Record',
    listFn: inputTraceabilityAPI.getRecords, createFn: inputTraceabilityAPI.createRecord, deleteFn: inputTraceabilityAPI.deleteRecord,
    hint: 'No backend route mounts /input-traceability yet.',
    fields: [{ name: 'batch_id', label: 'Batch ID', required: true }, { name: 'origin', label: 'Origin' } ],
    columns: [{ key: 'batch_id', label: 'Batch' }, { key: 'origin', label: 'Origin' }],
  },
]

function InputSupplyManagementPage() {
  return (
    <ManagementPageShell
      icon={Package}
      title="Input Supply Management"
      description="Fertilizers, pesticides, micronutrients — procurement, distribution and traceability (M113-M120)"
      accent="amber"
      tabs={TABS.map((t) => ({ id: t.id, label: t.label }))}
    >
      {(tab) => {
        const active = TABS.find((t) => t.id === tab) || TABS[0]
        return (
          <CrudSection
            queryKey={`input-supply-${active.id}`}
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

export default InputSupplyManagementPage
