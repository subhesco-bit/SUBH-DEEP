import { useState } from 'react'
import { Layers } from 'lucide-react'
import { platformCoreAPI, platformConfigurationAPI, environmentManagementAPI, featureFlagAPI, timeZoneManagementAPI, masterConfigAPI } from '../services/api'
import { useQuery } from '@tanstack/react-query'
import ManagementPageShell from './_shared/ManagementPageShell'
import CrudSection from './_shared/CrudSection'

/** Platform Foundation — platformCoreAPI/platformConfigurationAPI are real
 *  (backend/src/routes/platformCoreRoutes.js, platformConfigurationRoutes.js);
 *  the M005/M007/M009/M010 registries (environments, feature flags, time
 *  zones, master config) have no backend route mounted yet — see
 *  services/api.js comments for each. */
function PlatformHealthPanel() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['platform-core-health'],
    queryFn: async () => (await platformCoreAPI.getHealth()).data,
  })
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="font-semibold text-gray-800 mb-3">Platform Health (real — /platform-core/health)</h3>
      {isLoading && <div className="animate-pulse h-16 bg-gray-200 rounded" />}
      {error && <div className="text-red-600 text-sm">Error: {error.message}</div>}
      {data && <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto">{JSON.stringify(data, null, 2)}</pre>}
    </div>
  )
}

const REGISTRY_TABS = [
  {
    id: 'environments', label: 'Environments (M005)', entityLabel: 'Environment',
    listFn: environmentManagementAPI.getEnvironments, createFn: environmentManagementAPI.createEnvironment, deleteFn: environmentManagementAPI.deleteEnvironment,
    hint: 'No backend route mounts /environments yet.',
    fields: [{ name: 'name', label: 'Environment name', required: true }, { name: 'type', label: 'Type', type: 'select', options: ['Development', 'Staging', 'Production'] }],
    columns: [{ key: 'name', label: 'Name' }, { key: 'type', label: 'Type' }],
  },
  {
    id: 'feature-flags', label: 'Feature Flags', entityLabel: 'Flag',
    listFn: featureFlagAPI.getFlags, createFn: featureFlagAPI.createFlag, deleteFn: featureFlagAPI.deleteFlag,
    hint: 'No backend route mounts /feature-flags yet.',
    fields: [{ name: 'key', label: 'Flag key', required: true }, { name: 'enabled', label: 'Enabled', type: 'select', options: ['true', 'false'] }],
    columns: [{ key: 'key', label: 'Key' }, { key: 'enabled', label: 'Enabled' }],
  },
  {
    id: 'timezones', label: 'Time Zones', entityLabel: 'Zone',
    listFn: timeZoneManagementAPI.getZones, createFn: timeZoneManagementAPI.createZone, deleteFn: timeZoneManagementAPI.deleteZone,
    hint: 'No backend route mounts /timezones yet.',
    fields: [{ name: 'name', label: 'Zone name', required: true }, { name: 'offset', label: 'UTC offset' }],
    columns: [{ key: 'name', label: 'Name' }, { key: 'offset', label: 'Offset' }],
  },
  {
    id: 'master-config', label: 'Master Config', entityLabel: 'Config entry',
    listFn: masterConfigAPI.getConfig, createFn: masterConfigAPI.createConfig, deleteFn: masterConfigAPI.deleteConfig,
    hint: 'No backend route mounts /master-config yet.',
    fields: [{ name: 'key', label: 'Config key', required: true }, { name: 'value', label: 'Value' }],
    columns: [{ key: 'key', label: 'Key' }, { key: 'value', label: 'Value' }],
  },
]

function PlatformFoundationPage() {
  const [showConfig, setShowConfig] = useState(false)

  return (
    <ManagementPageShell
      icon={Layers}
      title="Platform Foundation"
      description="Platform health, configuration and foundational registries"
      accent="indigo"
      tabs={[{ id: 'health', label: 'Health & Config' }, ...REGISTRY_TABS.map((t) => ({ id: t.id, label: t.label }))]}
    >
      {(tab) => {
        if (tab === 'health' || !tab) {
          return (
            <div className="space-y-6">
              <PlatformHealthPanel />
              <div className="bg-white rounded-lg shadow p-6">
                <button
                  onClick={() => setShowConfig(!showConfig)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
                >
                  {showConfig ? 'Hide' : 'Load'} configuration recommendations
                </button>
                {showConfig && <ConfigRecommendations />}
              </div>
            </div>
          )
        }
        const active = REGISTRY_TABS.find((t) => t.id === tab)
        if (!active) return null
        return (
          <CrudSection
            queryKey={`platform-${active.id}`}
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

function ConfigRecommendations() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['platform-configuration-recommendations'],
    queryFn: async () => (await platformConfigurationAPI.getRecommendations()).data,
  })
  return (
    <div className="mt-4">
      {isLoading && <div className="animate-pulse h-16 bg-gray-200 rounded" />}
      {error && <div className="text-red-600 text-sm">Error: {error.message} (real backend at /platform-configuration/configuration/recommendations)</div>}
      {data && <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto">{JSON.stringify(data, null, 2)}</pre>}
    </div>
  )
}

export default PlatformFoundationPage
