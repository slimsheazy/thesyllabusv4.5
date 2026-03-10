import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, AnimatePresence } from 'motion/react';
import { ArrowLeft, RotateCw, Info, Volume2 } from 'lucide-react';
import { useHaptics } from '../hooks/useHaptics';
import { geminiService } from '../services/geminiService';
import { Type } from "@google/genai";
import { ReadAloudButton } from './ReadAloudButton';

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
    
    // Randomize results
    const newResults = [
      LENORMAND_CARDS[Math.floor(Math.random() * LENORMAND_CARDS.length)],
      LENORMAND_CARDS[Math.floor(Math.random() * LENORMAND_CARDS.length)],
      LENORMAND_CARDS[Math.floor(Math.random() * LENORMAND_CARDS.length)]
    ];

    // Wait for animation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setResults(newResults);
    setIsSpinning(false);
    
    // Get reading
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
    <div className="flex-1 flex flex-col h-screen bg-[#0A0A0A] text-[#E4E3E0] overflow-hidden">
      {/* Header */}
      <header className="p-6 border-b border-white/5 flex items-center justify-between">
        <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="subtitle-main text-white">The Lenormand Spinner</h1>
        <div className="w-10" />
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto custom-scrollbar">
        <div className="max-w-4xl w-full space-y-12">
          
          {/* Slot Machine Container */}
          <div className="relative p-8 bg-[#141414] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            {/* Glossy Overlay */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/5 to-transparent opacity-50" />
            
            <div className="grid grid-cols-3 gap-4 relative z-10">
              {[0, 1, 2].map((index) => (
                <div key={index} className="aspect-[2/3] bg-black rounded-lg border border-white/5 overflow-hidden relative">
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
                        {/* Blur effect during spin */}
                        {[...Array(10)].map((_, i) => (
                          <div key={i} className="flex-1 min-h-[100%] filter blur-sm grayscale(20%) contrast(110%)">
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
                          className="w-full h-full object-cover grayscale(20%) contrast(110%)"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${results[index]}/400/600?grayscale`;
                          }}
                        />
                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/60 backdrop-blur-sm">
                          <span className="text-[10px] uppercase tracking-widest font-mono opacity-60">{results[index]}</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Reel Dividers */}
            <div className="absolute top-0 bottom-0 left-1/3 w-[1px] bg-white/5 pointer-events-none" />
            <div className="absolute top-0 bottom-0 left-2/3 w-[1px] bg-white/5 pointer-events-none" />
          </div>

          {/* Controls */}
          <div className="flex flex-col items-center space-y-8">
            <button
              onClick={spinReels}
              disabled={isSpinning || isLoading}
              className="group relative px-12 py-4 bg-white text-black font-gidole uppercase tracking-[0.2em] text-sm overflow-hidden transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100"
            >
              <span className="relative z-10 flex items-center gap-3">
                {isSpinning ? "Spinning..." : "Pull the Lever"}
                <RotateCw size={16} className={isSpinning ? "animate-spin" : ""} />
              </span>
              <div className="absolute inset-0 bg-archive-accent translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </button>

            {/* Reading Display */}
            <div className="min-h-[100px] w-full max-w-2xl text-center">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center gap-3 text-white/40"
                  >
                    <div className="w-1 h-1 bg-white rounded-full animate-bounce" />
                    <div className="w-1 h-1 bg-white rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1 h-1 bg-white rounded-full animate-bounce [animation-delay:0.4s]" />
                    <span className="handwritten italic text-sm">Decoding the sequence...</span>
                  </motion.div>
                ) : reading ? (
                  <motion.div
                    key="reading"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-center gap-4">
                      <p className="text-xl md:text-2xl font-kollektif leading-relaxed text-white/90">
                        {reading}
                      </p>
                      <ReadAloudButton text={reading} className="!p-1 !h-auto !w-auto !bg-transparent !border-none !shadow-none opacity-20 hover:opacity-100" />
                    </div>
                    <div className="flex items-center justify-center gap-2 opacity-30">
                      <div className="h-[1px] w-8 bg-white" />
                      <span className="text-[10px] uppercase tracking-[0.3em]">The Spinner</span>
                      <div className="h-[1px] w-8 bg-white" />
                    </div>
                  </motion.div>
                ) : (
                  <motion.p 
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 }}
                    className="handwritten text-lg italic"
                  >
                    Three cards. One sentence. No fluff.
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <footer className="p-6 border-t border-white/5 flex justify-center">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest opacity-20">
          <Info size={12} />
          <span>Obsidian Series Tool v1.0</span>
        </div>
      </footer>
    </div>
  );
};
