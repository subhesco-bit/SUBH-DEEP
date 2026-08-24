import { Link } from 'react-router-dom'
import { DoorOpen, Store, Home, Sprout, Share2 } from 'lucide-react'

/** Entrance hub for the farmer "doors" — sell, household, field and shared
 *  infrastructure. Routes already exist in App.jsx (/farmer-entrance/*);
 *  this hub was the missing landing page that links them together. */
const DOORS = [
  { to: '/farmer-entrance/sell', icon: Store, title: 'Sell Produce', desc: 'List crops, take orders and track sales', color: 'text-emerald-600' },
  { to: '/farmer-entrance/household', icon: Home, title: 'Household', desc: 'Family, welfare, skills and health records', color: 'text-amber-600' },
  { to: '/farmer-entrance/field', icon: Sprout, title: 'Field', desc: 'Crop calendar, land and monitoring', color: 'text-teal-600' },
  { to: '/farmer-entrance/shared', icon: Share2, title: 'Shared Resources', desc: 'Shared equipment, batteries and community assets', color: 'text-sky-600' },
]

function FarmerEntranceHubPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
          <DoorOpen className="w-6 h-6 mr-2 text-emerald-600" />
          Farmer Entrance
        </h1>
        <p className="text-gray-600">Choose where you want to go</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {DOORS.map((d) => (
          <Link
            key={d.to}
            to={d.to}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition text-center"
          >
            <d.icon className={`w-10 h-10 mx-auto mb-3 ${d.color}`} />
            <div className="font-semibold text-gray-800 mb-1">{d.title}</div>
            <div className="text-sm text-gray-500">{d.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default FarmerEntranceHubPage
