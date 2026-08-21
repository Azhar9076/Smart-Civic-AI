import React from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0d021a] text-white relative overflow-hidden flex flex-col">
      {/* Ambient Multi-Layered Purple & Fuchsia Glow Background Mesh */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[55vw] h-[55vw] bg-purple-700/25 rounded-full blur-[160px] animate-pulse" />
        <div 
          className="absolute top-1/3 -right-32 w-[45vw] h-[45vw] bg-fuchsia-600/20 rounded-full blur-[160px] animate-pulse" 
          style={{ animationDelay: '1.2s' }} 
        />
        <div 
          className="absolute -bottom-40 left-1/4 w-[50vw] h-[50vw] bg-pink-600/15 rounded-full blur-[180px] animate-pulse" 
          style={{ animationDelay: '2.5s' }} 
        />
      </div>

      {/* Main Content Viewport */}
      <main className="flex-1 w-full relative z-0">
        {children}
      </main>
    </div>
  );
}
