import React from 'react';
import {
  GraduationCap,
  FileText,
  UserCheck,
  Bus,
  PartyPopper,
  CreditCard,
  Home,
  Briefcase,
  Building2,
  Award,
  AlertOctagon,
  Users,
  Lightbulb,
  Code,
  Calendar,
  BookOpen,
  ShieldAlert
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Category } from '../../types';

interface CategoryCardDef {
  id: Category;
  label: string;
  icon: React.ElementType;
  bgLight: string;
  textColor: string;
  borderColor: string;
}

const CATEGORY_DEFINITIONS: CategoryCardDef[] = [
  { id: 'ACADEMICS', label: 'Academics & SEAS', icon: GraduationCap, bgLight: 'bg-indigo-50 hover:bg-indigo-100', textColor: 'text-indigo-700', borderColor: 'border-indigo-200' },
  { id: 'EXAMS', label: 'Examinations', icon: FileText, bgLight: 'bg-red-50 hover:bg-red-100', textColor: 'text-red-700', borderColor: 'border-red-200' },
  { id: 'ATTENDANCE', label: 'Attendance', icon: UserCheck, bgLight: 'bg-orange-50 hover:bg-orange-100', textColor: 'text-orange-700', borderColor: 'border-orange-200' },
  { id: 'STUDENT CLUBS', label: 'ACM & Clubs', icon: Users, bgLight: 'bg-violet-50 hover:bg-violet-100', textColor: 'text-violet-700', borderColor: 'border-violet-200' },
  { id: 'ENTREPRENEURSHIP', label: 'E-Cell & CEL', icon: Lightbulb, bgLight: 'bg-amber-50 hover:bg-amber-100', textColor: 'text-amber-700', borderColor: 'border-amber-200' },
  { id: 'HACKATHONS', label: 'GDG & Hackathons', icon: Code, bgLight: 'bg-blue-50 hover:bg-blue-100', textColor: 'text-blue-700', borderColor: 'border-blue-200' },
  { id: 'EVENTS', label: 'Campus Events', icon: PartyPopper, bgLight: 'bg-pink-50 hover:bg-pink-100', textColor: 'text-pink-700', borderColor: 'border-pink-200' },
  { id: 'TRANSPORT', label: 'SRM Transport', icon: Bus, bgLight: 'bg-cyan-50 hover:bg-cyan-100', textColor: 'text-cyan-700', borderColor: 'border-cyan-200' },
  { id: 'FEES', label: 'Fees & Finance', icon: CreditCard, bgLight: 'bg-emerald-50 hover:bg-emerald-100', textColor: 'text-emerald-700', borderColor: 'border-emerald-200' },
  { id: 'HOSTEL', label: 'Hostel & Dining', icon: Home, bgLight: 'bg-amber-50 hover:bg-amber-100', textColor: 'text-amber-700', borderColor: 'border-amber-200' },
  { id: 'PLACEMENTS', label: 'CR&CS Placements', icon: Briefcase, bgLight: 'bg-purple-50 hover:bg-purple-100', textColor: 'text-purple-700', borderColor: 'border-purple-200' },
  { id: 'EMERGENCY', label: 'Alerts & Closures', icon: ShieldAlert, bgLight: 'bg-rose-50 hover:bg-rose-100', textColor: 'text-rose-700', borderColor: 'border-rose-200' },
];

export const CategoryOverview: React.FC = () => {
  const { dashboard, setSelectedCategory, setCurrentTab } = useApp();
  const counts = dashboard?.categoryCounts || {};

  const handleCategoryClick = (catId: Category) => {
    setSelectedCategory(catId);
    setCurrentTab('inbox');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-extrabold text-slate-900 tracking-tight font-heading">
          University Channels
        </h3>
        <span className="text-xs font-semibold text-slate-500">
          Click channel to filter inbox
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {CATEGORY_DEFINITIONS.map((def) => {
          const Icon = def.icon;
          const count = counts[def.id] || 0;

          return (
            <button
              key={def.id}
              onClick={() => handleCategoryClick(def.id)}
              className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition-all duration-200 hover:scale-102 hover:shadow-sm cursor-pointer ${def.bgLight} ${def.borderColor}`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <Icon className={`w-5 h-5 ${def.textColor}`} />
                <span className={`text-xs font-extrabold px-1.5 py-0.5 rounded-md bg-white/80 shadow-2xs ${def.textColor}`}>
                  {count}
                </span>
              </div>
              <span className={`text-xs font-bold ${def.textColor} truncate w-full`}>
                {def.label}
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5">
                {count === 1 ? '1 update' : `${count} updates`}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
