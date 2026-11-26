import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, MapPin, UtensilsCrossed, Building } from 'lucide-react';
import { useCampusData } from '../../context/CampusDataContext';

const CAFETERIA_IMG = '/src/assets/images/campus_cafeteria_1795679612458.jpg';

export default function CampusServicesPage() {
  const { services } = useCampusData();
  const [filter, setFilter] = useState('all');

  const filtered = services.filter((s) => {
    if (filter === 'all') return true;
    if (filter === 'cafeteria') return s.serviceType === 'cafeteria';
    return s.serviceType !== 'cafeteria';
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            Campus Services & Cafeterias
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Dining halls, operating hours, food availability, and MUST student support offices.
          </p>
        </div>

        <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-slate-200/70 dark:bg-slate-800 self-start">
          {[
            { id: 'all', label: 'All Services' },
            { id: 'cafeteria', label: 'Cafeterias' },
            { id: 'support', label: 'Student Offices' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                filter === tab.id
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cafeteria Feature Banner */}
      {filter !== 'support' && (
        <section className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-5 aspect-4/3 lg:aspect-auto bg-slate-100 dark:bg-slate-800">
            <img
              src={CAFETERIA_IMG}
              alt="MUST Main Student Cafeteria dining interior"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="lg:col-span-7 p-6 flex flex-col justify-center">
            <p className="text-xs font-semibold text-indigo-700 dark:text-cyan-400 flex items-center gap-1.5">
              <UtensilsCrossed className="h-3.5 w-3.5" />
              <span>Campus Dining & Cafeterias</span>
            </p>
            <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white mt-1.5">
              Affordable daily meals across MUST Nchiru Campus
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              Check opening times, available student meals, and exact building locations for both the Main Student Cafeteria (Mess) and the Innovation Hub Espresso & Snack Bar.
            </p>
            <div className="mt-4">
              <Link
                to="/dashboard/maps?building=main-cafeteria"
                className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-700 dark:text-cyan-400 hover:underline"
              >
                <MapPin className="h-3.5 w-3.5" />
                <span>View Main Cafeteria on Campus Map</span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((srv) => (
          <article
            key={srv.id}
            className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-indigo-700 dark:text-cyan-400 capitalize">
                  {srv.serviceType === 'cafeteria' ? 'Campus Cafeteria' : `${srv.serviceType} Service`}
                </span>
                <span className="inline-flex items-center gap-1 tabular-nums">
                  <Clock className="h-3.5 w-3.5" />
                  {srv.operatingHours}
                </span>
              </div>

              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white mt-2">
                {srv.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                <Building className="h-3.5 w-3.5 shrink-0" />
                <span>{srv.locationDetail}</span>
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                {srv.description}
              </p>

              {srv.offerings?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white mb-2">
                    {srv.serviceType === 'cafeteria' ? 'Available Food & Beverages' : 'Available Services'}
                  </p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                    {srv.offerings.map((item) => (
                      <li key={item}>· {item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {srv.buildingId && (
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Link
                  to={`/dashboard/maps?building=${srv.buildingId}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 dark:text-cyan-400 hover:underline"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  <span>Locate on Campus Map</span>
                </Link>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
