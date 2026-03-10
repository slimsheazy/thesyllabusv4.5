import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSyllabusStore } from '../store';
import { useHaptics } from '../hooks/useHaptics';
import { geminiService } from '../services/geminiService';
import { WritingEffect } from '../components/WritingEffect';
import { ReadAloudButton } from '../components/ReadAloudButton';
import { ZodiacWheel } from '../components/ZodiacWheel';
import { ChevronLeft, MapPin, Loader2, Sparkles, FileText, Image as ImageIcon } from 'lucide-react';
import { Tooltip } from './Tooltip';
import { exportAsImage, exportAsPDF } from '../utils/exportUtils';
import { HoraryAnalysis, BirthChartPlanet } from '../types';

interface HoraryToolProps {
  onBack: () => void;
}

export const HoraryTool: React.FC<HoraryToolProps> = ({ onBack }) => {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [result, setResult] = useState<HoraryAnalysis | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedPlanet, setSelectedPlanet] = useState<BirthChartPlanet | null>(null);
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const [interpreting, setInterpreting] = useState(false);
  const { recordCalculation, userLocation, setUserLocation, horaryHistory, addHoraryEntry, removeHoraryEntry } = useSyllabusStore();
  const { triggerClick, triggerSuccess } = useHaptics();

  const handlePlanetClick = async (planet: BirthChartPlanet) => {
    triggerClick();
    setSelectedPlanet(planet);
    setInterpretation(null);
    setInterpreting(true);

    const signNames = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
    const sign = signNames[Math.floor(planet.degree / 30)];
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

  const detectLocation = () => {
    triggerClick();
    if (!navigator.geolocation) {
      alert("Can't find your location on this browser.");
      return;
    }
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, name: "Detected" });
        setDetecting(false);
      },
      () => {
        alert("Couldn't lock onto your spot.");
        setDetecting(false);
      },
      { timeout: 10000 }
    );
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
    <div className="min-h-screen flex flex-col items-center justify-start py-12 px-4 md:px-8 relative max-w-6xl mx-auto">
      <div className="fixed top-4 right-4 flex gap-2 z-50">
        <button onClick={() => setShowHistory(!showHistory)} className="brutalist-button !text-[10px] bg-surface">
          {showHistory ? "Back to Tool" : "History"}
        </button>
        <button onClick={onBack} className="brutalist-button !text-[10px] bg-surface">
          <ChevronLeft size={14} className="inline mr-1" /> Back
        </button>
      </div>

      {showHistory ? (
        <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <header className="mb-12 text-center space-y-4">
            <h2 className="heading-marker text-6xl text-marker-blue lowercase">Horary Records</h2>
            <p className="handwritten text-xl opacity-40 uppercase tracking-widest italic">Your past inquiries to the sky</p>
          </header>
          
          <div className="grid grid-cols-1 gap-8">
            {horaryHistory.length === 0 ? (
              <div className="text-center py-20 opacity-20 italic font-serif text-2xl">No past inquiries found.</div>
            ) : (
              horaryHistory.map((entry) => (
                <div key={entry.id} className="marker-border bg-white p-8 shadow-xl relative group">
                  <button 
                    onClick={() => removeHoraryEntry(entry.id)}
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-40 hover:!opacity-100 transition-opacity text-marker-red"
                  >
                    Delete
                  </button>
                  <div className="flex justify-between items-start mb-6 border-b border-marker-black/10 pb-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-mono uppercase opacity-40">{new Date(entry.date).toLocaleString()}</p>
                      <h4 className="font-serif italic text-2xl text-marker-blue">"{entry.question}"</h4>
                    </div>
                    <span className="handwritten text-[10px] uppercase text-marker-red bg-marker-red/5 px-3 py-1 rounded-full border border-marker-red/10">
                      {entry.outcome}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <p className="handwritten text-lg italic text-marker-black leading-relaxed">
                        {entry.judgment}
                      </p>
                      <div className="p-4 bg-marker-black/[0.02] rounded-lg">
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
        <div className="w-full flex flex-col lg:flex-row gap-10 lg:gap-24 items-start">
        <div className="w-full lg:w-[400px] space-y-10 lg:sticky lg:top-20">
          <header className="space-y-4">
            <div className="flex items-center">
              <h2 className="heading-marker text-5xl sm:text-7xl text-marker-blue lowercase leading-none">
                Horary Analysis
              </h2>
              <Tooltip 
                title="What is Horary?" 
                content="A method of answering specific questions based on the moment they are asked." 
              />
            </div>
            <p className="handwritten text-lg sm:text-xl text-marker-blue opacity-40 uppercase tracking-widest italic">
              Analyzing the current situation
            </p>
          </header>

          <div className="relative p-10 marker-border bg-white shadow-2xl rounded-2xl overflow-hidden">
            {/* Decorative House Ring */}
            {[...Array(12)].map((_, i) => {
              const angle = (i * 30 - 120) * Math.PI / 180;
              const x = 50 + 46 * Math.cos(angle);
              const y = 50 + 46 * Math.sin(angle);
              return (
                <div 
                  key={i} 
                  className="absolute font-mono text-[12px] opacity-10 select-none pointer-events-none"
                  style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
                >
                  {i + 1}
                </div>
              );
            })}

            {/* Annotated Symbols */}
            <div className="absolute top-4 left-10 font-serif italic text-2xl opacity-10 select-none pointer-events-none">XD</div>
            <div className="absolute top-4 right-10 text-2xl opacity-10 select-none pointer-events-none">☽</div>
            <div className="absolute top-1/2 right-4 text-2xl opacity-10 select-none pointer-events-none flex flex-col gap-6 -translate-y-1/2">
              <span>♃</span>
              <span>♄</span>
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-2xl opacity-10 select-none pointer-events-none flex gap-12">
              <span>♂</span>
              <span>X</span>
            </div>

            <div className="space-y-6 relative z-10">
              <div className="space-y-2">
                <label className="handwritten text-[10px] uppercase text-marker-black/40 tracking-widest ml-1">
                  What's on your mind?
                </label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask a specific question you need an answer to right now..."
                  className="w-full p-6 marker-border bg-surface/50 italic text-xl outline-none focus:border-marker-blue shadow-sm min-h-[140px]"
                />
              </div>

              <div className="space-y-2">
                <label className="handwritten text-[10px] uppercase text-marker-black/40 tracking-widest ml-1">
                  Pinpoint where you are
                </label>
                <button
                  onClick={detectLocation}
                  disabled={detecting}
                  className={`w-full p-4 marker-border flex items-center justify-center gap-3 transition-all ${userLocation ? "bg-marker-green/5 border-marker-green text-marker-green" : "bg-surface hover:bg-marker-black/5"}`}
                >
                  {detecting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : userLocation ? (
                    <span className="flex items-center gap-2 font-mono text-[10px] uppercase">
                      <MapPin size={14} /> Got you: {userLocation.lat.toFixed(2)}N, {userLocation.lng.toFixed(2)}E
                    </span>
                  ) : (
                    <span>Find My Spot</span>
                  )}
                </button>
              </div>

              <button
                onClick={getAnswer}
                disabled={loading || !question || !userLocation}
                className={`brutalist-button w-full !py-6 !text-2xl transition-all ${!userLocation || !question ? "opacity-30" : "!bg-marker-blue text-white shadow-xl hover:scale-[1.02]"}`}
              >
                {loading ? "Checking the sky..." : "Get the Answer"}
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 w-full min-h-[500px] pb-32">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-40 gap-10 animate-in fade-in">
              <div className="relative">
                <div className="w-20 h-20 border-2 border-marker-blue border-t-transparent animate-spin rounded-full" />
                <div className="absolute inset-0 flex items-center justify-center heading-marker text-2xl opacity-20 italic">☉</div>
              </div>
              <span className="handwritten text-xl text-marker-blue animate-pulse uppercase tracking-[0.4em]">
                Let's see what the stars say...
              </span>
            </div>
          ) : result ? (
            <div id="horary-result-content" className="animate-in fade-in duration-1000 space-y-12 bg-archive-bg p-8 rounded-xl">
              <section className="space-y-6">
                <div className="flex justify-between items-end border-b border-marker-black/10 pb-4">
                  <h3 className="heading-marker text-4xl sm:text-5xl text-marker-black lowercase">The Verdict</h3>
                  <span className="handwritten text-[10px] uppercase text-marker-red bg-marker-red/5 px-3 py-1 rounded-full border border-marker-red/10">
                    Outlook: {result.outcome}
                  </span>
                </div>
                <div className="p-8 md:p-10 marker-border border-marker-blue bg-surface shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] select-none pointer-events-none text-9xl italic">REPLY</div>
                  <div className="handwritten text-lg md:text-xl text-marker-black leading-relaxed italic font-medium">
                    "<WritingEffect text={result.judgment} />"
                  </div>
                  <div className="mt-8 flex justify-end">
                    <ReadAloudButton text={result.judgment} className="!py-1 !px-3 !text-[10px]" />
                  </div>
                </div>
              </section>

              <section className="space-y-6">
                <span className="handwritten text-[10px] uppercase text-marker-black/50 tracking-[0.4em] block border-b border-marker-black/5 pb-2 italic">
                  How it looks up there
                </span>
                <div className="w-full max-w-lg mx-auto">
                  <ZodiacWheel 
                    planets={result.chartData.planets.map((p: any) => ({
                      name: p.name,
                      degree: p.degree,
                      sign: ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"][Math.floor(p.degree / 30)]
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
                      className="w-full max-w-2xl p-8 marker-border border-archive-accent bg-white shadow-2xl relative mt-8"
                    >
                      <button 
                        onClick={() => setSelectedPlanet(null)}
                        className="absolute top-4 right-4 text-xs font-mono opacity-40 hover:opacity-100"
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
                              {Math.floor(selectedPlanet.degree / 30 * 30 % 30)}° {["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"][Math.floor(selectedPlanet.degree / 30)]} • House {Math.floor(((selectedPlanet.degree - (result?.chartData?.ascendant || 0) + 360) % 360) / 30) + 1}
                            </p>
                          </div>
                        </div>

                        <div className="min-h-[100px] flex flex-col justify-center">
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
              </section>

              <div className="grid grid-cols-1 gap-8">
                <div className="p-8 marker-border border-marker-black/5 bg-marker-black/[0.02] space-y-6">
                  <div className="flex justify-between items-center border-b border-marker-black/5 pb-2">
                    <span className="handwritten text-[10px] uppercase text-marker-black/40 tracking-widest">
                      The underlying vibes
                    </span>
                    <ReadAloudButton text={result.technicalNotes} className="!p-1 !h-auto !w-auto !bg-transparent !border-none !shadow-none opacity-20 hover:opacity-100" />
                  </div>
                  <p className="handwritten text-base md:text-lg text-marker-black/80 font-medium leading-relaxed italic">
                    {result.technicalNotes}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-8 pt-8 border-t border-marker-black/10">
                <button 
                  onClick={() => exportAsPDF('horary-result-content', `horary-${new Date().toISOString().split('T')[0]}`)}
                  className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40 hover:opacity-100 flex items-center gap-2"
                >
                  <FileText className="w-3 h-3" />
                  Export PDF
                </button>
                <button 
                  onClick={() => exportAsImage('horary-result-content', `horary-${new Date().toISOString().split('T')[0]}`)}
                  className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40 hover:opacity-100 flex items-center gap-2"
                >
                  <ImageIcon className="w-3 h-3" />
                  Export Image
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-40 opacity-[0.03] select-none pointer-events-none">
              <div className="text-[10rem] heading-marker uppercase">Wait</div>
              <p className="handwritten text-4xl uppercase tracking-[0.4em]">Need a Question First</p>
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
};
