import { useEffect, useRef, useState } from 'react';
import { formatNumber } from '../../utils/formatters';

/**
 * Animated stat card with gradient border and counter animation.
 */
export default function StatCard({ label, value, icon: Icon, color = 'brand', delay = 0 }) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const target = typeof value === 'number' ? value : parseInt(value) || 0;
    if (target === 0) { setDisplayValue(0); return; }

    const duration = 1000;
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplayValue(Math.floor(eased * target));
      if (progress >= 1) clearInterval(timer);
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  const colorMap = {
    brand: 'from-brand-500/10 to-brand-600/5 border-brand-500/20',
    emerald: 'from-emerald-500/10 to-emerald-600/5 border-emerald-500/20',
    amber: 'from-amber-500/10 to-amber-600/5 border-amber-500/20',
    cyan: 'from-cyan-500/10 to-cyan-600/5 border-cyan-500/20',
  };

  const iconColorMap = {
    brand: 'text-brand-400', emerald: 'text-emerald-400', amber: 'text-amber-400', cyan: 'text-cyan-400',
  };

  return (
    <div
      ref={ref}
      className={`bg-gradient-to-br ${colorMap[color]} border rounded-2xl p-5 animate-slide-up`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-400 font-medium">{label}</span>
        {Icon && <Icon className={`w-5 h-5 ${iconColorMap[color]}`} />}
      </div>
      <p className="text-3xl font-bold text-white">{formatNumber(displayValue)}</p>
    </div>
  );
}
