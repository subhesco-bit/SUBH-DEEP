import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Share2, ArrowRight } from 'lucide-react'
import { sharedInfraAPI } from '../services/api'

/** Shared door — a live preview of shared assets pulled from the real
 *  sharedInfraService.js backend (mounted /shared-infra), with a link
 *  through to the full SharedInfraPage for registering/booking. This
 *  replaces the previous "coming soon" placeholder that used to live here. */
function FarmerSharedDoorPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['farmer-shared-door-assets'],
    queryFn: async () => {
      const res = await sharedInfraAPI.searchAssets({})
      const body = res?.data
      return Array.isArray(body) ? body : (body?.data ?? [])
    },
  })

  const assets = data || []

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
            <Share2 className="w-6 h-6 mr-2 text-sky-600" />
            Shared Door
          </h1>
          <p className="text-gray-600">Shared equipment, second-life gear and community batteries near you</p>
        </div>
        <Link to="/shared-infra" className="px-4 py-2 bg-sky-600 text-white rounded-lg font-semibold hover:bg-sky-700 transition flex items-center">
          Open full marketplace<ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>

      {isLoading && <div className="animate-pulse h-40 bg-gray-200 rounded-lg" />}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
          Error loading shared assets: {error.message}.
        </div>
      )}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {assets.length === 0 && (
            <div className="col-span-full text-center py-10 bg-white rounded-lg shadow text-gray-500">
              No shared assets listed nearby yet. <Link to="/shared-infra" className="text-sky-700 hover:underline">Register one</Link>.
            </div>
          )}
          {assets.map((a, i) => (
            <div key={a.id || i} className="bg-white rounded-lg shadow p-5">
              <div className="font-semibold text-gray-800">{a.asset_name || a.name}</div>
              <div className="text-sm text-gray-500">{a.asset_type || a.type}</div>
              <div className="text-sm text-gray-700 mt-2">{a.rate_per_day ? `₹${a.rate_per_day}/day` : ''}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default FarmerSharedDoorPage
