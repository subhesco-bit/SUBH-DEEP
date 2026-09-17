import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Clock, User, FileWarning, CheckCircle2 } from 'lucide-react';
import { governmentSchemeAPI } from '../../services/api';

/**
 * Application Status Tracker — real backend: governmentSchemeAPI.trackScheme
 * (GET /api/v1/government/schemes/track/:id), backed by
 * backend/src/services/legacy/governmentSchemeService.js's
 * trackSchemeApplication(), mounted via setupRoutes(app) in backend/src/index.js.
 */
const ApplicationStatusTracker = () => {
  const [applicationId, setApplicationId] = useState('');
  const [searchId, setSearchId] = useState(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['scheme-application-track', searchId],
    queryFn: () => governmentSchemeAPI.trackScheme(searchId).then((r) => r.data?.data),
    enabled: !!searchId,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (applicationId.trim()) setSearchId(applicationId.trim());
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Application Status Tracker</h1>
      <p className="text-gray-600 mb-6">Track the status of a government scheme application by application ID.</p>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        <input
          type="text"
          value={applicationId}
          onChange={(e) => setApplicationId(e.target.value)}
          placeholder="Enter application ID"
          className="flex-1 px-4 py-2 border rounded-lg"
        />
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Search className="w-4 h-4" /> Track
        </button>
      </form>

      {isLoading && <p className="text-gray-500">Loading status...</p>}
      {error && <p className="text-red-600">{error.message || 'Failed to load application status.'}</p>}

      {!isLoading && !error && searchId && data && (
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <div className="text-sm text-gray-500">Application ID</div>
              <div className="font-semibold">{data.application_id}</div>
            </div>
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 flex items-center gap-1">
              <Clock className="w-4 h-4" /> {data.current_status || 'unknown'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Tracking Number</div>
              <div className="font-medium">{data.tracking_number || 'N/A'}</div>
            </div>
            <div>
              <div className="text-gray-500">Estimated Completion</div>
              <div className="font-medium">{data.estimated_completion || 'N/A'}</div>
            </div>
            <div className="flex items-start gap-2">
              <User className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <div className="text-gray-500">Contact Officer</div>
                <div className="font-medium">{data.contact_officer || 'Not assigned'}</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <FileWarning className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <div className="text-gray-500">Documents Pending</div>
                <div className="font-medium">{Array.isArray(data.documents_pending) && data.documents_pending.length > 0 ? data.documents_pending.join(', ') : 'None'}</div>
              </div>
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-500 mb-2 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Status History</div>
            {Array.isArray(data.status_history) && data.status_history.length > 0 ? (
              <ul className="space-y-1 text-sm">
                {data.status_history.map((h, i) => (
                  <li key={i} className="border-l-2 border-blue-200 pl-3">{typeof h === 'string' ? h : JSON.stringify(h)}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No history recorded yet.</p>
            )}
          </div>

          {Array.isArray(data.next_steps) && data.next_steps.length > 0 && (
            <div>
              <div className="text-sm text-gray-500 mb-2">Next Steps</div>
              <ul className="list-disc list-inside text-sm space-y-1">
                {data.next_steps.map((s, i) => <li key={i}>{typeof s === 'string' ? s : JSON.stringify(s)}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      {!isLoading && !error && searchId && !data && (
        <p className="text-gray-500">No status found for this application ID.</p>
      )}
    </div>
  );
};

export default ApplicationStatusTracker;
