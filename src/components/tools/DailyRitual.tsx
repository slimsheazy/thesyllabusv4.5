import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, Moon, Coffee, Sparkles, RefreshCw, Loader2, Volume2, Wind, Timer, Play, Pause } from 'lucide-react';
import { geminiService } from '../../services/geminiService';
import { useSyllabusStore } from '../../store';
import { useHaptics } from '../../hooks/useHaptics';
import { useProfile } from '../../hooks/useProfile';
import { ReadAloudButton } from '../ReadAloudButton';
import { ToolLayout } from '../shared/ToolLayout';
import { ResultSection } from '../shared/ResultSection';

interface DailyRitualProps {
  onBack: () => void;
}

export const DailyRitual: React.FC<DailyRitualProps> = ({ onBack }) => {
  const { recordCalculation } = useSyllabusStore();
  const { profile } = useProfile();
  const { triggerSuccess, triggerClick } = useHaptics();
  const [ritual, setRitual] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showBreathing, setShowBreathing] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isTimerActive) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getRitual = async () => {
    triggerClick();
    setLoading(true);
    setRitual(null);
    setOutcome(null);
    
    try {
      const hour = new Date().getHours();
      const timeOfDay = hour >= 5 && hour < 12 ? 'Morning' : 
                        hour >= 12 && hour < 18 ? 'Midday' : 'Evening';
      
      const prompt = `You are a high priestess of the Archive, a guide for daily spiritual hygiene.
      The seeker is ${profile.isMe ? 'the user' : 'someone else'} born on ${profile.birthday || 'an unknown date'} in ${profile.location.name || 'an unknown location'}.
      The current time is ${timeOfDay}.
      
      Provide a specific, simple, and evocative ritual for the seeker to perform right now. 
      It should involve common elements like water, light, breath, or writing.
      The ritual should feel sacred, ancient, and deeply personal.
      
      Respond in the 'Archive/Syllabus' aesthetic: serif, italic, slightly cryptic but profoundly practical.`;

      const schema = {
        type: "OBJECT",
        properties: {
          ritual: { type: "STRING" },
          outcome: { type: "STRING" }
        },
        required: ["ritual", "outcome"]
      };

      const result = await geminiService.generateJson<{ ritual: string; outcome: string }>(prompt, schema);
      
      setRitual(result.ritual || "Breathe deeply. The ritual is silence.");
      setOutcome(result.outcome || "A moment of stillness in a busy world.");
      triggerSuccess();
      recordCalculation();
    } catch (error) {
      console.error("Error getting daily ritual:", error);
      setRitual("Light a single match. Watch it burn. Remember your own flame.");
      setOutcome("A connection to the element of fire and your own inner light.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout
      title="Daily Rituals"
      subtitle="Sacred moments for the modern seeker"
      onBack={onBack}
      tooltipTitle="Spiritual Hygiene"
      tooltipContent="Small, intentional actions performed daily to maintain energetic balance and mental clarity."
    >
      <div className="w-full flex flex-col items-center">
        <AnimatePresence mode="wait">
          {!ritual && !loading ? (
            <motion.div 
              key="initial"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl w-full space-y-12 text-center py-20"
            >
              <div className="space-y-6">
                <div className="flex justify-center gap-8 opacity-20">
                  <Sun size={48} />
                  <Coffee size={48} />
                  <Moon size={48} />
                </div>
                <h2 className="title-main text-6xl">Sacred Moments</h2>
                <p className="font-serif italic text-xl opacity-60">
                  Receive a small ritual tailored to your current energy and time.
                </p>
              </div>

              <button 
                onClick={getRitual}
                className="brutalist-button px-16 py-6 text-2xl flex items-center gap-4 mx-auto group"
              >
                <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                RECEIVE RITUAL
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
              <div className="relative">
                <div className="w-16 h-16 border-2 border-archive-accent border-t-transparent animate-spin rounded-full" />
                <div className="absolute inset-0 flex items-center justify-center text-xl opacity-20 italic">☉</div>
              </div>
              <span className="handwritten text-lg text-archive-accent animate-pulse uppercase tracking-[0.3em]">Consulting the ancient ways...</span>
            </motion.div>
          ) : (
            <motion.div 
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-3xl w-full space-y-12"
            >
              <div className="p-10 md:p-16 border border-archive-line bg-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.02] select-none pointer-events-none text-9xl italic">SACRED</div>
                <div className="absolute top-6 right-6 flex gap-4">
                  <button 
                    onClick={() => setShowBreathing(!showBreathing)}
                    className={`p-2 rounded-full transition-colors ${showBreathing ? 'bg-archive-accent text-white' : 'hover:bg-black/5 opacity-40'}`}
                    title="Breathing Guide"
                  >
                    <Wind size={18} />
                  </button>
                  <ReadAloudButton text={`${ritual}. Expected outcome: ${outcome}`} className="!p-1 !h-auto !w-auto !bg-transparent !border-none !shadow-none opacity-20 hover:opacity-100" />
                </div>
                
                <div className="space-y-12">
                  <AnimatePresence mode="wait">
                    {showBreathing ? (
                      <motion.div 
                        key="breathing"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex flex-col items-center justify-center py-10 gap-12"
                      >
                        <div className="relative flex items-center justify-center">
                          <motion.div 
                            animate={{ 
                              scale: [1, 1.5, 1],
                              opacity: [0.2, 0.5, 0.2]
                            }}
                            transition={{ 
                              duration: 8, 
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                            className="w-32 h-32 bg-archive-accent rounded-full blur-3xl absolute"
                          />
                          <motion.div 
                            animate={{ 
                              scale: [1, 1.3, 1]
                            }}
                            transition={{ 
                              duration: 8, 
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                            className="w-40 h-40 border-2 border-archive-accent rounded-full flex items-center justify-center relative z-10"
                          >
                            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-archive-accent">Breathe</span>
                          </motion.div>
                        </div>
                        <div className="text-center space-y-2">
                          <p className="font-serif italic text-xl">Inhale for 4. Hold for 4. Exhale for 4.</p>
                          <p className="text-[10px] font-mono uppercase opacity-40">The rhythm of the archive</p>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="ritual-text"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-12"
                      >
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <Sparkles className="text-archive-accent w-4 h-4" />
                            <span className="text-[10px] font-mono text-archive-accent uppercase tracking-[0.3em] font-bold">The Ritual</span>
                          </div>
                          <p className="font-serif italic text-3xl md:text-4xl leading-relaxed text-archive-ink">
                            "{ritual}"
                          </p>
                        </div>
                        
                        {outcome && (
                          <div className="pt-10 border-t border-archive-line">
                            <div className="flex items-center gap-3 mb-4">
                              <span className="text-[10px] font-mono uppercase tracking-[0.3em] opacity-40">Expected Outcome</span>
                            </div>
                            <p className="font-serif text-xl text-archive-ink/70 italic">
                              {outcome}
                            </p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="pt-10 border-t border-archive-line flex flex-col items-center gap-6">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-mono opacity-60">{formatTime(timer)}</div>
                      <button 
                        onClick={() => setIsTimerActive(!isTimerActive)}
                        className="p-3 bg-archive-ink text-archive-bg rounded-full hover:scale-110 transition-transform"
                      >
                        {isTimerActive ? <Pause size={20} /> : <Play size={20} />}
                      </button>
                      <button 
                        onClick={() => { setTimer(0); setIsTimerActive(false); }}
                        className="p-3 border border-archive-line rounded-full hover:bg-black/5 transition-colors"
                      >
                        <RefreshCw size={20} className={isTimerActive ? 'animate-spin' : ''} />
                      </button>
                    </div>
                    <p className="text-[9px] font-mono uppercase tracking-widest opacity-30 flex items-center gap-2">
                      <Timer size={12} /> Ritual Duration
                    </p>
                  </div>
                </div>

                <div className="mt-12 pt-10 border-t border-archive-line flex justify-center">
                  <button 
                    onClick={() => setRitual(null)}
                    className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40 hover:opacity-100 flex items-center gap-2"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Another Ritual
                  </button>
                </div>
              </div>

              <ResultSection
                id="daily-ritual-content"
                title="Archive Entry"
                content={`${ritual}\n\nOutcome: ${outcome}`}
                exportName="daily-ritual"
                onClose={() => setRitual(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToolLayout>
  );
};
