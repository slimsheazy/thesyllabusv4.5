import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, RefreshCw, Loader2, Hash, Zap, Clock, Eye, Info } from 'lucide-react';
import { useSyllabusStore } from '../../store';
import { useHaptics } from '../../hooks/useHaptics';
import { useProfile } from '../../hooks/useProfile';
import { ReadAloudButton } from '../shared/ReadAloudButton';
import { geminiService } from '../../services/geminiService';
import { ToolLayout } from '../shared/ToolLayout';
import { ResultSection } from '../shared/ResultSection';

interface SynchronicityDecoderProps {
  onBack: () => void;
}

type Mechanism = 'NUMERICAL' | 'SYMBOLIC' | 'TEMPORAL' | 'ENVIRONMENTAL';

const MECHANISMS: { id: Mechanism; label: string; icon: any; desc: string }[] = [
  { 
    id: 'NUMERICAL', 
    label: 'Numerical Resonance', 
    icon: Hash, 
    desc: 'Focus on repeating numbers, sequences, or specific dates.' 
  },
  { 
    id: 'SYMBOLIC', 
    label: 'Symbolic Archetype', 
    icon: Eye, 
    desc: 'Focus on recurring animals, objects, or specific motifs.' 
  },
  { 
    id: 'TEMPORAL', 
    label: 'Temporal Alignment', 
    icon: Clock, 
    desc: 'Focus on the timing, current transits, and planetary hours.' 
  },
  { 
    id: 'ENVIRONMENTAL', 
    label: 'Environmental Glitch', 
    icon: Zap, 
    desc: 'Focus on physical anomalies or "glitches" in your surroundings.' 
  },
];

export const SynchronicityDecoder: React.FC<SynchronicityDecoderProps> = ({ onBack }) => {
  const { recordCalculation, addSynchronicityEntry } = useSyllabusStore();
  const { profile } = useProfile();
  const { triggerClick, triggerSuccess } = useHaptics();
  const [event, setEvent] = useState('');
  const [mechanism, setMechanism] = useState<Mechanism>('SYMBOLIC');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleDecode = async () => {
    triggerClick();
    if (!event) return;
    setLoading(true);
    setResult(null);

    try {
      const now = new Date();
      const context = {
        mechanism: MECHANISMS.find(m => m.id === mechanism)?.label,
        currentTime: now.toLocaleString(),
        location: profile.location.name,
        userBirthday: profile.birthday
      };

      const interpretation = await geminiService.decodeSynchronicity(event, context);
      
      setResult(interpretation);
      addSynchronicityEntry(event, interpretation);
      recordCalculation();
      triggerSuccess();
    } catch (error) {
      console.error("Error decoding synchronicity:", error);
      setResult("The cosmic signal is interrupted. Reflect on the feeling of the coincidence; the answer is already within you.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout
      title="Synchronicity Decoder"
      subtitle="Translating meaningful coincidences into actionable wisdom"
      onBack={onBack}
      tooltipTitle="Intuiting Significance"
      tooltipContent="Select a mechanism to focus your intuition. Whether it's a repeating number or a strange environmental glitch, the archive helps translate the pattern into practical advice."
    >
      <div className="w-full flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
        <aside className="w-full lg:w-[400px] space-y-8 lg:sticky lg:top-20">
          <div className="archive-card p-6 animate-in fade-in slide-in-from-left-4 duration-300 space-y-8">
            <div className="space-y-4">
              <label className="archive-label">Select Mechanism</label>
              <div className="grid grid-cols-1 gap-2">
                {MECHANISMS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => { triggerClick(); setMechanism(m.id); }}
                    className={`flex items-center gap-4 p-4 border transition-all text-left group ${
                      mechanism === m.id 
                        ? 'bg-archive-ink text-archive-bg border-archive-ink' 
                        : 'bg-white border-archive-line hover:border-archive-ink'
                    }`}
                  >
                    <m.icon className={`w-5 h-5 ${mechanism === m.id ? 'text-archive-bg' : 'text-archive-accent'}`} />
                    <div className="flex-1">
                      <div className="text-[10px] font-mono uppercase tracking-widest font-bold">{m.label}</div>
                      <div className={`text-[9px] italic opacity-60 group-hover:opacity-100 ${mechanism === m.id ? 'text-archive-bg/60' : ''}`}>
                        {m.desc}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="archive-label">The Coincidence</label>
              <textarea 
                placeholder="Describe the coincidence, repeating number, or strange pattern you've noticed..." 
                value={event}
                onChange={(e) => setEvent(e.target.value)}
                className="archive-input min-h-[150px] resize-none !text-lg !italic"
              />
            </div>

            <button 
              onClick={handleDecode}
              disabled={loading || !event}
              className={`brutalist-button w-full py-5 text-xl flex items-center justify-center gap-3 transition-all ${loading || !event ? "opacity-30" : ""}`}
            >
              {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
              {loading ? 'DECODING...' : 'DECODE PATTERN'}
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
                  <div className="absolute inset-0 flex items-center justify-center text-xl opacity-20 italic">☉</div>
                </div>
                <span className="handwritten text-lg text-archive-accent animate-pulse uppercase tracking-[0.3em]">Decoding the cosmic signal...</span>
              </motion.div>
            ) : result ? (
              <motion.div 
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-12"
              >
                <div className="archive-card p-10 md:p-16 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.02] select-none pointer-events-none text-9xl italic">DECODE</div>
                  <div className="absolute top-6 right-6">
                    <ReadAloudButton text={result} className="!p-1 !h-auto !w-auto !bg-transparent !border-none !shadow-none opacity-20 hover:opacity-100" />
                  </div>
                  
                  <div className="space-y-10">
                    <div className="flex items-center gap-3 border-b border-archive-line pb-4">
                      <Sparkles className="text-archive-accent w-4 h-4" />
                      <span className="text-[10px] font-mono text-archive-accent uppercase tracking-[0.3em] font-bold">The Resonance</span>
                    </div>
                    <div className="font-serif italic text-2xl md:text-3xl leading-relaxed text-archive-ink">
                      "{result}"
                    </div>
                  </div>

                  <div className="mt-12 pt-10 border-t border-archive-line flex justify-center">
                    <button 
                      onClick={() => setResult(null)}
                      className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40 hover:opacity-100 flex items-center gap-2"
                    >
                      <RefreshCw className="w-3 h-3" />
                      New Query
                    </button>
                  </div>
                </div>

                <ResultSection
                  id="synchronicity-result-content"
                  title="Archive Record"
                  content={`Mechanism: ${mechanism}\nEvent: ${event}\n\nInterpretation: ${result}`}
                  exportName="synchronicity-decoding"
                  onClose={() => setResult(null)}
                />
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center py-40 opacity-[0.03] select-none pointer-events-none"
              >
                <Sparkles size={160} />
                <p className="handwritten text-4xl uppercase tracking-[0.4em] mt-8">Awaiting Pattern</p>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </ToolLayout>
  );
};
