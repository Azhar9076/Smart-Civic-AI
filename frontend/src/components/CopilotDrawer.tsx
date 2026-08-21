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
      // Simulate backend work-order dispatch pipeline
      await new Promise((resolve) => setTimeout(resolve, 750));
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
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div 
        className="relative w-full max-w-md h-full bg-[#120424]/95 backdrop-blur-2xl border-l border-purple-500/30 shadow-[-15px_0_40px_rgba(168,85,247,0.25)] flex flex-col animate-[slideIn_0.3s_ease-out]"
        style={{ animationFillMode: 'forwards' }}
      >
        {/* Top Accent Light Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-fuchsia-400 to-transparent opacity-90" />

        <div className="p-6 border-b border-purple-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(217,70,239,0.5)] border border-fuchsia-400/50">
              <span className="text-xl">✨</span>
            </div>
            <div>
              <h2 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-300 via-purple-300 to-pink-300">
                AI Officer Copilot
              </h2>
              <p className="text-[11px] font-mono text-purple-300/60">Autonomous Dispatch & SLA Advisor</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-white/50 hover:text-white bg-white/5 hover:bg-white/10 p-1.5 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          <p className="text-white/70 text-xs leading-relaxed">
            Multi-agent context summary and automated routing recommendations for{' '}
            <span className="font-mono text-fuchsia-300 font-semibold">{caseId ? `Case #${caseId}` : 'Incident Feed'}</span>.
          </p>

          <GlassCard padding="sm" glowColor="fuchsia" className="!bg-purple-950/30">
            <h3 className="text-fuchsia-300 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse" />
              LangGraph Case Summary
            </h3>
            <p className="text-white/80 text-xs leading-relaxed">
              Large asphalt pothole detected in <span className="text-purple-300 font-medium">Ward-A (Andheri Link Rd)</span>. Depth Anything V2 calculated <span className="text-fuchsia-300 font-mono font-bold">0.085 m³</span> defect volume.
            </p>
          </GlassCard>

          <GlassCard padding="sm" glowColor="pink" className="!bg-pink-950/20 border-pink-500/30">
            <h3 className="text-pink-300 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
              Priority & SLA Risk Assessment
            </h3>
            <p className="text-white/80 text-xs leading-relaxed">
              Urgency Score: <span className="text-red-400 font-bold font-mono">92.5/100 (CRITICAL)</span>. High traffic arterial road near Metro Station. SLA deadline in <span className="text-amber-300 font-mono font-semibold">18.2 hours</span>.
            </p>
          </GlassCard>

          <GlassCard padding="sm" glowColor={dispatched ? "emerald" : "purple"} className="!bg-purple-950/30 transition-all duration-300">
            <h3 className="text-purple-300 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${dispatched ? 'bg-emerald-400' : 'bg-purple-400'} animate-pulse`} />
              Copilot Dispatch Guidance
            </h3>
            <p className="text-white/80 text-xs leading-relaxed mb-3">
              Assign to <span className="text-emerald-300 font-medium">Team Road A1</span> (1.2 km away, active cold-mix compactor unit on site).
            </p>

            {dispatched ? (
              <div className="space-y-2 animate-[fadeIn_0.3s_ease-out]">
                <div className="w-full py-3 px-4 bg-emerald-500/20 border border-emerald-400/50 rounded-xl text-xs font-semibold text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.35)] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">✓</span>
                    <span>Work Order Dispatched to Team Road A1</span>
                  </div>
                  <span className="text-[10px] font-mono bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-400/40 text-emerald-200">
                    WO-20260820-0001
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-emerald-400/80 px-1">
                  <span>Status: EN ROUTE</span>
                  <span>ETA: ~12 mins</span>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleDispatch}
                disabled={isDispatching}
                className="w-full py-2.5 bg-gradient-to-r from-purple-600/40 via-fuchsia-600/40 to-pink-600/40 hover:from-purple-600/60 hover:to-fuchsia-600/60 text-fuchsia-200 rounded-xl text-xs font-semibold border border-fuchsia-400/40 shadow-[0_0_15px_rgba(217,70,239,0.3)] hover:shadow-[0_0_25px_rgba(217,70,239,0.5)] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDispatching ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-fuchsia-300" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Dispatching Work Order...</span>
                  </>
                ) : (
                  <>
                    <span>⚡</span>
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
