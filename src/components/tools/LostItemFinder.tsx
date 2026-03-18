import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Crosshair, Search, Sun, Check, Circle, Clock } from 'lucide-react';
import { useSyllabusStore } from '../../store';
import { useHaptics } from '../../hooks/useHaptics';
import { geminiService } from '../../services/geminiService';
import { ReadAloudButton } from '../shared/ReadAloudButton';
import { ToolLayout } from '../shared/ToolLayout';
import { ResultSection } from '../shared/ResultSection';
import { LexiconText } from '../shared/LexiconText';

interface LostItemFinderProps {
  onBack: () => void;
}

export const LostItemFinder: React.FC<LostItemFinderProps> = ({ onBack }) => {
  const { recordCalculation } = useSyllabusStore();
  const { triggerClick, triggerSuccess } = useHaptics();
  
  const [item, setItem] = useState('');
  const [timeLost, setTimeLost] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [checklist, setChecklist] = useState<{ text: string; checked: boolean }[]>([]);

  const toggleChecklist = (index: number) => {
    setChecklist(prev => prev.map((item, i) => i === index ? { ...item, checked: !item.checked } : item));
  };

  const calculateNumerology = (item: string, time: string) => {
    const itemNumber = item.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 9 + 1;
    const timeNumber = time.split('').filter(char => /\d/.test(char)).reduce((acc, char) => acc + parseInt(char), 0) % 9 + 1;
    const totalNumber = (itemNumber + timeNumber) % 9 + 1;
    return { itemNumber, timeNumber, totalNumber };
  };

  const handleFind = async () => {
    triggerClick();
    if (!item || !timeLost) return;
    setLoading(true);
    
    try {
      const numerologyData = calculateNumerology(item, timeLost);
      
      const data = await geminiService.findLostItem(item, numerologyData);
      
      setSuggestion(data.interpretation || "The archive is hazy. Look where you last felt peace.");
      setChecklist((data.checklist || []).map((t: string) => ({ text: t, checked: false })));
      
      recordCalculation();
      triggerSuccess();
    } catch (error) {
      console.error("Error finding item:", error);
      setSuggestion(error instanceof Error ? error.message : "The signal is weak. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout
      title="Lost Item Finder"
      subtitle="Locating what has been misplaced"
      onBack={onBack}
      tooltipTitle="How it works"
      tooltipContent="Uses numerological resonance based on the item name and the time it was lost to pinpoint its location."
    >
      <div className="w-full flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
        <aside className="w-full lg:w-[400px] space-y-8 lg:sticky lg:top-20">
          <div className="archive-card p-6 animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="space-y-4">
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
                <label className="archive-label">Time Lost (HH:MM)</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                  <input 
                    type="time" 
                    value={timeLost}
                    onChange={(e) => setTimeLost(e.target.value)}
                    className="archive-input pl-10 !text-lg !italic"
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={handleFind}
              disabled={loading || !item || !timeLost}
              className={`brutalist-button w-full py-5 text-xl mt-8 transition-all ${loading || !item || !timeLost ? "opacity-30" : ""}`}
            >
              {loading ? "CALCULATING..." : "FIND ITEM"}
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
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sun className="w-6 h-6 opacity-20" />
                  </div>
                </div>
                <span className="handwritten text-lg text-archive-accent animate-pulse uppercase tracking-[0.3em]">
                  Triangulating the resonance...
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
                    <div className="flex items-center gap-2">
                      <Crosshair className="text-archive-accent w-5 h-5" />
                      <span className="text-[10px] font-mono text-archive-accent uppercase tracking-widest">Numerological Resonance</span>
                    </div>
                    <ReadAloudButton text={suggestion} className="!p-1 !h-auto !w-auto !bg-transparent !border-none !shadow-none opacity-20 hover:opacity-100" />
                  </div>
                  
                  <div className="mt-8 space-y-8">
                    <div className="font-serif italic text-xl leading-relaxed text-archive-ink markdown-body">
                      <LexiconText>{suggestion}</LexiconText>
                    </div>

                    <div className="text-left space-y-4">
                      <h4 className="text-[10px] font-mono uppercase tracking-widest opacity-40">Search Checklist</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {checklist.map((item, i) => (
                          <button 
                            key={i} 
                            onClick={() => toggleChecklist(i)}
                            className={`flex items-start gap-3 p-3 border rounded-archive transition-all text-left ${item.checked ? 'bg-archive-line/20 border-archive-line opacity-40' : 'bg-archive-bg border-archive-line hover:border-archive-ink'}`}
                          >
                            <div className="mt-0.5 flex-shrink-0">
                              {item.checked ? <Check className="text-archive-ink w-3 h-3" /> : <Circle className="text-archive-ink/20 w-3 h-3" />}
                            </div>
                            <span className={`text-sm font-serif italic ${item.checked ? 'line-through' : ''}`}>
                              {item.text}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <ResultSection
                  id="lost-item-finder-content"
                  title="Final Synthesis"
                  content={suggestion}
                  exportName={`lost-item-${item}`}
                  onClose={() => setSuggestion(null)}
                  type="LOST_ITEM"
                  metadata={{
                    item,
                    timeLost,
                    suggestion
                  }}
                />
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center py-40 opacity-[0.03] select-none pointer-events-none"
              >
                <Search className="w-32 h-32" />
                <p className="handwritten text-4xl uppercase tracking-[0.4em] mt-8">Awaiting Search</p>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </ToolLayout>
  );
};
