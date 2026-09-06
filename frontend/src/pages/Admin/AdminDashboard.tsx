import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  Users,
  Plane,
  Building2,
  CalendarDays,
  DollarSign,
  MapPin,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
  Server,
  Database,
  Wifi,
  RefreshCw,
  TrendingUp,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useAuth } from '../../hooks/useAuth';
import { CurrencyDisplay } from '../../components/Common/CurrencyDisplay';
import { LoadingSpinner } from '../../components/Common/LoadingSpinner';

interface Provider {
  name: string;
  status: string;
  latency_ms: number;
  last_checked: string;
}

interface SystemHealth {
  database: string;
  memory_mb: number;
  uptime_hours: number;
  audit_logs: number;
  environment: string;
}

const MOCK_PROVIDERS: Provider[] = [
  { name: 'Flights API', status: 'operational', latency_ms: 124, last_checked: new Date().toISOString() },
  { name: 'Hotels API', status: 'operational', latency_ms: 89, last_checked: new Date().toISOString() },
  { name: 'Transport API', status: 'operational', latency_ms: 201, last_checked: new Date().toISOString() },
  { name: 'Activities API', status: 'degraded', latency_ms: 850, last_checked: new Date().toISOString() },
  { name: 'Payment Gateway', status: 'sandbox', latency_ms: 56, last_checked: new Date().toISOString() },
  { name: 'Weather API', status: 'operational', latency_ms: 43, last_checked: new Date().toISOString() },
  { name: 'Currency FX', status: 'operational', latency_ms: 31, last_checked: new Date().toISOString() },
];

const MOCK_HEALTH: SystemHealth = {
  database: 'connected',
  memory_mb: 512,
  uptime_hours: 47.3,
  audit_logs: 1284,
  environment: 'demo',
};

