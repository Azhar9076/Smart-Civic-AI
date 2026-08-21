import React from 'react';

export type StatusBadgeProps = {
  status: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
};

const statusMap: Record<
  string,
  { dotColor: string; bg: string; text: string; borderGlow: string }
> = {
  submitted: {
    dotColor: 'bg-fuchsia-400 shadow-[0_0_10px_#d946ef]',
    bg: 'bg-fuchsia-950/60',
    text: 'text-fuchsia-200 font-bold',
    borderGlow: 'border border-fuchsia-400/50 shadow-[0_0_12px_rgba(217,70,239,0.4)]',
  },
  processing: {
    dotColor: 'bg-purple-400 shadow-[0_0_10px_#a855f7]',
    bg: 'bg-purple-950/60',
    text: 'text-purple-200 font-bold',
    borderGlow: 'border border-purple-400/50 shadow-[0_0_12px_rgba(168,85,247,0.4)]',
  },
  localized: {
    dotColor: 'bg-indigo-400 shadow-[0_0_10px_#818cf8]',
    bg: 'bg-indigo-950/60',
    text: 'text-indigo-200 font-bold',
    borderGlow: 'border border-indigo-400/50 shadow-[0_0_12px_rgba(99,102,241,0.4)]',
  },
  prioritized: {
    dotColor: 'bg-pink-400 shadow-[0_0_10px_#f472b6]',
    bg: 'bg-pink-950/60',
    text: 'text-pink-200 font-bold',
    borderGlow: 'border border-pink-400/50 shadow-[0_0_12px_rgba(236,72,153,0.4)]',
  },
  assigned: {
    dotColor: 'bg-violet-400 shadow-[0_0_10px_#a78bfa]',
    bg: 'bg-violet-950/60',
    text: 'text-violet-200 font-bold',
    borderGlow: 'border border-violet-400/50 shadow-[0_0_12px_rgba(139,92,246,0.4)]',
  },
  in_progress: {
    dotColor: 'bg-purple-300 shadow-[0_0_12px_#c084fc]',
    bg: 'bg-purple-900/60',
    text: 'text-white font-extrabold',
    borderGlow: 'border border-purple-400/60 shadow-[0_0_15px_rgba(168,85,247,0.5)]',
  },
  resolved: {
    dotColor: 'bg-emerald-400 shadow-[0_0_10px_#34d399]',
    bg: 'bg-emerald-950/60',
    text: 'text-emerald-200 font-bold',
    borderGlow: 'border border-emerald-400/50 shadow-[0_0_12px_rgba(16,185,129,0.4)]',
  },
  verification_pending: {
    dotColor: 'bg-amber-400 shadow-[0_0_10px_#fbbf24]',
    bg: 'bg-amber-950/60',
    text: 'text-amber-200 font-bold',
    borderGlow: 'border border-amber-400/50 shadow-[0_0_12px_rgba(245,158,11,0.4)]',
  },
  verified_closed: {
    dotColor: 'bg-emerald-300 shadow-[0_0_12px_#10b981]',
    bg: 'bg-emerald-900/60',
    text: 'text-emerald-100 font-extrabold',
    borderGlow: 'border border-emerald-400/60 shadow-[0_0_15px_rgba(16,185,129,0.5)]',
  },
  reopened: {
    dotColor: 'bg-rose-400 shadow-[0_0_10px_#fb7185]',
    bg: 'bg-rose-950/60',
    text: 'text-rose-200 font-bold',
    borderGlow: 'border border-rose-400/50 shadow-[0_0_12px_rgba(244,63,94,0.4)]',
  },
  human_review: {
    dotColor: 'bg-rose-400 shadow-[0_0_10px_#f43f5e]',
    bg: 'bg-rose-900/60',
    text: 'text-rose-100 font-extrabold',
    borderGlow: 'border border-rose-400/60 shadow-[0_0_15px_rgba(244,63,94,0.5)]',
  },
  // Multi-Agent Runtimes specific tags
  online: {
    dotColor: 'bg-emerald-400 shadow-[0_0_10px_#10b981]',
    bg: 'bg-emerald-950/70',
    text: 'text-emerald-200 font-mono font-bold',
    borderGlow: 'border border-emerald-400/60 shadow-[0_0_15px_rgba(16,185,129,0.45)]',
  },
  active: {
    dotColor: 'bg-fuchsia-400 shadow-[0_0_12px_#d946ef]',
    bg: 'bg-fuchsia-950/70',
    text: 'text-fuchsia-100 font-mono font-bold',
    borderGlow: 'border border-fuchsia-400/60 shadow-[0_0_15px_rgba(217,70,239,0.5)]',
  },
  standby: {
    dotColor: 'bg-purple-400 shadow-[0_0_10px_#a855f7]',
    bg: 'bg-purple-950/70',
    text: 'text-purple-200 font-mono font-bold',
    borderGlow: 'border border-purple-400/60 shadow-[0_0_15px_rgba(168,85,247,0.45)]',
  },
  monitoring: {
    dotColor: 'bg-pink-400 shadow-[0_0_10px_#ec4899]',
    bg: 'bg-pink-950/70',
    text: 'text-pink-200 font-mono font-bold',
    borderGlow: 'border border-pink-400/60 shadow-[0_0_15px_rgba(236,72,153,0.45)]',
  },
};

export default function StatusBadge({ status, className = '', size = 'sm' }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase();
  const config = statusMap[normalizedStatus] || {
    dotColor: 'bg-purple-400 shadow-[0_0_8px_#a855f7]',
    bg: 'bg-purple-950/60',
    text: 'text-purple-200 font-bold',
    borderGlow: 'border border-purple-500/40',
  };

  const label = normalizedStatus.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  const sizeClasses = size === 'sm' ? 'px-3 py-1.5 text-xs' : size === 'lg' ? 'px-5 py-2.5 text-base' : 'px-4 py-2 text-sm';

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full tracking-wide shadow-sm backdrop-blur-md ${sizeClasses} ${config.bg} ${config.text} ${config.borderGlow} ${className}`}
    >
      <span className={`w-2 h-2 rounded-full ${config.dotColor} animate-pulse`} />
      {label}
    </span>
  );
}
