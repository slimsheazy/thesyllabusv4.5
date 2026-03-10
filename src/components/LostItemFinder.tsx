import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Sparkles, RefreshCw, Info, FileText, Image as ImageIcon, Volume2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { useSyllabusStore } from '../store';
import { useHaptics } from '../hooks/useHaptics';
import { getPlanetaryPositions, getHouseCusps, getSign, getRuler } from '../services/astroCoreService';
import { ZodiacWheel } from './ZodiacWheel';
import { ReadAloudButton } from './ReadAloudButton';
import { exportAsImage, exportAsPDF } from '../utils/exportUtils';

interface LostItemFinderProps {
  onBack: () => void;
}

export const LostItemFinder: React.FC<LostItemFinderProps> = ({ onBack }) => {
  const { recordCalculation, userLocation } = useSyllabusStore();
  const { triggerClick, triggerSuccess } = useHaptics();
  const [location, setLocation] = useState({
    lat: userLocation?.lat || 51.5074,
    lng: userLocation?.lng || -0.1278,
    name: userLocation?.name || 'London, UK',
    isMe: true
  });
  const [item, setItem] = useState('');
  const [seedNumber, setSeedNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [horaryDetails, setHoraryDetails] = useState<{ significator: string; house: number; sign: string } | null>(null);
  const [numerologyNumber, setNumerologyNumber] = useState<number | null>(null);
  const [chartData, setChartData] = useState<{ planets: any[]; ascendant: number } | null>(null);
  const [checklist, setChecklist] = useState<{ text: string; checked: boolean }[]>([]);

  const handleResetToMe = () => {
    triggerClick();
    setLocation({
      lat: userLocation?.lat || 51.5074,
      lng: userLocation?.lng || -0.1278,
      name: userLocation?.name || 'London, UK',
      isMe: true
    });
  };

  const getHouse = (longitude: number, cusps: number[]) => {
    for (let i = 0; i < 11; i++) {
      if (cusps[i] < cusps[i + 1]) {
        if (longitude >= cusps[i] && longitude < cusps[i + 1]) return i + 1;
      } else {
        // Handle wrap around 360
        if (longitude >= cusps[i] || longitude < cusps[i + 1]) return i + 1;
      }
    }
    return 12;
  };

  const toggleChecklist = (index: number) => {
    setChecklist(prev => prev.map((item, i) => i === index ? { ...item, checked: !item.checked } : item));
  };

  const handleFind = () => {
    triggerClick();
    if (!item) return;
    setLoading(true);
    
    const lat = location.lat;
    const lng = location.lng;
    const now = new Date();

    const runCalculation = async () => {
      try {
        const planets = await getPlanetaryPositions(now, lat, lng);
        const cusps = await getHouseCusps(now, lat, lng);
        
        setChartData({
          planets: planets.map((p: any) => ({ name: p.name, degree: p.longitude })),
          ascendant: cusps[0]
        });

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

        // Numerology: Lost Item Number (1-81)
        // If seed provided, use it. Otherwise use item name + timestamp
        let num: number;
        if (seedNumber && !isNaN(parseInt(seedNumber))) {
          num = (parseInt(seedNumber) % 81) || 81;
        } else {
          const hash = Math.abs(item.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + now.getTime());
          num = (hash % 81) || 81;
        }
        setNumerologyNumber(num);

        // Synthesis via Gemini
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const prompt = `You are an expert in Horary Astrology and Lost Item Numerology.
        A seeker has lost their "${item}".
        
        ASTROLOGICAL DATA:
        - Significator: ${significatorName}
        - House: ${significatorHouse} (${getHouseMeaning(significatorHouse)})
        - Sign: ${significatorSign} (${getSignMeaning(significatorSign)})
        
        NUMEROLOGICAL DATA:
        - Lost Item Number: ${num} (A traditional number from 1-81 used in divination for lost objects).
        
        TASK:
        1. Synthesize these two systems into a cohesive, practical, and slightly cryptic "Archive/Syllabus" style reading.
        2. Provide a single paragraph (approx 60 words) describing the location.
        3. Provide a list of 5 specific, interactive search checklist items based on the combined data.
        
        Format your response as JSON:
        {
          "interpretation": "...",
          "checklist": ["...", "...", "...", "...", "..."]
        }`;

        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: prompt,
          config: { responseMimeType: "application/json" }
        });

        const data = JSON.parse(response.text || "{}");
        setSuggestion(data.interpretation || "The archive is hazy. Look where you last felt peace.");
        setChecklist((data.checklist || []).map((t: string) => ({ text: t, checked: false })));
        
        recordCalculation();
        triggerSuccess();
      } catch (error) {
        console.error("Error finding item:", error);
        setSuggestion("The cosmic signal is weak. Try again in a moment.");
      } finally {
        setLoading(false);
      }
    };

    runCalculation();
  };

  const getHouseMeaning = (house: number) => {
    const meanings: Record<number, string> = {
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
    return meanings[house] || "The house position indicates the general area of the search.";
  };

  const getSignMeaning = (sign: string) => {
    const meanings: Record<string, string> = {
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
    return meanings[sign] || "The sign indicates the elemental nature of the hiding spot.";
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-archive-bg">
      <header className="border-b border-archive-line p-6 flex items-center justify-between bg-archive-bg">
        <div className="flex items-center gap-8">
          <button onClick={onBack} className="text-xs font-mono opacity-40 hover:opacity-100 transition-opacity">← BACK</button>
          <h1 className="font-serif italic text-2xl tracking-tight">Lost Item Finder</h1>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-12 text-center py-12">
            <div className="space-y-4">
              <h2 className="text-5xl font-serif italic">Where is it?</h2>
              <p className="handwritten text-xl opacity-60">Use the archive's intuition to locate what has been misplaced.</p>
            </div>

            <div className="max-w-2xl mx-auto space-y-8">
              <div className="p-6 bg-white border border-archive-line shadow-sm space-y-4 text-left">
                <div className="flex justify-between items-center border-b border-archive-line pb-4">
                  <span className="text-[10px] font-mono uppercase opacity-40 tracking-widest">Search Location</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleResetToMe}
                      className={`px-3 py-1 text-[10px] font-mono uppercase border transition-all ${location.isMe ? 'bg-archive-ink text-archive-bg border-archive-ink' : 'border-archive-line opacity-40'}`}
                    >
                      My Location
                    </button>
                    <button 
                      onClick={() => setLocation(l => ({ ...l, isMe: false }))}
                      className={`px-3 py-1 text-[10px] font-mono uppercase border transition-all ${!location.isMe ? 'bg-archive-ink text-archive-bg border-archive-ink' : 'border-archive-line opacity-40'}`}
                    >
                      Other
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="opacity-40" />
                  <input 
                    type="text" 
                    value={location.name}
                    onChange={(e) => setLocation(l => ({ ...l, name: e.target.value, isMe: false }))}
                    className="flex-1 bg-archive-bg p-2 border border-archive-line text-xs font-mono outline-none focus:border-archive-accent"
                    placeholder="City, Country"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40" />
                  <input 
                    type="text" 
                    placeholder="What are you looking for?" 
                    value={item}
                    onChange={(e) => setItem(e.target.value)}
                    className="w-full bg-white border border-archive-line p-6 pl-12 font-serif italic text-xl outline-none focus:border-archive-accent shadow-sm"
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-mono opacity-40">SEED #</span>
                  <input 
                    type="number" 
                    placeholder="Optional (1-99)" 
                    value={seedNumber}
                    onChange={(e) => setSeedNumber(e.target.value)}
                    className="w-full bg-white border border-archive-line p-6 pl-16 font-mono text-xl outline-none focus:border-archive-accent shadow-sm"
                  />
                </div>
              </div>

              <button 
                onClick={handleFind}
                disabled={loading || !item}
                className="brutalist-button w-full py-5 text-xl"
              >
                {loading ? 'CONSULTING THE ARCHIVE...' : 'FIND MY ITEM'}
              </button>
            </div>

            <AnimatePresence>
              {suggestion && (
                <motion.div 
                  id="lost-item-finder-content"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="max-w-2xl mx-auto p-12 border border-archive-line bg-white shadow-xl relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none text-8xl font-sans">☊</div>
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-6 justify-center">
                      <div className="flex items-center gap-2">
                        <MapPin className="text-archive-accent w-4 h-4" />
                        <span className="data-value text-archive-accent uppercase tracking-widest text-[10px]">Astro-Horary</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Sparkles className="text-archive-accent w-4 h-4" />
                        <span className="data-value text-archive-accent uppercase tracking-widest text-[10px]">Numerological</span>
                      </div>
                    </div>
                    <ReadAloudButton text={suggestion} className="!p-1 !h-auto !w-auto !bg-transparent !border-none !shadow-none opacity-20 hover:opacity-100" />
                  </div>
                  
                  <p className="font-serif italic text-2xl leading-relaxed text-archive-ink mb-8">
                    "{suggestion}"
                  </p>
                  
                  {chartData && (
                    <div className="flex justify-center py-8">
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
                          <span className="data-value text-xs">{horaryDetails.significator}</span>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-archive-ink text-archive-bg text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                            The planet representing the lost item in this horary chart.
                          </div>
                        </div>
                        <div className="text-center border-x border-archive-line group relative">
                          <span className="col-header block mb-1">House</span>
                          <span className="data-value text-xs">{horaryDetails.house}</span>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-archive-ink text-archive-bg text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                            {getHouseMeaning(horaryDetails.house)}
                          </div>
                        </div>
                        <div className="text-center group relative">
                          <span className="col-header block mb-1">Lost #</span>
                          <span className="data-value text-xs">{numerologyNumber}</span>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-archive-ink text-archive-bg text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                            The Lost Item Number (1-81) derived from the seeker's vibration.
                          </div>
                        </div>
                      </div>

                      <div className="text-left space-y-4">
                        <h4 className="text-xs font-mono uppercase tracking-widest opacity-40">Interactive Search Checklist</h4>
                        <div className="grid grid-cols-1 gap-2">
                          {checklist.map((item, i) => (
                            <button 
                              key={i} 
                              onClick={() => toggleChecklist(i)}
                              className={`flex items-start gap-3 p-3 border transition-all text-left ${item.checked ? 'bg-archive-line/20 border-archive-line opacity-40' : 'bg-white border-archive-line hover:border-archive-ink'}`}
                            >
                              <div className={`w-4 h-4 border border-archive-ink flex-shrink-0 mt-0.5 flex items-center justify-center ${item.checked ? 'bg-archive-ink' : ''}`}>
                                {item.checked && <div className="w-2 h-2 bg-white rounded-full" />}
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

                  <div className="mt-8 pt-8 border-t border-archive-line flex flex-wrap justify-center gap-8">
                    <button 
                      onClick={() => exportAsPDF('lost-item-finder-content', `lost-item-${item}`)}
                      className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40 hover:opacity-100 flex items-center gap-2"
                    >
                      <FileText className="w-3 h-3" />
                      Export PDF
                    </button>
                    <button 
                      onClick={() => exportAsImage('lost-item-finder-content', `lost-item-${item}`)}
                      className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40 hover:opacity-100 flex items-center gap-2"
                    >
                      <ImageIcon className="w-3 h-3" />
                      Export Image
                    </button>
                    <button 
                      onClick={() => setSuggestion(null)}
                      className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40 hover:opacity-100 flex items-center gap-2"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Try another search
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
