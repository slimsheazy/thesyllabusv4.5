import React, { useState, useEffect, useMemo } from 'react';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Calendar, Clock, Sparkles, RefreshCw, Loader2, AlertCircle, Compass } from 'lucide-react';
import { useSyllabusStore } from '../../store';
import { useHaptics } from '../../hooks/useHaptics';
import { useProfile } from '../../hooks/useProfile';
import { analyzeBirthChart, getCurrentSky } from '../../services/astrologyService';
import { geminiService } from '../../services/geminiService';
import { generateBirthChartKey } from '../../utils/hashUtils';
import { ZodiacWheel } from '../ZodiacWheel';
import { ErrorBoundary } from '../ErrorBoundary';
import { WritingEffect } from '../WritingEffect';
import { ReadAloudButton } from '../ReadAloudButton';
import { ToolLayout } from '../shared/ToolLayout';
import { ResultSection } from '../shared/ResultSection';
import { ProfileSelector } from '../shared/ProfileSelector';
import { BirthChartAnalysis, BirthChartPlanet } from '../../types';

interface BirthChartToolProps {
  onBack: () => void;
}

export const BirthChartTool: React.FC<BirthChartToolProps> = ({ onBack }) => {
  const { recordCalculation, birthChartCache, setBirthChartCache } = useSyllabusStore();
  const { triggerClick, triggerSuccess } = useHaptics();
  const { profile, setMe, setSomeoneElse, updateProfile, isValid } = useProfile();
  
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<BirthChartAnalysis | null>(null);
  const [view, setView] = useState<'NATAL' | 'CURRENT'>('NATAL');
  const [selectedPlanet, setSelectedPlanet] = useState<BirthChartPlanet | null>(null);
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const [interpreting, setInterpreting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cacheKey = useMemo(() => 
    view === 'CURRENT' ? 'current-sky' :
    generateBirthChartKey(
      profile.birthday, 
      profile.birthTime, 
      profile.location.name || 'Unknown', 
      profile.timezone
    ), 
    [profile.birthday, profile.birthTime, profile.location.name, profile.timezone, view]
  );

  useEffect(() => {
    const cached = birthChartCache[cacheKey];
    if (cached && cached.sunSign !== "Unknown" && cached.moonSign !== "Unknown" && cached.risingSign !== "Unknown") {
      setAnalysis(cached as BirthChartAnalysis);
    } else {
      setAnalysis(null);
      // Auto-run for "Me" if data exists
      if (profile.isMe && isValid) {
        handleAnalyze();
      }
    }
  }, [cacheKey, birthChartCache]);

  const handlePlanetClick = async (planet: BirthChartPlanet) => {
    triggerClick();
    setSelectedPlanet(planet);
    setInterpretation(null);
    setInterpreting(true);

    const signNames = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
    const sign = signNames[Math.floor(planet.degree / 30)];
    const house = Math.floor(((planet.degree - (analysis?.chartData?.ascendant || 0) + 360) % 360) / 30) + 1;

    try {
      const text = await geminiService.interpretPlacement(planet.name, sign, house);
      setInterpretation(text);
    } catch (err) {
      console.error(err);
      setInterpretation("The stars are clouded. Try again later.");
    } finally {
      setInterpreting(false);
    }
  };

  const handleAnalyze = async () => {
    triggerClick();
    if (view === 'NATAL' && !isValid) return;
    
    // Check cache first
    if (birthChartCache[cacheKey]) {
      setAnalysis(birthChartCache[cacheKey]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = view === 'NATAL' ? await analyzeBirthChart({
        date: profile.birthday,
        time: profile.birthTime,
        location: profile.location.name || "Unknown",
        timezone: profile.timezone
      }) : await getCurrentSky();
      
      setAnalysis(result);
      setBirthChartCache(cacheKey, result);
      recordCalculation();
      triggerSuccess();
    } catch (err) {
      console.error(err);
      setError("The archive is currently experiencing high resonance interference. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout
      title="The Birth Map"
      subtitle="Your unique celestial blueprint"
      onBack={onBack}
      tooltipTitle="The Cosmic Blueprint"
      tooltipContent="A map of the sky at the exact moment of your birth, revealing your unique cosmic blueprint. The stars are the archive of your soul's intent."
    >
      <div className="w-full flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
        <aside className="w-full lg:w-[400px] space-y-8 lg:sticky lg:top-20">
          <div className="archive-card p-6 animate-in fade-in slide-in-from-left-4 duration-300">
            <ProfileSelector 
              isMe={profile.isMe}
              onMe={setMe}
              onSomeoneElse={setSomeoneElse}
            />

            <div className="flex gap-2 p-1 bg-archive-bg border border-archive-line rounded-archive mt-6">
              <button 
                onClick={() => setView('NATAL')}
                className={`flex-1 py-2 text-[9px] font-mono uppercase tracking-widest transition-all rounded-archive ${view === 'NATAL' ? 'bg-archive-ink text-archive-bg' : 'opacity-40 hover:opacity-100'}`}
              >
                Natal Map
              </button>
              <button 
                onClick={() => setView('CURRENT')}
                className={`flex-1 py-2 text-[9px] font-mono uppercase tracking-widest transition-all rounded-archive ${view === 'CURRENT' ? 'bg-archive-ink text-archive-bg' : 'opacity-40 hover:opacity-100'}`}
              >
                Current Sky
              </button>
            </div>

            {view === 'NATAL' ? (
              <div className="space-y-6 animate-in fade-in duration-300 mt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="archive-form-group">
                    <label className="archive-label">Birth Date</label>
                    <input 
                      type="date" 
                      className="archive-input !p-3" 
                      value={profile.birthday} 
                      onChange={(e) => updateProfile({ birthday: e.target.value })} 
                    />
                  </div>
                  <div className="archive-form-group">
                    <label className="archive-label">Birth Time</label>
                    <input 
                      type="time" 
                      className="archive-input !p-3" 
                      value={profile.birthTime} 
                      onChange={(e) => updateProfile({ birthTime: e.target.value })} 
                    />
                  </div>
                </div>

                <div className="archive-form-group">
                  <label className="archive-label">Birth Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                    <input 
                      type="text" 
                      placeholder="City, Country"
                      className="archive-input !p-3 pl-10" 
                      value={profile.location.name || ""} 
                      onChange={(e) => updateProfile({ location: { ...profile.location, name: e.target.value } })} 
                    />
                  </div>
                </div>

                <div className="archive-form-group">
                  <label className="archive-label">Timezone</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      className="archive-input !p-3 flex-1" 
                      value={profile.timezone} 
                      onChange={(e) => updateProfile({ timezone: e.target.value })} 
                      placeholder="UTC"
                    />
                    <button 
                      onClick={() => updateProfile({ timezone: Intl.DateTimeFormat().resolvedOptions().timeZone })}
                      className="px-3 border border-archive-line text-[9px] font-mono uppercase hover:bg-archive-line/10 transition-colors rounded-archive"
                    >
                      Detect
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-archive-bg border border-archive-line text-center space-y-2 animate-in fade-in duration-300 mt-6 rounded-archive">
                <p className="handwritten text-sm italic opacity-60">Observing the collective frequency of the present moment.</p>
              </div>
            )}

            <button 
              onClick={handleAnalyze} 
              disabled={loading || (view === 'NATAL' && !isValid)} 
              className={`brutalist-button w-full py-5 text-xl transition-all flex items-center justify-center gap-3 mt-8 ${(loading || (view === 'NATAL' && !isValid)) ? "opacity-30" : ""}`}
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
              {view === 'NATAL' ? "GENERATE MAP" : "OBSERVE SKY"}
            </button>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-archive flex items-center gap-3 text-red-600 text-[10px] italic mt-4">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
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
                <span className="handwritten text-lg text-archive-accent animate-pulse uppercase tracking-[0.3em]">Mapping the celestial spheres...</span>
              </motion.div>
            ) : analysis ? (
              <motion.div 
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-12"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { label: 'Sun Sign', value: analysis.sunSign, symbol: '☉' },
                    { label: 'Moon Sign', value: analysis.moonSign, symbol: '☽' },
                    { label: 'Rising Sign', value: analysis.risingSign, symbol: 'ASC' },
                  ].map((item) => (
                    <div key={item.label} className="archive-card p-8 text-center relative overflow-hidden group">
                      <span className="absolute -right-4 -bottom-4 text-7xl opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">{item.symbol}</span>
                      <p className="col-header mb-2">{item.label}</p>
                      <p className="text-2xl font-serif italic">{item.value}</p>
                    </div>
                  ))}
                </div>

                {analysis.chartData && (
                  <div className="space-y-8">
                    <div className="flex items-center gap-3 border-b border-archive-line pb-2">
                      <Compass size={16} className="opacity-40" />
                      <h3 className="col-header border-none pb-0">Celestial Configuration</h3>
                    </div>
                    <div className="w-full max-w-lg mx-auto">
                      <ErrorBoundary fallback={
                        <div className="p-12 border border-dashed border-archive-line text-center space-y-4 rounded-archive">
                          <p className="handwritten text-xl opacity-40 italic">The celestial wheel is obscured by static.</p>
                          <button onClick={() => window.location.reload()} className="text-[10px] font-mono uppercase underline opacity-60">Reload Records</button>
                        </div>
                      }>
                        <ZodiacWheel 
                          planets={analysis.chartData.planets}
                          ascendantDegree={analysis.chartData.ascendant}
                          onPlanetClick={handlePlanetClick}
                        />
                      </ErrorBoundary>
                    </div>

                    <AnimatePresence>
                      {selectedPlanet && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="w-full max-w-2xl mx-auto p-8 border border-archive-accent bg-white shadow-xl relative rounded-archive"
                        >
                          <button 
                            onClick={() => setSelectedPlanet(null)}
                            className="absolute top-4 right-4 text-[10px] font-mono opacity-40 hover:opacity-100"
                          >
                            CLOSE [X]
                          </button>
                          
                          <div className="space-y-6">
                            <div className="flex items-center gap-4 border-b border-archive-line pb-4">
                              <div className="w-12 h-12 rounded-full border border-archive-accent flex items-center justify-center text-2xl text-archive-accent">
                                {selectedPlanet.name === 'Sun' ? '☉' : 
                                 selectedPlanet.name === 'Moon' ? '☽' : 
                                 selectedPlanet.name === 'Mercury' ? '☿' : 
                                 selectedPlanet.name === 'Venus' ? '♀' : 
                                 selectedPlanet.name === 'Mars' ? '♂' : 
                                 selectedPlanet.name === 'Jupiter' ? '♃' : 
                                 selectedPlanet.name === 'Saturn' ? '♄' : '○'}
                              </div>
                              <div>
                                <h4 className="text-2xl font-serif italic">{selectedPlanet.name} Interpretation</h4>
                                <p className="text-[10px] font-mono uppercase opacity-40">
                                  {Math.floor(selectedPlanet.degree / 30 * 30 % 30)}° {["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"][Math.floor(selectedPlanet.degree / 30)]} • House {Math.floor(((selectedPlanet.degree - (analysis?.chartData?.ascendant || 0) + 360) % 360) / 30) + 1}
                                </p>
                              </div>
                            </div>

                            <div className="min-h-[80px] flex flex-col justify-center">
                              {interpreting ? (
                                <div className="flex items-center gap-3 handwritten text-lg opacity-40 animate-pulse">
                                  <Sparkles className="w-5 h-5" /> Decoding the resonance...
                                </div>
                              ) : interpretation ? (
                                <div className="space-y-4">
                                  <div className="handwritten text-lg md:text-xl text-archive-ink leading-relaxed italic">
                                    <WritingEffect text={interpretation} />
                                  </div>
                                  <div className="flex justify-end">
                                    <ReadAloudButton text={interpretation} className="!py-1 !px-3 !text-[10px]" />
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <h3 className="col-header border-b border-archive-line pb-2">Core Traits</h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.traits?.map((trait: string) => (
                        <span key={trait} className="px-3 py-1 border border-archive-line text-[10px] font-mono uppercase tracking-widest bg-white rounded-archive">
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-archive-line pb-2">
                      <h3 className="col-header border-none pb-0">Synthesis</h3>
                      <ReadAloudButton text={analysis.summary} className="!p-1 !h-auto !w-auto !bg-transparent !border-none !shadow-none opacity-20 hover:opacity-100" />
                    </div>
                    <div className="font-serif italic text-lg leading-relaxed opacity-80 markdown-body">
                      <Markdown>{analysis.summary}</Markdown>
                    </div>
                  </div>
                </div>

                <ResultSection
                  id="birth-chart-content"
                  title="Final Synthesis"
                  content={analysis.summary}
                  exportName={`birth-chart-${profile.birthday}`}
                  onClose={() => setAnalysis(null)}
                />
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center py-40 opacity-[0.03] select-none pointer-events-none"
              >
                <RefreshCw size={160} />
                <p className="handwritten text-4xl uppercase tracking-[0.4em] mt-8">Awaiting Configuration</p>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </ToolLayout>
  );
};
