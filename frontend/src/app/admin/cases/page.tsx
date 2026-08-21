'use client';

import React, { useState } from 'react';
import GlassCard from '@/components/GlassCard';
import GlowButton from '@/components/GlowButton';
import CopilotDrawer from '@/components/CopilotDrawer';
import StatusBadge from '@/components/StatusBadge';
import SLATimer from '@/components/SLATimer';

const mockCases = Array.from({ length: 15 }).map((_, i) => ({
  id: `CASE-${2000 + i}`,
  category: ['Pothole', 'Water Leak', 'Garbage', 'Street Light'][Math.floor(Math.random() * 4)],
  priority: Math.floor(Math.random() * 100),
  status: ['submitted', 'in_progress', 'resolved', 'verification_pending'][Math.floor(Math.random() * 4)],
  ward: `Ward ${Math.floor(Math.random() * 24) + 1}`,
  slaDueAt: new Date(Date.now() + (Math.random() * 48 - 12) * 3600000).toISOString(),
  assignedTo: Math.random() > 0.5 ? 'Team Alpha' : 'Unassigned'
}));

export default function CasesTablePage() {
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<string | null>(null);

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col relative">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Case Management</h1>
        <div className="flex gap-4">
          <select className="bg-slate-900/60 border border-white/20 rounded-xl px-4 py-2 text-white text-sm outline-none">
            <option>All Statuses</option>
            <option>Open</option>
            <option>Resolved</option>
          </select>
          <GlowButton variant="outline" size="sm">Export CSV</GlowButton>
        </div>
      </div>

      <GlassCard padding="none" className="flex-1 flex flex-col overflow-hidden">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-white/5 sticky top-0 z-10 backdrop-blur-md">
              <tr className="border-b border-white/10 text-white/60 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Case ID</th>
                <th className="px-6 py-4 font-medium">Category / Ward</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Priority Score</th>
                <th className="px-6 py-4 font-medium">SLA Timer</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {mockCases.map((c) => (
                <tr key={c.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4 font-mono text-cyan-400 text-sm font-semibold">{c.id}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-white/90 font-medium">{c.category}</div>
                    <div className="text-xs text-white/50">{c.ward}</div>
                  </td>
                  <td className="px-6 py-4"><StatusBadge status={c.status} /></td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-bold ${c.priority > 80 ? 'text-red-400' : c.priority > 50 ? 'text-orange-400' : 'text-cyan-400'}`}>
                        {c.priority}
                      </span>
                      <div className="w-16 bg-white/10 rounded-full h-1">
                        <div className={`h-1 rounded-full ${c.priority > 80 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : c.priority > 50 ? 'bg-orange-500' : 'bg-cyan-500'}`} style={{ width: `${c.priority}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <SLATimer dueAt={c.slaDueAt} status={c.status} />
                  </td>
                  <td className="px-6 py-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition-colors">View</button>
                    <button 
                      onClick={() => { setSelectedCase(c.id); setCopilotOpen(true); }}
                      className="text-xs bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-400 border border-cyan-500/30 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                    >
                      ✨ Ask AI
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination mock */}
        <div className="border-t border-white/10 px-6 py-4 flex justify-between items-center bg-black/20">
          <span className="text-sm text-white/50">Showing 1 to 15 of 1,248 entries</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-white/5 text-white/50 rounded hover:bg-white/10">Prev</button>
            <button className="px-3 py-1 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded">1</button>
            <button className="px-3 py-1 bg-white/5 text-white/50 rounded hover:bg-white/10">2</button>
            <button className="px-3 py-1 bg-white/5 text-white/50 rounded hover:bg-white/10">Next</button>
          </div>
        </div>
      </GlassCard>

      <CopilotDrawer 
        isOpen={copilotOpen} 
        onClose={() => setCopilotOpen(false)} 
        caseId={selectedCase || undefined}
      />
    </div>
  );
}
