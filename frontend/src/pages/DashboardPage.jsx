import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Link2, BarChart3, TrendingUp, Calendar, ChevronRight, Loader2, ArrowUpRight, Sparkles, Copy, Check, Globe, Tag } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import urlService from '../services/urlService';
import StatCard from '../components/ui/StatCard';
import LinkModal from '../components/dashboard/LinkModal';
import DashboardLayout from '../components/layout/DashboardLayout';
import { formatNumber, timeAgo } from '../utils/formatters';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Quick Shorten states
  const [quickUrl, setQuickUrl] = useState('');
  const [quickAlias, setQuickAlias] = useState('');
  const [quickLoading, setQuickLoading] = useState(false);
  const [quickResult, setQuickResult] = useState(null);
  const [quickCopied, setQuickCopied] = useState(false);

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

  const handleQuickShorten = async (e) => {
    e.preventDefault();
    if (!quickUrl.trim()) return;
    if (!/^https?:\/\//i.test(quickUrl)) {
      toast.error('URL must start with http:// or https://');
      return;
    }

    setQuickLoading(true);
    try {
      const response = await urlService.create({
        originalUrl: quickUrl,
        customAlias: quickAlias || undefined
      });
      toast.success('Link shortened successfully!');
      setQuickResult(response.data.url);
      setQuickUrl('');
      setQuickAlias('');
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to shorten link');
    } finally {
      setQuickLoading(false);
    }
  };

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

        {/* Quick Shorten Widget */}
        <div className="bg-surface-900 border border-surface-700 rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-400 animate-pulse-slow" /> Quick Shorten
          </h3>
          
          {quickResult ? (
            <div className="bg-surface-950/60 border border-surface-800 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-scale-in">
              <div className="flex-1 min-w-0 text-left space-y-1">
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  Ready!
                </span>
                <p className="text-sm text-gray-400 truncate mt-1">Shortened URL:</p>
                <p className="text-base font-bold text-brand-400 truncate">{quickResult.shortUrl}</p>
                <p className="text-xs text-gray-500 truncate">Destination: {quickResult.originalUrl}</p>
              </div>
              
              <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(quickResult.shortUrl);
                    setQuickCopied(true);
                    toast.success('Copied shortened link!');
                    setTimeout(() => setQuickCopied(false), 2000);
                  }}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 bg-surface-800 hover:bg-surface-750 text-gray-300 hover:text-white rounded-xl border border-surface-700 text-sm font-semibold transition-all cursor-pointer"
                >
                  {quickCopied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" /> Copy Link
                    </>
                  )}
                </button>
                <button
                  onClick={() => setQuickResult(null)}
                  className="flex-1 sm:flex-initial px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-semibold transition-all cursor-pointer"
                >
                  Shorten Another
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleQuickShorten} className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Paste long URL (e.g. https://...)"
                  value={quickUrl}
                  onChange={(e) => setQuickUrl(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-surface-950 border border-surface-700 rounded-xl text-white placeholder-gray-550 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm font-medium"
                />
              </div>
              
              <div className="relative lg:w-72">
                <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Custom alias (optional)"
                  value={quickAlias}
                  onChange={(e) => setQuickAlias(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-surface-950 border border-surface-700 rounded-xl text-white placeholder-gray-550 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={quickLoading || !quickUrl.trim()}
                className="py-3 px-6 bg-brand-500 hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 shrink-0 text-sm cursor-pointer"
              >
                {quickLoading ? (
                  <>
                    <Loader2 className="w-4.5 h-4.5 animate-spin" /> Shortening...
                  </>
                ) : (
                  <>
                    Shorten
                  </>
                )}
              </button>
            </form>
          )}
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
