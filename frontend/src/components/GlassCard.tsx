import React from 'react';

export type GlassCardProps = {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'purple' | 'fuchsia' | 'pink' | 'cyan' | 'emerald' | 'amber' | 'orange' | 'yellow' | 'red' | 'none' | string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  title?: string;
  showReflection?: boolean;
};

export default function GlassCard({
  children,
  className = '',
  glowColor = 'none',
  padding = 'md',
  hoverable = false,
  title,
  showReflection = true,
}: GlassCardProps) {
  const paddingMap = {
    none: 'p-0',
    sm: 'p-5 sm:p-6',
    md: 'p-6 sm:p-7 lg:p-8',
    lg: 'p-8 sm:p-9 lg:p-10',
  };

  const glowMap: Record<string, string> = {
    purple: 'shadow-[0_0_35px_rgba(168,85,247,0.25)] border-purple-500/45',
    fuchsia: 'shadow-[0_0_40px_rgba(217,70,239,0.35)] border-fuchsia-500/45',
    pink: 'shadow-[0_0_35px_rgba(236,72,153,0.3)] border-pink-500/45',
    cyan: 'shadow-[0_0_30px_rgba(6,182,212,0.3)] border-cyan-500/45',
    emerald: 'shadow-[0_0_30px_rgba(16,185,129,0.3)] border-emerald-500/45',
    amber: 'shadow-[0_0_30px_rgba(245,158,11,0.3)] border-amber-500/45',
    orange: 'shadow-[0_0_30px_rgba(249,115,22,0.3)] border-orange-500/45',
    yellow: 'shadow-[0_0_30px_rgba(234,179,8,0.3)] border-yellow-500/45',
    red: 'shadow-[0_0_30px_rgba(239,68,68,0.3)] border-red-500/45',
    none: 'border-purple-500/35 hover:border-fuchsia-400/60 shadow-[0_0_30px_rgba(168,85,247,0.18)] hover:shadow-[0_0_45px_rgba(217,70,239,0.35)]',
  };

  const selectedGlow = glowMap[glowColor] || glowMap.none;

  const hoverClass = hoverable
    ? 'hover:scale-[1.015] hover:-translate-y-1 transition-all duration-300 cursor-pointer'
    : 'transition-all duration-300';

  return (
    <div
      className={`relative bg-purple-950/30 backdrop-blur-2xl border rounded-2xl overflow-hidden ${paddingMap[padding]} ${selectedGlow} ${hoverClass} ${className}`}
    >
      {/* Top Light Accent Reflection Line */}
      {showReflection && (
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-fuchsia-400 to-transparent opacity-90 pointer-events-none" />
      )}

      {title && (
        <div className="mb-5 pb-3 border-b border-purple-500/30 flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-bold text-white tracking-wide flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-fuchsia-400 animate-pulse shadow-[0_0_10px_#d946ef]" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-fuchsia-100 to-purple-200">
              {title}
            </span>
          </h3>
        </div>
      )}

      {children}
    </div>
  );
}
