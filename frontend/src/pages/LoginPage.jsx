import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email address';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await login(formData.email, formData.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please try again.';
      toast.error(message);
      setErrors({ general: message });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-surface-950 mesh-gradient selection:bg-brand-500/30 selection:text-white">
      {/* Centered Glassmorphic Form Card */}
      <div className="w-full max-w-md glass-card p-8 md:p-10 relative overflow-hidden group">
        
        {/* Subtle decorative glow */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center mb-8 select-none">
          <div className="inline-flex items-center gap-2 mb-3 cursor-pointer" onClick={() => navigate('/')}>
            <span className="text-2xl font-black tracking-tight text-white">link</span>
            <div className="bg-[#f84464] text-white font-black px-2 py-0.5 rounded text-xs leading-none shadow-md">
              IQ
            </div>
          </div>
          <h2 className="text-xl font-bold text-white">Welcome Back</h2>
          <p className="text-gray-400 text-xs mt-1">Sign in to manage and track your smart links</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" id="login-form">
          {/* Email Field */}
          <div>
            <label htmlFor="login-email" className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-500" />
              <input
                id="login-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={`w-full pl-11 pr-4 py-3 bg-surface-900 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all duration-200 text-sm ${
                  errors.email
                    ? 'border-red-500 focus:ring-red-500/10'
                    : 'border-surface-700 focus:ring-brand-500/20 focus:border-brand-500'
                }`}
                autoComplete="email"
              />
            </div>
            {errors.email && (
              <p className="mt-1.5 text-xs text-red-400 font-medium">{errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="login-password" className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-500" />
              <input
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full pl-11 pr-12 py-3 bg-surface-900 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all duration-200 text-sm ${
                  errors.password
                    ? 'border-red-500 focus:ring-red-500/10'
                    : 'border-surface-700 focus:ring-brand-500/20 focus:border-brand-500'
                }`}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1.5 text-xs text-red-400 font-medium">{errors.password}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            id="login-submit"
            className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-brand-600/10 hover:shadow-brand-600/25 cursor-pointer text-sm mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="w-4.5 h-4.5" />
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
