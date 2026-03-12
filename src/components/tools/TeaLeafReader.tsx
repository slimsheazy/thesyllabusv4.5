import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coffee, RefreshCw, Loader2, Sparkles, Zap } from 'lucide-react';
import { useSyllabusStore } from '../../store';
import { useHaptics } from '../../hooks/useHaptics';
import { useProfile } from '../../hooks/useProfile';
import { ReadAloudButton } from '../shared/ReadAloudButton';
import { geminiService } from '../../services/geminiService';
import { ToolLayout } from '../shared/ToolLayout';
import { ResultSection } from '../shared/ResultSection';

interface TeaLeafReaderProps {
  onBack: () => void;
}

export const TeaLeafReader: React.FC<TeaLeafReaderProps> = ({ onBack }) => {
  const { recordCalculation } = useSyllabusStore();
  const { profile } = useProfile();
  const { triggerClick, triggerSuccess } = useHaptics();
  const [reading, setReading] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [vision, setVision] = useState<string | null>(null);
  const [showInterpretation, setShowInterpretation] = useState(false);

  const readLeaves = async () => {
    triggerClick();
    setLoading(true);
    setReading(null);
    setVision(null);
    setShowInterpretation(false);
    
    try {
      const result = await geminiService.getTeaLeafReading(profile);
      setVision(result.vision);
      setReading(result.interpretation);
      
      recordCalculation();
      triggerSuccess();
    } catch (error) {
      console.error("Error reading tea leaves:", error);
      setReading("The leaves have settled into an illegible sludge. Brew another pot.");
    } finally {
      setLoading(false);
    }
  };

  const Steam = () => (
    <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex gap-4">
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20, scale: 0.5 }}
          animate={{ 
            opacity: [0, 0.4, 0], 
            y: [-20, -60], 
            scale: [0.5, 1.2, 1.5],
            x: [0, (i - 1) * 10, (i - 1) * 20]
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            delay: i * 0.8,
            ease: "easeOut"
          }}
          className="w-8 h-12 bg-white/20 blur-xl rounded-full"
        />
      ))}
    </div>
  );

  const Leaf = ({ i }: { i: number }) => {
    const shapes = [
      "M 0 0 C 5 5 5 15 0 20 C -5 15 -5 5 0 0", // Basic leaf
      "M 0 0 Q 10 5 0 20 Q -10 5 0 0", // Pointy leaf
      "M 0 0 C 10 0 10 20 0 20 C -10 20 -10 0 0 0", // Round leaf
      "M 0 0 L 5 10 L 0 20 L -5 10 Z" // Diamond fragment
    ];
    const shape = shapes[i % shapes.length];
    const size = Math.random() * 10 + 5;
    const rotation = Math.random() * 360;
    const top = Math.random() * 80 + 10;
    const left = Math.random() * 80 + 10;
    const opacity = Math.random() * 0.4 + 0.4;

    return (
      <motion.svg
        initial={{ opacity: 0, scale: 0, rotate: rotation - 20 }}
        animate={{ opacity, scale: 1, rotate: rotation }}
        transition={{ delay: i * 0.03, type: "spring", stiffness: 100 }}
        viewBox="-15 -5 30 30"
        className="absolute text-archive-ink"
        style={{ 
          width: `${size}px`,
          height: `${size * 1.5}px`,
          top: `${top}%`,
          left: `${left}%`,
        }}
      >
        <path d={shape} fill="currentColor" />
      </motion.svg>
    );
  };

  return (
    <ToolLayout
      title="Tea Leaf Reading"
      subtitle="Interpreting the fragments of the steeped archive"
      onBack={onBack}
      tooltipTitle="The Steeped Archive"
      tooltipContent="A divination method that interprets patterns in tea leaves. The cup is a microcosm of the seeker's current trajectory."
    >
      <div className="w-full flex flex-col items-center">
        <AnimatePresence mode="wait">
          {!vision && !loading ? (
            <motion.div 
              key="initial"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl w-full space-y-12 text-center py-20"
            >
              <div className="space-y-6">
                <div className="relative w-64 h-64 mx-auto">
                  <Steam />
                  <div className="absolute inset-0 bg-white rounded-full border-4 border-archive-line shadow-xl overflow-hidden">
                    <div className="absolute inset-4 rounded-full border border-archive-line/20" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5" />
                    <Coffee size={64} className="absolute inset-0 m-auto text-archive-ink opacity-5" />
                  </div>
                </div>
                <h2 className="title-main text-6xl">Tasseography</h2>
                <p className="font-serif italic text-xl opacity-60">
                  Interpret the patterns left behind in the cup of your life.
                </p>
              </div>

              <button 
                onClick={readLeaves}
                className="brutalist-button px-16 py-6 text-2xl flex items-center gap-4 mx-auto group"
              >
                <Coffee className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                BREW AND READ
              </button>
            </motion.div>
          ) : loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-40 gap-8"
            >
              <div className="relative w-48 h-48 mx-auto">
                <Steam />
                <div className="absolute inset-0 bg-white rounded-full border-4 border-archive-line shadow-lg overflow-hidden">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0"
                  >
                    {[...Array(12)].map((_, i) => (
                      <div 
                        key={i}
                        className="absolute w-2 h-4 bg-archive-ink/20 rounded-full"
                        style={{ 
                          top: `${Math.random() * 80 + 10}%`, 
                          left: `${Math.random() * 80 + 10}%`,
                          transform: `rotate(${Math.random() * 360}deg)`
                        }}
                      />
                    ))}
                  </motion.div>
                </div>
                <Loader2 className="w-12 h-12 animate-spin mx-auto opacity-20 absolute inset-0 m-auto" />
              </div>
              <span className="handwritten text-lg text-archive-accent animate-pulse uppercase tracking-[0.3em]">The leaves are settling...</span>
            </motion.div>
          ) : (
            <motion.div 
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-3xl w-full space-y-12"
            >
              <div className="archive-card p-10 md:p-16 relative overflow-hidden flex flex-col items-center text-center gap-10">
                <div className="absolute top-0 right-0 p-8 opacity-[0.02] select-none pointer-events-none text-9xl italic">STEEP</div>
                
                <div className="relative w-64 h-64 bg-white rounded-full border-8 border-archive-line shadow-inner overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-archive-bg/50 to-transparent" />
                  <div className="absolute inset-0 p-8">
                    {[...Array(24)].map((_, i) => (
                      <Leaf key={i} i={i} />
                    ))}
                  </div>
                </div>

                <div className="space-y-8 w-full">
                  <div className="space-y-2 border-b border-archive-line pb-6">
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <Zap className="text-archive-accent w-4 h-4" />
                      <span className="text-[10px] font-mono text-archive-accent uppercase tracking-[0.3em] font-bold">The Pattern</span>
                    </div>
                    <h3 className="text-4xl font-serif italic text-archive-ink">{vision}</h3>
                  </div>

                  <AnimatePresence mode="wait">
                    {!showInterpretation ? (
                      <motion.button 
                        key="reveal-btn"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => { triggerClick(); setShowInterpretation(true); }}
                        className="text-xs font-mono uppercase tracking-widest border border-archive-line px-8 py-4 hover:bg-archive-ink hover:text-archive-bg transition-all"
                      >
                        Reveal Interpretation
                      </motion.button>
                    ) : (
                      <motion.div 
                        key="interpretation"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                      >
                        <div className="flex justify-center items-center gap-3">
                          <Sparkles className="text-archive-accent w-4 h-4" />
                          <ReadAloudButton text={reading!} className="!p-1 !h-auto !w-auto !bg-transparent !border-none !shadow-none opacity-20 hover:opacity-100" />
                        </div>
                        <p className="font-serif italic text-2xl md:text-3xl leading-relaxed text-archive-ink/80">
                          "{reading}"
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="mt-8 pt-10 border-t border-archive-line w-full flex justify-center">
                  <button 
                    onClick={() => setVision(null)}
                    className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40 hover:opacity-100 flex items-center gap-2"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Brew Another Pot
                  </button>
                </div>
              </div>

              <ResultSection
                id="tea-leaf-content"
                title="Archive Entry"
                content={`Vision: ${vision}\n\nInterpretation: ${reading}`}
                exportName="tea-leaf-reading"
                onClose={() => setVision(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToolLayout>
  );
};
