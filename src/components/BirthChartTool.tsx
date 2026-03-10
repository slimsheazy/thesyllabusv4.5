import React, { useState, useEffect, useMemo } from 'react';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Calendar, Clock, Sparkles, RefreshCw, Share2, Download, Loader2, AlertCircle, FileText, Image as ImageIcon } from 'lucide-react';
import { useSyllabusStore } from '../store';
import { useHaptics } from '../hooks/useHaptics';
import { analyzeBirthChart } from '../services/astrologyService';
import { geminiService } from '../services/geminiService';
import { generateBirthChartKey } from '../utils/hashUtils';
import { ZodiacWheel } from './ZodiacWheel';
import { ErrorBoundary } from './ErrorBoundary';
import { Tooltip } from './Tooltip';
import { WritingEffect } from './WritingEffect';
import { ReadAloudButton } from './ReadAloudButton';
import { exportAsImage, exportAsPDF } from '../utils/exportUtils';
import { BirthChartAnalysis, BirthChartPlanet } from '../types';

interface BirthChartToolProps {
  onBack: () => void;
}

interface SubjectData {
  birthday: string;
  birthTime: string;
  timezone: string;
  location: { name: string } | null;
  isMe: boolean;
}

export const BirthChartTool: React.FC<BirthChartToolProps> = ({ onBack }) => {
  const { 
    userBirthday, userBirthTime, userBirthTimezone, userLocation, 
    recordCalculation, birthChartCache, setBirthChartCache 
  } = useSyllabusStore();
  const { triggerClick, triggerSuccess } = useHaptics();
  
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<BirthChartAnalysis | null>(null);
  const [selectedPlanet, setSelectedPlanet] = useState<BirthChartPlanet | null>(null);
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const [interpreting, setInterpreting] = useState(false);
  
  // Local state for the subject being analyzed
  const [subject, setSubject] = useState<SubjectData>({
    birthday: userBirthday || '',
    birthTime: userBirthTime || '12:00',
    timezone: userBirthTimezone || 'UTC',
    location: userLocation ? { name: userLocation.name } : null,
    isMe: true
  });

  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (subject.isMe) {
      setSubject({
        birthday: userBirthday || '',
        birthTime: userBirthTime || '12:00',
        timezone: userBirthTimezone || 'UTC',
        location: userLocation ? { name: userLocation.name } : null,
        isMe: true
      });
    }
  }, [userBirthday, userBirthTime, userBirthTimezone, userLocation, subject.isMe]);

  const cacheKey = useMemo(() => 
    generateBirthChartKey(
      subject.birthday, 
      subject.birthTime, 
      subject.location?.name || 'Unknown', 
      subject.timezone
    ), 
    [subject.birthday, subject.birthTime, subject.location?.name, subject.timezone]
  );

  useEffect(() => {
    const cached = birthChartCache[cacheKey];
    if (cached && cached.sunSign !== "Unknown" && cached.moonSign !== "Unknown" && cached.risingSign !== "Unknown") {
      setAnalysis(cached as BirthChartAnalysis);
    } else {
      setAnalysis(null);
      // Auto-run for "Me" if data exists
      if (subject.isMe && subject.birthday && subject.birthTime && subject.location) {
        handleAnalyze();
      }
    }
  }, [cacheKey, birthChartCache]);

  const handleResetToMe = () => {
    triggerClick();
    setSubject({
      birthday: userBirthday || '',
      birthTime: userBirthTime || '12:00',
      timezone: userBirthTimezone || 'UTC',
      location: userLocation ? { name: userLocation.name } : null,
      isMe: true
    });
    setIsEditing(false);
  };

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

  const handleShare = async () => {
    triggerClick();
    if (!analysis) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Birth Chart',
          text: `My Sun is in ${analysis.sunSign}, Moon in ${analysis.moonSign}, and Ascendant in ${analysis.risingSign}.`,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleDownload = () => {
    triggerClick();
    if (!analysis) return;
    const content = `Birth Chart Analysis\nSun: ${analysis.sunSign}\nMoon: ${analysis.moonSign}\nRising: ${analysis.risingSign}\n\nSummary: ${analysis.summary}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `birth-chart-${userBirthday}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAnalyze = async () => {
    triggerClick();
    if (!subject.birthday || !subject.birthTime) return;
    
    // Check cache first
    if (birthChartCache[cacheKey]) {
      setAnalysis(birthChartCache[cacheKey]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await analyzeBirthChart({
        date: subject.birthday,
        time: subject.birthTime,
        location: subject.location?.name || "Unknown",
        timezone: subject.timezone
      });
      setAnalysis(result);
      setBirthChartCache(cacheKey, result);
      recordCalculation();
      triggerSuccess();
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setError("The archive is currently experiencing high resonance interference. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-archive-bg">
      <header className="border-b border-archive-line p-6 flex items-center justify-between bg-archive-bg">
        <div className="flex items-center gap-8">
          <button onClick={onBack} className="text-xs font-mono opacity-40 hover:opacity-100 transition-opacity">← BACK</button>
          <div className="flex items-center">
            <h1 className="font-serif italic text-2xl tracking-tight">The Birth Map</h1>
            <Tooltip 
              title="What is a Birth Chart?" 
              content="A map of the sky at the exact moment of your birth, revealing your unique cosmic blueprint." 
            />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-4xl mx-auto">
          {!analysis || isEditing ? (
            <div className="space-y-12 py-12">
              <div className="text-center space-y-4">
                <h2 className="text-5xl font-serif italic">
                  {subject.isMe ? "Your Personal Chart" : "Subject Analysis"}
                </h2>
                <p className="handwritten text-xl opacity-60">
                  {subject.isMe 
                    ? "Review the planetary positions at the time of your birth."
                    : "Analyzing the data for the selected subject."}
                </p>
              </div>

              <div className="max-w-2xl mx-auto bg-white border border-archive-line p-8 shadow-xl space-y-8">
                <div className="flex justify-between items-center border-b border-archive-line pb-4">
                  <span className="text-[10px] font-mono uppercase opacity-40 tracking-widest">Subject Selection</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleResetToMe}
                      className={`px-3 py-1 text-[10px] font-mono uppercase border transition-all ${subject.isMe ? 'bg-archive-ink text-archive-bg border-archive-ink' : 'border-archive-line opacity-40'}`}
                    >
                      Me
                    </button>
                    <button 
                      onClick={() => setSubject(s => ({ ...s, isMe: false }))}
                      className={`px-3 py-1 text-[10px] font-mono uppercase border transition-all ${!subject.isMe ? 'bg-archive-ink text-archive-bg border-archive-ink' : 'border-archive-line opacity-40'}`}
                    >
                      Someone Else
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase opacity-40 tracking-widest flex items-center gap-2">
                      <Calendar size={12} /> Birth Date
                    </label>
                    <input 
                      type="date" 
                      className="w-full bg-archive-bg p-3 border border-archive-line text-lg italic outline-none focus:border-archive-accent" 
                      value={subject.birthday} 
                      onChange={(e) => setSubject(s => ({ ...s, birthday: e.target.value, isMe: false }))} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase opacity-40 tracking-widest flex items-center gap-2">
                      <Clock size={12} /> Birth Time
                    </label>
                    <input 
                      type="time" 
                      className="w-full bg-archive-bg p-3 border border-archive-line text-lg italic outline-none focus:border-archive-accent" 
                      value={subject.birthTime} 
                      onChange={(e) => setSubject(s => ({ ...s, birthTime: e.target.value, isMe: false }))} 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase opacity-40 tracking-widest flex items-center gap-2">
                    <MapPin size={12} /> Birth Location
                  </label>
                  <input 
                    type="text" 
                    placeholder="City, Country"
                    className="w-full bg-archive-bg p-3 border border-archive-line text-lg italic outline-none focus:border-archive-accent" 
                    value={subject.location?.name || ""} 
                    onChange={(e) => setSubject(s => ({ ...s, location: { ...s.location, name: e.target.value }, isMe: false }))} 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase opacity-40 tracking-widest">IANA Timezone</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      className="flex-1 bg-archive-bg p-3 border border-archive-line text-lg italic outline-none focus:border-archive-accent" 
                      value={subject.timezone} 
                      onChange={(e) => setSubject(s => ({ ...s, timezone: e.target.value, isMe: false }))} 
                      placeholder="UTC"
                    />
                    <button 
                      onClick={() => setSubject(s => ({ ...s, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, isMe: false }))}
                      className="px-3 border border-archive-line text-[9px] font-mono uppercase hover:bg-archive-ink hover:text-white transition-colors"
                    >
                      Detect
                    </button>
                  </div>
                </div>

                <button 
                  onClick={handleAnalyze}
                  disabled={loading || !subject.birthday}
                  className="brutalist-button w-full py-5 text-xl flex items-center justify-center gap-3"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
                  {loading ? 'CALCULATING...' : 'GENERATE CHART'}
                </button>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-lg flex items-center gap-3 text-red-600 text-sm italic">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}
                
                {analysis && isEditing && (
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="w-full text-[10px] font-mono uppercase opacity-40 hover:opacity-100"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </div>
          ) : (
            <AnimatePresence>
              {analysis && (
                <motion.div 
                  id="birth-chart-content"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-12 pb-24 bg-archive-bg p-8 rounded-xl"
                >
                  <div className="flex justify-between items-center border-b border-archive-line pb-4">
                    <div className="flex items-center gap-4">
                      <div className={`px-3 py-1 text-[10px] font-mono uppercase border ${subject.isMe ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                        {subject.isMe ? "Personal Map" : "External Map"}
                      </div>
                      <span className="text-sm italic opacity-60">{subject.location?.name} • {subject.birthday}</span>
                    </div>
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="text-[10px] font-mono uppercase opacity-40 hover:opacity-100 underline"
                    >
                      Change Subject
                    </button>
                  </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    { label: 'Sun Sign', value: analysis.sunSign, symbol: '☉' },
                    { label: 'Moon Sign', value: analysis.moonSign, symbol: '☽' },
                    { label: 'Rising Sign', value: analysis.risingSign, symbol: 'ASC' },
                  ].map((item) => (
                    <div key={item.label} className="p-8 border border-archive-line bg-white shadow-sm text-center relative overflow-hidden group">
                      <span className="absolute -right-4 -bottom-4 text-8xl opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">{item.symbol}</span>
                      <p className="col-header mb-2">{item.label}</p>
                      <p className="text-3xl font-serif italic">{item.value}</p>
                    </div>
                  ))}
                </div>

                {analysis.chartData && (
                  <div className="flex flex-col items-center gap-8 py-12 border-y border-archive-line bg-white/30">
                    <h3 className="col-header">Celestial Configuration</h3>
                    <div className="w-full max-w-lg">
                      <ErrorBoundary fallback={
                        <div className="p-12 border border-dashed border-archive-line text-center space-y-4">
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
                          className="w-full max-w-2xl p-8 marker-border border-archive-accent bg-white shadow-2xl relative"
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
                                  {Math.floor(selectedPlanet.degree / 30 * 30 % 30)}° {["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"][Math.floor(selectedPlanet.degree / 30)]} • House {Math.floor(((selectedPlanet.degree - (analysis?.chartData?.ascendant || 0) + 360) % 360) / 30) + 1}
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
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <h3 className="col-header border-b border-archive-line pb-2">Core Traits</h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.traits?.map((trait: string) => (
                        <span key={trait} className="px-3 py-1 border border-archive-line text-[10px] font-mono uppercase tracking-widest bg-white">
                          {trait}
                        </span>
                      ))}
                      {!analysis.traits && <p className="text-xs italic opacity-40">No traits analyzed.</p>}
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-archive-line pb-2">
                      <h3 className="col-header">Synthesis</h3>
                      <ReadAloudButton text={analysis.summary} className="!p-1 !h-auto !w-auto !bg-transparent !border-none !shadow-none opacity-20 hover:opacity-100" />
                    </div>
                    <div className="font-serif italic text-xl leading-relaxed opacity-80 markdown-body">
                      <Markdown>{analysis.summary}</Markdown>
                    </div>
                  </div>
                </div>

                <div className="pt-12 border-t border-archive-line flex flex-wrap justify-center gap-8">
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40 hover:opacity-100 flex items-center gap-2"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Recalibrate / Change Subject
                  </button>
                  <button 
                    onClick={handleShare}
                    className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40 hover:opacity-100 flex items-center gap-2"
                  >
                    <Share2 className="w-3 h-3" />
                    Share Results
                  </button>
                  <button 
                    onClick={handleDownload}
                    className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40 hover:opacity-100 flex items-center gap-2"
                  >
                    <Download className="w-3 h-3" />
                    Download Analysis
                  </button>
                  <button 
                    onClick={() => exportAsPDF('birth-chart-content', `birth-chart-${subject.birthday}`)}
                    className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40 hover:opacity-100 flex items-center gap-2"
                  >
                    <FileText className="w-3 h-3" />
                    Export PDF
                  </button>
                  <button 
                    onClick={() => exportAsImage('birth-chart-content', `birth-chart-${subject.birthday}`)}
                    className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40 hover:opacity-100 flex items-center gap-2"
                  >
                    <ImageIcon className="w-3 h-3" />
                    Export Image
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  </div>
);
};
