'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  Server,
  Database,
  Cloud,
  Lock,
  Wifi,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Clock,
  Zap,
  MessageSquare,
  Mail,
  CreditCard,
  FileText,
  Loader2,
} from 'lucide-react';
import { api } from '@/lib/api';

interface ServiceStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  latency?: number;
  lastCheck: string;
  message?: string;
  icon: any;
}

interface JobStatus {
  name: string;
  status: 'running' | 'completed' | 'failed' | 'scheduled';
  lastRun?: string;
  nextRun?: string;
  message?: string;
}

interface ErrorLog {
  message: string;
  source: string;
  timestamp: string;
  stack?: string;
}

export default function SystemHealthPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: health, refetch, isLoading } = useQuery({
    queryKey: ['system-health'],
    queryFn: () => api.getSystemHealth(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  // Mock data for demo
  const services: ServiceStatus[] = health?.services || [
    { name: 'API Server', status: 'healthy', latency: 45, lastCheck: '2024-01-15T10:30:00Z', icon: Server },
    { name: 'Database', status: 'healthy', latency: 12, lastCheck: '2024-01-15T10:30:00Z', icon: Database },
    { name: 'Redis Cache', status: 'healthy', latency: 3, lastCheck: '2024-01-15T10:30:00Z', icon: Zap },
    { name: 'Track PMS', status: 'healthy', latency: 234, lastCheck: '2024-01-15T10:30:00Z', icon: Cloud },
    { name: 'RemoteLock', status: 'degraded', latency: 1250, lastCheck: '2024-01-15T10:30:00Z', message: 'High latency detected', icon: Lock },
    { name: 'SignalR Hub', status: 'healthy', latency: 28, lastCheck: '2024-01-15T10:30:00Z', icon: Wifi },
    { name: 'Azure OpenAI', status: 'healthy', latency: 890, lastCheck: '2024-01-15T10:30:00Z', icon: MessageSquare },
    { name: 'Twilio SMS', status: 'healthy', latency: 156, lastCheck: '2024-01-15T10:30:00Z', icon: Mail },
    { name: 'Stripe', status: 'healthy', latency: 112, lastCheck: '2024-01-15T10:30:00Z', icon: CreditCard },
    { name: 'Sanity CMS', status: 'healthy', latency: 89, lastCheck: '2024-01-15T10:30:00Z', icon: FileText },
  ];

  const jobs: JobStatus[] = health?.jobs || [
    { name: 'Reservation Sync', status: 'completed', lastRun: '2024-01-15T10:25:00Z', nextRun: '2024-01-15T10:35:00Z' },
    { name: 'Device Code Generation', status: 'running', lastRun: '2024-01-15T10:28:00Z' },
    { name: 'Loyalty Points Calculation', status: 'scheduled', nextRun: '2024-01-16T00:00:00Z' },
    { name: 'Review Request Emails', status: 'completed', lastRun: '2024-01-15T09:00:00Z', nextRun: '2024-01-16T09:00:00Z' },
    { name: 'Weather Data Fetch', status: 'completed', lastRun: '2024-01-15T10:00:00Z', nextRun: '2024-01-15T11:00:00Z' },
    { name: 'Analytics Aggregation', status: 'failed', lastRun: '2024-01-15T06:00:00Z', message: 'Timeout after 300s' },
  ];

  const healthyCount = services.filter(s => s.status === 'healthy').length;
  const overallStatus = services.every(s => s.status === 'healthy') ? 'healthy' :
    services.some(s => s.status === 'down') ? 'down' : 'degraded';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Health</h1>
          <p className="text-gray-500">Monitor integrations and background jobs</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing || isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Overall Status Banner */}
      <div
        className={`p-6 rounded-xl ${
          overallStatus === 'healthy'
            ? 'bg-green-50 border border-green-200'
            : overallStatus === 'degraded'
            ? 'bg-amber-50 border border-amber-200'
            : 'bg-red-50 border border-red-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center ${
                overallStatus === 'healthy'
                  ? 'bg-green-500'
                  : overallStatus === 'degraded'
                  ? 'bg-amber-500'
                  : 'bg-red-500'
              }`}
            >
              {overallStatus === 'healthy' ? (
                <CheckCircle2 className="w-8 h-8 text-white" />
              ) : overallStatus === 'degraded' ? (
                <AlertTriangle className="w-8 h-8 text-white" />
              ) : (
                <XCircle className="w-8 h-8 text-white" />
              )}
            </div>
            <div>
              <h2
                className={`text-xl font-bold ${
                  overallStatus === 'healthy'
                    ? 'text-green-800'
                    : overallStatus === 'degraded'
                    ? 'text-amber-800'
                    : 'text-red-800'
                }`}
              >
                {overallStatus === 'healthy'
                  ? 'All Systems Operational'
                  : overallStatus === 'degraded'
                  ? 'Partial Service Degradation'
                  : 'System Outage Detected'}
              </h2>
              <p
                className={
                  overallStatus === 'healthy'
                    ? 'text-green-700'
                    : overallStatus === 'degraded'
                    ? 'text-amber-700'
                    : 'text-red-700'
                }
              >
                {healthyCount} of {services.length} services healthy
              </p>
            </div>
          </div>
          <div className="text-right text-sm text-gray-500">
            <p>Last updated</p>
            <p className="font-medium">{new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">External Services & Integrations</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => (
            <ServiceCard key={service.name} service={service} />
          ))}
        </div>
      </div>

      {/* Background Jobs */}
      <div className="card">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Background Jobs</h3>
          <span className="text-sm text-gray-500">
            {jobs.filter(j => j.status === 'running').length} running
          </span>
        </div>
        <div className="divide-y">
          {jobs.map((job) => (
            <JobRow key={job.name} job={job} />
          ))}
        </div>
      </div>

      {/* Error Log */}
      <div className="card">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Recent Errors</h3>
        </div>
        <div className="divide-y">
          {((health?.recentErrors || mockErrors) as ErrorLog[]).map((error, i) => (
            <div key={i} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-gray-900">{error.message}</p>
                  <p className="text-sm text-gray-500">{error.source}</p>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(error.timestamp).toLocaleString()}
                </span>
              </div>
              {error.stack && (
                <pre className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded overflow-x-auto">
                  {error.stack}
                </pre>
              )}
            </div>
          ))}
          {(!health?.recentErrors || health.recentErrors.length === 0) && mockErrors.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-400" />
              <p>No recent errors</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ServiceCard({ service }: { service: ServiceStatus }) {
  const Icon = service.icon || Activity;

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              service.status === 'healthy'
                ? 'bg-green-100'
                : service.status === 'degraded'
                ? 'bg-amber-100'
                : 'bg-red-100'
            }`}
          >
            <Icon
              className={`w-5 h-5 ${
                service.status === 'healthy'
                  ? 'text-green-600'
                  : service.status === 'degraded'
                  ? 'text-amber-600'
                  : 'text-red-600'
              }`}
            />
          </div>
          <div>
            <p className="font-medium text-gray-900">{service.name}</p>
            <p className="text-xs text-gray-500">
              {service.latency && `${service.latency}ms`}
            </p>
          </div>
        </div>
        <StatusBadge status={service.status} />
      </div>
      {service.message && (
        <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded">{service.message}</p>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: 'healthy' | 'degraded' | 'down' }) {
  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full ${
        status === 'healthy'
          ? 'bg-green-100 text-green-700'
          : status === 'degraded'
          ? 'bg-amber-100 text-amber-700'
          : 'bg-red-100 text-red-700'
      }`}
    >
      {status === 'healthy' ? 'Healthy' : status === 'degraded' ? 'Degraded' : 'Down'}
    </span>
  );
}

