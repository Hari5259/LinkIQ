import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Filter, ArrowUpDown, Copy, Check, BarChart3, Edit, Trash2, Globe, Calendar, Loader2 } from 'lucide-react';
import urlService from '../../services/urlService';
import LinkModal from '../../components/dashboard/LinkModal';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { formatDate, formatNumber } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function LinksPage() {
  const navigate = useNavigate();
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [urlToEdit, setUrlToEdit] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const fetchUrls = async () => {
    try {
      const res = await urlService.getAll({ search, filter, sort });
      setUrls(res.data.urls);
    } catch (err) {
      toast.error('Failed to load links');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUrls();
  }, [search, filter, sort]);

  const handleCopy = (id, url) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success('Copied link!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this link and all its analytics?')) return;
    try {
      await urlService.delete(id);
      toast.success('Link deleted successfully');
      fetchUrls();
    } catch (err) {
      toast.error('Failed to delete link');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">My Links</h2>
            <p className="text-gray-400 mt-1">Manage and monitor all your shortened links.</p>
          </div>
          <button
            onClick={() => { setUrlToEdit(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-4 py-2.5 rounded-xl transition-all shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Create Link
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search by long URL or alias..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-surface-900 border border-surface-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
            />
          </div>

          <div className="flex gap-3">
            {/* Filter */}
            <div className="relative flex-1 sm:flex-initial">
              <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full pl-10 pr-8 py-3 bg-surface-900 border border-surface-700 rounded-xl text-white appearance-none focus:outline-none focus:ring-2 focus:ring-brand-500/30 [color-scheme:dark]"
              >
                <option value="all">All Links</option>
                <option value="active">Active Only</option>
                <option value="expired">Expired Only</option>
              </select>
            </div>

            {/* Sort */}
            <div className="relative flex-1 sm:flex-initial">
              <ArrowUpDown className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full pl-10 pr-8 py-3 bg-surface-900 border border-surface-700 rounded-xl text-white appearance-none focus:outline-none focus:ring-2 focus:ring-brand-500/30 [color-scheme:dark]"
              >
                <option value="newest">Newest First</option>
                <option value="clicks">Most Clicks</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Links Grid/List */}
        {loading ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
          </div>
        ) : urls.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {urls.map((url) => (
              <div key={url._id} className="bg-surface-900 border border-surface-700 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-surface-600 transition-colors">
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-lg font-bold text-white truncate">{url.customAlias || url.shortCode}</span>
                    {url.expiryDate && (
                      <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                        new Date(url.expiryDate) < new Date() ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {new Date(url.expiryDate) < new Date() ? 'Expired' : 'Expires Soon'}
                      </span>
                    )}
                  </div>

                  <p className="text-gray-400 text-sm flex items-center gap-2 truncate">
                    <Globe className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="truncate">{url.originalUrl}</span>
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Created {formatDate(url.createdAt)}
                    </span>
                    {url.expiryDate && (
                      <span>Expires {formatDate(url.expiryDate)}</span>
                    )}
                  </div>
                </div>

                {/* Performance & Actions */}
                <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-surface-800">
                  <div className="text-left md:text-right">
                    <p className="text-xs text-gray-400 font-medium">Clicks</p>
                    <p className="text-xl font-bold text-emerald-400">{formatNumber(url.totalClicks)}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Copy */}
                    <button
                      onClick={() => handleCopy(url._id, url.shortUrl)}
                      className="p-2.5 bg-surface-800 hover:bg-surface-750 text-gray-300 hover:text-white rounded-xl transition-colors"
                      title="Copy short link"
                    >
                      {copiedId === url._id ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                    </button>

                    {/* Analytics */}
                    <button
                      onClick={() => navigate(`/analytics/${url._id}`)}
                      className="p-2.5 bg-surface-800 hover:bg-surface-750 text-gray-300 hover:text-white rounded-xl transition-colors"
                      title="View Analytics"
                    >
                      <BarChart3 className="w-5 h-5 text-brand-400" />
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => { setUrlToEdit(url); setIsModalOpen(true); }}
                      className="p-2.5 bg-surface-800 hover:bg-surface-750 text-gray-300 hover:text-white rounded-xl transition-colors"
                      title="Edit Link"
                    >
                      <Edit className="w-5 h-5 text-amber-400" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(url._id)}
                      className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-450 rounded-xl transition-colors"
                      title="Delete Link"
                    >
                      <Trash2 className="w-5 h-5 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-surface-900 border border-dashed border-surface-700 rounded-2xl">
            <Globe className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">No links found</h3>
            <p className="text-gray-400 mb-6 max-w-sm mx-auto">Create your first smart short link to get started with LinkIQ.</p>
            <button
              onClick={() => { setUrlToEdit(null); setIsModalOpen(true); }}
              className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-all"
            >
              Shorten a Link
            </button>
          </div>
        )}

        <LinkModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setUrlToEdit(null); }} urlToEdit={urlToEdit} onSave={fetchUrls} />
      </div>
    </DashboardLayout>
  );
}
