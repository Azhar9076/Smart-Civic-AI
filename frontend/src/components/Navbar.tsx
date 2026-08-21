'use client';

import Link from 'next/link';
import React, { useState } from 'react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#0d021a]/85 backdrop-blur-2xl border-b border-purple-500/30 shadow-[0_4px_30px_rgba(13,2,26,0.7)]">
      {/* Top Light Accent Reflection Line */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-fuchsia-400 to-transparent opacity-90 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          
          {/* Logo & Brand */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-fuchsia-500 flex items-center justify-center shadow-[0_0_20px_rgba(217,70,239,0.6)] border border-fuchsia-300/50 group-hover:scale-105 transition-transform">
                <span className="text-xl">🏛️</span>
              </div>
              <span className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-fuchsia-100 to-purple-200 drop-shadow-[0_0_15px_rgba(217,70,239,0.5)]">
                Smart Civic AI
              </span>
            </Link>
          </div>
          
          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-3">
            <Link 
              href="/" 
              className="px-4 py-2 rounded-xl text-purple-100 hover:text-white hover:bg-purple-900/40 transition-all text-sm font-bold tracking-wide"
            >
              Home
            </Link>
            <Link 
              href="/report" 
              className="px-4 py-2 rounded-xl text-purple-100 hover:text-white hover:bg-purple-900/40 transition-all text-sm font-bold tracking-wide flex items-center gap-2"
            >
              <span>📷</span>
              <span>Report Issue</span>
            </Link>
            <Link 
              href="/track" 
              className="px-4 py-2 rounded-xl text-purple-100 hover:text-white hover:bg-purple-900/40 transition-all text-sm font-bold tracking-wide flex items-center gap-2"
            >
              <span>🔍</span>
              <span>Track Case</span>
            </Link>
            <Link 
              href="/admin" 
              className="px-5 py-2 rounded-xl bg-purple-600/40 text-white border border-fuchsia-400/60 hover:bg-purple-600/60 shadow-[0_0_20px_rgba(217,70,239,0.35)] transition-all text-sm font-black tracking-wide flex items-center gap-2"
            >
              <span>⚡</span>
              <span>Admin Console</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-purple-100 hover:text-white p-2.5 rounded-xl bg-purple-950/60 border border-purple-500/40 shadow-sm"
              aria-label="Toggle Navigation Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0d021a]/95 backdrop-blur-2xl border-b border-purple-500/40 px-6 pt-3 pb-6 space-y-3 animate-[fadeIn_0.2s_ease-out]">
          <Link 
            href="/" 
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-2.5 rounded-xl text-purple-100 hover:bg-purple-900/50 text-base font-bold"
          >
            Home
          </Link>
          <Link 
            href="/report" 
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-2.5 rounded-xl text-purple-100 hover:bg-purple-900/50 text-base font-bold"
          >
            Report Issue
          </Link>
          <Link 
            href="/track" 
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-2.5 rounded-xl text-purple-100 hover:bg-purple-900/50 text-base font-bold"
          >
            Track Case
          </Link>
          <Link 
            href="/admin" 
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-2.5 rounded-xl bg-purple-600/40 text-white border border-fuchsia-400/60 text-base font-extrabold"
          >
            Admin Console
          </Link>
        </div>
      )}
    </nav>
  );
}
