import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Sparkles, RefreshCw, Loader2, X } from 'lucide-react';
import { SABIAN_SYMBOLS, SabianSymbol } from '../../data/sabianData';
import { SymbolCard } from './Sabian/SymbolCard';
import { geminiService } from "../../services/geminiService";
import { ToolLayout } from '../shared/ToolLayout';
import { ResultSection } from '../shared/ResultSection';
import { useProfile } from '../../hooks/useProfile';
import { useSyllabusStore } from '../../store';
import { useHaptics } from '../../hooks/useHaptics';
import { hashString } from '../../utils/hashUtils';

interface SabianSymbolsToolProps {
  onBack: () => void;
}

const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", 
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

export const SabianSymbolsTool: React.FC<SabianSymbolsToolProps> = ({ onBack }) => {
  const { 
    recordCalculation,
    interpretationCache, setInterpretationCache
  } = useSyllabusStore();
  const { profile } = useProfile();
  const { triggerClick, triggerSuccess, triggerTick } = useHaptics();
  const [search, setSearch] = useState('');
  const [selectedSign, setSelectedSign] = useState<string | 'ALL'>('ALL');
  const [selectedSymbol, setSelectedSymbol] = useState<SabianSymbol | null>(null);
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Show random symbol on load
  useEffect(() => {
    getRandomSymbol();
  }, []);

  const filteredSymbols = SABIAN_SYMBOLS.filter(s => {
    const matchesSearch = s.symbol.toLowerCase().includes(search.toLowerCase()) ||
                         s.sign.toLowerCase().includes(search.toLowerCase()) ||
                         s.degree.toString() === search;
    const matchesSign = selectedSign === 'ALL' || s.sign === selectedSign;
    return matchesSearch && matchesSign;
  });

  const getRandomSymbol = () => {
    triggerTick();
    const random = SABIAN_SYMBOLS[Math.floor(Math.random() * SABIAN_SYMBOLS.length)];
    setSelectedSymbol(random);
    setInterpretation(null);
  };

  const getPersonalSymbol = () => {
    triggerClick();
    if (!profile.birthday) {
      alert("Please set your birthday in your profile first.");
      return;
    }
    const hash = hashString(profile.birthday);
    const hashInt = parseInt(hash, 16);
    const index = Math.abs(hashInt) % SABIAN_SYMBOLS.length;
    const personal = SABIAN_SYMBOLS[index];
    setSelectedSymbol(personal);
    setInterpretation(null);
  };

  const getInterpretation = async (symbol: SabianSymbol) => {
    triggerClick();
    const cacheKey = hashString(`sabian|${symbol.sign}|${symbol.degree}`);
    if (interpretationCache[cacheKey]) {
      setInterpretation(interpretationCache[cacheKey]);
      return;
    }

    setLoading(true);
    try {
      const text = await geminiService.interpretSabianSymbol(symbol);
      setInterpretation(text || "The symbol remains silent.");
      setInterpretationCache(cacheKey, text);
      recordCalculation();
      triggerSuccess();
    } catch (error) {
      console.error("Error interpreting Sabian Symbol:", error);
      setInterpretation("The cosmic frequency is garbled. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSymbol = (symbol: SabianSymbol) => {
    triggerClick();
    setSelectedSymbol(symbol);
    setInterpretation(null);
  };

  return (
    <ToolLayout
      title="Sabian Symbols"
      onBack={onBack}
      tooltipTitle="What are Sabian Symbols?"
      tooltipContent="A set of 360 symbolic images, one for each degree of the zodiac, used to gain deeper insight into astrological placements."
      headerRight={
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
            <input 
              type="text" 
              placeholder="Search symbols..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border border-archive-line rounded-archive py-2 pl-10 pr-4 text-sm font-mono focus:outline-none focus:border-archive-ink w-64 transition-colors"
            />
          </div>
          <button 
            onClick={getPersonalSymbol}
            className="flex items-center gap-2 border border-archive-line px-4 py-2 text-sm font-mono hover:bg-archive-line transition-all rounded-archive"
          >
            <Sparkles className="w-4 h-4" />
            <span>MY SYMBOL</span>
          </button>
          
          <button 
            onClick={getRandomSymbol}
            className="flex items-center gap-2 bg-archive-ink text-archive-bg px-4 py-2 text-sm font-mono hover:opacity-90 transition-opacity rounded-archive"
          >
            <RefreshCw className="w-4 h-4" />
            <span>RANDOM ORACLE</span>
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 border-b border-archive-line">
          <button 
            onClick={() => setSelectedSign('ALL')}
            className={`px-3 py-1 text-[10px] font-mono border transition-all shrink-0 rounded-archive ${selectedSign === 'ALL' ? 'bg-archive-ink text-archive-bg border-archive-ink' : 'border-archive-line hover:border-archive-ink'}`}
          >
            ALL
          </button>
          {SIGNS.map(sign => (
            <button 
              key={sign}
              onClick={() => setSelectedSign(sign)}
              className={`px-3 py-1 text-[10px] font-mono border transition-all shrink-0 rounded-archive ${selectedSign === sign ? 'bg-archive-ink text-archive-bg border-archive-ink' : 'border-archive-line hover:border-archive-ink'}`}
            >
              {sign.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="max-w-6xl mx-auto w-full">
          <div className="mb-12">
            <h2 className="title-main text-6xl mb-2">The Oracle of Degrees</h2>
            <p className="opacity-50 uppercase text-xs tracking-syllabus">360 degrees of symbolic wisdom</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSymbols.map((symbol) => (
              <SymbolCard 
                key={`${symbol.sign}-${symbol.degree}`} 
                symbol={symbol} 
                onClick={() => handleSelectSymbol(symbol)}
              />
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedSymbol && (
          <div className="fixed inset-0 z-[4000] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSymbol(null)}
              className="absolute inset-0 bg-archive-ink/40 backdrop-blur-sm"
            />
            <div className="relative w-full max-w-lg bg-archive-bg border border-archive-line shadow-2xl p-12 text-center max-h-[90vh] overflow-y-auto custom-scrollbar rounded-archive-lg">
              <button 
                onClick={() => setSelectedSymbol(null)}
                className="absolute top-4 right-4 p-2 opacity-40 hover:opacity-100 transition-opacity"
              >
                <X size={20} />
              </button>

              <div className="mb-8">
                <span className="data-value text-archive-accent text-lg">{selectedSymbol.degree}° {selectedSymbol.sign.toUpperCase()}</span>
              </div>

              <p className="font-serif italic text-3xl leading-snug text-archive-ink mb-12">
                "{selectedSymbol.symbol}"
              </p>

              <div className="space-y-6">
                {!interpretation && !loading && (
                  <button 
                    onClick={() => getInterpretation(selectedSymbol)}
                    className="brutalist-button px-8 py-3 text-sm flex items-center gap-2 mx-auto"
                  >
                    <Sparkles className="w-4 h-4" />
                    DECODE RESONANCE
                  </button>
                )}

                {loading && (
                  <div className="flex flex-col items-center gap-4 py-8">
                    <Loader2 className="w-8 h-8 animate-spin opacity-20" />
                    <p className="handwritten opacity-40">Consulting the oracle...</p>
                  </div>
                )}

                {interpretation && (
                  <ResultSection
                    id="sabian-symbol-content"
                    title="Archetypal Resonance"
                    content={interpretation}
                    exportName={`sabian-${selectedSymbol.sign}-${selectedSymbol.degree}`}
                    onClose={() => setInterpretation(null)}
                    className="text-left"
                  />
                )}
              </div>

              <div className="pt-8 border-t border-archive-line mt-12">
                <p className="text-[10px] font-mono uppercase tracking-[0.3em] opacity-40">The Sabian Oracle has spoken</p>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </ToolLayout>
  );
};