function JobRow({ job }: { job: JobStatus }) {
  return (
    <div className="p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            job.status === 'running'
              ? 'bg-blue-100'
              : job.status === 'completed'
              ? 'bg-green-100'
              : job.status === 'failed'
              ? 'bg-red-100'
              : 'bg-gray-100'
          }`}
        >
          {job.status === 'running' ? (
            <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
          ) : job.status === 'completed' ? (
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          ) : job.status === 'failed' ? (
            <XCircle className="w-4 h-4 text-red-600" />
          ) : (
            <Clock className="w-4 h-4 text-gray-500" />
          )}
        </div>
        <div>
          <p className="font-medium text-gray-900">{job.name}</p>
          {job.message && (
            <p className="text-sm text-red-600">{job.message}</p>
          )}
        </div>
      </div>
      <div className="text-right text-sm">
        {job.lastRun && (
          <p className="text-gray-500">
            Last: {new Date(job.lastRun).toLocaleTimeString()}
          </p>
        )}
        {job.nextRun && (
          <p className="text-gray-400">
            Next: {new Date(job.nextRun).toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
}

const mockErrors = [
  {
    message: 'Failed to sync reservation #12345',
    source: 'ReservationSyncJob',
    timestamp: '2024-01-15T10:15:00Z',
    stack: 'Error: Track PMS timeout\n  at SyncService.sync (sync.ts:45)',
  },
  {
    message: 'RemoteLock API rate limit exceeded',
    source: 'DeviceCodeGenerationJob',
    timestamp: '2024-01-15T09:30:00Z',
  },
];
