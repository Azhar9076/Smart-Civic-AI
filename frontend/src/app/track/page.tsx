'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import GlassCard from '@/components/GlassCard';
import GlowButton from '@/components/GlowButton';

export default function TrackPage() {
  const [caseId, setCaseId] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (caseId.trim()) {
      router.push(`/track/${caseId.trim()}`);
    }
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]">
          Track Your Case
        </h1>
        <p className="text-white/60 text-lg">Enter your Case Number or Phone Number to view live status.</p>
      </div>

      <GlassCard padding="lg" glowColor="cyan" className="w-full max-w-xl">
        <form onSubmit={handleSearch} className="flex flex-col gap-6">
          <div>
            <label className="block text-sm font-medium text-cyan-400 mb-2">Case ID / Number</label>
            <input 
              type="text" 
              value={caseId}
              onChange={(e) => setCaseId(e.target.value)}
              placeholder="e.g. CASE-12345" 
              className="w-full bg-slate-900/60 border border-white/20 rounded-xl px-4 py-3 text-white text-lg placeholder-white/30 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all shadow-inner"
            />
          </div>
          <GlowButton type="submit" variant="cyan" size="lg" disabled={!caseId.trim()}>
            Track Status
          </GlowButton>
        </form>
      </GlassCard>
    </div>
  );
}
