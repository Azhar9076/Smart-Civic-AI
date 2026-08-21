'use client';

import React, { useEffect, useState } from 'react';

type SLATimerProps = {
  dueAt: string;
  status: string;
};

export default function SLATimer({ dueAt, status }: SLATimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const calculateTime = () => {
      const due = new Date(dueAt).getTime();
      const now = new Date().getTime();
      return Math.max(0, due - now);
    };

    setTimeLeft(calculateTime());

    const interval = setInterval(() => {
      setTimeLeft(calculateTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [dueAt]);

  if (!isClient) return <div className="text-white/60">Loading SLA...</div>;

  const isResolved = ['resolved', 'verified_closed', 'verification_pending'].includes(status.toLowerCase());
  
  if (isResolved) {
    return (
      <div className="font-mono text-sm font-bold text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">
        SLA MET
      </div>
    );
  }

  if (timeLeft <= 0) {
    return (
      <div className="font-mono text-sm font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded border border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.4)]">
        BREACHED
      </div>
    );
  }

  // Calculate percentage (assuming 24h total SLA for demo)
  const totalMs = 24 * 60 * 60 * 1000;
  const percentLeft = (timeLeft / totalMs) * 100;
  
  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  const formatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  let colorClass = 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]';
  if (percentLeft < 25) {
    colorClass = 'text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-pulse';
  } else if (percentLeft < 75) {
    colorClass = 'text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]';
  }

  return (
    <div className={`font-mono text-sm font-semibold tracking-wider ${colorClass}`}>
      {formatted}
    </div>
  );
}
