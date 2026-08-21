import React from 'react';

type CaseEvent = {
  stage: string;
  timestamp?: string;
  details?: string;
  runtime?: string;
  status: 'completed' | 'current' | 'future';
};

type CaseTimelineProps = {
  events: CaseEvent[];
};

export default function CaseTimeline({ events }: CaseTimelineProps) {
  return (
    <div className="relative border-l border-white/20 ml-3 py-2 space-y-8">
      {events.map((event, index) => (
        <div key={index} className="relative pl-8">
          {/* Dot */}
          <div className={`absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full ${
            event.status === 'completed' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 
            event.status === 'current' ? 'bg-cyan-400 animate-pulse shadow-[0_0_12px_rgba(6,182,212,0.9)]' : 
            'bg-gray-600'
          }`} />
          
          <div className="flex flex-col">
            <h4 className={`text-sm font-semibold ${
              event.status === 'completed' ? 'text-emerald-400' :
              event.status === 'current' ? 'text-cyan-400' :
              'text-white/40'
            }`}>
              {event.stage}
            </h4>
            
            {event.timestamp && (
              <span className="text-xs text-white/50 mt-1">{new Date(event.timestamp).toLocaleString()}</span>
            )}
            
            {event.details && (
              <p className="text-sm text-white/70 mt-2 bg-white/5 p-3 rounded-lg border border-white/5">
                {event.details}
              </p>
            )}
            
            {event.runtime && (
              <span className="text-xs font-mono text-cyan-500 mt-2 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                {event.runtime}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
