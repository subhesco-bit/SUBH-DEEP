import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Fingerprint, CheckCircle2, XCircle } from 'lucide-react';
import { biometricAPI } from '../../services/api';

const BIOMETRIC_TYPES = ['fingerprint', 'iris', 'face'];

/**
 * Biometric Authentication — real backend: biometricAPI.verify
 * (POST /api/v1/biometric/verify/:userId), backed by
 * backend/src/services/biometricService.js (writes to biometric_logs).
 * The route file (backend/src/routes/biometric.js) existed but was never
 * mounted; mounted at /api/v1 in backend/src/index.js as part of this page.
 */
const BiometricAuthentication = () => {
  const [userId, setUserId] = useState('');
  const [type, setType] = useState(BIOMETRIC_TYPES[0]);
  const [result, setResult] = useState(null);

  const verifyMutation = useMutation({
    mutationFn: () => biometricAPI.verify(userId, { type }),
    onSuccess: (res) => setResult({ ok: true, data: res.data }),
    onError: (error) => setResult({ ok: false, message: error?.response?.data?.error || error.message }),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userId.trim()) return;
    setResult(null);
    verifyMutation.mutate();
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
        <Fingerprint className="w-7 h-7" /> Biometric Authentication
      </h1>
      <p className="text-gray-600 mb-6">Record a biometric verification event for a beneficiary or applicant.</p>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">User / Farmer ID</label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Enter user ID"
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Biometric Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-4 py-2 border rounded-lg">
            {BIOMETRIC_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <button
          type="submit"
          disabled={verifyMutation.isPending}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {verifyMutation.isPending ? 'Verifying...' : 'Verify Biometric'}
        </button>
      </form>

      {result && (
        <div className={`mt-4 p-4 rounded-lg flex items-start gap-2 ${result.ok ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {result.ok ? <CheckCircle2 className="w-5 h-5 mt-0.5" /> : <XCircle className="w-5 h-5 mt-0.5" />}
          {result.ok ? (
            <div>
              <div className="font-medium">Biometric verified</div>
              <div className="text-sm">Verification ID: {result.data?.data?.verification_id || result.data?.verification_id || 'N/A'}</div>
            </div>
          ) : (
            <div className="text-sm">{result.message}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default BiometricAuthentication;
