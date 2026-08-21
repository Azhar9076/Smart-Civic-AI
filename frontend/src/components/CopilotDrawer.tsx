'use client';

import React, { useState, useEffect } from 'react';
import GlassCard from './GlassCard';

export type CopilotDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  caseId?: string;
};

export default function CopilotDrawer({ isOpen, onClose, caseId }: CopilotDrawerProps) {
  const [isDispatching, setIsDispatching] = useState<boolean>(false);
  const [dispatched, setDispatched] = useState<boolean>(false);

  // Reset dispatch state when target case changes
  useEffect(() => {
    setDispatched(false);
    setIsDispatching(false);
  }, [caseId, isOpen]);

  if (!isOpen) return null;

  const handleDispatch = async () => {
    setIsDispatching(true);
    try {
      // 1.5-second async loading simulation for presentation demo
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setDispatched(true);
    } catch (err) {
      console.error('Work order dispatch error:', err);
    } finally {
      setIsDispatching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div 
        className="relative w-full max-w-md h-full bg-[#120424]/95 backdrop-blur-2xl border-l border-purple-500/40 shadow-[-15px_0_40px_rgba(168,85,247,0.3)] flex flex-col animate-[slideIn_0.3s_ease-out]"
        style={{ animationFillMode: 'forwards' }}
      >
        {/* Top Accent Light Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-fuchsia-400 to-transparent opacity-90" />

        <div className="p-6 border-b border-purple-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 flex items-center justify-center shadow-[0_0_18px_rgba(217,70,239,0.5)] border border-fuchsia-400/60">
              <span className="text-2xl">✨</span>
            </div>
            <div>
              <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-fuchsia-100 to-purple-200">
                AI Officer Copilot
              </h2>
              <p className="text-xs font-mono text-purple-200 font-medium">Autonomous Dispatch & SLA Advisor</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-purple-200 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-xl transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          <p className="text-purple-100 text-xs sm:text-sm leading-relaxed font-medium">
            Multi-agent context summary and automated routing recommendations for{' '}
            <span className="font-mono text-fuchsia-200 font-bold">{caseId ? `Case #${caseId}` : 'Incident Feed'}</span>.
          </p>

          <GlassCard padding="sm" glowColor="fuchsia" className="!bg-purple-950/50 border-purple-500/40">
            <h3 className="text-fuchsia-200 text-xs sm:text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse" />
              LangGraph Case Summary
            </h3>
            <p className="text-slate-100 text-xs sm:text-sm leading-relaxed font-medium">
              Road surface crater detected in <span className="text-fuchsia-200 font-bold">PMC Ward-15 (Hadapsar/Handewadi)</span>. Depth Anything V2 calculated <span className="text-amber-300 font-mono font-bold">0.085 m³</span> defect volume.
            </p>
          </GlassCard>

          <GlassCard padding="sm" glowColor="pink" className="!bg-pink-950/30 border-pink-500/40">
            <h3 className="text-pink-200 text-xs sm:text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
              Priority & SLA Risk Assessment
            </h3>
            <p className="text-slate-100 text-xs sm:text-sm leading-relaxed font-medium">
              Urgency Score: <span className="text-pink-300 font-extrabold font-mono">92.5/100 (CRITICAL)</span>. High traffic Pune arterial road. SLA deadline in <span className="text-amber-300 font-mono font-bold">18.2 hours</span>.
            </p>
          </GlassCard>

          <GlassCard padding="sm" glowColor={dispatched ? "emerald" : "purple"} className="!bg-purple-950/50 border-purple-500/40 transition-all duration-300">
            <h3 className="text-purple-200 text-xs sm:text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${dispatched ? 'bg-emerald-400' : 'bg-purple-400'} animate-pulse`} />
              Copilot Dispatch Guidance
            </h3>
            <p className="text-slate-100 text-xs sm:text-sm leading-relaxed mb-3.5 font-medium">
              Assign to <span className="text-emerald-300 font-bold">Team Road A1 (PMC Ward-15)</span> (1.2 km away, active cold-mix unit on site).
            </p>

            {dispatched ? (
              <div className="space-y-2.5 animate-[fadeIn_0.3s_ease-out]">
                <div className="w-full py-3.5 px-4 bg-emerald-950/80 border-2 border-emerald-400/70 rounded-xl text-xs sm:text-sm font-bold text-emerald-200 shadow-[0_0_25px_rgba(16,185,129,0.45)] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg text-emerald-300 font-black">✓</span>
                    <span>Work Order Dispatched to Team Road A1 (PMC Ward-15)</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs font-mono text-emerald-300 font-bold px-1 bg-emerald-950/40 p-2 rounded-lg border border-emerald-500/30">
                  <span>WO-20260821-0001</span>
                  <span>STATUS: EN ROUTE (ETA ~12m)</span>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleDispatch}
                disabled={isDispatching}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl text-xs sm:text-sm font-extrabold border border-fuchsia-300/50 shadow-[0_0_20px_rgba(217,70,239,0.4)] hover:shadow-[0_0_30px_rgba(217,70,239,0.6)] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isDispatching ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Dispatching Work Order...</span>
                  </>
                ) : (
                  <>
                    <span className="text-base">⚡</span>
                    <span>Execute One-Click Work Order Dispatch</span>
                  </>
                )}
              </button>
            )}
          </GlassCard>
        </div>
      </div>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
