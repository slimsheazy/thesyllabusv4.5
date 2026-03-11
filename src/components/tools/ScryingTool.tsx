import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, RefreshCw, Loader2, Zap } from 'lucide-react';
import { useSyllabusStore } from '../../store';
import { useHaptics } from '../../hooks/useHaptics';
import { useProfile } from '../../hooks/useProfile';
import { ReadAloudButton } from '../ReadAloudButton';
import { geminiService } from '../../services/geminiService';
import { ToolLayout } from '../shared/ToolLayout';
import { ResultSection } from '../shared/ResultSection';

interface ScryingToolProps {
  onBack: () => void;
}

export const ScryingTool: React.FC<ScryingToolProps> = ({ onBack }) => {
  const { recordCalculation } = useSyllabusStore();
  const { profile } = useProfile();
  const { triggerClick, triggerSuccess } = useHaptics();
  const [vision, setVision] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const gaze = async () => {
    triggerClick();
    setLoading(true);
    setVision(null);
    
    try {
      const prompt = `You are a master of scrying and crystal ball divination.
      The seeker is ${profile.isMe ? 'the user' : 'someone else'} born on ${profile.birthday || 'an unknown date'}.
      
      Provide a deep, poetic, and visual prophecy for the seeker. 
      Describe a specific image or scene that appears in the crystal ball and interpret its meaning for their path.
      
      Use the "Archive/Syllabus" aesthetic: serif, italic, slightly cryptic but profoundly resonant.
      Keep it between 50 and 80 words.`;

      const text = await geminiService.generateText(prompt);

      setVision(text || "The fog is thick. Patience is required.");
      recordCalculation();
      triggerSuccess();
    } catch (error) {
      console.error("Error scrying:", error);
      setVision("A path of silver light appears before you. Trust the journey.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout
      title="Obsidian Scrying"
      subtitle="Gazing into the dark, reflective depths of the archive"
      onBack={onBack}
      tooltipTitle="The Reflective Archive"
      tooltipContent="The practice of gazing into a polished black stone, like obsidian, to induce visions. The mirror does not show the world, but the intent behind it."
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
                  <div className="absolute inset-0 rounded-full bg-black shadow-[inset_0_0_50px_rgba(255,255,255,0.1),0_0_30px_rgba(0,0,0,0.5)] overflow-hidden">
                    <div className="absolute top-[10%] left-[20%] w-[40%] h-[20%] bg-white/10 rounded-full blur-md rotate-[-20deg]" />
                    <div className="absolute bottom-[15%] right-[25%] w-[20%] h-[10%] bg-white/5 rounded-full blur-sm" />
                    <motion.div 
                      animate={{ 
                        opacity: [0.1, 0.2, 0.1],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ duration: 5, repeat: Infinity }}
                      className="absolute inset-0 bg-gradient-to-tr from-transparent via-archive-accent/5 to-transparent"
                    />
                  </div>
                  <motion.div 
                    animate={{ scale: [1, 1.05, 1], opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute inset-[-20px] bg-archive-accent rounded-full blur-3xl opacity-10"
                  />
                </div>
                <h2 className="title-main text-6xl">The Obsidian Mirror</h2>
                <p className="font-serif italic text-xl opacity-60">
                  Gaze into the dark, reflective depths to receive a visual prophecy.
                </p>
              </div>

              <button 
                onClick={gaze}
                className="brutalist-button px-16 py-6 text-2xl flex items-center gap-4 mx-auto group"
              >
                <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                GAZE INTO THE DARKNESS
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
                <div className="absolute inset-0 rounded-full bg-black shadow-inner overflow-hidden">
                  <motion.div 
                    animate={{ 
                      rotate: 360,
                      opacity: [0.1, 0.3, 0.1]
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent"
                  />
                </div>
                <Loader2 className="w-12 h-12 animate-spin mx-auto opacity-20 absolute inset-0 m-auto text-white" />
              </div>
              <span className="handwritten text-lg text-archive-accent animate-pulse uppercase tracking-[0.3em]">The shadows are shifting...</span>
            </motion.div>
          ) : (
            <motion.div 
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-3xl w-full space-y-12"
            >
              <div className="archive-card p-10 md:p-16 relative overflow-hidden flex flex-col items-center text-center gap-10">
                <div className="absolute top-0 right-0 p-8 opacity-[0.02] select-none pointer-events-none text-9xl italic">GAZE</div>
                <div className="absolute top-6 right-6">
                  <ReadAloudButton text={vision!} className="!p-1 !h-auto !w-auto !bg-transparent !border-none !shadow-none opacity-20 hover:opacity-100" />
                </div>

                <div className="relative w-full h-48 pointer-events-none overflow-hidden">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ y: 100, x: (i - 2) * 20, opacity: 0, scale: 0.5 }}
                      animate={{ 
                        y: -100, 
                        x: (i - 2) * 40 + (Math.random() * 20 - 10),
                        opacity: [0, 0.3, 0],
                        scale: [0.5, 1.5, 2]
                      }}
                      transition={{ 
                        duration: 4 + Math.random() * 2, 
                        repeat: Infinity,
                        delay: i * 0.5
                      }}
                      className="absolute bottom-0 left-1/2 w-12 h-12 bg-archive-ink/10 rounded-full blur-xl"
                    />
                  ))}
                </div>

                <div className="space-y-8">
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-3">
                      <Zap className="text-archive-accent w-4 h-4" />
                      <span className="text-[10px] font-mono text-archive-accent uppercase tracking-[0.3em] font-bold">The Vision</span>
                    </div>
                  </div>
                  <p className="font-serif italic text-3xl md:text-4xl leading-relaxed text-archive-ink">
                    "{vision}"
                  </p>
                </div>

                <div className="mt-8 pt-10 border-t border-archive-line w-full flex justify-center">
                  <button 
                    onClick={() => setVision(null)}
                    className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40 hover:opacity-100 flex items-center gap-2"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Gaze Again
                  </button>
                </div>
              </div>

              <ResultSection
                id="crystal-ball-content"
                title="Archive Record"
                content={vision!}
                exportName="scrying-vision"
                onClose={() => setVision(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToolLayout>
  );
};
