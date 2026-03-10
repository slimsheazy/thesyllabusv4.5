import React, { useState } from 'react';
import { Clock, Database, Globe, Tag, Settings, ChevronRight, User, Calendar, Check, Settings2, X, Moon, Sun } from 'lucide-react';
import { useSyllabusStore } from '../store';
import { useHaptics } from '../hooks/useHaptics';

interface ArchiveSidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const ArchiveSidebar: React.FC<ArchiveSidebarProps> = ({ currentPage, onNavigate }) => {
  const { 
    isEclipseMode, toggleEclipseMode, calculationsRun, 
    userIdentity, userBirthday, userBirthTime, userLocation, 
    isCalibrated, setUserIdentity, setUserBirthday, setUserBirthTime,
    resetAllData
  } = useSyllabusStore();
  const { triggerTick, triggerClick, triggerWarning } = useHaptics();
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const handleReset = () => {
    if (confirm("Are you sure you want to ERADICATE all data? This cannot be undone.")) {
      triggerWarning();
      resetAllData();
      window.location.reload();
    }
  };

  const handleNavigate = (page: string) => {
    triggerTick();
    onNavigate(page);
  };

  const handleToggleEclipse = () => {
    triggerClick();
    toggleEclipseMode();
  };

  const level = calculationsRun >= 25 ? "Expert Seeker" : 
                calculationsRun >= 15 ? "Deep Diver" : 
                calculationsRun >= 10 ? "Regular Visitor" : 
                calculationsRun >= 5 ? "Curious Student" : "Newcomer";

  const categories = [
    {
      label: "Syllabus",
      items: [
        { name: "Explorer", page: "EXPLORER", icon: Globe },
      ]
    },
    {
      label: "Inquiry",
      items: [
        { name: "Horary", page: "HORARY", icon: Clock },
        { name: "Numerology", page: "NUMEROLOGY", icon: Tag },
      ]
    }
  ];

  return (
    <aside className="w-64 border-r border-archive-line h-full flex flex-col bg-archive-bg">
      <div className="p-6 border-b border-archive-line">
        <div className="flex items-center justify-between mb-4">
          <p className="col-header">Calibration</p>
          <button 
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className="text-archive-ink opacity-40 hover:opacity-100 transition-opacity"
          >
            {isEditingProfile ? <X size={14} /> : <Settings2 size={14} />}
          </button>
        </div>

        {isEditingProfile ? (
          <div className="space-y-4 animate-in fade-in duration-300">
            <input 
              className="w-full bg-transparent border border-archive-line p-2 text-xs font-subheading outline-none focus:border-archive-ink" 
              value={userIdentity || ""} 
              onChange={(e) => setUserIdentity(e.target.value)}
              placeholder="FULL NAME..."
            />
            <input 
              type="date" 
              className="w-full bg-transparent border border-archive-line p-2 text-xs font-subheading outline-none focus:border-archive-ink" 
              value={userBirthday || ""} 
              onChange={(e) => setUserBirthday(e.target.value)} 
            />
            <button onClick={() => setIsEditingProfile(false)} className="w-full bg-archive-ink text-archive-bg py-2 text-[10px] font-subheading font-bold uppercase tracking-wide-custom">Save</button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm font-subheading font-bold uppercase tracking-wide-custom">{userIdentity || "Anonymous Seeker"}</p>
            <p className="data-value text-[10px] opacity-40 uppercase tracking-widest">{level}</p>
            {isCalibrated && <div className="flex items-center gap-2 text-[9px] font-subheading font-bold text-archive-accent uppercase mt-2 tracking-wide-custom"><Check size={10} /> Calibration Locked</div>}
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar">
        {categories.map((cat) => (
          <div key={cat.label} className="mb-6">
            <p className="px-6 mb-2 col-header text-[9px]">{cat.label}</p>
            <ul className="space-y-0.5">
              {cat.items.map((item) => (
                <li key={item.page}>
                  <button 
                    onClick={() => handleNavigate(item.page)}
                    className={`w-full flex items-center justify-between px-6 py-2 text-xs font-subheading font-bold transition-colors ${currentPage === item.page ? 'bg-archive-ink text-archive-bg' : 'hover:bg-archive-line/50 opacity-60 hover:opacity-100'}`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-3 h-3" />
                      <span>{item.name.toUpperCase()}</span>
                    </div>
                    {currentPage === item.page && <ChevronRight className="w-3 h-3" />}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="p-6 border-t border-archive-line space-y-6">
        <button onClick={handleToggleEclipse} className="w-full flex items-center justify-between group py-2 hover:opacity-80 transition-opacity">
          <div className="flex items-center gap-3">
            {isEclipseMode ? <Moon size={14} className="text-archive-accent" /> : <Sun size={14} className="text-archive-accent" />}
            <span className="data-value text-[10px] uppercase">{isEclipseMode ? "Night Watch" : "Day Watch"}</span>
          </div>
          <div className={`w-8 h-4 rounded-full border border-archive-ink relative transition-all ${isEclipseMode ? "bg-archive-ink" : "bg-transparent"}`}>
            <div className={`absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full transition-all duration-300 ${isEclipseMode ? "left-[calc(100%-0.75rem)] bg-archive-bg" : "left-1 bg-archive-ink"}`} />
          </div>
        </button>

        <div>
          <p className="col-header mb-2">System Status</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="data-value text-[10px] uppercase">Operational</span>
            </div>
            <button 
              onClick={handleReset}
              className="text-[9px] font-mono uppercase text-red-500/40 hover:text-red-500 transition-colors"
            >
              Eradicate
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
