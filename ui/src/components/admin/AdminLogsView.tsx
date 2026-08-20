'use client';

import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { 
  FileText, 
  RefreshCw, 
  Search, 
  Filter, 
  Eye, 
  X, 
  ShieldCheck, 
  Clock, 
  Calendar,
  AlertCircle 
} from 'lucide-react';

interface AuditLogEntry {
  id: string;
  admin_id: string;
  admin_email: string;
  action: string;
  target_resource: string;
  target_id: string | null;
  details: Record<string, any>;
  ip_address: string | null;
  created_at: string;
}

export const AdminLogsView: React.FC = () => {
  const { adminFetch } = useAdminAuth();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  const fetchLogs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (actionFilter !== 'all') params.append('action', actionFilter);
      params.append('limit', '100');

      const res = await adminFetch(`/api/admin/logs?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
      } else {
        throw new Error(data.error || 'Failed to fetch logs');
      }
    } catch (err: any) {
      console.error('Error in AdminLogsView:', err);
      setError(err.message || 'Failed to load audit trail.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Administrative Audit Logs</h1>
          <p className="text-sm text-slate-400">Immutable record of administrative security events and role modifications</p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
          Refresh Logs
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3">
        <div className="w-64">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Action Types</option>
            <option value="SET_ADMIN_ROLE">SET_ADMIN_ROLE</option>
            <option value="REVOKE_ADMIN_ROLE">REVOKE_ADMIN_ROLE</option>
            <option value="MAINTENANCE_TOGGLE">MAINTENANCE_TOGGLE</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        {isLoading && logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <RefreshCw className="w-7 h-7 animate-spin text-emerald-500 mb-2" />
            <p className="text-xs">Fetching audit trail...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <FileText className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <p className="text-sm font-medium text-slate-400">No audit log entries recorded</p>
            <p className="text-xs text-slate-600 mt-1">Actions performed by admins will automatically appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 uppercase tracking-wider text-slate-400 border-b border-slate-800 font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Timestamp</th>
                  <th className="px-4 py-3.5">Administrator</th>
                  <th className="px-4 py-3.5">Action</th>
                  <th className="px-4 py-3.5">Target Resource</th>
                  <th className="px-4 py-3.5">Target ID</th>
                  <th className="px-5 py-3.5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-medium text-white">
                      {log.admin_email || log.admin_id.substring(0, 8)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[11px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300 font-mono text-[11px]">
                      {log.target_resource}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                      {log.target_id ? `${log.target_id.substring(0, 12)}...` : '—'}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors text-[11px]"
                      >
                        <Eye className="w-3 h-3" /> Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* JSON Inspection Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" /> Audit Event Payload
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1.5 text-slate-500 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Action:</span>
                <span className="font-mono text-emerald-400">{selectedLog.action}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Admin Email:</span>
                <span className="text-white">{selectedLog.admin_email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Timestamp:</span>
                <span className="text-slate-300">{new Date(selectedLog.created_at).toISOString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Target Resource:</span>
                <span className="text-slate-300">{selectedLog.target_resource}</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-300 block mb-1">Details JSON</span>
              <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-60">
                {JSON.stringify(selectedLog.details, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