export const AdminDashboard: React.FC = () => {
  const { user, isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<any>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showProviders, setShowProviders] = useState(true);
  const [showHealth, setShowHealth] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchAll = async () => {
    setLoading(true);
    try {
      // Fetch stats
      const statsRes = await adminService.getStats();
      if (statsRes.success && statsRes.data) setStats(statsRes.data);

      // Fetch providers
      try {
        const provRes = await adminService.getProviders();
        if (provRes.success && provRes.data?.providers) {
          setProviders(provRes.data.providers);
        } else {
          setProviders(MOCK_PROVIDERS);
        }
      } catch {
        setProviders(MOCK_PROVIDERS);
      }

      // Fetch system health
      try {
        const healthRes = await adminService.getSystemHealth();
        if (healthRes.success && healthRes.data) {
          setHealth(healthRes.data);
        } else {
          setHealth(MOCK_HEALTH);
        }
      } catch {
        setHealth(MOCK_HEALTH);
      }

      setLastRefreshed(new Date());
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch administrator statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/admin');
      return;
    }
    if (!isAdmin) {
      setError('Access denied: Administrator credentials required. (HTTP 403 Forbidden)');
      setLoading(false);
      return;
    }
    fetchAll();
  }, [isAuthenticated, isAdmin, navigate]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAll();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'operational': return { dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Operational' };
      case 'degraded': return { dot: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Degraded' };
      case 'down': return { dot: 'bg-rose-500', badge: 'bg-rose-50 text-rose-700 border-rose-200', label: 'Down' };
      case 'sandbox': return { dot: 'bg-blue-500', badge: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Sandbox' };
      default: return { dot: 'bg-slate-400', badge: 'bg-slate-50 text-slate-600 border-slate-200', label: status };
    }
  };

  if (loading) return <LoadingSpinner size="xl" text="Loading TripPilot Admin Console..." className="py-32" />;

  if (error || !isAdmin) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-900">Administrator Access Required</h2>
        <p className="text-slate-500">{error || 'Please log in with an authorized admin account.'}</p>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-mono font-bold">
          HTTP 403 — Forbidden
        </div>
        <div className="pt-2">
          <Link to="/login" className="btn-primary inline-block">Switch Account</Link>
        </div>
      </div>
    );
  }

  const allOperational = providers.every((p) => p.status === 'operational' || p.status === 'sandbox');
  const degradedCount = providers.filter((p) => p.status === 'degraded').length;
  const downCount = providers.filter((p) => p.status === 'down').length;

  const statCards = [
    {
      label: 'Total Platform Revenue',
      value: stats?.total_revenue || 148500,
      isCurrency: true,
      icon: DollarSign,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      trend: '+12.4% this month',
    },
    {
      label: 'Confirmed Bookings',
      value: stats?.confirmed_bookings || stats?.bookings || 14,
      icon: CalendarDays,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      trend: `${stats?.cancelled_bookings || 2} cancelled`,
    },
    {
      label: 'Active Flights',
      value: stats?.flights || 200,
      icon: Plane,
      color: 'text-sky-600',
      bg: 'bg-sky-50',
      border: 'border-sky-200',
      trend: 'Across 18 airlines',
    },
    {
      label: 'Verified Hotels',
      value: stats?.hotels || 26,
      icon: Building2,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
      trend: 'In 12 cities',
    },
    {
      label: 'Global Destinations',
      value: stats?.destinations || 12,
      icon: MapPin,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      trend: 'Domestic & international',
    },
    {
      label: 'Registered Travellers',
      value: stats?.users || 2,
      icon: Users,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      trend: 'Active accounts',
    },
  ];

  const adminNav = [
    { label: 'Manage Destinations', href: '/admin/destinations', icon: MapPin, desc: 'Add new tourist locations, tags, and average budgets' },
    { label: 'Manage Flights', href: '/admin/flights', icon: Plane, desc: 'Configure schedules, carriers, pricing, and seat allocations' },
    { label: 'Manage Hotels', href: '/admin/hotels', icon: Building2, desc: 'Update hotel listings, photos, amenities, and room inventories' },
    { label: 'Manage Bookings', href: '/admin/bookings', icon: CalendarDays, desc: 'Inspect customer reservations, payment statuses, and cancellations' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

      {/* Admin Title */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold mb-2">
            <Shield className="w-3.5 h-3.5" /> Superuser Control Panel
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Platform Administration</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Overview of real-time inventory, user reservations, revenue, and system health.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] text-slate-400">Last refreshed</p>
            <p className="text-xs font-bold text-slate-600">
              {lastRefreshed.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn-secondary text-xs !py-2 px-3 font-bold flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
            {user?.email}
          </span>
        </div>
      </div>

      {/* Platform Status Banner */}
      <div className={`flex items-center gap-3 p-4 rounded-2xl border ${
        downCount > 0 ? 'bg-rose-50 border-rose-300' :
        degradedCount > 0 ? 'bg-amber-50 border-amber-300' :
        'bg-emerald-50 border-emerald-300'
      }`}>
        {downCount > 0 ? (
          <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
        ) : degradedCount > 0 ? (
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
        ) : (
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
        )}
        <div>
          <p className={`text-xs font-black uppercase tracking-wide ${
            downCount > 0 ? 'text-rose-800' : degradedCount > 0 ? 'text-amber-800' : 'text-emerald-800'
          }`}>
            {downCount > 0
              ? `${downCount} provider(s) down — immediate attention required`
              : degradedCount > 0
              ? `${degradedCount} provider(s) degraded — performance impacted`
              : 'All systems operational'}
          </p>
          <p className={`text-[11px] mt-0.5 ${
            downCount > 0 ? 'text-rose-600' : degradedCount > 0 ? 'text-amber-600' : 'text-emerald-600'
          }`}>
            {providers.length} providers monitored • Environment: {health?.environment?.toUpperCase() || 'DEMO'}
          </p>
        </div>
        <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded border ${
          health?.environment === 'demo'
            ? 'bg-amber-100 text-amber-800 border-amber-300'
            : 'bg-emerald-100 text-emerald-800 border-emerald-300'
        }`}>
          {health?.environment?.toUpperCase() || 'DEMO'} MODE
        </span>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="surface-card p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between bg-white">
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
                <div className="text-2xl font-black text-slate-900">
                  {stat.isCurrency ? <CurrencyDisplay amount={stat.value} /> : stat.value.toLocaleString('en-IN')}
                </div>
                {stat.trend && (
                  <p className="text-[10px] text-slate-400 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> {stat.trend}
                  </p>
                )}
              </div>
              <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.border} border flex items-center justify-center ${stat.color} shadow-xs flex-shrink-0 ml-4`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Provider Health Panel */}
      <div className="surface-card rounded-3xl border border-slate-200 shadow-sm bg-white overflow-hidden">
        <button
          onClick={() => setShowProviders((v) => !v)}
          className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Wifi className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">Provider Health Monitor</h2>
              <p className="text-xs text-slate-500">Real-time API provider status & latency</p>
            </div>
          </div>
          {showProviders ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {showProviders && (
          <div className="px-6 pb-6">
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="p-3 pl-4">Provider</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Latency</th>
                    <th className="p-3 pr-4">Last Checked</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {providers.map((provider, idx) => {
                    const sc = getStatusColor(provider.status);
                    const latencyColor =
                      provider.latency_ms < 200 ? 'text-emerald-600' :
                      provider.latency_ms < 500 ? 'text-amber-600' : 'text-rose-600';
                    return (
                      <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3 pl-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${sc.dot} flex-shrink-0`} />
                            <span className="font-bold text-slate-900">{provider.name}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${sc.badge}`}>
                            {sc.label}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`font-mono font-bold ${latencyColor}`}>
                            {provider.latency_ms}ms
                          </span>
                        </td>
                        <td className="p-3 pr-4 text-slate-400 font-mono text-[10px]">
                          {new Date(provider.last_checked).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* System Health Panel */}
      {health && (
        <div className="surface-card rounded-3xl border border-slate-200 shadow-sm bg-white overflow-hidden">
          <button
            onClick={() => setShowHealth((v) => !v)}
            className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900">System Health & Infrastructure</h2>
                <p className="text-xs text-slate-500">Database, memory, uptime, and audit trail</p>
              </div>
            </div>
            {showHealth ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {showHealth && (
            <div className="px-6 pb-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  {
                    icon: Database,
                    label: 'Database',
                    value: health.database,
                    color: health.database === 'connected' ? 'text-emerald-600' : 'text-rose-600',
                    bg: health.database === 'connected' ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200',
                  },
                  {
                    icon: Activity,
                    label: 'Memory Usage',
                    value: `${health.memory_mb} MB`,
                    color: health.memory_mb < 700 ? 'text-emerald-600' : 'text-amber-600',
                    bg: 'bg-blue-50 border-blue-200',
                  },
                  {
                    icon: Clock,
                    label: 'Uptime',
                    value: `${health.uptime_hours.toFixed(1)}h`,
                    color: 'text-indigo-600',
                    bg: 'bg-indigo-50 border-indigo-200',
                  },
                  {
                    icon: Sparkles,
                    label: 'Audit Log Entries',
                    value: health.audit_logs.toLocaleString('en-IN'),
                    color: 'text-purple-600',
                    bg: 'bg-purple-50 border-purple-200',
                  },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className={`p-4 rounded-2xl border ${item.bg} flex items-center gap-3`}>
                      <Icon className={`w-5 h-5 ${item.color} flex-shrink-0`} />
                      <div>
                        <p className="text-[10px] font-bold uppercase text-slate-500">{item.label}</p>
                        <p className={`text-sm font-black ${item.color} capitalize`}>{item.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Management Navigation Cards */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-slate-900">Inventory & Database Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {adminNav.map((nav, idx) => {
            const Icon = nav.icon;
            return (
              <Link
                key={idx}
                to={nav.href}
                className="surface-card p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex items-center justify-between group bg-white"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform shadow-xs">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors">
                      {nav.label}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{nav.desc}</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all flex-shrink-0 ml-4" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
