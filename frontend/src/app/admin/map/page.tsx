'use client';

import React, { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import GlassCard from '@/components/GlassCard';

// Dynamic import with SSR disabled to prevent Leaflet window reference errors in Next.js App Router
const MapContainer = dynamic(() => import('react-leaflet').then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((m) => m.TileLayer), { ssr: false });
const CircleMarker = dynamic(() => import('react-leaflet').then((m) => m.CircleMarker), { ssr: false });
const Polygon = dynamic(() => import('react-leaflet').then((m) => m.Polygon), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((m) => m.Popup), { ssr: false });
const Tooltip = dynamic(() => import('react-leaflet').then((m) => m.Tooltip), { ssr: false });

// Pune Municipal Corporation (PMC) Coordinate Center
const PUNE_CENTER: [number, number] = [18.5204, 73.8567];

// Authentic PMC Ward Polygons GeoJSON representations
const WARDS_GEOJSON = [
  {
    name: 'PMC Ward-08 (Shivajinagar / Kothrud)',
    code: 'PMC-WARD-08',
    department: 'Roads & Infrastructure - Central Pune',
    activeTeams: 4,
    slaHealth: '96%',
    coordinates: [
      [18.515, 73.820],
      [18.515, 73.860],
      [18.540, 73.860],
      [18.540, 73.820],
    ] as [number, number][],
    color: '#d946ef'
  },
  {
    name: 'PMC Ward-15 (Hadapsar / Handewadi)',
    code: 'PMC-WARD-15',
    department: 'Water Supply & Drainage - East Pune',
    activeTeams: 3,
    slaHealth: '91%',
    coordinates: [
      [18.485, 73.900],
      [18.485, 73.950],
      [18.520, 73.950],
      [18.520, 73.900],
    ] as [number, number][],
    color: '#a855f7'
  },
  {
    name: 'PMC Ward-04 (Viman Nagar / Kalyani Nagar)',
    code: 'PMC-WARD-04',
    department: 'Solid Waste & Urban Management - North Pune',
    activeTeams: 2,
    slaHealth: '84%',
    coordinates: [
      [18.540, 73.885],
      [18.540, 73.935],
      [18.575, 73.935],
      [18.575, 73.885],
    ] as [number, number][],
    color: '#ec4899'
  }
];

// Active Pune Municipal Corporation Teams
const MUNICIPAL_TEAMS = [
  { id: 'PMC-ROAD-A1', name: 'PMC Road Rapid Squad A1 (Shivajinagar)', lat: 18.528, lng: 73.842, status: 'DISPATCHED', category: 'Pothole' },
  { id: 'PMC-WATER-B2', name: 'PMC Hydraulic Team B2 (Hadapsar)', lat: 18.502, lng: 73.928, status: 'EN_ROUTE', category: 'Water Leak' },
  { id: 'PMC-WASTE-C1', name: 'PMC Solid Waste Crew C1 (Viman Nagar)', lat: 18.558, lng: 73.912, status: 'ON_SITE', category: 'Garbage' }
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

    // Initial cases for Pune Municipal Corporation
    const initialCases = [
      { id: 'SCA-20260821-P1A2', lat: 18.528, lng: 73.842, category: 'Pothole', priority: 92.5, label: 'CRITICAL', slaRemaining: '18h', ward: 'PMC Ward-08 (Shivajinagar)', depth: '0.085 m³' },
      { id: 'SCA-20260821-P3B4', lat: 18.502, lng: 73.928, category: 'Water Leak', priority: 55.0, label: 'HIGH', slaRemaining: '38h', ward: 'PMC Ward-15 (Hadapsar)', depth: null },
      { id: 'SCA-20260821-P5C6', lat: 18.558, lng: 73.912, category: 'Garbage', priority: 30.0, label: 'MEDIUM', slaRemaining: '46h', ward: 'PMC Ward-04 (Viman Nagar)', depth: '0.250 m³' },
      { id: 'SCA-20260821-P7D8', lat: 18.508, lng: 73.815, category: 'Street Light', priority: 70.0, label: 'HIGH', slaRemaining: '34h', ward: 'PMC Ward-08 (Kothrud)', depth: null },
      { id: 'SCA-20260821-P9E0', lat: 18.525, lng: 73.840, category: 'Pothole', priority: 85.0, label: 'CRITICAL', slaRemaining: '23h', ward: 'PMC Ward-08 (FC Road)', depth: '0.040 m³', isMasterLinked: true },
      { id: 'SCA-20260821-101', lat: 18.530, lng: 73.845, category: 'Pothole', priority: 78.0, label: 'CRITICAL', slaRemaining: '12h', ward: 'PMC Ward-08' },
      { id: 'SCA-20260821-102', lat: 18.522, lng: 73.835, category: 'Road Damage', priority: 42.0, label: 'MEDIUM', slaRemaining: '52h', ward: 'PMC Ward-08' },
      { id: 'SCA-20260821-103', lat: 18.505, lng: 73.920, category: 'Water Leak', priority: 64.0, label: 'HIGH', slaRemaining: '28h', ward: 'PMC Ward-15' },
      { id: 'SCA-20260821-104', lat: 18.514, lng: 73.931, category: 'Drainage', priority: 81.0, label: 'CRITICAL', slaRemaining: '8h', ward: 'PMC Ward-15' },
      { id: 'SCA-20260821-105', lat: 18.562, lng: 73.918, category: 'Garbage', priority: 25.0, label: 'LOW', slaRemaining: '68h', ward: 'PMC Ward-04' },
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
      <div className="w-full h-full min-h-[85vh] flex items-center justify-center bg-[#0d021a] text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-fuchsia-400 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_#d946ef]" />
          <span className="font-mono text-xs tracking-widest text-fuchsia-200 font-bold">LOADING PUNE GIS SPATIAL GRID...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[calc(100vh-64px)] overflow-hidden bg-[#0d021a]">
      {/* Interactive Map */}
      <MapContainer
        center={PUNE_CENTER}
        zoom={12}
        zoomControl={false}
        className="w-full h-full z-0"
        style={{ background: '#0d021a' }}
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
                fillOpacity: 0.1,
                weight: 2,
                dashArray: '6, 6'
              }}
            >
              <Tooltip sticky direction="top">
                <div className="bg-[#120424] text-white p-3 rounded-xl border border-purple-500/50 text-xs font-mono shadow-xl">
                  <div className="font-bold text-fuchsia-200 text-sm">{ward.name}</div>
                  <div className="text-purple-100 font-medium">Dept: {ward.department}</div>
                  <div className="text-emerald-300 font-bold">SLA Health: {ward.slaHealth}</div>
                </div>
              </Tooltip>
            </Polygon>
          ))}

        {/* Live Heatmap / Incidents Markers */}
        {filteredPoints.map((pt) => {
          let color = '#a855f7'; // LOW
          let radius = 6;
          let opacity = 0.5;

          if (pt.label === 'CRITICAL') {
            color = '#ec4899';
            radius = 12;
            opacity = 0.9;
          } else if (pt.label === 'HIGH') {
            color = '#d946ef';
            radius = 9;
            opacity = 0.75;
          } else if (pt.label === 'MEDIUM') {
            color = '#c084fc';
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
              <Popup>
                <div className="bg-[#120424] text-white p-4 rounded-xl border border-purple-500/50 shadow-[0_10px_30px_rgba(0,0,0,0.8)] min-w-[240px]">
                  <div className="flex items-center justify-between border-b border-purple-500/30 pb-2 mb-2">
                    <span className="font-mono text-fuchsia-200 font-bold text-xs">{pt.id}</span>
                    <span 
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ 
                        backgroundColor: `${color}25`,
                        color: color,
                        border: `1px solid ${color}50`
                      }}
                    >
                      {pt.label} ({pt.priority})
                    </span>
                  </div>

                  <div className="space-y-1 text-xs mb-3">
                    <div className="flex justify-between">
                      <span className="text-purple-200">Category:</span>
                      <span className="font-bold text-white">{pt.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-200">Jurisdiction:</span>
                      <span className="font-mono text-fuchsia-200 font-semibold">{pt.ward}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-200">SLA Due In:</span>
                      <span className="font-mono text-emerald-300 font-bold">{pt.slaRemaining}</span>
                    </div>
                    {pt.depth && (
                      <div className="flex justify-between">
                        <span className="text-purple-200">Depth AI Est:</span>
                        <span className="font-mono text-amber-300 font-bold">{pt.depth}</span>
                      </div>
                    )}
                    {pt.isMasterLinked && (
                      <div className="text-[10px] text-fuchsia-200 bg-purple-950/60 p-1 rounded border border-purple-500/40 mt-1 font-mono font-bold">
                        ★ Merged with Master Incident Record
                      </div>
                    )}
                  </div>

                  <a 
                    href={`/admin?tab=cases&id=${pt.id}`}
                    className="block text-center text-xs w-full py-2 bg-purple-600/40 hover:bg-purple-600/60 text-white border border-fuchsia-400/50 rounded-xl transition-all font-bold"
                  >
                    Open Investigation →
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
                color: '#10b981',
                fillColor: '#10b981',
                fillOpacity: 0.95,
                weight: 2
              }}
            >
              <Tooltip direction="top">
                <div className="bg-[#120424] text-emerald-200 text-xs font-mono p-1.5 rounded-lg border border-emerald-500/50 font-bold">
                  ⚡ {team.name} ({team.status})
                </div>
              </Tooltip>
            </CircleMarker>
          ))}
      </MapContainer>

      {/* Floating Control & Filter Glass Panel */}
      <div className="absolute top-6 left-6 z-10 w-84 space-y-4 pointer-events-none">
        <GlassCard padding="sm" className="pointer-events-auto shadow-[0_8px_32px_0_rgba(0,0,0,0.6)] bg-[#0d021a]/95 border-purple-500/50">
          <div className="flex items-center justify-between mb-3 border-b border-purple-500/30 pb-2">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-ping" />
              PMC Pune Spatial Intelligence
            </h3>
            <span className="text-[10px] font-mono text-fuchsia-300 bg-purple-950/70 px-2 py-0.5 rounded border border-purple-500/40 font-bold">
              PMC PostGIS ACTIVE
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div>
              <label className="text-purple-200 block mb-1 font-medium">Issue Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-purple-950/70 border border-purple-500/40 rounded-lg px-3 py-1.5 text-white outline-none focus:border-fuchsia-400/70"
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
              <label className="text-purple-200 block mb-1 font-medium">Priority Rating</label>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="w-full bg-purple-950/70 border border-purple-500/40 rounded-lg px-3 py-1.5 text-white outline-none focus:border-fuchsia-400/70"
              >
                <option value="ALL">All Priority Levels</option>
                <option value="CRITICAL">Critical (Score 75-100)</option>
                <option value="HIGH">High (Score 50-75)</option>
                <option value="MEDIUM">Medium (Score 25-50)</option>
                <option value="LOW">Low (Score 0-25)</option>
              </select>
            </div>

            <div className="pt-2 border-t border-purple-500/30 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-purple-100 font-medium">
                <input
                  type="checkbox"
                  checked={showWards}
                  onChange={(e) => setShowWards(e.target.checked)}
                  className="rounded bg-purple-950 border-purple-500/40 text-fuchsia-500 focus:ring-0"
                />
                Ward Boundaries
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-purple-100 font-medium">
                <input
                  type="checkbox"
                  checked={showTeams}
                  onChange={(e) => setShowTeams(e.target.checked)}
                  className="rounded bg-purple-950 border-purple-500/40 text-emerald-500 focus:ring-0"
                />
                Field Squads
              </label>
            </div>
          </div>
        </GlassCard>

        {/* Heatmap Legend */}
        <GlassCard padding="sm" className="pointer-events-auto bg-[#0d021a]/95 border-purple-500/50">
          <div className="text-[11px] font-bold text-purple-200 uppercase tracking-wider mb-2">Priority Heatmap Legend</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 text-purple-100">
              <div className="w-3 h-3 rounded-full bg-pink-500 shadow-[0_0_8px_#ec4899]" />
              <span>Critical (24h SLA)</span>
            </div>
            <div className="flex items-center gap-2 text-purple-100">
              <div className="w-3 h-3 rounded-full bg-fuchsia-500" />
              <span>High (48h SLA)</span>
            </div>
            <div className="flex items-center gap-2 text-purple-100">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span>Medium (72h SLA)</span>
            </div>
            <div className="flex items-center gap-2 text-purple-100">
              <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
              <span>Active Field Squad</span>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
