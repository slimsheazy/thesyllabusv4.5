import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCw, Sparkles, Zap } from 'lucide-react';
import { useHaptics } from '../../hooks/useHaptics';
import { geminiService } from '../../services/geminiService';
import { Type } from "@google/genai";
import { ReadAloudButton } from '../ReadAloudButton';
import { ToolLayout } from '../shared/ToolLayout';
import { ResultSection } from '../shared/ResultSection';

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
  const { triggerClick, triggerSuccess } = useHaptics();
  const [isSpinning, setIsSpinning] = useState(false);
  const [results, setResults] = useState<string[]>(['rider', 'clover', 'ship']);
  const [reading, setReading] = useState<string | null>(null);
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
      const prompt = `Interpret these three Lenormand cards as a cohesive sentence in a 'Modern Noir' style. 
      Cards: ${newResults[0]}, ${newResults[1]}, ${newResults[2]}.
      Tone: Practical, punchy, down-to-earth, no mystical fluff. 
      Format: One sentence only. Mention the card names in parentheses where appropriate.`;
      
      const response = await geminiService.generateJson<{ reading: string }>(prompt, {
        type: Type.OBJECT,
        properties: {
          reading: { type: Type.STRING }
        },
        required: ['reading']
      });
      
      setReading(response.reading);
      triggerSuccess();
    } catch (error) {
      console.error("Failed to get reading:", error);
      setReading("The signals are crossed. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ToolLayout
      title="The Lenormand Spinner"
      subtitle="Practical insights from the mechanical archive"
      onBack={onBack}
      tooltipTitle="The Mechanical Oracle"
      tooltipContent="A 36-card divination system known for its direct, practical, and literal interpretations. The spinner reduces the cosmic noise to a single, punchy frequency."
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
                <RotateCw size={24} className={isSpinning ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"} />
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
                    <span className="handwritten text-xl italic opacity-40">Decoding the sequence...</span>
                  </motion.div>
                ) : reading ? (
                  <motion.div
                    key="reading"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                  >
                    <div className="archive-card p-10 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-[0.02] select-none pointer-events-none text-6xl italic">SPIN</div>
                      <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                          <Zap className="text-archive-accent w-4 h-4" />
                          <h3 className="col-header border-none pb-0">Synthesis</h3>
                        </div>
                        <ReadAloudButton text={reading} className="!p-1 !h-auto !w-auto !bg-transparent !border-none !shadow-none opacity-20 hover:opacity-100" />
                      </div>
                      <p className="font-serif italic text-2xl md:text-3xl leading-relaxed text-archive-ink">
                        "{reading}"
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 }}
                    className="space-y-4 py-10"
                  >
                    <Sparkles className="mx-auto w-8 h-8" />
                    <p className="handwritten text-2xl italic">Three cards. One sentence. No fluff.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {reading && (
          <ResultSection
            id="lenormand-spinner-content"
            title="Archive Entry"
            content={`Cards: ${results.join(', ')}\n\nReading: ${reading}`}
            exportName="lenormand-spin"
            onClose={() => setReading(null)}
          />
        )}
      </div>
    </ToolLayout>
  );
};
