import { useState, useEffect } from 'react';
import axiosClient from '../utils/axiosClient';
import { Code2, CheckCircle2, XCircle, AlertCircle, Clock } from 'lucide-react';

const CODE_BG = '#2a2c30';

const SubmissionHistory = ({ problemId }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const response = await axiosClient.get(`/problem/submittedProblem/${problemId}`);
        
        // Filter out invalid/placeholder submissions returned by the API
        const validSubmissions = Array.isArray(response.data)
          ? response.data.filter((sub) => sub && sub._id && sub.createdAt && sub.status)
          : [];

        setSubmissions(validSubmissions);
        setError(null);
      } catch (err) {
        setError('Failed to fetch submission history');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [problemId]);

  const getStatusStyles = (status) => {
    switch (status) {
      case 'accepted':
        return {
          Icon: CheckCircle2,
          pill: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30',
        };
      case 'wrong':
        return {
          Icon: XCircle,
          pill: 'text-rose-300 bg-rose-500/15 border-rose-500/30',
        };
      case 'error':
        return {
          Icon: AlertCircle,
          pill: 'text-amber-300 bg-amber-500/15 border-amber-500/30',
        };
      case 'pending':
        return {
          Icon: Clock,
          pill: 'text-sky-300 bg-sky-500/15 border-sky-500/30',
        };
      default:
        return {
          Icon: AlertCircle,
          pill: 'text-slate-300 bg-white/5 border-white/10',
        };
    }
  };

  const formatMemory = (memory) => {
    if (!memory) return '—';
    if (memory < 1024) return `${memory} kB`;
    return `${(memory / 1024).toFixed(2)} MB`;
  };

  // Compact relative time: "2m ago", "3h ago", "2d ago", or a short date if older
  const formatRelative = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  };

  // Sort newest first
  const sortedSubmissions = [...submissions].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40 text-slate-400 text-sm">
        Loading submissions...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-sm text-rose-300">
        {error}
      </div>
    );
  }

  if (sortedSubmissions.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-6 text-center text-sm text-slate-400">
        No submissions yet for this problem.
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Compact list — one card per submission, fits narrow left panel */}
      <div className="space-y-2">
        {sortedSubmissions.map((sub, index) => {
          const { Icon, pill } = getStatusStyles(sub.status);
          return (
            <div
              key={sub._id}
              className="rounded-xl border border-white/10 bg-white/5 p-3 transition-colors duration-150 hover:bg-white/[0.07]"
            >
              {/* Row 1: status pill + language + time */}
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${pill}`}
                >
                  <Icon size={12} />
                  {sub.status}
                </span>

                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-xs text-slate-300">
                  {sub.language}
                </span>

                <span className="ml-auto text-xs text-slate-500">
                  {formatRelative(sub.createdAt)}
                </span>
              </div>

              {/* Row 2: stats + code button */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-400">
                <span>
                  <span className="text-slate-500">Runtime: </span>
                  <span className="font-mono text-slate-300">{sub.runtime ?? 0}s</span>
                </span>
                <span>
                  <span className="text-slate-500">Memory: </span>
                  <span className="font-mono text-slate-300">{formatMemory(sub.memory)}</span>
                </span>
                <span>
                  <span className="text-slate-500">Tests: </span>
                  <span className="font-mono text-slate-300">
                    {sub.testCasesPassed}/{sub.testCasesTotal}
                  </span>
                </span>

                <button
                  onClick={() => setSelectedSubmission(sub)}
                  className="ml-auto flex cursor-pointer items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-slate-200 transition-colors duration-150 hover:border-emerald-400/30 hover:bg-emerald-500/10 hover:text-emerald-300"
                >
                  <Code2 size={12} /> Code
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-center text-xs text-slate-500">
        Showing {sortedSubmissions.length} submission{sortedSubmissions.length !== 1 ? 's' : ''}
      </p>

      {/* Code view modal */}
      {selectedSubmission && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setSelectedSubmission(null)}
        >
          <div
            className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/10 shadow-2xl"
            style={{ backgroundColor: '#2a2c30' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
              <h3 className="text-base font-semibold text-slate-100">
                Submission · {selectedSubmission.language}
              </h3>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="cursor-pointer rounded-lg px-2.5 py-1 text-sm text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                Close
              </button>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap items-center gap-2 border-b border-white/10 px-5 py-3">
              {(() => {
                const { Icon, pill } = getStatusStyles(selectedSubmission.status);
                return (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${pill}`}
                  >
                    <Icon size={12} />
                    {selectedSubmission.status}
                  </span>
                );
              })()}
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300">
                Runtime: <span className="font-mono">{selectedSubmission.runtime ?? 0}s</span>
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300">
                Memory: <span className="font-mono">{formatMemory(selectedSubmission.memory)}</span>
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300">
                Passed:{' '}
                <span className="font-mono">
                  {selectedSubmission.testCasesPassed}/{selectedSubmission.testCasesTotal}
                </span>
              </span>
            </div>

            {/* Error message */}
            {selectedSubmission.errorMessage && (
              <div className="border-b border-white/10 bg-rose-500/10 px-5 py-3 text-sm text-rose-300">
                {selectedSubmission.errorMessage}
              </div>
            )}

            {/* Code */}
            <div className="flex-1 overflow-auto" style={{ backgroundColor: CODE_BG }}>
              <pre className="p-5 text-sm text-slate-100">
                <code>{selectedSubmission.code}</code>
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionHistory;