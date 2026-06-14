/**
 * Animated mesh gradient background for auth pages.
 * Features floating orbs with CSS animations for a premium feel.
 */
export default function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-surface-950 via-surface-900 to-surface-950" />

      {/* Animated orbs */}
      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl animate-float"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 70%)' }}
      />
      <div
        className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl animate-float"
        style={{
          background: 'radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)',
          animationDelay: '-2s',
        }}
      />
      <div
        className="absolute top-2/3 left-1/2 w-64 h-64 rounded-full opacity-10 blur-3xl animate-float"
        style={{
          background: 'radial-gradient(circle, rgba(52,211,153,0.3) 0%, transparent 70%)',
          animationDelay: '-4s',
        }}
      />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  );
}
