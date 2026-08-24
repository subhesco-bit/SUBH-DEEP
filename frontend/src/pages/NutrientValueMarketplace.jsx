import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Leaf } from 'lucide-react'
import { nutrientValueSalesAPI } from '../services/api'
import toast from 'react-hot-toast'

/** Nutrient Value Marketplace — real backend at
 *  backend/src/services/nutrientValueSalesService.js (mounted /nutrient-value):
 *  nutrient-value pricing, verification, listings, tiers, comparison and
 *  certification. */
function NutrientValueMarketplace() {
  const [criteria, setCriteria] = useState({ minProtein: '', category: '' })
  const [results, setResults] = useState(null)

  const searchMutation = useMutation({
    mutationFn: (params) => nutrientValueSalesAPI.searchByNutrientCriteria(params),
    onSuccess: (res) => setResults(res.data?.data ?? res.data ?? []),
    onError: (err) => toast.error(err?.response?.data?.error || 'Search failed'),
  })

  const rows = Array.isArray(results) ? results : []

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
          <Leaf className="w-6 h-6 mr-2 text-emerald-600" />
          Nutrient Value Marketplace
        </h1>
        <p className="text-gray-600">Search and compare products by nutrient content — real backend at /nutrient-value</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="font-semibold text-gray-800 mb-3">Search by nutrient criteria</h3>
        <form
          onSubmit={(e) => { e.preventDefault(); searchMutation.mutate(criteria) }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Minimum protein (%)</label>
            <input type="number" value={criteria.minProtein} onChange={(e) => setCriteria({ ...criteria, minProtein: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <input value={criteria.category} onChange={(e) => setCriteria({ ...criteria, category: e.target.value })} placeholder="e.g. Pulses, Grains" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
          </div>
          <button type="submit" disabled={searchMutation.isPending} className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition disabled:opacity-60">
            {searchMutation.isPending ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        {!results && <div className="px-4 py-10 text-center text-gray-500">Run a search above to see nutrient-ranked listings.</div>}
        {results && rows.length === 0 && <div className="px-4 py-10 text-center text-gray-500">No listings matched those criteria.</div>}
        {rows.length > 0 && (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nutrient tier</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((r, i) => (
                <tr key={r.id || i} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-800">{r.name || r.product_name || r.productId}</td>
                  <td className="px-4 py-3"><span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-800">{r.tier || r.nutrient_tier || '—'}</span></td>
                  <td className="px-4 py-3 text-gray-700">{r.price ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default NutrientValueMarketplace
