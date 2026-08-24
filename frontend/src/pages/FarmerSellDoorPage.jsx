import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Store, ShoppingCart, FileText, Boxes, TrendingUp } from 'lucide-react'
import { walletAPI } from '../services/api'

/** Sell door — links into the real selling surfaces already in the app,
 *  plus a live wallet-balance snapshot (real backend: farmerService.js /
 *  farmer-portal/wallet/balance). */
const LINKS = [
  { to: '/farmersell', icon: Store, title: 'Sell Produce', desc: 'List crops and manage active listings' },
  { to: '/marketplace', icon: ShoppingCart, title: 'Marketplace', desc: 'Browse buyer demand and current listings' },
  { to: '/rfq', icon: FileText, title: 'RFQs', desc: 'Respond to buyer requests for quotes' },
  { to: '/bulk-orders', icon: Boxes, title: 'Bulk Orders', desc: 'Wholesale order management' },
  { to: '/price-check', icon: TrendingUp, title: 'Price Check', desc: 'Compare current mandi and market prices' },
]

function WalletSnapshot() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['farmer-sell-door-wallet-balance'],
    queryFn: async () => (await walletAPI.getBalance()).data,
    retry: false,
  })
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="text-sm text-gray-500">Wallet balance</div>
      {isLoading && <div className="animate-pulse h-8 w-24 bg-gray-200 rounded mt-1" />}
      {error && <div className="text-sm text-red-600 mt-1">Unable to load balance: {error.message}</div>}
      {data && <div className="text-2xl font-bold text-gray-800 mt-1">{JSON.stringify(data?.data ?? data)}</div>}
    </div>
  )
}

function FarmerSellDoorPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
          <Store className="w-6 h-6 mr-2 text-emerald-600" />
          Sell Door
        </h1>
        <p className="text-gray-600">Everything for getting produce to market</p>
      </div>

      <WalletSnapshot />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {LINKS.map((l) => (
          <Link key={l.to} to={l.to} className="bg-white rounded-lg shadow p-5 hover:shadow-lg transition flex items-start space-x-3">
            <l.icon className="w-8 h-8 text-emerald-600 flex-shrink-0" />
            <div>
              <div className="font-semibold text-gray-800">{l.title}</div>
              <div className="text-sm text-gray-500">{l.desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default FarmerSellDoorPage
