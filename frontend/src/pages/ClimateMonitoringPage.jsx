import { CloudRain } from 'lucide-react'
import {
  droughtMonitoringAPI, floodMonitoringAPI, pestForecastingAPI,
  diseaseForecastingAPI, climateRiskAPI, agroMeteorologyAPI,
} from '../services/api'
import ManagementPageShell from './_shared/ManagementPageShell'
import CrudSection from './_shared/CrudSection'

/** Batch 4 climate modules (M085-M090). pestForecastingAPI is real (reads
 *  GET /weather/pest-forecast, migration 057); the rest have no backend
 *  route mounted yet — see services/api.js comments for each. */
const TABS = [
  {
    id: 'drought', label: 'Drought (M085)', entityLabel: 'Drought record',
    listFn: droughtMonitoringAPI.getRecords, createFn: droughtMonitoringAPI.createRecord, deleteFn: droughtMonitoringAPI.deleteRecord,
    hint: 'No backend route mounts /drought-monitoring yet.',
    fields: [{ name: 'region', label: 'Region', required: true }, { name: 'spi_index', label: 'SPI index', type: 'number' }, { name: 'severity', label: 'Severity', type: 'select', options: ['Mild', 'Moderate', 'Severe', 'Extreme'] }, { name: 'observed_date', label: 'Date', type: 'date' }],
    columns: [{ key: 'region', label: 'Region' }, { key: 'spi_index', label: 'SPI' }, { key: 'severity', label: 'Severity' }, { key: 'observed_date', label: 'Date' }],
  },
  {
    id: 'flood', label: 'Flood (M086)', entityLabel: 'Flood record',
    listFn: floodMonitoringAPI.getRecords, createFn: floodMonitoringAPI.createRecord, deleteFn: floodMonitoringAPI.deleteRecord,
    hint: 'No backend route mounts /flood-monitoring yet.',
    fields: [{ name: 'region', label: 'Region', required: true }, { name: 'water_level_m', label: 'Water level (m)', type: 'number' }, { name: 'severity', label: 'Severity', type: 'select', options: ['Watch', 'Warning', 'Severe'] }, { name: 'observed_date', label: 'Date', type: 'date' }],
    columns: [{ key: 'region', label: 'Region' }, { key: 'water_level_m', label: 'Level (m)' }, { key: 'severity', label: 'Severity' }, { key: 'observed_date', label: 'Date' }],
  },
  {
    id: 'disease', label: 'Disease Forecast (M088)', entityLabel: 'Forecast',
    listFn: diseaseForecastingAPI.getForecasts, createFn: diseaseForecastingAPI.createForecast, deleteFn: diseaseForecastingAPI.deleteForecast,
    hint: 'No backend route mounts /disease-forecasting yet.',
    fields: [{ name: 'crop', label: 'Crop', required: true }, { name: 'disease', label: 'Disease', required: true }, { name: 'risk_level', label: 'Risk level', type: 'select', options: ['Low', 'Moderate', 'High'] }, { name: 'valid_until', label: 'Valid until', type: 'date' }],
    columns: [{ key: 'crop', label: 'Crop' }, { key: 'disease', label: 'Disease' }, { key: 'risk_level', label: 'Risk' }, { key: 'valid_until', label: 'Valid until' }],
  },
  {
    id: 'risk', label: 'Climate Risk (M089)', entityLabel: 'Assessment',
    listFn: climateRiskAPI.getAssessments, createFn: climateRiskAPI.createAssessment, deleteFn: climateRiskAPI.deleteAssessment,
    hint: 'No backend route mounts /climate-risk yet.',
    fields: [{ name: 'region', label: 'Region', required: true }, { name: 'risk_type', label: 'Risk type', type: 'select', options: ['Drought', 'Flood', 'Heat stress', 'Cyclone', 'Frost'] }, { name: 'score', label: 'Risk score (0-100)', type: 'number' }],
    columns: [{ key: 'region', label: 'Region' }, { key: 'risk_type', label: 'Type' }, { key: 'score', label: 'Score' }],
  },
  {
    id: 'agromet', label: 'Agro-Meteorology (M090)', entityLabel: 'Record',
    listFn: agroMeteorologyAPI.getRecords, createFn: agroMeteorologyAPI.createRecord, deleteFn: agroMeteorologyAPI.deleteRecord,
    hint: 'No backend route mounts /agro-meteorology yet.',
    fields: [{ name: 'station', label: 'Station', required: true }, { name: 'rainfall_mm', label: 'Rainfall (mm)', type: 'number' }, { name: 'temp_max_c', label: 'Max temp (°C)', type: 'number' }, { name: 'temp_min_c', label: 'Min temp (°C)', type: 'number' }, { name: 'observed_date', label: 'Date', type: 'date' }],
    columns: [{ key: 'station', label: 'Station' }, { key: 'rainfall_mm', label: 'Rainfall (mm)' }, { key: 'temp_max_c', label: 'Max °C' }, { key: 'observed_date', label: 'Date' }],
  },
]

function ClimateMonitoringPage() {
  return (
    <ManagementPageShell
      icon={CloudRain}
      title="Climate Monitoring"
      description="Drought, flood, disease-forecast, risk and agromet observations (M085-M090)"
      accent="sky"
      tabs={[...TABS.map((t) => ({ id: t.id, label: t.label })), { id: 'pest', label: 'Pest Forecast (M087)' }]}
    >
      {(tab) => {
        if (tab === 'pest') {
          return (
            <CrudSection
              queryKey="climate-pest-forecast"
              listFn={() => pestForecastingAPI.getForecasts({})}
              entityLabel="Forecast"
              accent="sky"
              columns={[{ key: 'crop', label: 'Crop' }, { key: 'pest', label: 'Pest' }, { key: 'risk', label: 'Risk' }]}
              emptyMessage="No pest-forecast data returned for the current parameters."
            />
          )
        }
        const active = TABS.find((t) => t.id === tab) || TABS[0]
        return (
          <CrudSection
            queryKey={`climate-${active.id}`}
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

export default ClimateMonitoringPage
