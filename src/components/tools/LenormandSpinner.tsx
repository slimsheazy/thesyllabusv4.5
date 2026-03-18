import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, Sparkles } from 'lucide-react';
import { useHaptics } from '../../hooks/useHaptics';
import { useSyllabusStore } from '../../store';
import { geminiService } from '../../services/geminiService';
import { Type } from "@google/genai";
import { ReadAloudButton } from '../shared/ReadAloudButton';
import { ToolLayout } from '../shared/ToolLayout';
import { ResultSection } from '../shared/ResultSection';
import Markdown from 'react-markdown';

const LENORMAND_CARDS = [
  'rider', 'clover', 'ship', 'house', 'tree', 'clouds', 'snake', 'coffin', 
  'bouquet', 'scythe', 'whip', 'birds', 'child', 'fox', 'bear', 'stars', 
  'stork', 'dog', 'tower', 'garden', 'mountain', 'path', 'mice', 'heart', 
  'ring', 'book', 'letter', 'man', 'woman', 'lillies', 'sun', 'moon', 
  'key', 'fish', 'anchor', 'cross'
];

interface LenormandSpinnerProps {
  onBack: () => void;
}

export const LenormandSpinner: React.FC<LenormandSpinnerProps> = ({ onBack }) => {
  const { addLenormandEntry } = useSyllabusStore();
  const { triggerClick, triggerSuccess } = useHaptics();
  const [isSpinning, setIsSpinning] = useState(false);
  const [results, setResults] = useState<string[]>(['rider', 'clover', 'ship']);
  const [reading, setReading] = useState<string | { practical: string; psychological: string; spiritual: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const spinReels = async () => {
    if (isSpinning) return;
    triggerClick();
    
    setIsSpinning(true);
    setReading(null);
    
    const newResults = [
      LENORMAND_CARDS[Math.floor(Math.random() * LENORMAND_CARDS.length)],
      LENORMAND_CARDS[Math.floor(Math.random() * LENORMAND_CARDS.length)],
      LENORMAND_CARDS[Math.floor(Math.random() * LENORMAND_CARDS.length)]
    ];

    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setResults(newResults);
    setIsSpinning(false);
    
    setIsLoading(true);
    try {
      const result = await geminiService.interpretLenormand(newResults);
      setReading(result);
      addLenormandEntry({
        cards: newResults,
        interpretation: result
      });
      triggerSuccess();
    } catch (error) {
      console.error("Failed to get reading:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getReadingText = () => {
    if (!reading) return "";
    if (typeof reading === 'string') return reading;
    return `${reading.practical}\n\n${reading.psychological}\n\n${reading.spiritual}`;
  };

  return (
    <ToolLayout
      title="Lenormand Spinner"
      subtitle="Quick answers from the card spinner."
      onBack={onBack}
      tooltipTitle="The Spinner"
      tooltipContent="A simple 36-card system for direct answers."
    >
      <div className="w-full flex flex-col items-center gap-16">
        <div className="max-w-4xl w-full space-y-12">
          <div className="archive-card p-1 bg-archive-ink border-archive-line shadow-2xl overflow-hidden rounded-archive">
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/5 to-transparent opacity-50" />
            
            <div className="grid grid-cols-3 gap-1 relative z-10">
              {[0, 1, 2].map((index) => (
                <div key={index} className="aspect-[2/3] bg-black overflow-hidden relative first:rounded-l-archive last:rounded-r-archive">
                  <AnimatePresence mode="wait">
                    {isSpinning ? (
                      <motion.div
                        key="spinning"
                        initial={{ y: 0 }}
                        animate={{ y: "-50%" }}
                        transition={{ 
                          repeat: Infinity, 
                          duration: 0.2, 
                          ease: "linear" 
                        }}
                        className="absolute inset-0 flex flex-col"
                      >
                        {[...Array(10)].map((_, i) => (
                          <div key={i} className="flex-1 min-h-[100%] filter blur-sm grayscale contrast(125%)">
                            <img 
                              src={`/images/lenormand/${LENORMAND_CARDS[Math.floor(Math.random() * LENORMAND_CARDS.length)]}.jpg`}
                              alt="spinning"
                              className="w-full h-full object-cover opacity-50"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        ))}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="result"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full h-full"
                      >
                        <img 
                          src={`/images/lenormand/${results[index]}.jpg`}
                          alt={results[index]}
                          className="w-full h-full object-cover grayscale contrast(125%)"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${results[index]}/400/600?grayscale`;
                          }}
                        />
                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-black/80 backdrop-blur-sm border-t border-white/10">
                          <span className="text-[10px] uppercase tracking-widest font-mono text-white/60">{results[index]}</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
 
            <div className="absolute top-0 bottom-0 left-1/3 w-[1px] bg-white/10 pointer-events-none" />
            <div className="absolute top-0 bottom-0 left-2/3 w-[1px] bg-white/10 pointer-events-none" />
          </div>
 
          <div className="flex flex-col items-center gap-12">
            <button
              onClick={spinReels}
              disabled={isSpinning || isLoading}
              className="brutalist-button px-16 py-6 text-2xl flex items-center gap-4 group transition-all"
            >
              <span className="relative z-10 flex items-center gap-4">
                {isSpinning ? "SPINNING..." : "PULL THE LEVER"}
                <RotateCcw className={`w-6 h-6 ${isSpinning ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} />
              </span>
            </button>
 
            <div className="min-h-[160px] w-full max-w-3xl text-center">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center gap-6 py-10"
                  >
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-archive-accent rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-archive-accent rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2 h-2 bg-archive-accent rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                    <span className="handwritten text-xl italic opacity-40">Analyzing...</span>
                  </motion.div>
                ) : reading ? (
                  <motion.div
                    key="reading"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                  >
                    <div className="archive-card p-10 relative overflow-hidden bg-white/50 backdrop-blur-sm border-2 border-archive-ink/5">
                      <div className="absolute top-0 right-0 p-4 opacity-[0.03] select-none pointer-events-none text-6xl italic font-serif">
                        READING
                      </div>
                      
                      <div className="space-y-6 relative z-10">
                        <div className="flex items-center justify-center gap-3 mb-6">
                          <div className="w-8 h-px bg-archive-accent" />
                          <span className="text-[9px] font-mono text-archive-accent uppercase tracking-[0.3em] font-bold">
                            Traditional Interpretation
                          </span>
                          <div className="w-8 h-px bg-archive-accent" />
                        </div>
 
                          <div className="font-serif italic text-2xl leading-relaxed text-archive-ink text-left space-y-4 markdown-body">
                            {typeof reading === 'string' ? (
                              <Markdown>{reading}</Markdown>
                            ) : (
                              <>
                                <div>
                                  <h4 className="text-[10px] uppercase tracking-widest opacity-40 mb-1">Practical</h4>
                                  <Markdown>{reading.practical}</Markdown>
                                </div>
                                <div>
                                  <h4 className="text-[10px] uppercase tracking-widest opacity-40 mb-1">Psychological</h4>
                                  <Markdown>{reading.psychological}</Markdown>
                                </div>
                                <div>
                                  <h4 className="text-[10px] uppercase tracking-widest opacity-40 mb-1">Spiritual</h4>
                                  <Markdown>{reading.spiritual}</Markdown>
                                </div>
                              </>
                            )}
                          </div>
  
                        <div className="pt-6 mt-6 border-t border-archive-line/10 flex justify-center">
                          <ReadAloudButton 
                            text={getReadingText()} 
                            className="!p-2 !h-auto !w-auto !bg-archive-bg !border-archive-line !text-archive-ink hover:!bg-archive-ink hover:!text-archive-bg transition-all shadow-sm" 
                          />
                        </div>
                      </div>
                    </div>

                    <ResultSection
                      id="lenormand-reading-content"
                      type="Lenormand Reading"
                      title="Archive Entry"
                      content={getReadingText()}
                      exportName="lenormand-reading"
                      onClose={() => setReading(null)}
                      metadata={{ cards: results }}
                    />
                  </motion.div>
                ) : (
                  <motion.div 
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 }}
                    className="space-y-4 py-10 flex flex-col items-center"
                  >
                    <Sparkles className="w-10 h-10" />
                    <p className="handwritten text-2xl italic">Three cards. One cohesive message.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};
