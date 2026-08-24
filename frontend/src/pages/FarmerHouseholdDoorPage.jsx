import { Link } from 'react-router-dom'
import { Home, Users, HeartPulse, GraduationCap, UserCircle, BadgeCheck } from 'lucide-react'

/** Household door — links into the farmer household pages (family, health,
 *  skills, profile, verification). */
const LINKS = [
  { to: '/farmer-family', icon: Users, title: 'Family', desc: 'Household and dependent records' },
  { to: '/farmer-welfare', icon: HeartPulse, title: 'Health & Welfare', desc: 'Health records and welfare-scheme enrolment' },
  { to: '/farmer-skills', icon: GraduationCap, title: 'Skills & Training', desc: 'Training history and skill records' },
  { to: '/farmer-profile', icon: UserCircle, title: 'Profile', desc: 'Extended farmer profile details' },
  { to: '/farmer-verification', icon: BadgeCheck, title: 'Verification', desc: 'Field verification of land and membership claims' },
]

function FarmerHouseholdDoorPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
          <Home className="w-6 h-6 mr-2 text-amber-600" />
          Household Door
        </h1>
        <p className="text-gray-600">Family, health and welfare records for the household</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {LINKS.map((l) => (
          <Link key={l.to} to={l.to} className="bg-white rounded-lg shadow p-5 hover:shadow-lg transition flex items-start space-x-3">
            <l.icon className="w-8 h-8 text-amber-600 flex-shrink-0" />
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

export default FarmerHouseholdDoorPage
