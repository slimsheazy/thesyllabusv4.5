import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSyllabusStore } from '../../store';
import { useHaptics } from '../../hooks/useHaptics';
import { useLocation } from '../../hooks/useLocation';
import { geminiService } from '../../services/geminiService';
import { WritingEffect } from '../shared/WritingEffect';
import { ReadAloudButton } from '../shared/ReadAloudButton';
import { ZodiacWheel } from '../shared/ZodiacWheel';
import { MapPin, Loader2, Sparkles, History, Trash2 } from 'lucide-react';
import { ToolLayout } from '../shared/ToolLayout';
import { ResultSection } from '../shared/ResultSection';
import { HoraryAnalysis, BirthChartPlanet } from '../../types';

interface HoraryToolProps {
  onBack: () => void;
}

const SIGN_NAMES = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];

const PLANET_SYMBOLS: Record<string, string> = {
  'Sun': '☉',
  'Moon': '☽',
  'Mercury': '☿',
  'Venus': '♀',
  'Mars': '♂',
  'Jupiter': '♃',
  'Saturn': '♄'
};

export const HoraryTool: React.FC<HoraryToolProps> = ({ onBack }) => {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HoraryAnalysis | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedPlanet, setSelectedPlanet] = useState<BirthChartPlanet | null>(null);
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const [interpreting, setInterpreting] = useState(false);
  const { recordCalculation, userLocation, horaryHistory, addHoraryEntry, removeHoraryEntry } = useSyllabusStore();
  const { triggerClick, triggerSuccess } = useHaptics();
  const { detectLocation, isDetecting } = useLocation();

  const handlePlanetClick = async (planet: BirthChartPlanet) => {
    triggerClick();
    setSelectedPlanet(planet);
    setInterpretation(null);
    setInterpreting(true);

    const sign = SIGN_NAMES[Math.floor(planet.degree / 30)];
    const house = Math.floor(((planet.degree - (result?.chartData?.ascendant || 0) + 360) % 360) / 30) + 1;

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

  const getAnswer = async () => {
    triggerClick();
    if (!question.trim() || !userLocation) return;
    setLoading(true);
    setResult(null);
    try {
      const analysis = await geminiService.getHoraryAnalysis(question, userLocation.lat, userLocation.lng);
      if (analysis) {
        setResult(analysis);
        addHoraryEntry({
          question,
          outcome: analysis.outcome,
          judgment: analysis.judgment,
          technicalNotes: analysis.technicalNotes,
          location: userLocation.name || `${userLocation.lat.toFixed(2)}N, ${userLocation.lng.toFixed(2)}E`,
          chartData: analysis.chartData
        });
        recordCalculation();
        triggerSuccess();
      }
    } catch (error) {
      alert("Lost the signal. Give it a second.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout
      title="Horary Analysis"
      subtitle="The stars as they stand at this moment"
      onBack={onBack}
      tooltipTitle="What is Horary?"
      tooltipContent="A method of answering specific questions based on the moment they are asked."
      headerRight={
        <button 
          onClick={() => setShowHistory(!showHistory)} 
          className="flex items-center gap-2 text-[10px] font-mono uppercase opacity-40 hover:opacity-100 transition-opacity"
        >
          <History size={14} />
          {showHistory ? "Back to Tool" : "History"}
        </button>
      }
    >
      {showHistory ? (
        <div className="w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 gap-8">
            {horaryHistory.length === 0 ? (
              <div className="text-center py-20 opacity-20 italic font-serif text-2xl">No past inquiries found.</div>
            ) : (
              horaryHistory.map((entry) => (
                <div key={entry.id} className="marker-border bg-white p-8 shadow-xl relative group">
                  <button 
                    onClick={() => removeHoraryEntry(entry.id)}
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-40 hover:!opacity-100 transition-opacity text-archive-accent"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className="flex justify-between items-start mb-6 border-b border-archive-line pb-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-mono uppercase opacity-40">{new Date(entry.date).toLocaleString()}</p>
                      <h4 className="font-serif italic text-2xl text-archive-ink">"{entry.question}"</h4>
                    </div>
                    <span className="handwritten text-[10px] uppercase text-archive-accent bg-archive-accent/5 px-3 py-1 rounded-full border border-archive-accent/10">
                      {entry.outcome}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <p className="handwritten text-lg italic text-archive-ink leading-relaxed">
                        {entry.judgment}
                      </p>
                      <div className="p-4 bg-archive-ink/[0.02] rounded-lg">
                        <p className="text-[12px] handwritten opacity-60 italic">{entry.technicalNotes}</p>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <ZodiacWheel 
                        size={250}
                        planets={entry.chartData.planets}
                        ascendantDegree={entry.chartData.ascendant}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="w-full flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
          <aside className="w-full lg:w-[400px] space-y-8 lg:sticky lg:top-20">
            <div className="archive-card p-6 animate-in fade-in slide-in-from-left-4 duration-300">
              <div className="archive-form-group">
                <label className="archive-label">Your Inquiry</label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask a specific question..."
                  className="archive-input min-h-[120px] resize-none"
                />
              </div>

              <div className="archive-form-group mt-6">
                <label className="archive-label">Location Context</label>
                <button
                  onClick={detectLocation}
                  disabled={isDetecting}
                  className={`w-full p-4 border rounded-archive-lg flex items-center justify-center gap-3 transition-all ${userLocation ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-archive-bg border-archive-line hover:bg-archive-line/10"}`}
                >
                  {isDetecting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : userLocation ? (
                    <span className="flex items-center gap-2 font-mono text-[10px] uppercase">
                      <MapPin size={14} /> {userLocation.name || `${userLocation.lat.toFixed(2)}N, ${userLocation.lng.toFixed(2)}E`}
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono uppercase">Detect Location</span>
                  )}
                </button>
              </div>

              <button
                onClick={getAnswer}
                disabled={loading || !question || !userLocation}
                className={`brutalist-button w-full py-5 text-xl mt-8 transition-all ${!userLocation || !question ? "opacity-30" : ""}`}
              >
                {loading ? "CONSULTING..." : "GET VERDICT"}
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
                    Decoding the celestial alignment...
                  </span>
                </motion.div>
              ) : result ? (
                <motion.div 
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-12"
                >
                  <div className="space-y-8">
                    <div className="flex justify-between items-end border-b border-archive-line pb-4">
                      <h3 className="col-header">The Verdict</h3>
                      <span className="handwritten text-[10px] uppercase text-archive-accent bg-archive-accent/5 px-3 py-1 rounded-full border border-archive-accent/10">
                        Outlook: {result.outcome}
                      </span>
                    </div>
                    
                    <div className="archive-card p-8 md:p-10 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-[0.02] select-none pointer-events-none text-8xl italic">REPLY</div>
                      <div className="handwritten text-xl md:text-2xl text-archive-ink leading-relaxed italic font-medium">
                        "<WritingEffect text={result.judgment} />"
                      </div>
                      <div className="mt-8 flex justify-end">
                        <ReadAloudButton text={result.judgment} className="!py-1 !px-3 !text-[10px]" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <h3 className="col-header border-b border-archive-line pb-2">Celestial Configuration</h3>
                    <div className="w-full max-w-lg mx-auto">
                      <ZodiacWheel 
                        planets={result.chartData.planets.map((p: any) => ({
                          name: p.name,
                          degree: p.degree,
                          sign: SIGN_NAMES[Math.floor(p.degree / 30)]
                        }))} 
                        ascendantDegree={result.chartData.ascendant} 
                        onPlanetClick={handlePlanetClick}
                      />
                    </div>

                    <AnimatePresence>
                      {selectedPlanet && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="w-full max-w-2xl mx-auto p-8 border border-archive-accent bg-white shadow-xl relative rounded-archive-lg"
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
                                {PLANET_SYMBOLS[selectedPlanet.name] || '○'}
                              </div>
                              <div>
                                <h4 className="text-2xl font-serif italic">{selectedPlanet.name} Interpretation</h4>
                                <p className="text-[10px] font-mono uppercase opacity-40">
                                  {Math.floor(selectedPlanet.degree % 30)}° {SIGN_NAMES[Math.floor(selectedPlanet.degree / 30)]} • House {Math.floor(((selectedPlanet.degree - (result?.chartData?.ascendant || 0) + 360) % 360) / 30) + 1}
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

                  <ResultSection
                    id="horary-result-content"
                    title="Underlying Resonance"
                    content={result.technicalNotes}
                    exportName={`horary-${new Date().toISOString().split('T')[0]}`}
                    onClose={() => setResult(null)}
                  />
                </motion.div>
              ) : (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center py-40 opacity-[0.03] select-none pointer-events-none"
                >
                  <History size={160} />
                  <p className="handwritten text-4xl uppercase tracking-[0.4em] mt-8">Awaiting Inquiry</p>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      )}
    </ToolLayout>
  );
};
