import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Compass,
  MapPin,
  Search,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Navigation,
  AlertTriangle,
} from 'lucide-react';
import { useCampusData } from '../../context/CampusDataContext';

const CATEGORY_OPTIONS = [
  { id: 'all', label: 'All Buildings' },
  { id: 'academic', label: 'Lecture Halls' },
  { id: 'lab', label: 'Laboratories' },
  { id: 'library', label: 'Library' },
  { id: 'admin', label: 'Administration' },
  { id: 'cafeteria', label: 'Cafeterias' },
  { id: 'services', label: 'Student Services' },
];

const CATEGORY_COLORS = {
  academic: { fill: '#312E81', stroke: '#6366F1' },
  lab: { fill: '#155E75', stroke: '#06B6D4' },
  library: { fill: '#1E3A8A', stroke: '#3B82F6' },
  admin: { fill: '#334155', stroke: '#94A3B8' },
  cafeteria: { fill: '#78350F', stroke: '#F59E0B' },
  services: { fill: '#065F46', stroke: '#10B981' },
};

export default function CampusMapsPage() {
  const { buildings, venues, nextClass } = useCampusData();
  const [searchParams] = useSearchParams();

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [zoom, setZoom] = useState(1);
  const [selectedBuildingId, setSelectedBuildingId] = useState(() => {
    return searchParams.get('building') || nextClass?.buildingId || buildings[0]?.id;
  });

  useEffect(() => {
    const paramBuilding = searchParams.get('building');
    if (paramBuilding) {
      setSelectedBuildingId(paramBuilding);
    }
  }, [searchParams]);

  const filteredBuildings = useMemo(() => {
    return buildings.filter((b) => {
      const matchCat = category === 'all' || b.category === category;
      const q = query.trim().toLowerCase();
      const matchSearch =
        !q ||
        b.name.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q) ||
        b.facilities.some((f) => f.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [buildings, category, query]);

  const selectedBuilding = useMemo(
    () => buildings.find((b) => b.id === selectedBuildingId) || buildings[0],
    [buildings, selectedBuildingId]
  );

  const buildingVenues = useMemo(
    () => venues.filter((v) => v.buildingId === selectedBuilding?.id),
    [venues, selectedBuilding?.id]
  );

  function focusNextClass() {
    if (nextClass?.buildingId) {
      setCategory('all');
      setQuery('');
      setSelectedBuildingId(nextClass.buildingId);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            MUST Campus Maps & Wayfinding
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Interactive schematic campus map for Meru University of Science and Technology (Nchiru Main Campus).
          </p>
        </div>

        {nextClass && (
          <button
            type="button"
            onClick={focusNextClass}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-900 hover:bg-indigo-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-xs font-semibold transition-colors self-start whitespace-nowrap"
          >
            <Navigation className="h-4 w-4" />
            <span>
              Navigate to Next Class: {nextClass.venueName}
            </span>
          </button>
        )}
      </div>

      {nextClass?.previousVenueName && (
        <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-4 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
          <div>
            <span className="font-semibold">
              Destination Automatically Updated:
            </span>{' '}
            {nextClass.unitCode} ({nextClass.unitName}) was moved from {nextClass.previousVenueName} to{' '}
            <strong>{nextClass.venueName}</strong> ({nextClass.buildingName}).
          </div>
        </div>
      )}

      {/* Search & Category Filter */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search lecture halls, labs, library, cafeteria, or admin offices..."
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORY_OPTIONS.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                category === cat.id
                  ? 'bg-slate-900 dark:bg-indigo-600 text-white'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-400'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map + Inspector Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Schematic Map */}
        <div className="lg:col-span-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 inline-flex items-center gap-2">
              <Compass className="h-4 w-4 text-indigo-700 dark:text-cyan-400" />
              <span>Schematic Wayfinding View (Click any building to view directions)</span>
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(0.85, Number((z - 0.15).toFixed(2))))}
                className="p-1.5 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Zoom out"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoom(1)}
                className="p-1.5 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Reset zoom"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(1.45, Number((z + 0.15).toFixed(2))))}
                className="p-1.5 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Zoom in"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="relative overflow-auto bg-slate-100 dark:bg-slate-950 p-4 min-h-[430px] flex items-center justify-center">
            <svg
              viewBox="0 0 920 580"
              style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
              className="w-full max-w-[880px] h-auto transition-transform duration-200 select-none"
              role="img"
              aria-label="Interactive MUST Campus Schematic Map"
            >
              {/* Campus Grounds */}
              <rect x="20" y="20" width="880" height="540" rx="18" className="fill-slate-200/70 dark:fill-slate-900 stroke-slate-300 dark:stroke-slate-800" strokeWidth="2" />

              {/* Walkways & Spine Road */}
              <path
                d="M 55 345 L 250 345 L 330 280 L 545 280 L 760 280 M 330 280 L 330 430 M 545 280 L 545 455 M 185 175 L 185 300"
                fill="none"
                className="stroke-slate-400/70 dark:stroke-slate-700"
                strokeWidth="12"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M 55 345 L 250 345 L 330 280 L 545 280 L 760 280"
                fill="none"
                stroke="#6366F1"
                strokeDasharray="6 6"
                strokeWidth="2.5"
                opacity="0.7"
              />

              {/* Main Gate Marker */}
              <g transform="translate(36, 325)">
                <rect x="0" y="0" width="42" height="40" rx="6" fill="#0F172A" />
                <text x="21" y="18" textAnchor="middle" fill="#38BDF8" fontSize="9" fontWeight="700">
                  MAIN
                </text>
                <text x="21" y="30" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="700">
                  GATE
                </text>
              </g>

              {/* Acacia Roundabout */}
              <circle cx="330" cy="285" r="14" className="fill-emerald-600/30 stroke-emerald-500" strokeWidth="2" />

              {/* Route Highlight to Selected Building */}
              {selectedBuilding && (
                <line
                  x1="78"
                  y1="345"
                  x2={selectedBuilding.x + selectedBuilding.width / 2}
                  y2={selectedBuilding.y + selectedBuilding.height / 2}
                  stroke="#06B6D4"
                  strokeWidth="3"
                  strokeDasharray="8 5"
                />
              )}

              {/* Campus Buildings */}
              {buildings.map((b) => {
                const isSelected = b.id === selectedBuilding?.id;
                const isMatch = filteredBuildings.some((fb) => fb.id === b.id);
                const isNextClassBuilding = nextClass?.buildingId === b.id;
                const palette = CATEGORY_COLORS[b.category] || CATEGORY_COLORS.academic;

                return (
                  <g
                    key={b.id}
                    onClick={() => setSelectedBuildingId(b.id)}
                    className="cursor-pointer"
                    opacity={isMatch ? 1 : 0.25}
                  >
                    <rect
                      x={b.x}
                      y={b.y}
                      width={b.width}
                      height={b.height}
                      rx="10"
                      fill={palette.fill}
                      stroke={isSelected ? '#22D3EE' : palette.stroke}
                      strokeWidth={isSelected ? 4 : 2}
                    />
                    <text
                      x={b.x + b.width / 2}
                      y={b.y + b.height / 2 - 4}
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="11.5"
                      fontWeight="700"
                    >
                      {b.name.length > 24 ? `${b.name.slice(0, 22)}...` : b.name}
                    </text>
                    <text
                      x={b.x + b.width / 2}
                      y={b.y + b.height / 2 + 14}
                      textAnchor="middle"
                      fill="#CBD5E1"
                      fontSize="9.5"
                    >
                      {b.floors} {b.floors === 1 ? 'Floor' : 'Floors'}
                    </text>

                    {isNextClassBuilding && (
                      <g transform={`translate(${b.x + b.width - 78}, ${b.y - 11})`}>
                        <rect x="0" y="0" width="76" height="20" rx="5" fill="#4F46E5" />
                        <text x="38" y="13.5" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="700">
                          NEXT CLASS
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Selected Building Details & Walking Directions */}
        <aside className="lg:col-span-4 space-y-4">
          {selectedBuilding && (
            <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-4">
              <div>
                <p className="text-xs font-semibold text-indigo-700 dark:text-cyan-400 capitalize">
                  {selectedBuilding.category} Building · {selectedBuilding.floors} {selectedBuilding.floors === 1 ? 'Floor' : 'Floors'}
                </p>
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white mt-1">
                  {selectedBuilding.name}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  {selectedBuilding.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-indigo-700 dark:text-cyan-400" />
                  <span>Walking Directions</span>
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                  {selectedBuilding.walkingDirections}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-900 dark:text-white mb-2">
                  Facilities & Rooms
                </p>
                <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                  {selectedBuilding.facilities.map((fac) => (
                    <li key={fac}>· {fac}</li>
                  ))}
                </ul>
              </div>

              {buildingVenues.length > 0 && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white mb-2">
                    Scheduled Teaching Venues
                  </p>
                  <div className="space-y-1.5">
                    {buildingVenues.map((v) => (
                      <div key={v.id} className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                        <span>{v.name} ({v.floorLabel})</span>
                        <span className="font-mono-nums text-slate-500">{v.capacity} seats</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Directory List */}
          <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white mb-3">
              Filtered Locations ({filteredBuildings.length})
            </h4>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-56 overflow-y-auto">
              {filteredBuildings.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setSelectedBuildingId(b.id)}
                  className={`w-full text-left py-2.5 px-2 rounded text-xs transition-colors flex items-center justify-between ${
                    b.id === selectedBuilding?.id
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-cyan-300 font-semibold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>{b.name}</span>
                  <span className="text-[11px] capitalize text-slate-400">{b.category}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
