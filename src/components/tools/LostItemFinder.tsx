import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Sparkles, RefreshCw, Info, CheckCircle2, Circle } from 'lucide-react';
import { useSyllabusStore } from '../../store';
import { useHaptics } from '../../hooks/useHaptics';
import { useProfile } from '../../hooks/useProfile';
import { getPlanetaryPositions, getHouseCusps, getSign, getRuler } from '../../services/astroCoreService';
import { geminiService } from '../../services/geminiService';
import { ZodiacWheel } from '../shared/ZodiacWheel';
import { ReadAloudButton } from '../shared/ReadAloudButton';
import { ToolLayout } from '../shared/ToolLayout';
import { ResultSection } from '../shared/ResultSection';
import { ProfileSelector } from '../shared/ProfileSelector';
import Markdown from 'react-markdown';

interface LostItemFinderProps {
  onBack: () => void;
}

const HOUSE_MEANINGS: Record<number, string> = {
  1: "The 1st House represents your immediate environment and personal space. The item is likely right under your nose.",
  2: "The 2nd House rules personal possessions. The item is likely where you keep your valuables or daily essentials.",
  3: "The 3rd House rules communication and short trips. Check near phones, mail, or in your vehicle.",
  4: "The 4th House rules the home and private spaces. Look in the most 'hidden' or foundational parts of the house.",
  5: "The 5th House rules pleasure and creativity. Check near hobby supplies or where you relax.",
  6: "The 6th House rules work and service. Look near tools, cleaning supplies, or your workspace.",
  7: "The 7th House rules partnerships. It might be with someone else or in a shared space.",
  8: "The 8th House rules shared resources and the 'occult'. It might be buried deep or in a very dark place.",
  9: "The 9th House rules long journeys and higher learning. It could be far away or near books/travel gear.",
  10: "The 10th House rules public life and career. Check your professional bag or workplace.",
  11: "The 11th House rules friends and hopes. It might be in a social area or where you gather with others.",
  12: "The 12th House rules secrets and isolation. The item is very well hidden or in a place of retreat."
};

const SIGN_MEANINGS: Record<string, string> = {
  "Aries": "Aries is a fire sign, suggesting a high, bright, or hot location.",
  "Taurus": "Taurus is an earth sign, suggesting a low, stable, or comfortable location.",
  "Gemini": "Gemini is an air sign, suggesting a place of movement, books, or communication.",
  "Cancer": "Cancer is a water sign, suggesting a domestic, private, or watery location.",
  "Leo": "Leo is a fire sign, suggesting a prominent, sunny, or central location.",
  "Virgo": "Virgo is an earth sign, suggesting a practical, organized, or low location.",
  "Libra": "Libra is an air sign, suggesting a balanced, beautiful, or social location.",
  "Scorpio": "Scorpio is a water sign, suggesting a hidden, dark, or intense location.",
  "Sagittarius": "Sagittarius is a fire sign, suggesting an expansive, high, or outdoor location.",
  "Capricorn": "Capricorn is an earth sign, suggesting a structured, low, or dark location.",
  "Aquarius": "Aquarius is an air sign, suggesting a unique, high, or technological location.",
  "Pisces": "Pisces is a water sign, suggesting a quiet, hidden, or watery location."
};

