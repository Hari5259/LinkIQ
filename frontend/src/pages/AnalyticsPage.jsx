import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Calendar, Globe, AlertCircle, Loader2, Play } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import analyticsService from '../../services/analyticsService';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { formatDate, timeAgo } from '../../utils/formatters';
import toast from 'react-hot-toast';

const COLORS = ['#818cf8', '#34d399', '#fb7185', '#fbbf24', '#22d3ee', '#a78bfa'];

export default function AnalyticsPage() {
  const { urlId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchAnalytics = async () => {
    try {
      const res = await analyticsService.getAnalytics(urlId);
      setData(res.data);
    } catch (err) {
      toast.error('Failed to load analytics details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [urlId]);

  const handleCopy = () => {
    if (!data?.url?.shortUrl) return;
    navigator.clipboard.writeText(data.url.shortUrl);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
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

  if (!data) {
    return (
      <DashboardLayout>
        <div className="text-center py-20 bg-surface-900 border border-surface-700 rounded-2xl">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Analytics not found</h3>
          <p className="text-gray-400 mb-6">We couldn&apos;t load the analytics for this URL.</p>
          <button onClick={() => navigate('/links')} className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-all">
            Back to Links
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // Pre-process chart data
  const trendData = data.dailyTrend?.map(item => ({
    date: new Date(item._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    clicks: item.clicks,
  })) || [];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Back button & title */}
        <button onClick={() => navigate('/links')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Links
        </button>

        {/* Link Info Box */}
        <div className="bg-surface-900 border border-surface-700 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 min-w-0 flex-1">
            <h2 className="text-2xl font-bold text-white truncate">{data.url.customAlias || data.url.shortCode}</h2>
            <p className="text-gray-400 text-sm flex items-center gap-2 truncate">
              <Globe className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <a href={data.url.originalUrl} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-brand-400 truncate">
                {data.url.originalUrl}
              </a>
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Created {formatDate(data.url.createdAt)}</span>
              {data.url.expiryDate && <span>Expires {formatDate(data.url.expiryDate)}</span>}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-surface-950 border border-surface-800 rounded-xl flex items-center gap-2">
              <span className="text-brand-400 font-semibold text-sm truncate max-w-[180px] sm:max-w-none">{data.url.shortUrl}</span>
              <button onClick={handleCopy} className="text-gray-400 hover:text-white transition-colors">
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <a href={data.url.shortUrl} target="_blank" rel="noreferrer" className="p-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl transition-all shadow-lg shadow-brand-500/10">
              <Play className="w-4 h-4 fill-white" />
            </a>
          </div>
        </div>

        {/* Top metrics summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="bg-surface-900 border border-surface-700 p-5 rounded-2xl">
            <p className="text-xs text-gray-400 font-medium">Total Clicks</p>
            <p className="text-3xl font-bold text-white mt-1">{data.totalClicks}</p>
          </div>
          <div className="bg-surface-900 border border-surface-700 p-5 rounded-2xl">
            <p className="text-xs text-gray-400 font-medium">Last Clicked</p>
            <p className="text-3xl font-bold text-white mt-1">{data.lastVisited ? timeAgo(data.lastVisited) : 'Never'}</p>
          </div>
          <div className="bg-surface-900 border border-surface-700 p-5 rounded-2xl">
            <p className="text-xs text-gray-400 font-medium">Status</p>
            <p className={`text-3xl font-bold mt-1 ${
              data.url.expiryDate && new Date(data.url.expiryDate) < new Date() ? 'text-red-400' : 'text-emerald-400'
            }`}>
              {data.url.expiryDate && new Date(data.url.expiryDate) < new Date() ? 'Expired' : 'Active'}
            </p>
          </div>
        </div>

        {/* Clicks Trend Chart */}
        <div className="bg-surface-900 border border-surface-700 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">Clicks Trend</h3>
          {trendData.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorClicksDetails" x1="0" y1="0" x2="0" y2="1">
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
                  <Area type="monotone" dataKey="clicks" stroke="#818cf8" strokeWidth={2} fillOpacity={1} fill="url(#colorClicksDetails)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-gray-500 border border-dashed border-surface-700 rounded-xl">
              No click history for this link yet.
            </div>
          )}
        </div>

        {/* Breakdowns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Device */}
          <div className="bg-surface-900 border border-surface-700 p-6 rounded-2xl flex flex-col items-center">
            <h3 className="text-base font-bold text-white self-start mb-6">Devices</h3>
            {data.devices?.length > 0 ? (
              <div className="w-full flex flex-col items-center">
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={data.devices} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={3} dataKey="value">
                      {data.devices.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1c1c30', borderRadius: '8px', border: 'none' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="w-full mt-4 space-y-2">
                  {data.devices.map((device, index) => (
                    <div key={device.name} className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="text-gray-300 capitalize">{device.name}</span>
                      </div>
                      <span className="text-white font-bold">{device.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : <p className="text-gray-500 py-12 text-sm">No data</p>}
          </div>

          {/* Browser */}
          <div className="bg-surface-900 border border-surface-700 p-6 rounded-2xl flex flex-col items-center">
            <h3 className="text-base font-bold text-white self-start mb-6">Browsers</h3>
            {data.browsers?.length > 0 ? (
              <div className="w-full flex flex-col items-center">
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={data.browsers} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={3} dataKey="value">
                      {data.browsers.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1c1c30', borderRadius: '8px', border: 'none' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="w-full mt-4 space-y-2">
                  {data.browsers.map((browser, index) => (
                    <div key={browser.name} className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="text-gray-300">{browser.name}</span>
                      </div>
                      <span className="text-white font-bold">{browser.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : <p className="text-gray-500 py-12 text-sm">No data</p>}
          </div>

          {/* Location */}
          <div className="bg-surface-900 border border-surface-700 p-6 rounded-2xl flex flex-col">
            <h3 className="text-base font-bold text-white mb-6">Top Countries</h3>
            {data.countries?.length > 0 ? (
              <div className="space-y-4 flex-1">
                {data.countries.map((country, index) => {
                  const maxCount = Math.max(...data.countries.map(c => c.value));
                  const percentage = `${(country.value / maxCount) * 100}%`;
                  return (
                    <div key={country.name} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-355 text-gray-300">{country.name}</span>
                        <span className="text-white font-bold">{country.value}</span>
                      </div>
                      <div className="w-full h-1.5 bg-surface-950 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-500 rounded-full" style={{ width: percentage }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : <p className="text-gray-500 py-12 text-sm text-center">No data</p>}
          </div>
        </div>

        {/* Detailed Logs */}
        <div className="bg-surface-900 border border-surface-700 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Click Log</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-surface-850 text-gray-400 font-medium">
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Browser</th>
                  <th className="py-3 px-4">Device</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4">Country</th>
                </tr>
              </thead>
              <tbody>
                {data.recentVisits?.length > 0 ? (
                  data.recentVisits.map((visit) => (
                    <tr key={visit._id} className="border-b border-surface-850 hover:bg-surface-800/30 text-gray-300">
                      <td className="py-3.5 px-4 font-medium">{timeAgo(visit.visitedAt)}</td>
                      <td className="py-3.5 px-4">{visit.browser}</td>
                      <td className="py-3.5 px-4 capitalize">{visit.device}</td>
                      <td className="py-3.5 px-4 font-mono">{visit.ipAddress}</td>
                      <td className="py-3.5 px-4">{visit.country}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">No clicks recorded yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
