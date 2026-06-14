import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Menu, ChevronLeft, ChevronRight, Copy, Check, Loader2, Download, ExternalLink, Sparkles, QrCode, TrendingUp, Calendar, Shield } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import urlService from '../services/urlService';
import toast from 'react-hot-toast';

export default function LandingPage() {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdUrl, setCreatedUrl] = useState(null);
  const [copied, setCopied] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('Hyderabad');

  // Carousel slider state
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    {
      title: "JASMINE SANDLAS LIVE",
      subtitle: "Live at Quake Arena Hyd - Sat 27 June",
      desc: "Shorten and track event ticket redirects. Track clicks in real-time.",
      badge: "LIVE CAMPAIGN",
      bgGradient: "from-[#081b33] to-[#040814]",
      image: "🎤"
    },
    {
      title: "TRACK DYNAMIC ANALYTICS",
      subtitle: "Country, browser & device breakdowns",
      desc: "Geolocate your click logs instantly using built-in IP intelligence.",
      badge: "PLATFORM FEATURE",
      bgGradient: "from-[#1a0f30] to-[#0a0514]",
      image: "📊"
    },
    {
      title: "DOWNLOAD DYNAMIC QR CODES",
      subtitle: "High fidelity offline-to-online marketing",
      desc: "Instantly download QR codes for every shortened link.",
      badge: "NEW RELEASE",
      bgGradient: "from-[#0a2720] to-[#030d0a]",
      image: "📱"
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
    <div className="min-h-screen bg-[#f5f5f5] text-[#333333] flex flex-col font-sans selection:bg-[#f84464]/20 selection:text-[#f84464]">
      
      {/* ── BookMyShow Style Header ── */}
      <header className="w-full bg-[#333545] text-white py-3.5 px-6 md:px-12 sticky top-0 z-55">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
          
          {/* Logo - link in white, IQ in rounded red box */}
          <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => navigate('/')}>
            <span className="text-2xl font-extrabold tracking-tight text-white">link</span>
            <div className="bg-[#f84464] text-white font-black px-2.5 py-1 rounded-md text-base leading-none shadow-md">
              myIQ
            </div>
          </div>

          {/* Centered URL Shortener Input Bar (Mimicking Search Bar) */}
          <div className="flex-1 max-w-2xl hidden md:block">
            <form onSubmit={handleShorten} className="relative flex items-center w-full bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="absolute left-3.5 text-gray-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Search or paste long URL to shorten..."
                className="w-full pl-11 pr-24 py-2.5 text-sm text-[#333] placeholder-gray-400 bg-white focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading || !url.trim()}
                className="absolute right-1 py-1.5 px-4 bg-[#f84464] hover:bg-[#d83652] text-white text-xs font-semibold rounded-md transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Shorten'}
              </button>
            </form>
          </div>

          {/* Right Section: Location dropdown, Sign In button, and menu */}
          <div className="flex items-center gap-5">
            <div className="relative flex items-center gap-1.5 cursor-pointer text-sm text-gray-200 hover:text-white transition-colors">
              <MapPin className="w-4 h-4 text-[#f84464]" />
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="bg-transparent border-none text-white text-sm font-semibold pr-4 focus:outline-none cursor-pointer [color-scheme:dark]"
              >
                <option value="Hyderabad">Hyderabad</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi">Delhi NCR</option>
                <option value="Bengaluru">Bengaluru</option>
              </select>
            </div>

            <Link
              to="/login"
              className="bg-[#f84464] hover:bg-[#d83652] text-white font-semibold text-xs px-4 py-1.5 rounded-md transition-all shadow-sm"
            >
              Sign In
            </Link>

            <button className="text-gray-300 hover:text-white transition-colors">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Sub Navigation Bar ── */}
      <nav className="w-full bg-[#1f2533] text-gray-300 py-3 px-6 md:px-12 text-xs md:text-sm shadow-sm select-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6 font-medium">
            <Link to="/" className="text-white hover:text-white transition-colors">Shorten Links</Link>
            <Link to="/login" className="hover:text-white transition-colors">Real-time Analytics</Link>
            <Link to="/login" className="hover:text-white transition-colors">Smart QR Codes</Link>
            <Link to="/login" className="hover:text-white transition-colors">Custom Aliases</Link>
            <Link to="/login" className="hover:text-white transition-colors">Developer API</Link>
          </div>
          <div className="hidden sm:flex items-center gap-6 font-medium">
            <Link to="/login" className="hover:text-[#f84464] transition-colors">ListYourLink</Link>
            <Link to="/login" className="hover:text-white transition-colors">Corporates</Link>
            <Link to="/login" className="hover:text-white transition-colors">Offers</Link>
            <Link to="/login" className="hover:text-white transition-colors">Gift Cards</Link>
          </div>
        </div>
      </nav>

      {/* Mobile-only shortener input section */}
      <div className="w-full md:hidden bg-[#2d3040] p-4 text-white">
        <form onSubmit={handleShorten} className="relative flex items-center w-full bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="absolute left-3 text-gray-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste long URL to shorten..."
            className="w-full pl-9 pr-20 py-2 text-xs text-[#333] placeholder-gray-400 bg-white focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="absolute right-1 py-1.5 px-3 bg-[#f84464] hover:bg-[#d83652] text-white text-xs font-semibold rounded-md transition-all shadow-sm"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Shorten'}
          </button>
        </form>
      </div>

      {/* ── Featured Banner Slider (Hero Carousel) ── */}
      <section className="w-full bg-[#1b1c24] py-8 px-4 md:px-12 relative group overflow-hidden">
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
                  <span className="inline-block bg-[#f84464] text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider">
                    {slide.badge}
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-extrabold leading-tight tracking-tight">
                    {slide.title}
                  </h2>
                  <p className="text-gray-300 font-semibold text-sm sm:text-base">
                    {slide.subtitle}
                  </p>
                  <p className="text-gray-400 text-xs sm:text-sm font-normal max-w-lg">
                    {slide.desc}
                  </p>
                </div>

                <div className="hidden md:flex text-7xl select-none filter drop-shadow-lg p-6 animate-float">
                  {slide.image}
                </div>
              </div>
            );
          })}

          {/* Left Arrow */}
          <button
            onClick={handlePrevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/45 hover:bg-black/60 text-white transition-all z-20 group-hover:scale-105 border border-white/5"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Right Arrow */}
          <button
            onClick={handleNextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/45 hover:bg-black/60 text-white transition-all z-20 group-hover:scale-105 border border-white/5"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Navigation Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
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

      {/* Result Card Overlay (Displays if user creates a URL) */}
      {createdUrl && (
        <section className="w-full bg-[#f84464]/5 py-8 px-6 border-b border-gray-200">
          <div className="max-w-lg mx-auto bg-white border border-gray-200 shadow-xl rounded-2xl p-6 text-center space-y-5 animate-scale-in relative">
            <h3 className="text-lg font-bold text-gray-800 flex items-center justify-center gap-1.5">
              <Sparkles className="w-5 h-5 text-[#f84464]" /> Link Shortened Successfully!
            </h3>

            <div className="flex flex-col items-center">
              <div className="p-3.5 bg-[#fcfcfc] border border-gray-150 rounded-xl mb-3">
                <QRCodeSVG
                  id="public-qr-code"
                  value={createdUrl.shortUrl}
                  size={130}
                  bgColor="#ffffff"
                  fgColor="#2d3040"
                  level="H"
                />
              </div>
              <button
                onClick={downloadQRCode}
                className="flex items-center gap-1 text-xs text-[#f84464] hover:text-[#d83652] font-bold transition-all mb-3 hover:underline"
              >
                <Download className="w-3.5 h-3.5" /> Download QR Code
              </button>
            </div>

            <div className="w-full">
              <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-xl w-full">
                <span className="text-[#f84464] font-bold text-sm truncate flex-1 text-left">
                  {createdUrl.shortUrl}
                </span>
                <button
                  onClick={handleCopy}
                  className="p-1.5 text-gray-400 hover:text-[#f84464] transition-colors"
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
                className="px-4 py-2 bg-gray-100 hover:bg-gray-250 text-gray-750 font-semibold text-xs rounded-lg transition-all"
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

      {/* ── Movie Campaign Templates Section (Mimicking BMS Movie list grid) ── */}
      <section className="max-w-7xl mx-auto w-full px-6 py-12 md:px-12 space-y-8 flex-1">
        
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-gray-800 tracking-tight">
              Recommended Campaign Types
            </h2>
            <p className="text-xs md:text-sm text-gray-500 mt-1">
              Select one to explore and start tracking your audience clicks.
            </p>
          </div>
          <Link to="/signup" className="text-xs font-bold text-[#f84464] hover:underline flex items-center gap-1">
            See All Campaigns <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Templates Grid - Cards match BMS Movie grid structure */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {[
            {
              title: "Concerts & Events",
              icon: "🎟️",
              desc: "Short links for tickets, venues, and directions.",
              metric: "98% CTR typical",
              color: "bg-blue-500/10 text-blue-500"
            },
            {
              title: "Social Bio Links",
              icon: "🔗",
              desc: "Consolidate all profile destinations into a single slug.",
              metric: "Highly customizable",
              color: "bg-purple-500/10 text-purple-500"
            },
            {
              title: "Promo Code Links",
              icon: "🏷️",
              desc: "Track affiliate conversion rates and marketing attribution.",
              metric: "Secure redirection",
              color: "bg-emerald-500/10 text-emerald-500"
            },
            {
              title: "Corporate Links",
              icon: "💼",
              desc: "Branded short URLs with custom domains and SSL protection.",
              metric: "Enterprise grade",
              color: "bg-amber-500/10 text-amber-500"
            },
            {
              title: "Marketing QR Codes",
              icon: "📱",
              desc: "Scan-to-redirect templates for posters, flyers, and banners.",
              metric: "Print resolution",
              color: "bg-cyan-500/10 text-cyan-500"
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group cursor-pointer"
            >
              {/* Image box placeholder style */}
              <div className="h-44 bg-gray-50 flex items-center justify-center relative border-b border-gray-100">
                <span className="text-5xl group-hover:scale-110 transition-transform duration-300 select-none">
                  {item.icon}
                </span>
                
                {/* BMS style rating bar overlay */}
                <div className="absolute bottom-0 inset-x-0 bg-black/75 px-3 py-1.5 flex justify-between items-center text-[10px] text-white font-bold select-none">
                  <span className="flex items-center gap-1 text-[#f84464]">
                    ★ 9.2/10
                  </span>
                  <span>12.5k Votes</span>
                </div>
              </div>

              {/* Card info */}
              <div className="p-3.5 space-y-1 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-sm text-gray-800 line-clamp-1 group-hover:text-[#f84464] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-gray-400 text-[10px] leading-snug line-clamp-2 mt-1">
                    {item.desc}
                  </p>
                </div>
                
                <div className="pt-3 border-t border-gray-50 flex justify-between items-center text-[10px] text-gray-500 font-semibold select-none">
                  <span className="uppercase text-[9px] text-[#f84464] bg-[#f84464]/5 px-1.5 py-0.5 rounded">
                    {item.metric}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Conversion Banner */}
      <section className="w-full bg-[#2c303b] text-white py-12 px-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-lg sm:text-xl font-bold">List Your Business & Track Clicks</h3>
            <p className="text-xs text-gray-400 max-w-md">
              Become a premium LinkIQ partner to manage enterprise sub-domains, schedule redirects, and generate professional QR codes.
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
      <footer className="w-full bg-[#333333] text-gray-400 py-10 px-6 md:px-12 border-t border-gray-700 text-xs">
        <div className="max-w-7xl mx-auto space-y-6">
          
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 cursor-default">
              <span className="text-lg font-black text-white">link</span>
              <div className="bg-[#f84464] text-white font-bold px-1.5 py-0.5 rounded text-xs">
                myIQ
              </div>
            </div>
            <p className="text-gray-500">
              © {new Date().getFullYear()} LinkIQ. Created for smart redirect automation and ticket sales marketing tracking.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-gray-500">
            <Link to="/login" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/login" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/login" className="hover:text-white transition-colors">Developer SLA</Link>
            <Link to="/login" className="hover:text-white transition-colors">Refund Policies</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
