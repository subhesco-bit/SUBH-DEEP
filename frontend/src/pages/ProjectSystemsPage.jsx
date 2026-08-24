import { useState } from 'react'
import { FolderKanban } from 'lucide-react'
import { projectSystemsAPI } from '../services/api'
import ManagementPageShell from './_shared/ManagementPageShell'
import CrudSection from './_shared/CrudSection'

/** AF-PS Project Systems — real backend at backend/src/routes/projectSystemsRoutes.js
 *  (mounted /erp/projects). Projects are scoped by companyId. */
function ProjectSystemsPage() {
  const [companyId, setCompanyId] = useState('')

  return (
    <ManagementPageShell
      icon={FolderKanban}
      title="Project Systems"
      description="Projects, work breakdown structure and milestones — AF-PS (erp/projects)"
      accent="sky"
    >
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Company ID</label>
        <input
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
          placeholder="Enter a company ID to scope the project list"
          className="w-full md:w-80 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
        />
      </div>

      <CrudSection
        queryKey="project-systems-projects"
        listParams={companyId}
        listFn={() => projectSystemsAPI.getProjects(companyId || undefined)}
        createFn={(data) => projectSystemsAPI.createProject({ ...data, companyId: companyId || data.companyId })}
        entityLabel="Project"
        accent="sky"
        fields={[
          { name: 'name', label: 'Project name', required: true },
          { name: 'description', label: 'Description', type: 'textarea' },
          { name: 'start_date', label: 'Start date', type: 'date' },
          { name: 'end_date', label: 'End date', type: 'date' },
        ]}
        columns={[
          { key: 'name', label: 'Project' },
          { key: 'status', label: 'Status' },
          { key: 'start_date', label: 'Start' },
          { key: 'end_date', label: 'End' },
        ]}
        emptyMessage="No projects yet. Enter a company ID above and create one."
      />
    </ManagementPageShell>
  )
}

export default ProjectSystemsPage
