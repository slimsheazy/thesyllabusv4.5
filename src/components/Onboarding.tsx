import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Calendar, Clock, MapPin, Check, ArrowRight, Loader2, Sparkles, UserCheck, Volume2 } from 'lucide-react';
import { useSyllabusStore } from '../store';
import { UserLocation } from '../types';
import { analyzeBirthChart, BirthData } from '../services/astrologyService';
import { generateBirthChartKey } from '../utils/hashUtils';
import { useHaptics } from '../hooks/useHaptics';
import { ReadAloudButton } from './shared/ReadAloudButton';

export const Onboarding: React.FC = () => {
  const { triggerTick, triggerSuccess } = useHaptics();
  const { 
    setUserIdentity, setUserBirthday, setUserBirthTime, 
    setUserBirthTimezone, setUserLocation, isCalibrated,
    setCalibrated,
    userIdentity: storedIdentity, userBirthday: storedBirthday,
    userBirthTime: storedBirthTime, userBirthTimezone: storedTimezone,
    userLocation: storedLocation,
    birthChartCache, setBirthChartCache
  } = useSyllabusStore();

  const [step, setStep] = useState(() => {
    if (!storedIdentity) return 1;
    if (!storedBirthday) return 2;
    if (!storedLocation) return 3;
    return 4;
  });
  const [identity, setIdentity] = useState(storedIdentity || '');
  const [birthday, setBirthday] = useState(storedBirthday || '');
  const [birthTime, setBirthTime] = useState(storedBirthTime || '12:00');
  const [timezone, setTimezone] = useState(storedTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [detecting, setDetecting] = useState(false);
  const [location, setLocation] = useState<UserLocation | null>(storedLocation);
  const [manualLocation, setManualLocation] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  
  const [synopsis, setSynopsis] = useState<any>(null);
  const [loadingSynopsis, setLoadingSynopsis] = useState(false);
  const [isEditingSigns, setIsEditingSigns] = useState(false);

  const handleNext = () => {
    if (step === 1 && identity) {
      triggerTick();
      setUserIdentity(identity);
      setStep(2);
    } else if (step === 2 && birthday) {
      triggerTick();
      setUserBirthday(birthday);
      setUserBirthTime(birthTime);
      setUserBirthTimezone(timezone);
      setStep(3);
    }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setSearchError("Geolocation is not supported by this browser.");
      return;
    }
    setDetecting(true);
    setSearchError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude, name: "Detected Location" };
        setLocation(loc);
        setDetecting(false);
      },
      (err) => {
        setDetecting(false);
        setSearchError("Location access denied or unavailable. Please use manual search.");
        console.error("Geolocation error:", err);
      },
      { timeout: 10000 }
    );
  };

  const handleManualSearch = async () => {
    if (!manualLocation.trim()) return;
    setSearching(true);
    setSearchError(null);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(manualLocation)}&limit=1`);
      const data = await response.json();
      if (data && data.length > 0) {
        const first = data[0];
        setLocation({
          lat: parseFloat(first.lat),
          lng: parseFloat(first.lon),
          name: first.display_name.split(',')[0]
        });
      } else {
        setSearchError("Location not found. Please be more specific.");
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchError("Failed to connect to location service.");
    } finally {
      setSearching(false);
    }
  };

  const handleFinishStep3 = async () => {
    if (location) {
      triggerTick();
      setUserLocation(location);
      setStep(4);
      fetchSynopsis();
    }
  };

  const fetchSynopsis = async () => {
    if (!birthday || !birthTime || !location) return;
    
    const cacheKey = generateBirthChartKey(birthday, birthTime, location.name || "Unknown", timezone);
    const cached = birthChartCache[cacheKey];
    
    // If cached value exists and doesn't have "Unknown" or "Calculating..." signs, use it
    const isRealResult = (c: any) => c && c.sunSign !== "Unknown" && c.sunSign !== "Calculating..." && c.moonSign !== "Unknown" && c.risingSign !== "Unknown";
    
    if (isRealResult(cached)) {
      setSynopsis(cached);
      return;
    }

    setLoadingSynopsis(true);
    try {
      const data: BirthData = {
        date: birthday,
        time: birthTime,
        location: location.name || "Unknown",
        timezone: timezone,
        lat: location.lat,
        lng: location.lng
      };
      const result = await analyzeBirthChart(data);
      setSynopsis(result);
      
      // Only cache if it's a real result, not the fallback
      if (result.sunSign !== "Calculating...") {
        setBirthChartCache(cacheKey, result);
      }
    } catch (error) {
      console.error("Failed to fetch synopsis", error);
    } finally {
      setLoadingSynopsis(false);
    }
  };

  const handleConfirm = () => {
    triggerSuccess();
    setCalibrated(true);
  };

  if (isCalibrated) return null;

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-archive-bg p-4 sm:p-8 overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-archive-accent blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-archive-ink blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl bg-white border border-archive-line shadow-2xl rounded-2xl p-8 sm:p-12 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none text-9xl font-sans">☊</div>
        
        <div className="relative z-10 space-y-10">
          <header className="space-y-2">
            <div className="flex items-center">
              <span className="label-gidole text-archive-accent">Setting Up</span>
            </div>
            <h2 className="subtitle-main leading-tight">WELCOME TO THE SYLLABUS</h2>
            <p className="body-gidole opacity-60">Let's get your profile ready.</p>
          </header>

          <div className="min-h-[240px]">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <label className="label-gidole opacity-40 flex items-center gap-2">
                      <User size={12} /> What is your full name?
                    </label>
                    <input 
                      autoFocus
                      className="w-full bg-archive-bg p-6 border border-archive-line text-3xl italic outline-none focus:border-archive-accent shadow-inner" 
                      value={identity} 
                      onChange={(e) => setIdentity(e.target.value)}
                      placeholder="Your full name..."
                      onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                    />
                  </div>
                  <button 
                    onClick={handleNext}
                    disabled={!identity}
                    className="brutalist-button w-full py-5 text-xl flex items-center justify-center gap-3 disabled:opacity-30"
                  >
                    Continue <ArrowRight size={20} />
                  </button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="label-gidole opacity-40 flex items-center gap-2">
                        <Calendar size={12} /> Birth Date
                      </label>
                      <input 
                        type="date" 
                        className="w-full bg-archive-bg p-4 border border-archive-line text-xl italic outline-none focus:border-archive-accent" 
                        value={birthday} 
                        onChange={(e) => setBirthday(e.target.value)} 
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="label-gidole opacity-40 flex items-center gap-2">
                        <Clock size={12} /> Birth Time
                      </label>
                      <input 
                        type="time" 
                        className="w-full bg-archive-bg p-4 border border-archive-line text-xl italic outline-none focus:border-archive-accent" 
                        value={birthTime} 
                        onChange={(e) => setBirthTime(e.target.value)} 
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="label-gidole opacity-40 flex items-center gap-2">
                      Birth Timezone (e.g., America/New_York)
                    </label>
                    <p className="text-[10px] italic opacity-60 -mt-1">
                      Crucial for the Moon sign. Use an IANA zone (like "Europe/London") or a specific offset if known.
                    </p>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        className="flex-1 bg-archive-bg p-4 border border-archive-line text-xl italic outline-none focus:border-archive-accent" 
                        value={timezone} 
                        onChange={(e) => setTimezone(e.target.value)} 
                        placeholder="e.g. America/Los_Angeles"
                      />
                      <button 
                        onClick={() => setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone)}
                        className="px-4 border border-archive-line text-[10px] font-mono uppercase hover:bg-archive-ink hover:text-white transition-colors"
                      >
                        Detect
                      </button>
                    </div>
                  </div>
                  <button 
                    onClick={handleNext}
                    disabled={!birthday}
                    className="brutalist-button w-full py-5 text-xl flex items-center justify-center gap-3 disabled:opacity-30"
                  >
                    Continue <ArrowRight size={20} />
                  </button>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div 
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="space-y-4">
                    <label className="label-gidole opacity-40 flex items-center gap-2">
                      <MapPin size={12} /> Birth Location
                    </label>
                    <p className="body-gidole italic opacity-60">We use this to calculate your astrological chart.</p>
                    
                    <button
                      onClick={detectLocation}
                      disabled={detecting || searching}
                      className={`w-full p-8 border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-all rounded-xl ${location && !manualLocation ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-archive-bg border-archive-line hover:border-archive-accent group"}`}
                    >
                      {detecting ? (
                        <Loader2 className="w-8 h-8 animate-spin text-archive-accent" />
                      ) : location && !manualLocation ? (
                        <>
                          <Check className="w-10 h-10" />
                          <span className="font-sans text-xs uppercase tracking-widest">Coordinates Locked</span>
                        </>
                      ) : (
                        <>
                          <MapPin className="w-10 h-10 opacity-20 group-hover:opacity-100 group-hover:text-archive-accent transition-all" />
                          <span className="font-sans text-xs uppercase tracking-widest">Pinpoint Location</span>
                        </>
                      )}
                    </button>

                    <div className="relative">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-px flex-1 bg-archive-line opacity-20" />
                        <span className="text-[8px] uppercase opacity-30 tracking-[0.2em]">or search manually</span>
                        <div className="h-px flex-1 bg-archive-line opacity-20" />
                      </div>
                      <div className="flex gap-2">
                        <input 
                          type="text"
                          placeholder="Enter city, region, or landmark..."
                          value={manualLocation}
                          onChange={(e) => setManualLocation(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
                          className="flex-1 bg-archive-bg p-4 border border-archive-line text-sm italic outline-none focus:border-archive-accent"
                        />
                        <button 
                          onClick={handleManualSearch}
                          disabled={searching || !manualLocation.trim()}
                          className="px-6 border border-archive-line text-[10px] font-mono uppercase hover:bg-archive-ink hover:text-white transition-colors disabled:opacity-30"
                        >
                          {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
                        </button>
                      </div>
                      {searchError && (
                        <p className="text-[10px] text-red-500 italic mt-2 text-center">{searchError}</p>
                      )}
                      {location && manualLocation && !searching && (
                        <p className="text-[10px] text-emerald-600 italic mt-2 text-center flex items-center justify-center gap-1">
                          <Check size={10} /> Found: {location.name}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {location && (
                    <motion.button 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={handleFinishStep3}
                      className="brutalist-button w-full py-5 text-xl flex items-center justify-center gap-3"
                    >
                      Review Details <ArrowRight size={20} />
                    </motion.button>
                  )}
                </motion.div>
              )}

              {step === 4 && (
                <motion.div 
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <label className="label-gidole opacity-40 flex items-center gap-2">
                      <UserCheck size={12} /> Confirm Your Details
                    </label>
                    
                    {loadingSynopsis ? (
                      <div className="flex flex-col items-center justify-center py-12 space-y-4 bg-archive-bg border border-archive-line rounded-xl">
                        <Loader2 className="w-10 h-10 animate-spin text-archive-accent" />
                        <p className="label-gidole text-sm opacity-60">Calculating your profile...</p>
                      </div>
                    ) : synopsis ? (
                      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        <div className="bg-archive-bg p-6 border border-archive-line rounded-xl space-y-4">
                          <div className="flex justify-between items-start">
                            <div className="grid grid-cols-2 gap-4 flex-1">
                              <div className="space-y-1">
                                <span className="label-gidole opacity-40">Name</span>
                                <p className="font-serif italic text-lg">{identity}</p>
                              </div>
                              <div className="space-y-1">
                                <span className="label-gidole opacity-40">Birth</span>
                                <p className="font-serif italic text-lg">{birthday} {birthTime}</p>
                              </div>
                            </div>
                            <ReadAloudButton 
                              text={`Welcome ${identity}. Your Sun is in ${synopsis.sunSign}, Moon in ${synopsis.moonSign}, and Rising in ${synopsis.risingSign}. Your Life Path number is ${synopsis.lifePath}.`} 
                              className="!p-2 !h-auto !w-auto !bg-transparent !border-none !shadow-none opacity-40 hover:opacity-100"
                            />
                          </div>
                          
                          <div className="border-t border-archive-line pt-4 space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="label-gidole opacity-40">Sun Sign</span>
                              {isEditingSigns ? (
                                <select 
                                  className="bg-transparent font-mono text-xs text-archive-accent outline-none border-b border-archive-accent/20"
                                  value={synopsis.sunSign}
                                  onChange={(e) => setSynopsis({...synopsis, sunSign: e.target.value})}
                                >
                                  {["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"].map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                              ) : (
                                <span className="font-mono text-xs text-archive-accent">{synopsis.sunSign}</span>
                              )}
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="label-gidole opacity-40">Moon Sign</span>
                              {isEditingSigns ? (
                                <select 
                                  className="bg-transparent font-mono text-xs text-archive-accent outline-none border-b border-archive-accent/20"
                                  value={synopsis.moonSign}
                                  onChange={(e) => setSynopsis({...synopsis, moonSign: e.target.value})}
                                >
                                  {["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"].map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                              ) : (
                                <span className="font-mono text-xs text-archive-accent">{synopsis.moonSign}</span>
                              )}
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="label-gidole opacity-40">Rising Sign</span>
                              {isEditingSigns ? (
                                <select 
                                  className="bg-transparent font-mono text-xs text-archive-accent outline-none border-b border-archive-accent/20"
                                  value={synopsis.risingSign}
                                  onChange={(e) => setSynopsis({...synopsis, risingSign: e.target.value})}
                                >
                                  {["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"].map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                              ) : (
                                <span className="font-mono text-xs text-archive-accent">{synopsis.risingSign}</span>
                              )}
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="label-gidole opacity-40">Life Path</span>
                              <span className="font-mono text-xs text-archive-accent">{synopsis.lifePath}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-center gap-2">
                          <p className="text-[10px] italic opacity-60 text-center px-4">
                            {isEditingSigns ? "Adjust your signs as needed." : "This profile is derived from your birth date, time, and location using astronomical calculations."}
                          </p>
                          <p className="text-[10px] italic opacity-40 text-center px-4 -mt-1">
                            Does this data accurately reflect your birth information?
                          </p>
                          <button 
                            onClick={() => setIsEditingSigns(!isEditingSigns)}
                            className="text-[10px] font-mono uppercase text-archive-accent underline opacity-60 hover:opacity-100"
                          >
                            {isEditingSigns ? "Save Adjustments" : "Manual Adjustment"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 text-center bg-archive-bg border border-archive-line rounded-xl">
                        <p className="text-sm italic opacity-60">Calibration failed. Please try again.</p>
                        <button onClick={fetchSynopsis} className="mt-4 text-xs font-mono uppercase text-archive-accent underline">Retry</button>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setStep(1)}
                      className="flex-1 py-4 border border-archive-line text-xs font-mono uppercase hover:bg-archive-bg transition-colors"
                    >
                      Re-Calibrate
                    </button>
                    <button 
                      onClick={handleConfirm}
                      disabled={!synopsis || loadingSynopsis}
                      className="flex-[2] brutalist-button py-4 text-lg flex items-center justify-center gap-3 disabled:opacity-30"
                    >
                      Start Exploring <Check size={20} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <footer className="flex justify-center gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i} 
                className={`h-1 rounded-full transition-all duration-500 ${step === i ? "w-8 bg-archive-accent" : "w-2 bg-archive-line"}`} 
              />
            ))}
          </footer>
        </div>
      </motion.div>
    </div>
  );
};
