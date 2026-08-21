import Link from 'next/link';

export default function Home() {
  return (
    <div className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8 bg-[#0d021a] text-white">
      {/* Animated Background Ambient Radial Mesh */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[45vw] h-[45vw] bg-purple-700/30 rounded-full blur-[160px] animate-pulse" />
        <div 
          className="absolute bottom-1/4 right-1/4 w-[40vw] h-[40vw] bg-fuchsia-600/25 rounded-full blur-[160px] animate-pulse" 
          style={{ animationDelay: '0.8s' }} 
        />
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[35vw] h-[35vw] bg-pink-600/20 rounded-full blur-[180px] animate-pulse" 
          style={{ animationDelay: '1.6s' }} 
        />
      </div>

      {/* Hero Title & Pitch */}
      <div className="text-center z-10 mb-12 max-w-4xl">
        <h1 className="text-5xl sm:text-7xl md:text-8xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-fuchsia-100 to-purple-300 drop-shadow-[0_0_30px_rgba(217,70,239,0.5)]">
          Smart Civic AI
        </h1>
        <p className="text-xl sm:text-2xl text-purple-100 font-normal max-w-3xl mx-auto leading-relaxed drop-shadow-sm">
          Autonomous, closed-loop civic intelligence platform. Real-time PostGIS spatial routing, Depth Anything V2 volumetric vision, and LangGraph multi-agent orchestration.
        </p>
      </div>

      {/* Hero CTAs with Glowing Gradient Aesthetics */}
      <div className="flex flex-col sm:flex-row gap-5 z-10 w-full max-w-lg justify-center">
        <Link href="/report" className="w-full sm:w-auto">
          <button className="w-full sm:w-64 py-4 px-8 rounded-2xl text-base sm:text-lg font-extrabold text-white bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 shadow-[0_0_25px_rgba(217,70,239,0.5)] hover:shadow-[0_0_45px_rgba(217,70,239,0.7)] hover:scale-105 active:scale-95 transition-all duration-300 border border-fuchsia-300/50 flex items-center justify-center gap-3">
            <span className="text-xl">📷</span>
            <span>Report an Issue</span>
          </button>
        </Link>
        
        <Link href="/admin" className="w-full sm:w-auto">
          <button className="w-full sm:w-64 py-4 px-8 rounded-2xl text-base sm:text-lg font-extrabold text-white bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/50 hover:border-fuchsia-400/70 shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_35px_rgba(217,70,239,0.5)] hover:scale-105 active:scale-95 transition-all duration-300 backdrop-blur-2xl flex items-center justify-center gap-3">
            <span className="text-xl">🏛️</span>
            <span>Admin Console</span>
          </button>
        </Link>
      </div>
    </div>
  );
}
