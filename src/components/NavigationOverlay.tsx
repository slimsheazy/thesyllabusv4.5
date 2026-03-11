import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sun, Moon, MapPin, Calendar, Clock, User, Settings2, Check, Bell, Trash2, Pin, PinOff, Search, Book, Brain, AlertTriangle } from 'lucide-react';
import { useSyllabusStore } from '../store';
import { Tooltip } from './Tooltip';
import { useSeekerLevel } from '../hooks/useSeekerLevel';

import { TOOL_CATEGORIES, ALL_TOOLS } from '../constants/tools';

interface NavigationOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string) => void;
}

export const NavigationOverlay: React.FC<NavigationOverlayProps> = ({ isOpen, onClose, onNavigate }) => {
  const { 
    isEclipseMode, toggleEclipseMode, 
    userIdentity, userBirthday, userBirthTime, userBirthTimezone, userLocation, 
    isCalibrated, setUserIdentity, setUserBirthday, setUserBirthTime, setUserBirthTimezone, setUserLocation,
    transitNotifications, markNotificationRead, clearNotifications,
    pinnedTools, togglePinnedTool, resetAllData
  } = useSyllabusStore();

  const { level, resonance, progress, calculationsRun } = useSeekerLevel();
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [manualLocation, setManualLocation] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [quickSearch, setQuickSearch] = useState('');

  const handleReset = () => {
    resetAllData();
    onNavigate("HOME");
    onClose();
    setShowResetConfirm(false);
  };

  const categories = TOOL_CATEGORIES;
  const pinnedItems = ALL_TOOLS.filter(tool => pinnedTools.includes(tool.page));

  const handleManualSearch = async () => {
    if (!manualLocation.trim()) return;
    setSearching(true);
    setSearchError(null);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(manualLocation)}&limit=1`);
      const data = await response.json();
      if (data && data.length > 0) {
        const first = data[0];
        setUserLocation({
          lat: parseFloat(first.lat),
          lng: parseFloat(first.lon),
          name: first.display_name.split(',')[0]
        });
        setManualLocation('');
      } else {
        setSearchError("Location not found.");
      }
    } catch (error) {
      setSearchError("Search failed.");
    } finally {
      setSearching(false);
    }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) return;
    setDetecting(true);
    setSearchError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, name: "Detected Location" });
        setDetecting(false);
      },
      () => {
        setDetecting(false);
        setSearchError("Access denied.");
      }
    );
  };

  return (
    <div className={`fixed inset-0 z-[2900] transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
      <div className="absolute inset-0 bg-archive-bg/95 backdrop-blur-md" onClick={onClose} />
      <div className={`absolute top-0 left-0 h-full w-full md:w-[480px] bg-archive-bg border-r border-archive-line transition-transform duration-500 shadow-2xl flex flex-col ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-6 sm:p-10 pt-24 flex-grow overflow-y-auto custom-scrollbar">
          <section className="mb-12 p-8 border border-archive-line bg-white shadow-xl rounded-xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none text-6xl font-sans">☊</div>
            <div className="flex justify-between items-center relative z-10">
              <div className="flex items-center gap-2">
                <span className="text-xl font-sans text-archive-accent">♁</span>
                <span className="handwritten text-[10px] uppercase text-archive-accent tracking-widest">Resonance Calibration</span>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)} 
                  className="relative text-archive-ink/40 hover:text-archive-accent transition-colors"
                >
                  <Bell size={16} />
                  {transitNotifications.some(n => !n.isRead) && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-archive-accent rounded-full border border-white" />
                  )}
                </button>
                <button onClick={() => setIsEditingProfile(!isEditingProfile)} className="text-[10px] uppercase flex items-center gap-1 hover:text-archive-accent transition-colors">
                  {isEditingProfile ? <X size={14} /> : <Settings2 size={14} />}
                </button>
              </div>
            </div>

            {showNotifications ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300 relative z-10">
                <div className="flex justify-between items-center border-b border-archive-line pb-2">
                  <span className="text-[9px] uppercase opacity-40">Celestial Transits</span>
                  <button onClick={clearNotifications} className="text-[9px] uppercase opacity-40 hover:text-red-500 flex items-center gap-1">
                    <Trash2 size={10} /> Clear
                  </button>
                </div>
                <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                  {!transitNotifications || transitNotifications.length === 0 ? (
                    <p className="handwritten text-sm opacity-40 py-4 text-center italic">The stars are quiet for now.</p>
                  ) : (
                    transitNotifications.map((n) => (
                      <div 
                        key={n.id} 
                        onClick={() => markNotificationRead(n.id)}
                        className={`p-3 border border-archive-line rounded-lg transition-all cursor-pointer ${n.isRead ? 'opacity-40' : 'bg-archive-accent/5 border-archive-accent/20'}`}
                      >
                        <p className="handwritten text-sm italic leading-tight">{n.message}</p>
                        <p className="text-[8px] font-mono uppercase opacity-40 mt-2">
                          {new Date(n.date).toLocaleDateString()} @ {new Date(n.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    ))
                  )}
                </div>
                <button onClick={() => setShowNotifications(false)} className="w-full text-[10px] uppercase opacity-40 hover:opacity-100">Back to Profile</button>
              </div>
            ) : isEditingProfile ? (
              <div className="space-y-6 animate-in fade-in duration-300 relative z-10">
                <div className="space-y-2">
                  <label className="text-[9px] uppercase opacity-40 flex items-center gap-2"><User size={10} /> Who are you?</label>
                  <input 
                    className="w-full bg-archive-bg p-3 border border-archive-line text-lg italic outline-none focus:border-archive-accent" 
                    value={userIdentity || ""} 
                    onChange={(e) => setUserIdentity(e.target.value)}
                    placeholder="Name..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase opacity-40 flex items-center gap-2"><Calendar size={10} /> Arrival Date</label>
                    <input type="date" className="w-full bg-archive-bg p-3 border border-archive-line text-lg italic outline-none focus:border-archive-accent" value={userBirthday || ""} onChange={(e) => setUserBirthday(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase opacity-40 flex items-center gap-2"><Clock size={10} /> Time</label>
                    <input type="time" className="w-full bg-archive-bg p-3 border border-archive-line text-lg italic outline-none focus:border-archive-accent" value={userBirthTime || "12:00"} onChange={(e) => setUserBirthTime(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] uppercase opacity-40 flex items-center gap-2">IANA Timezone</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      className="flex-1 bg-archive-bg p-3 border border-archive-line text-lg italic outline-none focus:border-archive-accent" 
                      value={userBirthTimezone} 
                      onChange={(e) => setUserBirthTimezone(e.target.value)} 
                      placeholder="UTC"
                    />
                    <button 
                      onClick={() => setUserBirthTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone)}
                      className="px-3 border border-archive-line text-[9px] font-mono uppercase hover:bg-archive-ink hover:text-white transition-colors"
                    >
                      Detect
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] uppercase opacity-40 flex items-center gap-2"><MapPin size={10} /> Spatial Coordinates</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      className="flex-1 bg-archive-bg p-3 border border-archive-line text-lg italic outline-none focus:border-archive-accent" 
                      value={manualLocation} 
                      onChange={(e) => setManualLocation(e.target.value)} 
                      onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
                      placeholder={userLocation?.name || "City, Region..."}
                    />
                    <button 
                      onClick={handleManualSearch}
                      disabled={searching || !manualLocation.trim()}
                      className="px-3 border border-archive-line text-[9px] font-mono uppercase hover:bg-archive-ink hover:text-white transition-colors disabled:opacity-30"
                    >
                      {searching ? "..." : "Search"}
                    </button>
                    <button 
                      onClick={detectLocation}
                      disabled={detecting}
                      className="px-3 border border-archive-line text-[9px] font-mono uppercase hover:bg-archive-ink hover:text-white transition-colors"
                    >
                      {detecting ? "..." : "Detect"}
                    </button>
                  </div>
                  {searchError && <p className="text-[8px] text-red-500 italic">{searchError}</p>}
                  {userLocation && !manualLocation && <p className="text-[8px] text-emerald-600 italic">Current: {userLocation.name}</p>}
                </div>
                <button onClick={() => setIsEditingProfile(false)} className="w-full text-[10px] uppercase opacity-40 hover:opacity-100">Save and Close</button>
              </div>
            ) : (
              <div className="space-y-4 relative z-10">
                <p className="handwritten text-2xl italic text-archive-ink leading-tight">
                  {userIdentity ? `Hi, ${userIdentity.split(' ')[0]}.` : "Let's set your frequency."}
                </p>
                <div className="flex flex-col gap-2">
                  {userBirthday && <span className="flex items-center gap-2 text-sm italic opacity-60"><Calendar size={14} className="opacity-40" /> Born: {userBirthday} {userBirthTime && `@ ${userBirthTime}`} ({userBirthTimezone})</span>}
                  {userLocation && <span className="flex items-center gap-2 text-sm italic opacity-60"><MapPin size={14} className="opacity-40" /> Location: {userLocation.name || "Synced"}</span>}
                </div>
                {isCalibrated && <div className="flex items-center gap-2 text-[9px] text-emerald-600 uppercase tracking-widest pt-2 border-t border-archive-line"><Check size={12} /> Calibration Locked ♁</div>}
              </div>
            )}
          </section>

          <div className="flex justify-between items-center mb-10 pb-4 border-b border-archive-line">
            <div className="space-y-2 flex-1 mr-8">
              <div className="flex justify-between items-end">
                <div className="handwritten text-[10px] text-archive-ink opacity-40 uppercase tracking-widest">Seeker Level</div>
                <div className="text-[9px] font-mono opacity-40">{calculationsRun} / 50</div>
              </div>
              <div className="h-1.5 w-full bg-archive-ink/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-archive-accent"
                />
              </div>
              <div className="heading-marker text-xl">{level}</div>
            </div>
            <div className="text-right">
              <div className="handwritten text-[10px] text-archive-ink opacity-40 uppercase tracking-widest">Resonance</div>
              <div className="heading-marker text-xl">{resonance}%</div>
            </div>
          </div>

          <div className="space-y-16">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
                <input 
                  type="text" 
                  placeholder="Quick find a record..." 
                  value={quickSearch}
                  onChange={(e) => setQuickSearch(e.target.value)}
                  className="w-full bg-white border border-archive-line p-4 pl-12 text-sm font-serif italic outline-none focus:border-archive-accent shadow-sm rounded-xl"
                />
              </div>
              {quickSearch && (
                <div className="space-y-1 pl-6 animate-in fade-in slide-in-from-top-2 duration-300">
                  {ALL_TOOLS.filter(t => t.name.toLowerCase().includes(quickSearch.toLowerCase())).map((item, i) => (
                    <button 
                      key={i}
                      onClick={() => { onNavigate(item.page); setQuickSearch(''); }} 
                      className="w-full text-left handwritten text-lg text-archive-ink hover:text-archive-accent py-1.5 px-4 rounded-md hover:bg-archive-ink/5 transition-colors flex justify-between items-center"
                    >
                      <span>{item.name}</span>
                      <span className="text-[8px] uppercase opacity-40">Jump →</span>
                    </button>
                  ))}
                  {ALL_TOOLS.filter(t => t.name.toLowerCase().includes(quickSearch.toLowerCase())).length === 0 && (
                    <p className="handwritten text-sm opacity-40 italic py-2">No records match your query.</p>
                  )}
                </div>
              )}
            </div>

            {pinnedItems.length > 0 && !quickSearch && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-archive-accent/30 pb-2">
                  <span className="text-2xl font-sans text-archive-accent">★</span>
                  <span className="heading-marker text-2xl text-archive-ink uppercase tracking-wide">Pinned Records</span>
                </div>
                <ul className="space-y-1 pl-6">
                  {pinnedItems.map((item, i) => (
                    <li key={i} className="flex items-center group">
                      <button 
                        onClick={() => onNavigate(item.page)} 
                        className="flex-1 text-left handwritten text-lg text-archive-ink hover:text-archive-accent py-1.5 px-4 rounded-md hover:bg-archive-ink/5 transition-colors"
                      >
                        {item.name}
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); togglePinnedTool(item.page); }}
                        className="p-2 opacity-20 group-hover:opacity-100 hover:text-archive-accent transition-all"
                        title="Unpin"
                      >
                        <PinOff size={14} />
                      </button>
                      <Tooltip title={item.name} content={item.desc} />
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center gap-3 border-b border-archive-line pb-2">
                <span className="text-2xl font-sans text-archive-ink opacity-40">☖</span>
                <span className="heading-marker text-2xl text-archive-ink uppercase tracking-wide">Core Systems</span>
              </div>
              <ul className="space-y-1 pl-6">
                <li>
                  <button 
                    onClick={() => onNavigate("MASTER_ARCHIVE")} 
                    className="w-full text-left handwritten text-lg text-archive-ink hover:text-archive-accent py-1.5 px-4 rounded-md hover:bg-archive-ink/5 transition-colors flex items-center gap-3"
                  >
                    <Clock size={16} className="opacity-40" /> Master Archive
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => onNavigate("LEXICON")} 
                    className="w-full text-left handwritten text-lg text-archive-ink hover:text-archive-accent py-1.5 px-4 rounded-md hover:bg-archive-ink/5 transition-colors flex items-center gap-3"
                  >
                    <Book size={16} className="opacity-40" /> Lexicon of Discovery
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => onNavigate("ORACLE_VIEW")} 
                    className="w-full text-left handwritten text-lg text-archive-ink hover:text-archive-accent py-1.5 px-4 rounded-md hover:bg-archive-ink/5 transition-colors flex items-center gap-3"
                  >
                    <Brain size={16} className="opacity-40" /> Consult Librarian
                  </button>
                </li>
              </ul>
            </div>

            {categories.map((cat, idx) => (
              <div key={idx} className="space-y-4">
                <div className="flex items-center gap-3 border-b border-archive-line pb-2">
                  <span className="text-2xl font-sans" style={{ color: cat.color }}>{cat.symbol}</span>
                  <span className="heading-marker text-2xl text-archive-ink uppercase tracking-wide">{cat.label}</span>
                </div>
                <ul className="space-y-1 pl-6">
                  {cat.items.map((item, i) => (
                    <li key={i} className="flex items-center group">
                      <button 
                        onClick={() => onNavigate(item.page)} 
                        className="flex-1 text-left handwritten text-lg text-archive-ink hover:text-archive-accent py-1.5 px-4 rounded-md hover:bg-archive-ink/5 transition-colors"
                      >
                        {item.name}
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); togglePinnedTool(item.page); }}
                        className={`p-2 transition-all hover:text-archive-accent ${pinnedTools.includes(item.page) ? 'opacity-100 text-archive-accent' : 'opacity-0 group-hover:opacity-40'}`}
                        title={pinnedTools.includes(item.page) ? "Unpin" : "Pin to top"}
                      >
                        {pinnedTools.includes(item.page) ? <PinOff size={14} /> : <Pin size={14} />}
                      </button>
                      <Tooltip title={item.name} content={item.desc} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            
            <div className="pt-8 mt-8 border-t border-archive-line space-y-4">
              <button onClick={toggleEclipseMode} className="w-full flex items-center justify-between group p-3 hover:bg-archive-ink/5 rounded-xl transition-all">
                <div className="flex items-center gap-3">
                  {isEclipseMode ? <Moon size={20} className="text-archive-accent" /> : <Sun size={20} className="text-archive-accent" />}
                  <span className="handwritten text-lg italic">{isEclipseMode ? "Night Watch" : "Day Watch"}</span>
                </div>
                <div className={`w-12 h-6 rounded-full border border-archive-ink relative transition-all ${isEclipseMode ? "bg-archive-ink" : "bg-transparent"}`}>
                  <div className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full transition-all duration-300 ${isEclipseMode ? "left-[calc(100%-1.2rem)] bg-archive-bg" : "left-1 bg-archive-ink"}`} />
                </div>
              </button>

              <button 
                onClick={() => setShowResetConfirm(true)}
                className="w-full flex items-center gap-3 p-3 text-red-500/40 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all group"
              >
                <AlertTriangle size={20} />
                <span className="handwritten text-lg italic">Reset Archive</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <div className="modal-overlay">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowResetConfirm(false)}
              className="absolute inset-0"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="modal-container"
            >
              <div className="flex items-center gap-4 text-red-500">
                <AlertTriangle size={32} />
                <h3 className="font-serif italic text-2xl">Irreversible Action</h3>
              </div>
              <p className="handwritten text-lg italic opacity-60 leading-relaxed">
                This will permanently erase all your recorded resonances, dreams, and insights. The Syllabus will be wiped clean. Are you absolutely sure?
              </p>
              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 px-6 py-3 border border-archive-line font-mono uppercase text-[10px] tracking-widest hover:bg-archive-ink/5 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleReset}
                  className="flex-1 px-6 py-3 bg-red-500 text-white font-mono uppercase text-[10px] tracking-widest hover:bg-red-600 transition-colors shadow-lg"
                >
                  Erase All
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
