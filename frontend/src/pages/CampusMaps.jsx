import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  MapPin, 
  Clock, 
  Map, 
  Compass, 
  Info,
  ChevronRight,
  BookOpen,
  Award,
  Building,
  Cpu,
  Utensils,
  Home,
  Trophy,
  Activity
} from 'lucide-react';

export default function CampusMaps() {
  const { locations } = useApp();
  const [selectedId, setSelectedId] = useState('library');

  const selectedLoc = locations.find(loc => loc.id === selectedId) || locations[0];

  const getIcon = (iconName, className) => {
    switch (iconName) {
      case 'BookOpen': return <BookOpen className={className} />;
      case 'Award': return <Award className={className} />;
      case 'Building': return <Building className={className} />;
      case 'Cpu': return <Cpu className={className} />;
      case 'Utensils': return <Utensils className={className} />;
      case 'Home': return <Home className={className} />;
      case 'Trophy': return <Trophy className={className} />;
      default: return <MapPin className={className} />;
    }
  };

  // Helper colors for spots on our interactive SVG map
  const getSpotColor = (id) => {
    return selectedId === id 
      ? 'fill-blue-600 stroke-blue-200 stroke-[5px] scale-110 drop-shadow-md' 
      : 'fill-slate-700 dark:fill-slate-350 stroke-white dark:stroke-slate-900 stroke-2 hover:fill-blue-500';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
      
      {/* 1. MASTER MAP CANVAS (7 Columns) */}
      <section id="campus-map-mesh" className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 md:p-6 shadow-[0_4px_12px_rgba(0,0,0,0.03)] flex flex-col space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 shrink-0">
          <div className="flex items-center space-x-2">
            <Compass className="w-5 h-5 text-emerald-500 animate-spin-slow" />
            <h2 className="font-extrabold text-sm md:text-base text-slate-850 dark:text-slate-100">Interactive Campus Layout</h2>
          </div>
          <span className="text-[10px] font-bold text-slate-400">MUST Main Campus Map</span>
        </div>

        {/* Dynamic Vector/SVG Campus Map representation */}
        <div className="relative aspect-[3/2] w-full bg-slate-50 dark:bg-slate-950/40 rounded-2xl border dark:border-slate-800 overflow-hidden group select-none">
          
          {/* Aesthetic grid layers */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:32px_32px] opacity-15" />
          
          {/* Main SVG Vector representation */}
          <svg className="absolute inset-0 w-full h-full p-4" viewBox="0 0 800 500">
            {/* Styled roads / ring avenues */}
            <path d="M 100,100 L 700,100 L 700,400 L 100,400 Z" fill="none" stroke="#cbd5e1" strokeWidth="8" strokeLinecap="round" strokeDasharray="1 10" className="opacity-40" />
            <path d="M 150,150 L 650,150 L 650,350 L 150,350 Z" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" className="opacity-25" />
            
            {/* Interconnected corridors */}
            <line x1="100" y1="250" x2="700" y2="250" stroke="#94a3b8" strokeWidth="2" strokeDasharray="6" className="opacity-20" />
            <line x1="400" y1="100" x2="400" y2="400" stroke="#94a3b8" strokeWidth="2" strokeDasharray="6" className="opacity-20" />

            {/* University Central Green Square representation */}
            <rect x="330" y="190" width="140" height="120" rx="20" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="2" className="dark:fill-emerald-950/15 dark:stroke-emerald-900/30" />
            <text x="400" y="255" textAnchor="middle" fill="#65a30d" className="text-[11px] font-extrabold uppercase tracking-widest fill-emerald-600 dark:fill-emerald-500 opacity-60">Graduation Square</text>

            {/* Plot/Spots representations and actions */}
            {locations.map((loc) => {
              // Convert percentages from coordinates to SVG pixels
              const xPx = parseFloat(loc.coordinates.x) * 8;
              const yPx = parseFloat(loc.coordinates.y) * 5;
              const isSelected = selectedId === loc.id;

              return (
                <g 
                  key={loc.id} 
                  className="cursor-pointer transition-transform duration-200"
                  onClick={() => setSelectedId(loc.id)}
                >
                  {/* Outer range indicator for selected state */}
                  {isSelected && (
                    <circle 
                      cx={xPx} cy={yPx} r="24" 
                      className="fill-blue-500/10 stroke-blue-500/20 stroke-1 animate-ping" 
                    />
                  )}
                  {/* Point */}
                  <circle 
                    cx={xPx} cy={yPx} r={isSelected ? '11 font' : '8'} 
                    className={`transition-all duration-300 ${getSpotColor(loc.id)}`}
                  />
                  {/* Text block near point */}
                  <rect 
                    x={xPx - 35} y={yPx - 26} width="70" height="14" rx="4"
                    className={`fill-slate-900/40 backdrop-blur-xs stroke-none ${isSelected ? 'fill-blue-600' : 'fill-slate-805/85'}`}
                  />
                  <text 
                    x={xPx} y={yPx - 16} 
                    textAnchor="middle" 
                    fill="#ffffff" 
                    className="text-[8px] font-black tracking-wide"
                  >
                    {loc.name.split(' ')[0]}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Map Compass Overlay */}
          <div className="absolute right-4 bottom-4 p-2 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-xl border dark:border-slate-800 flex items-center space-x-1.5 text-[10px] font-bold text-slate-500">
            <span>Grid view: Operational</span>
          </div>
        </div>

        {/* Quick Grid cards list of standard blocks */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {locations.map((loc) => {
            const isSel = selectedId === loc.id;
            return (
              <button
                key={loc.id}
                onClick={() => setSelectedId(loc.id)}
                className={`py-2 px-3 text-xs font-bold rounded-xl flex items-center space-x-2 transition-all border text-left cursor-pointer ${
                  isSel 
                    ? 'bg-blue-50 dark:bg-slate-800 border-blue-300 dark:border-slate-700 text-blue-600 dark:text-blue-400 font-extrabold' 
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                {getIcon(loc.icon, 'w-4 h-4 text-slate-400 shrink-0')}
                <span className="truncate">{loc.name}</span>
              </button>
            );
          })}
        </div>

      </section>

      {/* 2. LOCATION DETAIL PANEL DRAWER (5 Columns) */}
      <section id="location-detail-panel" className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 md:p-6 shadow-[0_4px_12px_rgba(0,0,0,0.03)] h-fit space-y-6">
        
        <div className="border-b border-slate-200 dark:border-slate-800 pb-3 space-y-1">
          <span className="text-[9px] font-bold uppercase tracking-widest text-[#2563eb] dark:text-blue-400">
            Navigation details
          </span>
          <h3 id="location-name-title" className="text-base font-black text-slate-850 dark:text-slate-100 leading-tight flex items-center space-x-2">
            {getIcon(selectedLoc.icon, 'w-5 h-5 text-blue-500')}
            <span>{selectedLoc.name}</span>
          </h3>
          <p className="text-xs text-slate-450 dark:text-slate-400">
            {selectedLoc.floorCount} • On Campus Building Structure
          </p>
        </div>

        {/* Description body */}
        <p id="location-desc-text" className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          {selectedLoc.description}
        </p>

        {/* Path Metrics segment */}
        <div className="grid grid-cols-2 gap-3.5 pt-1">
          
          <div className="p-3 bg-slate-50 dark:bg-slate-850/50 rounded-xl border border-slate-200 dark:border-slate-800/80">
            <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wide">
              Est. Walking Time
            </span>
            <span id="location-walking-time" className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center space-x-1 mt-1 leading-none">
              <Clock className="w-4.5 h-4.5 text-blue-500 mr-1 shrink-0" />
              <span>{selectedLoc.walkingTime}</span>
            </span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-850/50 rounded-xl border border-slate-200 dark:border-slate-800/80">
            <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wide">
              Straight Distance
            </span>
            <span id="location-distance" className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center space-x-1 mt-1 leading-none">
              <MapPin className="w-4.5 h-4.5 text-emerald-500 mr-1 shrink-0" />
              <span>{selectedLoc.distance}</span>
            </span>
          </div>

        </div>

        {/* Services & Facilities checklist */}
        <div className="space-y-2.5">
          <span className="text-[9.5px] uppercase font-bold tracking-widest text-[#2563eb] dark:text-blue-400 block">Facilities & Services Available</span>
          <div id="location-services" className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-600 dark:text-slate-350">
            {selectedLoc.services.map((srv, idx) => (
              <div key={idx} className="flex items-center space-x-2 p-1.5 rounded-lg bg-slate-50/55 dark:bg-slate-850 border dark:border-slate-800">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span>{srv}</span>
              </div>
            ))}
          </div>
        </div>

        {/* GPS Simulation / Direction button */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-col space-y-2.5">
          <button 
            onClick={() => console.log(`Simulating direction routing path to ${selectedLoc.name}... Walking path active 🧩`)}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 shadow-sm transition-all cursor-pointer focus:outline-hidden"
          >
            <Activity className="w-4 h-4 animate-pulse" />
            <span>Generate Walking Path Routing</span>
          </button>
          
          <div className="p-3 bg-blue-50/30 dark:bg-slate-800/30 rounded-xl text-[9.5px] text-slate-400 leading-normal">
            <Info className="w-4 h-4 text-slate-400 inline mr-1 mb-0.5" />
            Estimated walking slots are calibrated from the central Graduation Square. Actual walking paces may vary depending on student volumes and corridor traffic.
          </div>
        </div>

      </section>

    </div>
  );
}
