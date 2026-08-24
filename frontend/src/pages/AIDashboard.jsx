import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Sparkles } from 'lucide-react'
import { aiBackboneAPI } from '../services/api'
import toast from 'react-hot-toast'

/** AI Backbone — real backend at backend/src/routes/aiBackboneRoutes.js
 *  (Claude/ChatGPT/Gemini/Azure/Hugging Face integration). */
function AIDashboard() {
  const [prompt, setPrompt] = useState('')
  const [result, setResult] = useState(null)

  const { data: status, isLoading, error } = useQuery({
    queryKey: ['ai-backbone-status'],
    queryFn: async () => (await aiBackboneAPI.getAIProviderStatus()).data,
  })

  const callMutation = useMutation({
    mutationFn: (data) => aiBackboneAPI.callAI(data),
    onSuccess: (res) => { setResult(res.data); toast.success('AI call complete') },
    onError: (err) => toast.error(err?.response?.data?.error || 'AI call failed'),
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
          <Sparkles className="w-6 h-6 mr-2 text-indigo-600" />
          AI Dashboard
        </h1>
        <p className="text-gray-600">Provider status and a direct call console — real backend at /ai-backbone</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="font-semibold text-gray-800 mb-3">Provider status</h3>
        {isLoading && <div className="animate-pulse h-16 bg-gray-200 rounded" />}
        {error && <div className="text-red-600 text-sm">Error: {error.message}</div>}
        {status && <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto">{JSON.stringify(status, null, 2)}</pre>}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold text-gray-800 mb-3">Call AI</h3>
        <form
          onSubmit={(e) => { e.preventDefault(); if (!prompt) { toast.error('Prompt is required'); return } callMutation.mutate({ prompt }) }}
          className="space-y-4"
        >
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            placeholder="Ask the configured AI provider a question..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
          <button type="submit" disabled={callMutation.isPending} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-60">
            {callMutation.isPending ? 'Calling...' : 'Call AI'}
          </button>
        </form>
        {result && <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto mt-4">{JSON.stringify(result, null, 2)}</pre>}
      </div>
    </div>
  )
}

export default AIDashboard
