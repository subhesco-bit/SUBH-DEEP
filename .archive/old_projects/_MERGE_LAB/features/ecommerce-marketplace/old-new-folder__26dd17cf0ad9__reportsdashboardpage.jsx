import { Link } from 'react-router-dom'
import { BarChart3, FileText, ArrowRight } from 'lucide-react'

const reports = [
  { title: 'Operational analytics', description: 'Review activity, workflow readiness, and recommended actions.', to: '/analytics' },
  { title: 'Financial services', description: 'Open the consolidated financial services dashboard.', to: '/financial-services' },
  { title: 'Supply chain performance', description: 'Monitor logistics, fulfillment, and delivery execution.', to: '/logistics' },
]

function ReportsDashboardPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Reporting hub</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Enterprise reports</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Move from a trusted report catalogue into the live dashboards that power each operational decision.
          </p>
        </section>
        <section className="grid gap-4 md:grid-cols-3" aria-label="Available reports">
          {reports.map((report) => (
            <Link key={report.to} to={report.to} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md focus-visible:outline-none">
              <div className="flex items-start justify-between gap-4">
                <span className="rounded-xl bg-emerald-50 p-2 text-emerald-700"><BarChart3 className="h-5 w-5" /></span>
                <ArrowRight className="h-5 w-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-emerald-600" />
              </div>
              <h2 className="mt-5 font-semibold text-slate-900">{report.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{report.description}</p>
            </Link>
          ))}
        </section>
        <div className="flex items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
          <FileText className="h-5 w-5 shrink-0" />
          Reports are generated from live platform services; unavailable data is shown explicitly rather than replaced with placeholder values.
        </div>
      </div>
    </main>
  )
}

export default ReportsDashboardPage
