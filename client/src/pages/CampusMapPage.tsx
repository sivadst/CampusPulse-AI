import React, { useState } from 'react';
import { MapPin, Navigation, ExternalLink, Building, Bus, BookOpen, UserCheck, ShieldAlert } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CampusMapPage: React.FC = () => {
  const { openEmailById } = useApp();

  const locations = [
    {
      id: 'loc-1',
      name: 'S202, SR Block',
      badge: 'VERIFIED SRM AP LOCATION',
      badgeColor: 'bg-indigo-600 text-white',
      category: 'EVENTS / EXAMS',
      description: "Venue for Techfest IIT Bombay Robotics Workshop & CSE 204 Algorithms Mid-Term Exam. Located on the 2nd Floor of SR Block.",
      isVerified: true,
      icon: Building,
      emailId: 'email-001',
      lat: 16.4637,
      lng: 80.5078
    },
    {
      id: 'loc-2',
      name: 'X-Lab Auditorium',
      badge: 'VERIFIED SRM AP LOCATION',
      badgeColor: 'bg-emerald-600 text-white',
      category: 'TECH & HACKATHONS',
      description: 'Venue for GDG Google Solution Hunt Challenge 2026. SRM University AP, Mangalagiri Neerukonda Tadikonda Road, 522240.',
      isVerified: true,
      icon: Building,
      emailId: 'email-014',
      lat: 16.4642,
      lng: 80.5085
    },
    {
      id: 'loc-3',
      name: 'Room 114, Administrative Block',
      badge: 'DEMO CAMPUS LOCATION',
      badgeColor: 'bg-amber-600 text-white',
      category: 'ATTENDANCE',
      description: 'SEAS Academic Cell for physical submission of signed attendance condonation medical records.',
      isVerified: false,
      icon: UserCheck,
      emailId: 'email-002',
      lat: 16.4630,
      lng: 80.5070
    },
    {
      id: 'loc-4',
      name: 'Main Gate Bus Bay 2',
      badge: 'DEMO CAMPUS LOCATION',
      badgeColor: 'bg-cyan-600 text-white',
      category: 'TRANSPORT',
      description: 'Campus arrival point for Route 5 & 8 buses from Vijayawada & Guntur via Mangalagiri Bypass.',
      isVerified: false,
      icon: Bus,
      emailId: 'email-003',
      lat: 16.4650,
      lng: 80.5060
    }
  ];

  const [selectedLoc, setSelectedLoc] = useState(locations[0]);

  const openGoogleMaps = (locName: string) => {
    const query = encodeURIComponent(`SRM University-AP Andhra Pradesh ${locName}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-heading flex items-center gap-2">
          <MapPin className="w-6 h-6 text-indigo-600" />
          <span>Campus Venue & Location Intelligence</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Grounded campus venue coordinates derived from notices and transit updates.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Interactive Locations List */}
        <div className="space-y-3 lg:col-span-1">
          {locations.map((loc) => {
            const Icon = loc.icon;
            const isSelected = selectedLoc.id === loc.id;

            return (
              <div
                key={loc.id}
                onClick={() => setSelectedLoc(loc)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-200/50 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-indigo-200 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${loc.badgeColor}`}>
                    {loc.badge}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    {loc.category}
                  </span>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700 shrink-0 mt-0.5">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{loc.name}</h4>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">{loc.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Simulated Map Display & Live Routing */}
        <div className="lg:col-span-2 bg-white border border-[#E7EAF3] rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-6">
          <div className="relative h-80 rounded-2xl bg-gradient-to-tr from-slate-100 via-indigo-50/40 to-slate-200 border border-slate-200 overflow-hidden flex items-center justify-center">
            {/* Campus Grid Pattern Simulation */}
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: 'radial-gradient(#4F46E5 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }} />

            {/* Campus Center Landmark Pins */}
            <div className="relative z-10 flex flex-col items-center text-center p-6 bg-white/90 backdrop-blur-md rounded-2xl border border-white/40 shadow-xl max-w-sm">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white flex items-center justify-center mb-3 shadow-md">
                <MapPin className="w-6 h-6 animate-bounce" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 font-heading">
                {selectedLoc.name}
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                {selectedLoc.description}
              </p>
              <span className="mt-2 text-[10px] font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                SRM AP Neerukonda Campus Coordinates · Pin #{selectedLoc.id} ({selectedLoc.isVerified ? 'Verified Official' : 'Demo Location'})
              </span>
            </div>
          </div>

          {/* Action Buttons for Location */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              onClick={() => openEmailById(selectedLoc.emailId)}
              className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
            >
              ← View Source Email Notice
            </button>

            <button
              onClick={() => openGoogleMaps(selectedLoc.name)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open in Google Maps</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
