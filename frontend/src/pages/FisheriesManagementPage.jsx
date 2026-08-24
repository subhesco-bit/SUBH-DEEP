import { Fish } from 'lucide-react'
import {
  biofloccFarmAPI, hatcheryManagementAPI, fishFeedAPI, fisheriesWaterQualityAPI,
  fishHealthAPI, fisheriesHarvestAPI, fishProcessingAPI, coldFishChainAPI, aquacultureAnalyticsAPI,
} from '../services/api'
import ManagementPageShell from './_shared/ManagementPageShell'
import CrudSection from './_shared/CrudSection'

/** Fisheries domain modules M131-M140. None have a matching backend route
 *  mounted yet — see services/api.js comments for each. */
const TABS = [
  {
    id: 'biofloc', label: 'Biofloc (M131)', entityLabel: 'Tank',
    listFn: biofloccFarmAPI.getTanks, createFn: biofloccFarmAPI.createTank, deleteFn: biofloccFarmAPI.deleteTank,
    hint: 'No backend route mounts /biofloc-farms yet.',
    fields: [{ name: 'tank_id', label: 'Tank ID', required: true }, { name: 'species', label: 'Species' }, { name: 'stocking_density', label: 'Stocking density', type: 'number' }],
    columns: [{ key: 'tank_id', label: 'Tank' }, { key: 'species', label: 'Species' }, { key: 'stocking_density', label: 'Density' }],
  },
  {
    id: 'hatchery', label: 'Hatchery (M133)', entityLabel: 'Batch',
    listFn: hatcheryManagementAPI.getBatches, createFn: hatcheryManagementAPI.createBatch, deleteFn: hatcheryManagementAPI.deleteBatch,
    hint: 'No backend route mounts /hatchery-management yet.',
    fields: [{ name: 'batch_id', label: 'Batch ID', required: true }, { name: 'species', label: 'Species' }, { name: 'fry_count', label: 'Fry count', type: 'number' }, { name: 'hatch_date', label: 'Hatch date', type: 'date' }],
    columns: [{ key: 'batch_id', label: 'Batch' }, { key: 'species', label: 'Species' }, { key: 'fry_count', label: 'Fry count' }, { key: 'hatch_date', label: 'Hatched' }],
  },
  {
    id: 'feed', label: 'Feed (M134)', entityLabel: 'Feed log',
    listFn: fishFeedAPI.getLogs, createFn: fishFeedAPI.createLog, deleteFn: fishFeedAPI.deleteLog,
    hint: 'No backend route mounts /fish-feed yet.',
    fields: [{ name: 'pond_id', label: 'Pond / tank ID', required: true }, { name: 'feed_type', label: 'Feed type' }, { name: 'quantity_kg', label: 'Quantity (kg)', type: 'number' }, { name: 'fed_date', label: 'Date', type: 'date' }],
    columns: [{ key: 'pond_id', label: 'Pond' }, { key: 'feed_type', label: 'Feed' }, { key: 'quantity_kg', label: 'Qty (kg)' }, { key: 'fed_date', label: 'Date' }],
  },
  {
    id: 'water-quality', label: 'Water Quality (M135)', entityLabel: 'Reading',
    listFn: fisheriesWaterQualityAPI.getReadings, createFn: fisheriesWaterQualityAPI.createReading, deleteFn: fisheriesWaterQualityAPI.deleteReading,
    hint: 'No backend route mounts /fisheries-water-quality yet.',
    fields: [{ name: 'pond_id', label: 'Pond / tank ID', required: true }, { name: 'ph', label: 'pH', type: 'number' }, { name: 'dissolved_oxygen', label: 'Dissolved O2 (mg/L)', type: 'number' }, { name: 'reading_date', label: 'Date', type: 'date' }],
    columns: [{ key: 'pond_id', label: 'Pond' }, { key: 'ph', label: 'pH' }, { key: 'dissolved_oxygen', label: 'DO (mg/L)' }, { key: 'reading_date', label: 'Date' }],
  },
  {
    id: 'fish-health', label: 'Fish Health (M136)', entityLabel: 'Record',
    listFn: fishHealthAPI.getRecords, createFn: fishHealthAPI.createRecord, deleteFn: fishHealthAPI.deleteRecord,
    hint: 'No backend route mounts /fish-health yet.',
    fields: [{ name: 'pond_id', label: 'Pond / tank ID', required: true }, { name: 'condition', label: 'Condition / disease' }, { name: 'treatment', label: 'Treatment' }],
    columns: [{ key: 'pond_id', label: 'Pond' }, { key: 'condition', label: 'Condition' }, { key: 'treatment', label: 'Treatment' }],
  },
  {
    id: 'harvest', label: 'Harvest (M137)', entityLabel: 'Harvest',
    listFn: fisheriesHarvestAPI.getHarvests, createFn: fisheriesHarvestAPI.createHarvest, deleteFn: fisheriesHarvestAPI.deleteHarvest,
    hint: 'No backend route mounts /fisheries-harvest yet.',
    fields: [{ name: 'pond_id', label: 'Pond / tank ID', required: true }, { name: 'quantity_kg', label: 'Quantity (kg)', type: 'number' }, { name: 'harvest_date', label: 'Date', type: 'date' }],
    columns: [{ key: 'pond_id', label: 'Pond' }, { key: 'quantity_kg', label: 'Qty (kg)' }, { key: 'harvest_date', label: 'Date' }],
  },
  {
    id: 'processing', label: 'Processing (M138)', entityLabel: 'Batch',
    listFn: fishProcessingAPI.getBatches, createFn: fishProcessingAPI.createBatch, deleteFn: fishProcessingAPI.deleteBatch,
    hint: 'No backend route mounts /fish-processing yet.',
    fields: [{ name: 'batch_id', label: 'Batch ID', required: true }, { name: 'product_type', label: 'Product type' }, { name: 'quantity_kg', label: 'Quantity (kg)', type: 'number' }],
    columns: [{ key: 'batch_id', label: 'Batch' }, { key: 'product_type', label: 'Product' }, { key: 'quantity_kg', label: 'Qty (kg)' }],
  },
  {
    id: 'cold-chain', label: 'Cold Chain (M139)', entityLabel: 'Shipment',
    listFn: coldFishChainAPI.getShipments, createFn: coldFishChainAPI.createShipment, deleteFn: coldFishChainAPI.deleteShipment,
    hint: 'No backend route mounts /cold-fish-chain yet.',
    fields: [{ name: 'shipment_id', label: 'Shipment ID', required: true }, { name: 'destination', label: 'Destination' }, { name: 'temperature_c', label: 'Temperature (°C)', type: 'number' }],
    columns: [{ key: 'shipment_id', label: 'Shipment' }, { key: 'destination', label: 'Destination' }, { key: 'temperature_c', label: 'Temp (°C)' }],
  },
  {
    id: 'analytics', label: 'Analytics (M140)', entityLabel: 'Metric',
    listFn: aquacultureAnalyticsAPI.getMetrics, createFn: aquacultureAnalyticsAPI.createMetric, deleteFn: aquacultureAnalyticsAPI.deleteMetric,
    hint: 'No backend route mounts /aquaculture-analytics yet.',
    fields: [{ name: 'pond_id', label: 'Pond / tank ID', required: true }, { name: 'metric', label: 'Metric name' }, { name: 'value', label: 'Value', type: 'number' }],
    columns: [{ key: 'pond_id', label: 'Pond' }, { key: 'metric', label: 'Metric' }, { key: 'value', label: 'Value' }],
  },
]

function FisheriesManagementPage() {
  return (
    <ManagementPageShell
      icon={Fish}
      title="Fisheries Management"
      description="Aquaculture operations — biofloc, hatchery, feed, water quality, health, harvest and cold chain (M131-M140)"
      accent="sky"
      tabs={TABS.map((t) => ({ id: t.id, label: t.label }))}
    >
      {(tab) => {
        const active = TABS.find((t) => t.id === tab) || TABS[0]
        return (
          <CrudSection
            queryKey={`fisheries-${active.id}`}
            listFn={active.listFn}
            createFn={active.createFn}
            deleteFn={active.deleteFn}
            entityLabel={active.entityLabel}
            accent="sky"
            notFoundHint={active.hint}
            fields={active.fields}
            columns={active.columns}
          />
        )
      }}
    </ManagementPageShell>
  )
}

export default FisheriesManagementPage
