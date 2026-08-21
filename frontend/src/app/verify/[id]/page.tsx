'use client';

import React, { useState } from 'react';
import GlassCard from '@/components/GlassCard';
import GlowButton from '@/components/GlowButton';
import StatusBadge from '@/components/StatusBadge';

export default function VerifyPage({ params }: { params: { id: string } }) {
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (accept: boolean) => {
    // API call simulated here
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <GlassCard padding="lg" glowColor="emerald" className="max-w-md w-full text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-white mb-2">Verification Submitted</h2>
          <p className="text-white/60 mb-6">Thank you for confirming the resolution. Your civic duty helps keep the city smart!</p>
          <GlowButton variant="cyan" onClick={() => window.location.href = '/'} className="w-full">
            Back to Home
          </GlowButton>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          Verify Resolution: {params.id}
          <StatusBadge status="verification_pending" />
        </h1>
        <p className="text-white/60">The department has marked this issue as resolved. Please verify if the work is completed.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <GlassCard title="Before" padding="sm" className="overflow-hidden relative group">
          <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold border border-white/20">BEFORE</div>
          <img 
            src="https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=800" 
            alt="Before repair" 
            className="w-full aspect-[4/3] object-cover rounded-xl opacity-80 group-hover:opacity-100 transition-opacity" 
          />
        </GlassCard>
        
        <GlassCard title="After" padding="sm" glowColor="emerald" className="overflow-hidden relative group border-emerald-500/30">
          <div className="absolute top-4 left-4 z-10 bg-emerald-900/80 text-emerald-400 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]">AFTER</div>
          <img 
            src="https://images.unsplash.com/photo-1584824486516-0555a07fc511?auto=format&fit=crop&q=80&w=800" 
            alt="After repair" 
            className="w-full aspect-[4/3] object-cover rounded-xl" 
          />
        </GlassCard>
      </div>

      <GlassCard padding="lg">
        <h2 className="text-xl font-semibold mb-4 text-white">Provide Feedback (Optional)</h2>
        <textarea 
          className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-cyan-500/50 mb-6" 
          placeholder="Any additional comments on the repair quality?"
          rows={3}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />
        
        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <GlowButton 
            variant="outline" 
            onClick={() => handleSubmit(false)}
            className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500"
          >
            Reject - Not Fixed
          </GlowButton>
          <GlowButton 
            variant="emerald" 
            onClick={() => handleSubmit(true)}
          >
            Accept & Close Case
          </GlowButton>
        </div>
      </GlassCard>
    </div>
  );
}
