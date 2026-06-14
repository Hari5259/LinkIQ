import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    else if (formData.name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email address';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await register(formData.name.trim(), formData.email, formData.password);
      toast.success('Account created! Welcome to LinkIQ 🎉');
      navigate('/dashboard');
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
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

  const inputClass = (field) =>
    `w-full pl-11 pr-4 py-2.5 bg-surface-900 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all duration-200 text-sm ${
      errors[field]
        ? 'border-red-500 focus:ring-red-500/10'
        : 'border-surface-700 focus:ring-brand-500/20 focus:border-brand-500'
    }`;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-surface-950 mesh-gradient selection:bg-brand-500/30 selection:text-white">
      {/* Centered Glassmorphic Form Card */}
      <div className="w-full max-w-md glass-card p-8 md:p-10 relative overflow-hidden group">
        
        {/* Subtle decorative glow */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center mb-6 select-none">
          <div className="inline-flex items-center gap-2 mb-3 cursor-pointer" onClick={() => navigate('/')}>
            <span className="text-2xl font-black tracking-tight text-white">link</span>
            <div className="bg-[#f84464] text-white font-black px-2 py-0.5 rounded text-xs leading-none shadow-md">
              IQ
            </div>
          </div>
          <h2 className="text-xl font-bold text-white">Create Account</h2>
          <p className="text-gray-400 text-xs mt-1">Join LinkIQ and start intelligence tracking</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" id="signup-form">
          {/* Name Field */}
          <div>
            <label htmlFor="signup-name" className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-500" />
              <input
                id="signup-name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className={inputClass('name')}
                autoComplete="name"
              />
            </div>
            {errors.name && <p className="mt-1 text-xs text-red-400 font-medium">{errors.name}</p>}
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="signup-email" className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-500" />
              <input
                id="signup-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={inputClass('email')}
                autoComplete="email"
              />
            </div>
            {errors.email && <p className="mt-1 text-xs text-red-400 font-medium">{errors.email}</p>}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="signup-password" className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-500" />
              <input
                id="signup-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                placeholder="Min. 6 characters"
                className={`${inputClass('password')} pr-12`}
                autoComplete="new-password"
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
            {errors.password && <p className="mt-1 text-xs text-red-400 font-medium">{errors.password}</p>}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="signup-confirm" className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-500" />
              <input
                id="signup-confirm"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat your password"
                className={inputClass('confirmPassword')}
                autoComplete="new-password"
              />
            </div>
            {errors.confirmPassword && <p className="mt-1 text-xs text-red-400 font-medium">{errors.confirmPassword}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            id="signup-submit"
            className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-brand-600/10 hover:shadow-brand-600/25 cursor-pointer text-sm mt-4"
          >
            {loading ? (
              <>
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                Create Account
                <ArrowRight className="w-4.5 h-4.5" />
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