export const LostItemFinder: React.FC<LostItemFinderProps> = ({ onBack }) => {
  const { recordCalculation } = useSyllabusStore();
  const { triggerClick, triggerSuccess } = useHaptics();
  const { profile, setMe, setSomeoneElse, updateProfile } = useProfile();
  
  const [item, setItem] = useState('');
  const [seedNumber, setSeedNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [horaryDetails, setHoraryDetails] = useState<{ significator: string; house: number; sign: string } | null>(null);
  const [numerologyNumber, setNumerologyNumber] = useState<number | null>(null);
  const [chartData, setChartData] = useState<{ planets: any[]; ascendant: number } | null>(null);
  const [checklist, setChecklist] = useState<{ text: string; checked: boolean }[]>([]);

  const getHouse = (longitude: number, cusps: number[]) => {
    for (let i = 0; i < 11; i++) {
      if (cusps[i] < cusps[i + 1]) {
        if (longitude >= cusps[i] && longitude < cusps[i + 1]) return i + 1;
      } else {
        if (longitude >= cusps[i] || longitude < cusps[i + 1]) return i + 1;
      }
    }
    return 12;
  };

  const toggleChecklist = (index: number) => {
    setChecklist(prev => prev.map((item, i) => i === index ? { ...item, checked: !item.checked } : item));
  };

  const handleFind = async () => {
    triggerClick();
    if (!item) return;
    setLoading(true);
    
    const lat = profile.location.lat || 0;
    const lng = profile.location.lng || 0;
    const now = new Date();

    try {
      setLoadingStep('Calculating planetary positions...');
      const [planets, cusps] = await Promise.all([
        getPlanetaryPositions(now, lat, lng),
        getHouseCusps(now, lat, lng)
      ]);
      
      setChartData({
        planets: planets.map((p: any) => ({ 
          name: p.name, 
          degree: p.longitude,
          sign: p.sign 
        })),
        ascendant: cusps[0]
      });

      setLoadingStep('Analyzing horary significators...');
      const secondHouseSign = getSign(cusps[1]);
      const significatorName = getRuler(secondHouseSign);
      const significator = planets.find((p: any) => p.name === significatorName) || planets[0];
      const significatorHouse = getHouse(significator.longitude, cusps);
      const significatorSign = significator.sign;

      setHoraryDetails({
        significator: significatorName,
        house: significatorHouse,
        sign: significatorSign
      });

      setLoadingStep('Calculating numerical vibration...');
      let num: number;
      if (seedNumber && !isNaN(parseInt(seedNumber))) {
        num = (parseInt(seedNumber) % 81) || 81;
      } else {
        const hash = Math.abs(item.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + now.getTime());
        num = (hash % 81) || 81;
      }
      setNumerologyNumber(num);

      const astroData = {
        significatorName,
        significatorHouse,
        houseMeaning: HOUSE_MEANINGS[significatorHouse],
        significatorSign,
        signMeaning: SIGN_MEANINGS[significatorSign]
      };

      setLoadingStep('Synthesizing cosmic data...');
      
      // Add a timeout to the AI call to prevent indefinite hanging
      const dataPromise = geminiService.findLostItem(item, astroData, num);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("The cosmic archive is taking too long to respond.")), 20000)
      );
      
      const data = await Promise.race([dataPromise, timeoutPromise]) as any;
      
      setSuggestion(data.interpretation || "The archive is hazy. Look where you last felt peace.");
      setChecklist((data.checklist || []).map((t: string) => ({ text: t, checked: false })));
      
      recordCalculation();
      triggerSuccess();
    } catch (error) {
      console.error("Error finding item:", error);
      setSuggestion(error instanceof Error ? error.message : "The cosmic signal is weak. Try again in a moment.");
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  return (
    <ToolLayout
      title="Lost Item Finder"
      subtitle="Locating what has been misplaced"
      onBack={onBack}
      tooltipTitle="How it works"
      tooltipContent="Combines Horary Astrology and Lost Item Numerology to pinpoint the location of lost objects."
    >
      <div className="w-full flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
        <aside className="w-full lg:w-[400px] space-y-8 lg:sticky lg:top-20">
          <div className="archive-card p-6 animate-in fade-in slide-in-from-left-4 duration-300">
            <ProfileSelector 
              isMe={profile.isMe}
              onMe={setMe}
              onSomeoneElse={setSomeoneElse}
            />

            <div className="archive-form-group mt-6">
              <label className="archive-label">Search Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                <input 
                  type="text" 
                  value={profile.location.name || ""}
                  onChange={(e) => updateProfile({ location: { ...profile.location, name: e.target.value } })}
                  className="archive-input pl-10 !text-[10px] !font-mono"
                  placeholder="City, Country"
                />
              </div>
            </div>

            <div className="space-y-4 mt-6">
              <div className="archive-form-group">
                <label className="archive-label">The Object</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                  <input 
                    type="text" 
                    placeholder="What is lost?" 
                    value={item}
                    onChange={(e) => setItem(e.target.value)}
                    className="archive-input pl-10 !text-lg !italic"
                  />
                </div>
              </div>
              <div className="archive-form-group">
                <label className="archive-label">Seed Number (Optional)</label>
                <input 
                  type="number" 
                  placeholder="1-99" 
                  value={seedNumber}
                  onChange={(e) => setSeedNumber(e.target.value)}
                  className="archive-input !text-lg !font-mono"
                />
              </div>
            </div>

            <button 
              onClick={handleFind}
              disabled={loading || !item}
              className={`brutalist-button w-full py-5 text-xl mt-8 transition-all ${loading || !item ? "opacity-30" : ""}`}
            >
              {loading ? "CONSULTING..." : "FIND ITEM"}
            </button>
          </div>
        </aside>

        <main className="flex-1 w-full min-h-[600px] pb-32">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-40 gap-8"
              >
                <div className="relative">
                  <div className="w-16 h-16 border-2 border-archive-accent border-t-transparent animate-spin rounded-full" />
                  <div className="absolute inset-0 flex items-center justify-center text-xl opacity-20 italic">☉</div>
                </div>
                <span className="handwritten text-lg text-archive-accent animate-pulse uppercase tracking-[0.3em]">
                  {loadingStep || "Triangulating the resonance..."}
                </span>
              </motion.div>
            ) : suggestion ? (
              <motion.div 
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-12"
              >
                <div className="archive-card p-8 md:p-10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.02] select-none pointer-events-none text-8xl italic">LOST</div>
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <MapPin className="text-archive-accent w-4 h-4" />
                        <span className="text-[10px] font-mono text-archive-accent uppercase tracking-widest">Astro-Horary</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Sparkles className="text-archive-accent w-4 h-4" />
                        <span className="text-[10px] font-mono text-archive-accent uppercase tracking-widest">Numerological</span>
                      </div>
                    </div>
                    <ReadAloudButton text={suggestion} className="!p-1 !h-auto !w-auto !bg-transparent !border-none !shadow-none opacity-20 hover:opacity-100" />
                  </div>
                  
                  <div className="font-serif italic text-2xl leading-relaxed text-archive-ink mb-8">
                    <Markdown>{suggestion}</Markdown>
                  </div>
                  
                  {chartData && (
                    <div className="flex justify-center py-8 border-t border-archive-line">
                      <ZodiacWheel 
                        size={280}
                        planets={chartData.planets}
                        ascendantDegree={chartData.ascendant}
                      />
                    </div>
                  )}
                  
                  {horaryDetails && (
                    <div className="mt-8 space-y-8">
                      <div className="pt-6 border-t border-archive-line grid grid-cols-3 gap-4">
                        <div className="text-center group relative">
                          <span className="col-header block mb-1">Significator</span>
                          <span className="text-[10px] font-mono">{horaryDetails.significator}</span>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-archive-ink text-archive-bg text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                            The planet representing the lost item in this horary chart.
                          </div>
                        </div>
                        <div className="text-center border-x border-archive-line group relative">
                          <span className="col-header block mb-1">House</span>
                          <span className="text-[10px] font-mono">{horaryDetails.house}</span>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-archive-ink text-archive-bg text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                            {HOUSE_MEANINGS[horaryDetails.house]}
                          </div>
                        </div>
                        <div className="text-center group relative">
                          <span className="col-header block mb-1">Lost #</span>
                          <span className="text-[10px] font-mono">{numerologyNumber}</span>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-archive-ink text-archive-bg text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                            The Lost Item Number (1-81) derived from the seeker's vibration.
                          </div>
                        </div>
                      </div>

                      <div className="text-left space-y-4">
                        <h4 className="text-[10px] font-mono uppercase tracking-widest opacity-40">Interactive Search Checklist</h4>
                        <div className="grid grid-cols-1 gap-2">
                          {checklist.map((item, i) => (
                            <button 
                              key={i} 
                              onClick={() => toggleChecklist(i)}
                              className={`flex items-start gap-3 p-3 border rounded-archive transition-all text-left ${item.checked ? 'bg-archive-line/20 border-archive-line opacity-40' : 'bg-white border-archive-line hover:border-archive-ink'}`}
                            >
                              <div className="mt-0.5 flex-shrink-0">
                                {item.checked ? <CheckCircle2 className="w-4 h-4 text-archive-ink" /> : <Circle className="w-4 h-4 text-archive-ink/20" />}
                              </div>
                              <span className={`text-sm font-serif italic ${item.checked ? 'line-through' : ''}`}>
                                {item.text}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <ResultSection
                  id="lost-item-finder-content"
                  title="Final Synthesis"
                  content={suggestion}
                  exportName={`lost-item-${item}`}
                  onClose={() => setSuggestion(null)}
                />
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center py-40 opacity-[0.03] select-none pointer-events-none"
              >
                <Search size={160} />
                <p className="handwritten text-4xl uppercase tracking-[0.4em] mt-8">Awaiting Search</p>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </ToolLayout>
  );
};
