'use client';

import React, { useEffect, useState } from 'react';
import GlassCard from '@/components/GlassCard';
import CaseTimeline from '@/components/CaseTimeline';
import StatusBadge from '@/components/StatusBadge';
import SLATimer from '@/components/SLATimer';
import GlowButton from '@/components/GlowButton';
import { getCase } from '@/lib/api';

export default function CaseDetailPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCase(params.id).then(res => {
      setData(res);
      setLoading(false);
    });
  }, [params.id]);

  if (loading) {
    return <div className="flex justify-center items-center h-[50vh]"><div className="animate-spin w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full"></div></div>;
  }

  if (!data) return <div>Case not found.</div>;

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            Case #{data.id}
            <StatusBadge status={data.status} />
          </h1>
          <p className="text-white/60">{data.category} • {data.ward}</p>
        </div>
        <GlassCard padding="sm" className="flex items-center gap-4">
          <div className="text-sm text-white/50">SLA Due In</div>
          <SLATimer dueAt={data.slaDueAt} status={data.status} />
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <GlassCard title="Timeline">
            <h2 className="text-xl font-semibold mb-6 text-cyan-400">Resolution Timeline</h2>
            <CaseTimeline events={data.events} />
          </GlassCard>

          {data.status === 'verification_pending' && (
            <GlassCard glowColor="amber" className="border-amber-500/30">
              <h2 className="text-xl font-semibold mb-2 text-amber-400">Citizen Verification Required</h2>
              <p className="text-white/70 mb-4">The department has marked this issue as resolved. Please verify if the work is completed.</p>
              <GlowButton onClick={() => window.location.href = `/verify/${data.id}`} variant="outline" className="w-full border-amber-500/50 text-amber-400 hover:bg-amber-500/10">
                Verify Resolution
              </GlowButton>
            </GlassCard>
          )}
        </div>

        <div className="space-y-6">
          <GlassCard>
            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">AI Assessment</h3>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-white/50 mb-1">Priority Score</div>
                <div className="text-3xl font-bold text-orange-400 drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]">
                  {data.priorityScore} <span className="text-sm font-normal text-white/50">/ 100</span>
                </div>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.8)]" style={{ width: `${data.priorityScore}%` }}></div>
              </div>
              <p className="text-xs text-white/50">Calculated based on severity ({data.severity}/5), location (arterial road), and historical data.</p>
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Location</h3>
            <div className="aspect-video bg-slate-800 rounded-lg flex items-center justify-center border border-white/5 mb-2 relative overflow-hidden">
               {/* Mock Map View */}
               <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
               <div className="w-4 h-4 bg-red-500 rounded-full shadow-[0_0_15px_rgba(239,68,68,1)] z-10 animate-pulse"></div>
            </div>
            <div className="text-sm font-mono text-cyan-400 text-center">
              {data.coordinates.lat}, {data.coordinates.lng}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
