'use client';

import React, { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import GlassCard from '@/components/GlassCard';
import GlowButton from '@/components/GlowButton';

// Dynamic import with SSR disabled to prevent Leaflet window reference errors in Next.js App Router
const MapContainer = dynamic(() => import('react-leaflet').then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((m) => m.TileLayer), { ssr: false });
const CircleMarker = dynamic(() => import('react-leaflet').then((m) => m.CircleMarker), { ssr: false });
const Polygon = dynamic(() => import('react-leaflet').then((m) => m.Polygon), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((m) => m.Popup), { ssr: false });
const Tooltip = dynamic(() => import('react-leaflet').then((m) => m.Tooltip), { ssr: false });

// Mumbai Metropolitan Coordinate Center
const MUMBAI_CENTER: [number, number] = [19.0760, 72.8777];

// Authentic Ward Polygons GeoJSON representations
const WARDS_GEOJSON = [
  {
    name: 'Ward A (Andheri / K-West)',
    code: 'WARD-A',
    department: 'Roads & Infrastructure - West',
    activeTeams: 4,
    slaHealth: '92%',
    coordinates: [
      [19.110, 72.830],
      [19.110, 72.860],
      [19.130, 72.860],
      [19.130, 72.830],
    ] as [number, number][],
    color: '#06B6D4'
  },
  {
    name: 'Ward B (Bandra / H-West)',
    code: 'WARD-B',
    department: 'Water Supply & Drainage - West',
    activeTeams: 3,
    slaHealth: '88%',
    coordinates: [
      [19.045, 72.825],
      [19.045, 72.855],
      [19.065, 72.855],
      [19.065, 72.825],
    ] as [number, number][],
    color: '#10B981'
  },
  {
    name: 'Ward C (Dadar / G-North)',
    code: 'WARD-C',
    department: 'Solid Waste Management - Central',
    activeTeams: 2,
    slaHealth: '74%',
    coordinates: [
      [19.010, 72.835],
      [19.010, 72.855],
      [19.025, 72.855],
      [19.025, 72.835],
    ] as [number, number][],
    color: '#F59E0B'
  }
];

// Active Municipal Teams
const MUNICIPAL_TEAMS = [
  { id: 'TEAM-ROAD-A1', name: 'Road Rapid Unit A1', lat: 19.118, lng: 72.848, status: 'DISPATCHED', category: 'Pothole' },
  { id: 'TEAM-WATER-B2', name: 'Hydraulic Team B2', lat: 19.052, lng: 72.838, status: 'EN_ROUTE', category: 'Water Leak' },
  { id: 'TEAM-WASTE-C1', name: 'Solid Waste Crew C1', lat: 19.018, lng: 72.842, status: 'ON_SITE', category: 'Garbage' }
];

export default function AdminMapPage() {
  const [isClient, setIsClient] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [showTeams, setShowTeams] = useState<boolean>(true);
  const [showWards, setShowWards] = useState<boolean>(true);
  const [casePoints, setCasePoints] = useState<any[]>([]);

  useEffect(() => {
    setIsClient(true);

    // Generate initial cases synchronized with seed data & spatial spread
    const initialCases = [
      { id: 'SCA-20260820-A1B2', lat: 19.119, lng: 72.846, category: 'Pothole', priority: 92.5, label: 'CRITICAL', slaRemaining: '18h', ward: 'WARD-A', depth: '0.085 m³' },
      { id: 'SCA-20260820-C3D4', lat: 19.054, lng: 72.840, category: 'Water Leak', priority: 55.0, label: 'HIGH', slaRemaining: '38h', ward: 'WARD-B', depth: null },
      { id: 'SCA-20260819-E5F6', lat: 19.018, lng: 72.844, category: 'Garbage', priority: 30.0, label: 'MEDIUM', slaRemaining: '46h', ward: 'WARD-C', depth: '0.250 m³' },
      { id: 'SCA-20260820-G7H8', lat: 19.115, lng: 72.845, category: 'Street Light', priority: 70.0, label: 'HIGH', slaRemaining: '34h', ward: 'WARD-A', depth: null },
      { id: 'SCA-20260820-I9J0', lat: 19.1192, lng: 72.8462, category: 'Pothole', priority: 85.0, label: 'CRITICAL', slaRemaining: '23h', ward: 'WARD-A', depth: '0.040 m³', isMasterLinked: true },
      // Supplementary clustered points for realistic density heatmap
      { id: 'SCA-20260820-101', lat: 19.121, lng: 72.849, category: 'Pothole', priority: 78.0, label: 'CRITICAL', slaRemaining: '12h', ward: 'WARD-A' },
      { id: 'SCA-20260820-102', lat: 19.116, lng: 72.839, category: 'Road Damage', priority: 42.0, label: 'MEDIUM', slaRemaining: '52h', ward: 'WARD-A' },
      { id: 'SCA-20260820-103', lat: 19.050, lng: 72.835, category: 'Water Leak', priority: 64.0, label: 'HIGH', slaRemaining: '28h', ward: 'WARD-B' },
      { id: 'SCA-20260820-104', lat: 19.058, lng: 72.848, category: 'Drainage', priority: 81.0, label: 'CRITICAL', slaRemaining: '8h (BREACH IMMINENT)', ward: 'WARD-B' },
      { id: 'SCA-20260820-105', lat: 19.014, lng: 72.849, category: 'Garbage', priority: 25.0, label: 'LOW', slaRemaining: '68h', ward: 'WARD-C' },
    ];

    setCasePoints(initialCases);
  }, []);

  const filteredPoints = useMemo(() => {
    return casePoints.filter((pt) => {
      const matchCat = selectedCategory === 'ALL' || pt.category === selectedCategory;
      const matchPri = selectedPriority === 'ALL' || pt.label === selectedPriority;
      return matchCat && matchPri;
    });
  }, [casePoints, selectedCategory, selectedPriority]);

  if (!isClient) {
    return (
      <div className="w-full h-full min-h-[85vh] flex items-center justify-center bg-[#090D16] text-white/70">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <span className="font-mono text-xs tracking-widest text-cyan-400">LOADING GIS SPATIAL ENGINE...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[calc(100vh-64px)] overflow-hidden bg-[#090D16]">
      {/* Interactive Map */}
      <MapContainer
        center={MUMBAI_CENTER}
        zoom={12}
        zoomControl={false}
        className="w-full h-full z-0"
        style={{ background: '#090D16' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CartoDB DarkMatter</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Deterministic PostGIS Ward Boundary Overlays */}
        {showWards &&
          WARDS_GEOJSON.map((ward) => (
            <Polygon
              key={ward.code}
              positions={ward.coordinates}
              pathOptions={{
                color: ward.color,
                fillColor: ward.color,
                fillOpacity: 0.08,
                weight: 1.5,
                dashArray: '6, 6'
              }}
            >
              <Tooltip sticky direction="top" className="glass-tooltip">
                <div className="bg-slate-900/90 text-white p-2 rounded border border-cyan-500/30 text-xs font-mono">
                  <div className="font-bold text-cyan-400">{ward.name}</div>
                  <div className="text-white/70">Dept: {ward.department}</div>
                  <div className="text-emerald-400">SLA Health: {ward.slaHealth}</div>
                </div>
              </Tooltip>
            </Polygon>
          ))}

        {/* Live Heatmap / Incidents Markers */}
        {filteredPoints.map((pt) => {
          let color = '#06B6D4'; // LOW
          let radius = 6;
          let opacity = 0.5;

          if (pt.label === 'CRITICAL') {
            color = '#EF4444';
            radius = 12;
            opacity = 0.85;
          } else if (pt.label === 'HIGH') {
            color = '#F97316';
            radius = 9;
            opacity = 0.7;
          } else if (pt.label === 'MEDIUM') {
            color = '#EAB308';
            radius = 7;
            opacity = 0.6;
          }

          return (
            <CircleMarker
              key={pt.id}
              center={[pt.lat, pt.lng]}
              radius={radius}
              pathOptions={{
                color: color,
                fillColor: color,
                fillOpacity: opacity,
                weight: pt.isMasterLinked ? 2 : 0,
                dashArray: pt.isMasterLinked ? '2, 2' : undefined
              }}
            >
              <Popup className="glass-leaflet-popup">
                <div className="bg-slate-950/95 text-white p-4 rounded-xl border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.8)] min-w-[240px]">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
                    <span className="font-mono text-cyan-400 font-bold text-xs">{pt.id}</span>
                    <span 
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ 
                        backgroundColor: `${color}20`,
                        color: color,
                        border: `1px solid ${color}40`
                      }}
                    >
                      {pt.label} ({pt.priority})
                    </span>
                  </div>

                  <div className="space-y-1 text-xs mb-3">
                    <div className="flex justify-between">
                      <span className="text-white/50">Category:</span>
                      <span className="font-medium text-white/90">{pt.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50">Jurisdiction:</span>
                      <span className="font-mono text-cyan-300">{pt.ward}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50">SLA Due In:</span>
                      <span className="font-mono text-emerald-400 font-semibold">{pt.slaRemaining}</span>
                    </div>
                    {pt.depth && (
                      <div className="flex justify-between">
                        <span className="text-white/50">Depth AI Est:</span>
                        <span className="font-mono text-amber-300 font-semibold">{pt.depth}</span>
                      </div>
                    )}
                    {pt.isMasterLinked && (
                      <div className="text-[10px] text-cyan-400 bg-cyan-950/60 p-1 rounded border border-cyan-800/60 mt-1">
                        ★ Merged with Master Pothole Case
                      </div>
                    )}
                  </div>

                  <a 
                    href={`/admin/cases?id=${pt.id}`}
                    className="block text-center text-xs w-full py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-lg transition-all font-medium"
                  >
                    Open Case Investigation →
                  </a>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        {/* Live Field Team Unit Pins */}
        {showTeams &&
          MUNICIPAL_TEAMS.map((team) => (
            <CircleMarker
              key={team.id}
              center={[team.lat, team.lng]}
              radius={8}
              pathOptions={{
                color: '#10B981',
                fillColor: '#10B981',
                fillOpacity: 0.9,
                weight: 2
              }}
            >
              <Tooltip permanent={false} direction="top">
                <div className="bg-slate-900 text-emerald-300 text-xs font-mono p-1 rounded border border-emerald-500/40">
                  ⚡ {team.name} ({team.status})
                </div>
              </Tooltip>
            </CircleMarker>
          ))}
      </MapContainer>

      {/* Floating Control & Filter Glass Panel */}
      <div className="absolute top-6 left-6 z-10 w-84 space-y-4 pointer-events-none">
        <GlassCard padding="sm" className="pointer-events-auto shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              GIS Spatial Intelligence
            </h3>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
              ST_Contains ACTIVE
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div>
              <label className="text-white/60 block mb-1">Issue Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-slate-900/80 border border-white/10 rounded-lg px-3 py-1.5 text-white/90 outline-none focus:border-cyan-500/50"
              >
                <option value="ALL">All Categories ({casePoints.length})</option>
                <option value="Pothole">Pothole</option>
                <option value="Water Leak">Water Leak</option>
                <option value="Garbage">Garbage</option>
                <option value="Street Light">Street Light</option>
                <option value="Drainage">Drainage</option>
              </select>
            </div>

            <div>
              <label className="text-white/60 block mb-1">Explainable Priority</label>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="w-full bg-slate-900/80 border border-white/10 rounded-lg px-3 py-1.5 text-white/90 outline-none focus:border-cyan-500/50"
              >
                <option value="ALL">All Severity Levels</option>
                <option value="CRITICAL">Critical (Score 75-100)</option>
                <option value="HIGH">High (Score 50-75)</option>
                <option value="MEDIUM">Medium (Score 25-50)</option>
                <option value="LOW">Low (Score 0-25)</option>
              </select>
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-white/80">
                <input
                  type="checkbox"
                  checked={showWards}
                  onChange={(e) => setShowWards(e.target.checked)}
                  className="rounded bg-slate-800 border-white/20 text-cyan-500 focus:ring-0"
                />
                Ward Boundaries
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-white/80">
                <input
                  type="checkbox"
                  checked={showTeams}
                  onChange={(e) => setShowTeams(e.target.checked)}
                  className="rounded bg-slate-800 border-white/20 text-emerald-500 focus:ring-0"
                />
                Field Units
              </label>
            </div>
          </div>
        </GlassCard>

        {/* Heatmap Legend */}
        <GlassCard padding="sm" className="pointer-events-auto">
          <div className="text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-2">Priority Heatmap Legend</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 text-white/80">
              <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_#EF4444]" />
              <span>Critical (24h SLA)</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span>High (48h SLA)</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span>Medium (72h SLA)</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <div className="w-3 h-3 rounded-full bg-cyan-500" />
              <span>Low (Standard)</span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Global override styling for Leaflet Dark Glass Integration */}
      <style jsx global>{`
        .leaflet-popup-content-wrapper {
          background: transparent !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .leaflet-popup-tip-container {
          display: none !important;
        }
        .leaflet-popup-content {
          margin: 0 !important;
        }
      `}</style>
    </div>
  );
}
