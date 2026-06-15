import { useState, useEffect } from 'react';
import { X, Copy, Check, Calendar, Tag, Globe, Loader2, Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import urlService from '../../services/urlService';
import toast from 'react-hot-toast';

export default function LinkModal({ isOpen, onClose, urlToEdit, onSave }) {
  const [formData, setFormData] = useState({
    originalUrl: '',
    customAlias: '',
    expiryDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [createdUrl, setCreatedUrl] = useState(null);
  const [copied, setCopied] = useState(false);
  const [qrFgColor, setQrFgColor] = useState('#818cf8');

  const downloadQRCode = () => {
    const svg = document.getElementById('modal-qr-code');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = '#12121f';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `${createdUrl.shortCode}-qr.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  useEffect(() => {
    if (isOpen) {
      if (urlToEdit) {
        setFormData({
          originalUrl: urlToEdit.originalUrl,
          customAlias: urlToEdit.customAlias || '',
          expiryDate: urlToEdit.expiryDate ? new Date(urlToEdit.expiryDate).toISOString().split('T')[0] : '',
        });
      } else {
        setFormData({ originalUrl: '', customAlias: '', expiryDate: '' });
      }
      setCreatedUrl(null);
      setErrors({});
    }
  }, [isOpen, urlToEdit]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!formData.originalUrl.trim()) {
      newErrors.originalUrl = 'URL is required';
    } else if (!/^https?:\/\//i.test(formData.originalUrl)) {
      newErrors.originalUrl = 'URL must start with http:// or https://';
    }
    if (formData.customAlias && formData.customAlias.length < 3) {
      newErrors.customAlias = 'Alias must be at least 3 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      if (urlToEdit) {
        const response = await urlService.update(urlToEdit._id, {
          originalUrl: formData.originalUrl,
          expiryDate: formData.expiryDate || null,
        });
        toast.success('Link updated successfully!');
        onSave();
        onClose();
      } else {
        const response = await urlService.create(formData);
        toast.success('Link shortened successfully!');
        setCreatedUrl(response.data.url);
        onSave();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!createdUrl) return;
    navigator.clipboard.writeText(createdUrl.shortUrl);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-surface-900 border border-surface-700 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl animate-scale-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-700">
          <h3 className="text-xl font-bold text-white">
            {urlToEdit ? 'Edit Link' : 'Create Smart Link'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {createdUrl ? (
          <div className="p-6 text-center space-y-6">
            <div className="flex flex-col items-center">
              <div className="inline-flex p-4 bg-brand-500/10 border border-brand-500/20 rounded-2xl mb-4">
                <QRCodeSVG id="modal-qr-code" value={createdUrl.shortUrl} size={140} bgColor="#12121f" fgColor={qrFgColor} level="H" />
              </div>

              {/* QR Theme Customizer */}
              <div className="mb-2">
                <p className="text-xs text-gray-400 mb-1.5 font-medium">Select QR Code Theme:</p>
                <div className="flex gap-2.5">
                  {[
                    { name: 'Indigo', value: '#818cf8' },
                    { name: 'Emerald', value: '#34d399' },
                    { name: 'Cyan', value: '#22d3ee' },
                    { name: 'Amber', value: '#fbbf24' },
                    { name: 'Rose', value: '#fb7185' }
                  ].map((color) => (
                    <button
                      type="button"
                      key={color.name}
                      onClick={() => setQrFgColor(color.value)}
                      className="w-5.5 h-5.5 rounded-full border border-surface-700 transition-all hover:scale-110 active:scale-95 cursor-pointer relative"
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    >
                      {qrFgColor === color.value && (
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] text-surface-950 font-bold">
                          ✓
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={downloadQRCode}
                className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 font-bold transition-all mt-2 hover:underline cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Download QR Code
              </button>
            </div>

            <div>
              <p className="text-sm text-gray-400 mb-2">Shortened Link</p>
              <div className="flex items-center gap-2 p-3 bg-surface-950 border border-surface-800 rounded-xl max-w-sm mx-auto">
                <span className="text-brand-400 font-semibold truncate flex-1">{createdUrl.shortUrl}</span>
                <button onClick={handleCopy} className="text-gray-400 hover:text-white transition-colors">
                  {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="pt-4 flex gap-3 justify-center">
              <button
                onClick={() => setCreatedUrl(null)}
                className="px-5 py-2.5 bg-surface-800 hover:bg-surface-750 text-white rounded-xl transition-all"
              >
                Shorten another
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-semibold transition-all"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2">
                <Globe className="w-4 h-4 text-brand-400" /> Original URL
              </label>
              <input
                type="text"
                value={formData.originalUrl}
                onChange={(e) => setFormData({ ...formData, originalUrl: e.target.value })}
                placeholder="https://example.com/very/long/destination/url"
                className={`w-full px-4 py-3 bg-surface-800 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 ${
                  errors.originalUrl ? 'border-red-500' : 'border-surface-600'
                }`}
              />
              {errors.originalUrl && <p className="mt-1 text-sm text-red-400">{errors.originalUrl}</p>}
            </div>

            {!urlToEdit && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-emerald-400" /> Custom Alias <span className="text-gray-500 text-xs">(optional)</span>
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-surface-600 bg-surface-950 text-gray-400 text-sm">
                    linkiq/
                  </span>
                  <input
                    type="text"
                    value={formData.customAlias}
                    onChange={(e) => setFormData({ ...formData, customAlias: e.target.value })}
                    placeholder="my-custom-slug"
                    className={`flex-1 min-w-0 px-4 py-3 bg-surface-800 border rounded-r-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 ${
                      errors.customAlias ? 'border-red-500' : 'border-surface-600'
                    }`}
                  />
                </div>
                {errors.customAlias && <p className="mt-1 text-sm text-red-400">{errors.customAlias}</p>}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" /> Expiry Date <span className="text-gray-500 text-xs">(optional)</span>
              </label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="w-full px-4 py-3 bg-surface-800 border border-surface-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 [color-scheme:dark]"
              />
            </div>

            <div className="pt-4 flex gap-3 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-surface-800 hover:bg-surface-750 text-white rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-semibold transition-all flex items-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {urlToEdit ? 'Save Changes' : 'Shorten Link'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
