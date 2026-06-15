import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Link2, ChevronLeft, ChevronRight, Copy, Check, Loader2, Download, ExternalLink, Sparkles, QrCode, TrendingUp, Calendar, Shield, Activity, Globe, Search, BarChart3 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import urlService from '../services/urlService';
import analyticsService from '../services/analyticsService';
import toast from 'react-hot-toast';

export default function LandingPage() {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdUrl, setCreatedUrl] = useState(null);
  const [copied, setCopied] = useState(false);
  const [qrFgColor, setQrFgColor] = useState('#6366f1'); // default brand color (indigo)

  // Public Tracker state
  const [trackCode, setTrackCode] = useState('');
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackResult, setTrackResult] = useState(null);

  // Carousel slider state
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    {
      title: "LINK INTELLIGENCE PLATFORM",
      subtitle: "Smarter Links. Deeper Insights.",
      desc: "Shorten URLs instantly, add dynamic expiration rules, and generate print-ready QR codes for marketing campaigns.",
      badge: "ENTERPRISE READY",
      bgGradient: "from-[#081b33] to-[#040814]",
      icon: <Link2 className="w-24 h-24 text-brand-400" />
    },
    {
      title: "REAL-TIME CLICK TRACKING",
      subtitle: "Comprehensive Visitor Intelligence Reports",
      desc: "Analyze browser details, device distributions, IP addresses, and geographic locations for every single click.",
      badge: "ANALYTICS SYSTEM",
      bgGradient: "from-[#1a0f30] to-[#0a0514]",
      icon: <TrendingUp className="w-24 h-24 text-emerald-450" />
    },
    {
      title: "DYNAMIC QR CAMPAIGNS",
      subtitle: "Connect Offline Media to Online Content",
      desc: "Auto-generate high-resolution QR codes that change destination dynamically without reprint requirements.",
      badge: "SMART QR TECHNOLOGY",
      bgGradient: "from-[#0a2720] to-[#030d0a]",
      icon: <QrCode className="w-24 h-24 text-cyan-450" />
    }
  ];

  const campaignModules = [
    {
      title: "Marketing Campaigns",
      icon: <TrendingUp className="w-14 h-14 text-brand-500" />,
      desc: "Short links for Google, Facebook, and newsletter advertising campaigns.",
      metric: "98% CTR Average"
    },
    {
      title: "Social Bio Portals",
      icon: <Link2 className="w-14 h-14 text-emerald-500" />,
      desc: "Combine and manage multiple profile destinations into a single custom slug.",
      metric: "Custom Slugs"
    },
    {
      title: "Affiliate & Attribution",
      icon: <Activity className="w-14 h-14 text-cyan-500" />,
      desc: "Track affiliate conversions, referral metrics, and attribution codes.",
      metric: "Secure Redirects"
    },
    {
      title: "Corporate Redirects",
      icon: <Shield className="w-14 h-14 text-amber-500" />,
      desc: "Sleek URLs utilizing custom branded domains with SSL support.",
      metric: "Enterprise SLA"
    },
    {
      title: "Print QR Codes",
      icon: <QrCode className="w-14 h-14 text-brand-500" />,
      desc: "Dynamic print-ready QR codes for packaging, banners, and posters.",
      metric: "Vector Export"
    }
  ];

  // Auto-slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handleShorten = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    if (!/^https?:\/\//i.test(url)) {
      toast.error('URL must start with http:// or https://');
      return;
    }

    setLoading(true);
    try {
      const res = await urlService.createPublic({ originalUrl: url });
      setCreatedUrl(res.data.url);
      toast.success('Link shortened successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to shorten link');
    } finally {
      setUrl('');
      setLoading(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!trackCode.trim()) return;

    let code = trackCode.trim();
    if (code.includes('/r/')) {
      code = code.split('/r/').pop();
    } else if (code.includes('/')) {
      code = code.split('/').pop();
    }

    setTrackLoading(true);
    setTrackResult(null);
    try {
      const res = await analyticsService.getPublicStats(code);
      setTrackResult(res.data);
      toast.success('Link performance loaded!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verify the short link code.');
    } finally {
      setTrackLoading(false);
    }
  };

  const downloadQRCode = () => {
    const svg = document.getElementById('public-qr-code');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = '#ffffff';
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

  const qrColors = [
    { name: 'Indigo', value: '#4f46e5' },
    { name: 'Emerald', value: '#059669' },
    { name: 'Cyan', value: '#0891b2' },
    { name: 'Amber', value: '#d97706' },
    { name: 'Rose', value: '#e11d48' }
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#2d3748] flex flex-col font-sans selection:bg-brand-500/20 selection:text-brand-600">
      
      {/* ── Premium Top Header ── */}
      <header className="w-full bg-[#1e2029] text-white py-4 px-6 md:px-12 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => navigate('/')}>
            <span className="text-2xl font-black tracking-tight text-white">link</span>
            <div className="bg-brand-500 text-white font-black px-2.5 py-1 rounded-lg text-sm leading-none shadow-md">
              IQ
            </div>
          </div>

          {/* Right Section: System status, Sign In button, and menu */}
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-gray-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>System Online (In-Memory DB Mode)</span>
            </div>

            <Link
              to="/login"
              className="hover:text-brand-400 text-white font-bold text-sm transition-colors py-1.5"
            >
              Sign In
            </Link>

            <Link
              to="/signup"
              className="bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm px-4 py-2 rounded-lg transition-all shadow-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ── Sub Navigation Bar ── */}
      <nav className="w-full bg-[#111319] text-gray-300 py-3.5 px-6 md:px-12 text-xs md:text-sm shadow-sm select-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6 font-medium">
            <Link to="/" className="text-white hover:text-white transition-colors">Instant Shortener</Link>
            <Link to="/login" className="hover:text-white transition-colors">Real-time Analytics</Link>
            <Link to="/login" className="hover:text-white transition-colors">Smart QR Codes</Link>
            <Link to="/login" className="hover:text-white transition-colors">Custom Aliases</Link>
            <Link to="/login" className="hover:text-white transition-colors">Developer API</Link>
          </div>
          <div className="hidden md:flex items-center gap-6 font-medium text-gray-400">
            <Link to="/login" className="hover:text-white transition-colors">Pricing</Link>
            <Link to="/login" className="hover:text-white transition-colors">Documentation</Link>
            <Link to="/login" className="hover:text-white transition-colors">Enterprise SLA</Link>
          </div>
        </div>
      </nav>

      {/* ── Featured Banner Slider (Hero Carousel) ── */}
      <section className="w-full bg-[#1b1c24] py-12 px-4 md:px-12 relative group overflow-hidden">
        <div className="max-w-7xl mx-auto relative h-64 sm:h-80 rounded-3xl overflow-hidden shadow-2xl">
          {slides.map((slide, idx) => {
            const isActive = idx === currentSlide;
            return (
              <div
                key={idx}
                className={`absolute inset-0 bg-gradient-to-r ${slide.bgGradient} p-8 md:p-12 flex flex-col md:flex-row justify-between items-center transition-all duration-700 ease-in-out ${
                  isActive ? 'opacity-100 translate-x-0 scale-100 z-10' : 'opacity-0 translate-x-8 scale-95 z-0'
                }`}
              >
                <div className="space-y-4 md:max-w-2xl text-center md:text-left text-white">
                  <span className="inline-block bg-brand-500 text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-wider">
                    {slide.badge}
                  </span>
                  <h2 className="text-3xl sm:text-5xl font-extrabold leading-tight tracking-tight text-white">
                    {slide.title}
                  </h2>
                  <p className="text-brand-400 font-bold text-base sm:text-lg">
                    {slide.subtitle}
                  </p>
                  <p className="text-gray-300 text-xs sm:text-sm font-normal max-w-lg leading-relaxed">
                    {slide.desc}
                  </p>
                </div>

                <div className="hidden md:flex select-none filter drop-shadow-lg p-6 animate-float">
                  {slide.icon}
                </div>
              </div>
            );
          })}

          {/* Left Arrow */}
          <button
            onClick={handlePrevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/50 hover:bg-black/75 text-white transition-all z-20 hover:scale-105 border border-white/5 cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Right Arrow */}
          <button
            onClick={handleNextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/50 hover:bg-black/75 text-white transition-all z-20 hover:scale-105 border border-white/5 cursor-pointer"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Navigation Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2.5 z-20">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-3 h-3 rounded-full transition-all ${
                  idx === currentSlide ? 'bg-brand-500 w-8' : 'bg-gray-500/50'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Central Input Shortener Section ── */}
      <section className="w-full max-w-4xl mx-auto px-6 -mt-12 relative z-30">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 md:p-10">
          <form onSubmit={handleShorten} className="flex flex-col md:flex-row gap-5">
            <div className="relative flex-1">
              <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste your long destination URL here (e.g. https://github.com/)..."
                className="w-full pl-12 pr-4 py-5 bg-gray-50 border border-gray-300 rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-base sm:text-lg font-semibold shadow-inner"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="py-5 px-10 bg-brand-500 hover:bg-brand-600 text-white font-extrabold rounded-2xl transition-all shadow-lg shadow-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base sm:text-lg shrink-0 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Shortening...
                </>
              ) : (
                <>
                  Shorten URL
                </>
              )}
            </button>
          </form>
        </div>
      </section>

      {/* Shorten Result Card Container */}
      {createdUrl && (
        <section className="w-full max-w-xl mx-auto px-6 py-10">
          <div className="bg-white border border-gray-200 shadow-2xl rounded-3xl p-8 text-center space-y-6 animate-scale-in relative">
            <h3 className="text-xl font-bold text-gray-800 flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-brand-500" /> Link Shortened Successfully!
            </h3>

            <div className="flex flex-col items-center">
              {/* Customizable QR Code */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl mb-4">
                <QRCodeSVG
                  id="public-qr-code"
                  value={createdUrl.shortUrl}
                  size={150}
                  bgColor="#ffffff"
                  fgColor={qrFgColor}
                  level="H"
                />
              </div>

              {/* QR Theme Customizer */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2 font-bold uppercase tracking-wider">Select QR Code Theme Color:</p>
                <div className="flex gap-3 justify-center">
                  {qrColors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setQrFgColor(color.value)}
                      className="w-6.5 h-6.5 rounded-full border border-gray-300 transition-all hover:scale-110 active:scale-95 cursor-pointer relative"
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    >
                      {qrFgColor === color.value && (
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] text-white font-bold">
                          ✓
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={downloadQRCode}
                className="flex items-center gap-1.5 text-xs text-brand-500 hover:text-brand-650 font-bold transition-all mb-2 hover:underline cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download QR Code
              </button>
            </div>

            <div className="w-full">
              <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-250 rounded-xl w-full">
                <span className="text-brand-600 font-extrabold text-base sm:text-lg truncate flex-1 text-left">
                  {createdUrl.shortUrl}
                </span>
                <button
                  onClick={() => handleCopy(createdUrl.shortUrl)}
                  className="p-2 text-gray-500 hover:text-brand-500 transition-colors cursor-pointer border border-gray-200 bg-white rounded-lg hover:bg-gray-50"
                  title="Copy URL"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex gap-4 justify-center pt-2">
              <button
                onClick={() => setCreatedUrl(null)}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer border border-gray-300/60"
              >
                Shorten Another
              </button>
              <Link
                to="/signup"
                className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-brand-500/10"
              >
                Save to Account <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Public Click Tracker (Value Add widget) ── */}
      <section className="w-full max-w-4xl mx-auto px-6 py-10">
        <div className="bg-white border border-gray-200 rounded-3xl p-8 md:p-10 shadow-lg space-y-6">
          <div className="text-center sm:text-left space-y-1">
            <h3 className="text-2xl font-black text-gray-800 flex items-center justify-center sm:justify-start gap-2.5">
              <BarChart3 className="w-7 h-7 text-emerald-500" /> Track Link clicks
            </h3>
            <p className="text-sm text-gray-500 font-medium">
              Query total clicks and basic properties for any public shortened link instantly.
            </p>
          </div>

          <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Enter short code or copy-pasted linkiq link (e.g. linkiq-repo)..."
                value={trackCode}
                onChange={(e) => setTrackCode(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-300 rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-base font-semibold shadow-inner"
              />
            </div>
            <button
              type="submit"
              disabled={trackLoading || !trackCode.trim()}
              className="py-4 px-8 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold rounded-2xl transition-all shadow-md shrink-0 flex items-center justify-center gap-1.5 text-base cursor-pointer"
            >
              {trackLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Loading...
                </>
              ) : (
                <>
                  Check Stats
                </>
              )}
            </button>
          </form>

          {trackResult && (
            <div className="p-6 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 animate-scale-in text-gray-800">
              <div className="space-y-2 text-center md:text-left">
                <span className="inline-block text-[10px] font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  PUBLIC DATA FOUND
                </span>
                <h4 className="text-xl font-bold text-gray-800 flex items-center gap-2 justify-center md:justify-start">
                  Short link Code: <span className="text-brand-600 font-extrabold">linkiq/r/{trackResult.shortCode}</span>
                </h4>
                <p className="text-sm text-gray-500 flex items-center gap-1.5 justify-center md:justify-start">
                  <Calendar className="w-4 h-4 text-gray-400" /> Created on {new Date(trackResult.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                </p>
              </div>

              <div className="flex items-center gap-6 justify-center w-full md:w-auto">
                <div className="text-center md:text-right">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Clicks</p>
                  <p className="text-5xl font-black text-emerald-600">{trackResult.totalClicks}</p>
                </div>
                <div className="h-12 w-px bg-gray-250 hidden md:block" />
                <div className="space-y-2">
                  <button
                    onClick={() => handleCopy(`${window.location.origin}/r/${trackResult.shortCode}`)}
                    className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-300 transition-all cursor-pointer font-bold shadow-sm"
                  >
                    Copy Short URL
                  </button>
                  <Link
                    to="/signup"
                    className="block text-xs text-brand-650 hover:text-brand-500 text-center font-bold underline"
                  >
                    View detailed analytics →
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Campaign Use Cases / Modules Section ── */}
      <section className="max-w-7xl mx-auto w-full px-6 py-16 md:px-12 space-y-10 flex-1">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-800 tracking-tight">
              Enterprise Link Solutions
            </h2>
            <p className="text-sm text-gray-500 mt-1 font-medium">
              Select a module type to explore campaign tracking and analytics.
            </p>
          </div>
          <Link to="/signup" className="text-sm font-bold text-brand-500 hover:underline flex items-center gap-1.5 self-start sm:self-auto">
            See All Enterprise Modules <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Templates Grid - Clean campaign cards with icons and descriptions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {campaignModules.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-brand-500/30 hover:shadow-xl transition-all duration-350 hover:-translate-y-2 group cursor-pointer shadow-sm"
              onClick={() => navigate('/login')}
            >
              {/* Icon Container (Bigger Icons!) */}
              <div className="h-44 bg-gray-50 flex items-center justify-center border-b border-gray-100">
                <div className="group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
              </div>

              {/* Card info */}
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-base text-gray-800 line-clamp-1 group-hover:text-brand-500 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-gray-500 text-xs sm:text-sm leading-relaxed mt-1.5">
                    {item.desc}
                  </p>
                </div>
                
                <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500 font-semibold select-none">
                  <span className="uppercase text-[9px] text-brand-650 bg-brand-500/10 px-2.5 py-0.5 rounded border border-brand-500/20 font-bold">
                    {item.metric}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Corporate Conversion Banner */}
      <section className="w-full bg-[#2c303b] text-white py-16 px-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-8">
          <div className="space-y-3 text-center sm:text-left">
            <h3 className="text-xl sm:text-3xl font-extrabold tracking-tight">Need a Branded Custom Domain?</h3>
            <p className="text-sm text-gray-400 max-w-lg leading-relaxed">
              Create an account now to integrate custom domains, set expiration constraints, and access direct geolocated analytics.
            </p>
          </div>
          <Link
            to="/signup"
            className="px-8 py-3 bg-brand-500 hover:bg-brand-600 text-white text-sm font-black rounded-xl transition-all shadow-lg shadow-brand-500/10 whitespace-nowrap"
          >
            Create Free Account
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="w-full bg-[#1e2029] text-gray-400 py-12 px-6 md:px-12 border-t border-gray-800 text-xs relative z-10">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-gray-800 pb-8">
            <div className="flex items-center gap-2 cursor-default select-none">
              <span className="text-lg font-black text-white">link</span>
              <div className="bg-brand-500 text-white font-bold px-1.5 py-0.5 rounded-md text-xs">
                IQ
              </div>
            </div>
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} LinkIQ. Complete Link Attribution and Intelligence Platform.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-2 text-gray-550 justify-center sm:justify-start">
            <Link to="/login" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/login" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/login" className="hover:text-white transition-colors">Developer SLA</Link>
            <Link to="/login" className="hover:text-white transition-colors">Security Information</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
