import React from 'react';

export type GlowButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'purple' | 'fuchsia' | 'cyan' | 'emerald' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
};

export default function GlowButton({
  children,
  onClick,
  variant = 'purple',
  size = 'md',
  disabled = false,
  loading = false,
  type = 'button',
  className = '',
}: GlowButtonProps) {
  const sizeMap = {
    sm: 'px-4 py-2 text-xs sm:text-sm rounded-xl',
    md: 'px-6 py-3 text-sm sm:text-base rounded-xl',
    lg: 'px-8 py-4 text-base sm:text-lg rounded-2xl',
  };

  const variantMap = {
    purple: 'bg-purple-600/40 text-white font-extrabold border border-fuchsia-400/60 hover:bg-purple-600/60 hover:text-white shadow-[0_0_20px_rgba(217,70,239,0.4)]',
    fuchsia: 'bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 text-white font-black border border-fuchsia-300/60 hover:shadow-[0_0_35px_rgba(217,70,239,0.6)] hover:scale-[1.02] shadow-[0_0_25px_rgba(217,70,239,0.45)]',
    cyan: 'bg-cyan-500/25 text-cyan-200 font-extrabold border border-cyan-400/50 hover:bg-cyan-500/40 hover:text-white shadow-[0_0_20px_rgba(6,182,212,0.35)]',
    emerald: 'bg-emerald-500/25 text-emerald-200 font-extrabold border border-emerald-400/50 hover:bg-emerald-500/40 hover:text-white shadow-[0_0_20px_rgba(16,185,129,0.35)]',
    outline: 'border border-purple-500/40 text-purple-100 font-bold hover:bg-purple-900/40 hover:text-white hover:border-fuchsia-400/60 shadow-sm transition-colors',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center tracking-wide transition-all duration-300 ${sizeMap[size]} ${variantMap[variant]} ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'
      } ${className}`}
    >
      {loading ? (
        <svg className="animate-spin -ml-1 mr-2.5 h-5 w-5 text-fuchsia-200" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : null}
      {children}
    </button>
  );
}
