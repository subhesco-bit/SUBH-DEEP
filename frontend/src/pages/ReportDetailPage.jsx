import { Link, useLocation } from 'react-router-dom'
import { ArrowLeft, FileBarChart } from 'lucide-react'

function ReportDetailPage({ title, description }) {
  const location = useLocation()
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <Link to="/reports" className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700 hover:text-emerald-900">
          <ArrowLeft className="h-4 w-4" /> Back to reports
        </Link>
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <span className="rounded-xl bg-emerald-50 p-3 text-emerald-700"><FileBarChart className="h-6 w-6" /></span>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Live report</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">{title}</h1>
              <p className="mt-2 text-sm text-slate-600">{description}</p>
            </div>
          </div>
          <div className="mt-8 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
            This report is connected to the AFRERA reporting surface at <code className="font-mono">{location.pathname}</code>. Select a live dashboard from the reports hub to continue.
          </div>
        </section>
      </div>
    </main>
  )
}

export default ReportDetailPage
