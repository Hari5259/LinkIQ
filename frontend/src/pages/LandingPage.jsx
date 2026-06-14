import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Link2, Menu, ChevronLeft, ChevronRight, Copy, Check, Loader2, Download, ExternalLink, Sparkles, QrCode, TrendingUp, Calendar, Shield, Cpu, Activity, Globe } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import urlService from '../services/urlService';
import toast from 'react-hot-toast';

export default function LandingPage() {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdUrl, setCreatedUrl] = useState(null);
  const [copied, setCopied] = useState(false);

  // Carousel slider state
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    {
      title: "LINK INTELLIGENCE PLATFORM",
      subtitle: "Smarter Links. Deeper Insights.",
      desc: "Shorten URLs instantly, add dynamic expiration rules, and generate print-ready QR codes for marketing campaigns.",
      badge: "ENTERPRISE READY",
      bgGradient: "from-[#081b33] to-[#040814]",
      icon: <Link2 className="w-20 h-20 text-brand-400" />
    },
    {
      title: "REAL-TIME CLICK TRACKING",
      subtitle: "Comprehensive Visitor Intelligence Reports",
      desc: "Analyze browser details, device distributions, IP addresses, and geographic locations for every single click.",
      badge: "ANALYTICS SYSTEM",
      bgGradient: "from-[#1a0f30] to-[#0a0514]",
      icon: <TrendingUp className="w-20 h-20 text-emerald-400" />
    },
    {
      title: "DYNAMIC QR CAMPAIGNS",
      subtitle: "Connect Offline Media to Online Content",
      desc: "Auto-generate high-resolution QR codes that change destination dynamically without reprint requirements.",
      badge: "SMART QR TECHNOLOGY",
      bgGradient: "from-[#0a2720] to-[#030d0a]",
      icon: <QrCode className="w-20 h-20 text-cyan-400" />
    }
  ];

  const campaignModules = [
    {
      title: "Marketing Campaigns",
      icon: <TrendingUp className="w-10 h-10 text-[#f84464]" />,
      desc: "Short links for Google, Facebook, and newsletter advertising campaigns.",
      metric: "98% CTR Average"
    },
    {
      title: "Social Bio Portals",
      icon: <Link2 className="w-10 h-10 text-[#f84464]" />,
      desc: "Combine and manage multiple profile destinations into a single custom slug.",
      metric: "Custom Slugs"
    },
    {
      title: "Affiliate & Attribution",
      icon: <Activity className="w-10 h-10 text-[#f84464]" />,
      desc: "Track affiliate conversions, referral metrics, and attribution codes.",
      metric: "Secure Redirects"
    },
    {
      title: "Corporate Redirects",
      icon: <Shield className="w-10 h-10 text-[#f84464]" />,
      desc: "Sleek URLs utilizing custom branded domains with SSL support.",
      metric: "Enterprise SLA"
    },
    {
      title: "Print QR Codes",
      icon: <QrCode className="w-10 h-10 text-[#f84464]" />,
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
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `${createdUrl.shortCode}-qr.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#333333] flex flex-col font-sans selection:bg-[#f84464]/20 selection:text-[#f84464]">
      
      {/* ── Premium Top Header ── */}
      <header className="w-full bg-[#1e2029] text-white py-4 px-6 md:px-12 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => navigate('/')}>
            <span className="text-2xl font-black tracking-tight text-white animate-fade-in">link</span>
            <div className="bg-[#f84464] text-white font-black px-2.5 py-1 rounded-md text-sm leading-none shadow-md">
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
              className="hover:text-[#f84464] text-white font-bold text-sm transition-colors py-1.5"
            >
              Sign In
            </Link>

            <Link
              to="/signup"
              className="bg-[#f84464] hover:bg-[#d83652] text-white font-bold text-sm px-4 py-2 rounded-lg transition-all shadow-sm"
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
      <section className="w-full bg-[#1b1c24] py-10 px-4 md:px-12 relative group overflow-hidden">
        <div className="max-w-7xl mx-auto relative h-56 sm:h-72 rounded-2xl overflow-hidden shadow-2xl">
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
                  <span className="inline-block bg-[#f84464] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full tracking-wider">
                    {slide.badge}
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-extrabold leading-tight tracking-tight">
                    {slide.title}
                  </h2>
                  <p className="text-[#f84464] font-semibold text-sm sm:text-base">
                    {slide.subtitle}
                  </p>
                  <p className="text-gray-400 text-xs sm:text-sm font-normal max-w-lg leading-relaxed">
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
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/45 hover:bg-black/60 text-white transition-all z-25 hover:scale-105 border border-white/5 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Right Arrow */}
          <button
            onClick={handleNextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/45 hover:bg-black/60 text-white transition-all z-25 hover:scale-105 border border-white/5 cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Navigation Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-25">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  idx === currentSlide ? 'bg-[#f84464] w-6' : 'bg-gray-500/50'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Central Input Shortener Section (Corrected Size Input) ── */}
      <section className="w-full max-w-4xl mx-auto px-6 -mt-8 relative z-30">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 md:p-8">
          <form onSubmit={handleShorten} className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste your long destination URL here (e.g. https://github.com/Hari5259/LinkIQ)..."
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f84464]/30 focus:border-[#f84464] transition-all text-base font-semibold"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="py-4 px-8 bg-[#f84464] hover:bg-[#d83652] text-white font-bold rounded-xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base shrink-0 cursor-pointer"
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

      {/* Result Card Container */}
      {createdUrl && (
        <section className="w-full max-w-lg mx-auto px-6 py-8">
          <div className="bg-white border border-gray-200 shadow-xl rounded-2xl p-6 text-center space-y-5 animate-scale-in relative">
            <h3 className="text-lg font-bold text-gray-800 flex items-center justify-center gap-1.5">
              <Sparkles className="w-5 h-5 text-[#f84464]" /> Link Shortened Successfully!
            </h3>

            <div className="flex flex-col items-center">
              <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl mb-3">
                <QRCodeSVG
                  id="public-qr-code"
                  value={createdUrl.shortUrl}
                  size={130}
                  bgColor="#ffffff"
                  fgColor="#1b1c24"
                  level="H"
                />
              </div>
              <button
                onClick={downloadQRCode}
                className="flex items-center gap-1 text-xs text-[#f84464] hover:text-[#d83652] font-bold transition-all mb-3 hover:underline cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Download QR Code
              </button>
            </div>

            <div className="w-full">
              <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-250 rounded-xl w-full">
                <span className="text-[#f84464] font-bold text-sm truncate flex-1 text-left">
                  {createdUrl.shortUrl}
                </span>
                <button
                  onClick={handleCopy}
                  className="p-1.5 text-gray-400 hover:text-[#f84464] transition-colors cursor-pointer"
                  title="Copy URL"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={() => {
                  setUrl('');
                  setCreatedUrl(null);
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-750 font-semibold text-xs rounded-lg transition-all cursor-pointer"
              >
                Shorten Another
              </button>
              <Link
                to="/signup"
                className="px-4 py-2 bg-[#f84464] hover:bg-[#d83652] text-white font-semibold text-xs rounded-lg transition-all flex items-center gap-1.5"
              >
                Save to Account <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Campaign Use Cases / Modules Section ── */}
      <section className="max-w-7xl mx-auto w-full px-6 py-12 md:px-12 space-y-8 flex-1">
        
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-gray-800 tracking-tight">
              Enterprise Link Solutions
            </h2>
            <p className="text-xs md:text-sm text-gray-500 mt-1">
              Select a module type to explore campaign tracking and analytics.
            </p>
          </div>
          <Link to="/signup" className="text-xs font-bold text-[#f84464] hover:underline flex items-center gap-1">
            See All Enterprise Modules <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Templates Grid - Clean campaign cards with icons and descriptions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {campaignModules.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group cursor-pointer"
              onClick={() => navigate('/login')}
            >
              {/* Icon Container */}
              <div className="h-40 bg-gray-50 flex items-center justify-center border-b border-gray-100">
                <div className="group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
              </div>

              {/* Card info */}
              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-sm text-gray-800 line-clamp-1 group-hover:text-[#f84464] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-gray-400 text-xs leading-relaxed mt-1">
                    {item.desc}
                  </p>
                </div>
                
                <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500 font-semibold select-none">
                  <span className="uppercase text-[9px] text-[#f84464] bg-[#f84464]/5 px-2 py-0.5 rounded">
                    {item.metric}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Corporate Conversion Banner */}
      <section className="w-full bg-[#2c303b] text-white py-12 px-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-lg sm:text-xl font-bold">Need a Branded Custom Domain?</h3>
            <p className="text-xs text-gray-400 max-w-md">
              Create an account now to integrate custom domains, set expiration constraints, and access direct geolocated analytics.
            </p>
          </div>
          <Link
            to="/signup"
            className="px-6 py-2.5 bg-[#f84464] hover:bg-[#d83652] text-white text-xs font-bold rounded-md transition-all shadow-md whitespace-nowrap"
          >
            Create Free Account
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="w-full bg-[#1e2029] text-gray-400 py-10 px-6 md:px-12 border-t border-gray-800 text-xs">
        <div className="max-w-7xl mx-auto space-y-6">
          
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 cursor-default select-none">
              <span className="text-lg font-black text-white">link</span>
              <div className="bg-[#f84464] text-white font-bold px-1.5 py-0.5 rounded text-xs">
                IQ
              </div>
            </div>
            <p className="text-gray-500">
              © {new Date().getFullYear()} LinkIQ. Complete Link Attribution and Intelligence Platform.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-gray-500">
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
