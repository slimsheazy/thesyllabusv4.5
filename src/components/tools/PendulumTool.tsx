import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Sparkles, Zap } from 'lucide-react';
import { useSyllabusStore } from '../../store';
import { useHaptics } from '../../hooks/useHaptics';
import { ToolLayout } from '../shared/ToolLayout';
import { ResultSection } from '../shared/ResultSection';

interface PendulumToolProps {
  onBack: () => void;
}

export const PendulumTool: React.FC<PendulumToolProps> = ({ onBack }) => {
  const { recordCalculation } = useSyllabusStore();
  const { triggerClick, triggerSuccess } = useHaptics();
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [animationType, setAnimationType] = useState<'NEUTRAL' | 'YES' | 'NO' | 'MAYBE' | 'UNFOLDING' | 'REPHRASE'>('NEUTRAL');

  const askPendulum = () => {
    triggerClick();
    setLoading(true);
    setAnswer(null);
    setAnimationType('NEUTRAL');

    setTimeout(() => {
      const answers = ["YES", "NO", "MAYBE", "UNFOLDING", "REPHRASE"];
      const result = answers[Math.floor(Math.random() * answers.length)];
      setAnswer(result);
      setAnimationType(result as any);
      recordCalculation();
      setLoading(false);
      triggerSuccess();
    }, 2500);
  };

  const getAnimationProps = () => {
    if (animationType === 'YES') {
      return {
        animate: { 
          rotateX: [0, 15, 0, -15, 0],
          rotateY: [0, 15, 0, -15, 0],
          x: [0, 20, 0, -20, 0],
        },
        transition: { duration: 2.5, repeat: Infinity, ease: "linear" as const }
      };
    }
    if (animationType === 'NO') {
      return {
        animate: { 
          rotateX: [0, -15, 0, 15, 0],
          rotateY: [0, 15, 0, -15, 0],
          x: [0, -20, 0, 20, 0],
        },
        transition: { duration: 2.5, repeat: Infinity, ease: "linear" as const }
      };
    }
    if (animationType === 'MAYBE') {
      return {
        animate: { x: [-50, 50, -50] },
        transition: { duration: 2, repeat: Infinity, ease: "easeInOut" as const }
      };
    }
    if (animationType === 'UNFOLDING') {
      return {
        animate: { y: [-10, 20, -10] },
        transition: { duration: 2, repeat: Infinity, ease: "easeInOut" as const }
      };
    }
    if (animationType === 'REPHRASE') {
      return {
        animate: { rotate: [-15, 15, -15], x: [-10, 10, -10] },
        transition: { duration: 0.8, repeat: Infinity, ease: "easeInOut" as const }
      };
    }
    return {
      animate: loading ? { 
        rotate: [0, 5, -5, 0],
      } : { 
        rotate: [0, 1, -1, 0] 
      },
      transition: { 
        duration: loading ? 0.5 : 4, 
        repeat: Infinity, 
        ease: "easeInOut" as const
      }
    };
  };

  return (
    <ToolLayout
      title="The Pendulum"
      subtitle="Binary resonance from the subtle archive"
      onBack={onBack}
      tooltipTitle="Subtle Resonance"
      tooltipContent="A tool for dowsing that uses a weighted object on a string to tap into subconscious knowledge or subtle energy fields. The pendulum is the archive of the unseen."
    >
      <div className="w-full flex flex-col items-center">
        <div className="max-w-4xl w-full space-y-12 text-center py-12">
          <div className="space-y-4">
            <h2 className="title-main text-6xl">Binary Resonance</h2>
            <p className="font-serif italic text-xl opacity-60">Focus on a 'Yes' or 'No' question and let the pendulum swing.</p>
          </div>

          <div className="relative w-full h-96 mx-auto flex flex-col items-center perspective-1000">
            <motion.div 
              {...getAnimationProps()}
              className="flex flex-col items-center origin-top preserve-3d"
            >
              <div className="w-[1px] h-56 bg-gradient-to-b from-archive-line via-archive-line/40 to-archive-line/80 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-archive-ink border border-archive-line" />
              </div>
              
              <div className="relative -mt-1 group">
                <div className="absolute inset-0 bg-archive-accent/20 blur-xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <svg width="40" height="60" viewBox="0 0 40 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-2xl">
                  <path d="M20 0L40 20L20 60L0 20L20 0Z" fill="url(#pendulumGradient)" />
                  <path d="M20 0L20 60" stroke="white" strokeOpacity="0.1" />
                  <path d="M0 20L40 20" stroke="white" strokeOpacity="0.1" />
                  <defs>
                    <linearGradient id="pendulumGradient" x1="0" y1="0" x2="40" y2="60" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#1A1A1A" />
                      <stop offset="0.5" stopColor="#333333" />
                      <stop offset="1" stopColor="#000000" />
                    </linearGradient>
                  </defs>
                </svg>
                
                <div className="absolute top-2 left-4 w-1 h-8 bg-white/10 blur-[1px] rounded-full rotate-12" />
              </div>
            </motion.div>

            <AnimatePresence>
              {answer && !loading && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="mt-12 w-full max-w-md mx-auto"
                >
                  <ResultSection
                    id="pendulum-result"
                    title="REPLY"
                    content={answer}
                    exportName="pendulum-answer"
                    onClose={() => setAnswer(null)}
                  >
                    <div className="flex flex-col items-center gap-4">
                      <div className="flex items-center gap-3">
                        <Zap className="text-archive-accent w-4 h-4" />
                        <span className="text-[10px] font-mono text-archive-accent uppercase tracking-[0.3em] font-bold">The Resonance</span>
                      </div>
                      <p className="font-serif italic text-6xl md:text-7xl leading-relaxed text-archive-ink">
                        {answer}
                      </p>
                    </div>
                  </ResultSection>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="pt-12">
            <button 
              onClick={askPendulum}
              disabled={loading}
              className="brutalist-button px-16 py-6 text-2xl min-w-[300px] flex items-center justify-center gap-4 mx-auto"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-6 h-6 animate-spin" />
                  SWINGING...
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  {answer ? 'ASK AGAIN' : 'ASK THE PENDULUM'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};
