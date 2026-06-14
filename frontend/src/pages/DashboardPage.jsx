import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Link2, BarChart3, TrendingUp, Calendar, ChevronRight, Loader2, ArrowUpRight } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import urlService from '../../services/urlService';
import StatCard from '../../components/ui/StatCard';
import LinkModal from '../../components/dashboard/LinkModal';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { formatNumber, timeAgo } from '../../utils/formatters';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await urlService.getStats();
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-[70vh] flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  // Fallback for daily trends if empty
  const chartData = stats?.dailyClicks?.map(item => ({
    date: new Date(item._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    clicks: item.clicks,
  })) || [];

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Overview</h2>
            <p className="text-gray-400 mt-1">Here is how your short links are performing.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 self-start sm:self-auto bg-brand-500 hover:bg-brand-600 text-white font-semibold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-brand-500/10 hover:shadow-brand-500/20"
          >
            <Plus className="w-5 h-5" />
            Create Link
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard label="Total Links" value={stats?.totalLinks || 0} icon={Link2} color="brand" delay={0} />
          <StatCard label="Total Clicks" value={stats?.totalClicks || 0} icon={TrendingUp} color="emerald" delay={100} />
          <StatCard label="Active Links" value={stats?.activeLinks || 0} icon={Calendar} color="amber" delay={200} />
          <StatCard label="Clicks Today" value={stats?.clicksToday || 0} icon={BarChart3} color="cyan" delay={300} />
        </div>

        {/* Chart Section */}
        <div className="bg-surface-900 border border-surface-700 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">Click Analytics (Last 30 Days)</h3>
          {chartData.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#818cf8" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#23233b" />
                  <XAxis dataKey="date" stroke="#6b7280" fontSize={12} tickLine={false} />
                  <YAxis stroke="#6b7280" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1c1c30', borderColor: 'rgba(99, 102, 241, 0.15)', borderRadius: '12px' }}
                    labelStyle={{ color: '#9ca3af' }}
                    itemStyle={{ color: '#818cf8' }}
                  />
                  <Area type="monotone" dataKey="clicks" stroke="#818cf8" strokeWidth={2} fillOpacity={1} fill="url(#colorClicks)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-gray-500 border border-dashed border-surface-700 rounded-xl">
              No click data available yet.
            </div>
          )}
        </div>

        {/* Top Links & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Links */}
          <div className="bg-surface-900 border border-surface-700 rounded-2xl p-6 flex flex-col">
            <h3 className="text-lg font-bold text-white mb-4">Top Links</h3>
            <div className="flex-1 space-y-4">
              {stats?.topLinks?.length > 0 ? (
                stats.topLinks.map((link) => (
                  <div key={link._id} className="flex items-center justify-between p-3 bg-surface-950/50 border border-surface-800 rounded-xl">
                    <div className="min-w-0 pr-4">
                      <p className="text-sm font-semibold text-white truncate">{link.customAlias || link.shortCode}</p>
                      <p className="text-xs text-gray-500 truncate">{link.originalUrl}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-brand-400">{formatNumber(link.totalClicks)} clicks</span>
                      <button
                        onClick={() => navigate(`/analytics/${link._id}`)}
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-surface-800 rounded-lg transition-colors"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500 py-12">
                  No links created yet.
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-surface-900 border border-surface-700 rounded-2xl p-6 flex flex-col">
            <h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>
            <div className="flex-1 space-y-4">
              {stats?.recentActivity?.length > 0 ? (
                stats.recentActivity.map((activity) => (
                  <div key={activity._id} className="flex items-center justify-between p-3 bg-surface-950/50 border border-surface-800 rounded-xl">
                    <div className="min-w-0 pr-4">
                      <p className="text-sm font-semibold text-white">
                        Click on <span className="text-brand-400">{activity.urlId?.shortCode}</span>
                      </p>
                      <p className="text-xs text-gray-500">
                        {activity.browser} on {activity.device} • {activity.country}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 font-medium">{timeAgo(activity.visitedAt)}</span>
                  </div>
                ))
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500 py-12">
                  No activity recorded yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Link Creation Modal */}
        <LinkModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={fetchStats} />
      </div>
    </DashboardLayout>
  );
}
