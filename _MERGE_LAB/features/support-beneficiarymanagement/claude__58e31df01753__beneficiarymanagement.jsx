import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, TrendingUp, ShieldAlert, IndianRupee } from 'lucide-react';
import { strategicAPI } from '../../services/api';

/**
 * Beneficiary Management — admin view of a subsidy program's beneficiaries:
 * utilization (applications/approvals/disbursements), financials and leakage
 * risk. Real backend: strategicAPI.government.getSubsidyPrograms /
 * getProgramImpact, backed by backend/src/services/strategic/
 * governmentSubsidyService.js's getGovernmentDashboard() / trackSubsidyImpact()
 * (real Postgres queries against government_subsidy_programs,
 * government_subsidy_applications, subsidy_disbursements), mounted at
 * /api/v1/strategic/government (backend/src/index.js).
 *
 * SchemeBeneficiaryList.jsx covered the same "list of beneficiaries" concept
 * with no distinct backend of its own — consolidated here; see that file's
 * header comment.
 */
const BeneficiaryManagement = () => {
  const [programId, setProgramId] = useState('');

  const { data: programs, isLoading: programsLoading, error: programsError } = useQuery({
    queryKey: ['subsidy-programs-list'],
    queryFn: () => strategicAPI.government.getSubsidyPrograms().then((r) => r.data?.data),
  });

  const { data: impact, isLoading: impactLoading, error: impactError } = useQuery({
    queryKey: ['subsidy-program-impact', programId],
    queryFn: () => strategicAPI.government.getProgramImpact(programId).then((r) => r.data?.data),
    enabled: !!programId,
  });

  const programList = Array.isArray(programs?.programs) ? programs.programs : Array.isArray(programs) ? programs : [];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
        <Users className="w-7 h-7" /> Beneficiary Management
      </h1>
      <p className="text-gray-600 mb-6">Utilization, disbursement and impact metrics for subsidy program beneficiaries.</p>

      {programsLoading && <p className="text-gray-500">Loading programs...</p>}
      {programsError && <p className="text-red-600">{programsError.message}</p>}

      {!programsLoading && (
        <div className="mb-6">
          <label className="block text-sm text-gray-600 mb-1">Subsidy Program</label>
          <select value={programId} onChange={(e) => setProgramId(e.target.value)} className="w-full md:w-96 px-4 py-2 border rounded-lg">
            <option value="">Select a program...</option>
            {programList.map((p) => (
              <option key={p.id} value={p.id}>{p.program_name || p.id}</option>
            ))}
            {programList.length === 0 && <option disabled>No programs available</option>}
          </select>
        </div>
      )}

      {impactLoading && <p className="text-gray-500">Loading impact metrics...</p>}
      {impactError && <p className="text-red-600">{impactError.message}</p>}

      {!impactLoading && impact && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-500">Total Applications</div>
              <div className="text-2xl font-bold">{impact.utilization?.total_applications ?? 0}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-500">Disbursed</div>
              <div className="text-2xl font-bold text-green-600">{impact.utilization?.disbursed_applications ?? 0}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-500">Rejected</div>
              <div className="text-2xl font-bold text-red-600">{impact.utilization?.rejected_applications ?? 0}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-500">Utilization Rate</div>
              <div className="text-2xl font-bold">{impact.utilization?.utilization_rate ?? '0%'}</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><IndianRupee className="w-5 h-5" /> Financials</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-gray-500">Total Disbursed</div>
                <div className="font-semibold">₹{impact.financial?.total_disbursed ?? 0}</div>
              </div>
              <div>
                <div className="text-gray-500">Average Disbursement</div>
                <div className="font-semibold">₹{impact.financial?.average_disbursement ?? 0}</div>
              </div>
              <div>
                <div className="text-gray-500">Budget Utilization</div>
                <div className="font-semibold">{impact.financial?.budget_utilization ?? '0%'}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5" /> Impact</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-500">Average Income Increase</div>
                <div className="font-semibold">{impact.impact?.income_impact?.average_increase ?? 0}</div>
              </div>
              <div>
                <div className="text-gray-500">Farmers with Improved Income</div>
                <div className="font-semibold">{impact.impact?.income_impact?.percentage_improved ?? 0}%</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><ShieldAlert className="w-5 h-5" /> Leakage Risk</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-gray-500">Duplicate Applications</div>
                <div className="font-semibold">{impact.leak_detection?.duplicate_applications ?? 0}</div>
              </div>
              <div>
                <div className="text-gray-500">Unusual Patterns</div>
                <div className="font-semibold">{impact.leak_detection?.unusual_patterns ?? 0}</div>
              </div>
              <div>
                <div className="text-gray-500">Verification Failures</div>
                <div className="font-semibold">{impact.leak_detection?.verification_failures ?? 0}</div>
              </div>
              <div>
                <div className="text-gray-500">Overall Risk</div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  impact.leak_detection?.overall_risk === 'high' ? 'bg-red-100 text-red-800' :
                  impact.leak_detection?.overall_risk === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {impact.leak_detection?.overall_risk ?? 'low'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {!programId && !programsLoading && (
        <p className="text-gray-500">Select a program above to view beneficiary and impact metrics.</p>
      )}
    </div>
  );
};

export default BeneficiaryManagement;
