import { Link } from 'react-router-dom'
import { Sprout, Calendar, Map, ScanEye, Layers3, Droplets } from 'lucide-react'

/** Field door — links into the farmer field-management pages (crop
 *  calendar, land, monitoring, soil, water). */
const LINKS = [
  { to: '/farmerfield', icon: Sprout, title: 'My Fields', desc: 'Existing field records and plot details' },
  { to: '/crop-calendar', icon: Calendar, title: 'Crop Calendar', desc: 'Sowing and harvest windows' },
  { to: '/land-management', icon: Map, title: 'Land', desc: 'Leases, GIS mapping and surveys' },
  { to: '/crop-monitoring', icon: ScanEye, title: 'Crop Monitoring', desc: 'Field scouting and observations' },
  { to: '/soil-management', icon: Layers3, title: 'Soil', desc: 'Health cards, nutrients and lab testing' },
  { to: '/water-management', icon: Droplets, title: 'Water', desc: 'Budgeting, quality and rainwater harvesting' },
]

function FarmerFieldDoorPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
          <Sprout className="w-6 h-6 mr-2 text-teal-600" />
          Field Door
        </h1>
        <p className="text-gray-600">Crop planning, land and field-level management</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {LINKS.map((l) => (
          <Link key={l.to} to={l.to} className="bg-white rounded-lg shadow p-5 hover:shadow-lg transition flex items-start space-x-3">
            <l.icon className="w-8 h-8 text-teal-600 flex-shrink-0" />
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

export default FarmerFieldDoorPage
