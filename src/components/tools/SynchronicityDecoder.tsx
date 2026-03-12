import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, RefreshCw, Loader2, FileText, Image as ImageIcon, Volume2 } from 'lucide-react';
import { useSyllabusStore } from '../../store';
import { useHaptics } from '../../hooks/useHaptics';
import { useProfile } from '../../hooks/useProfile';
import { ReadAloudButton } from '../shared/ReadAloudButton';
import { GoogleGenAI } from "@google/genai";
import { ToolLayout } from '../shared/ToolLayout';
import { ResultSection } from '../shared/ResultSection';

interface SynchronicityDecoderProps {
  onBack: () => void;
}

export const SynchronicityDecoder: React.FC<SynchronicityDecoderProps> = ({ onBack }) => {
  const { recordCalculation, addSynchronicityEntry } = useSyllabusStore();
  const { profile } = useProfile();
  const { triggerClick, triggerSuccess } = useHaptics();
  const [event, setEvent] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleDecode = async () => {
    triggerClick();
    if (!event) return;
    setLoading(true);
    setResult(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `You are an expert in Jungian synchronicity, esoteric symbolism, and pattern recognition.
      A seeker ${profile.isMe ? 'the user' : 'someone else'} (born ${profile.birthday || 'unknown date'}) has noticed a meaningful coincidence:
      
      "${event}"
      
      Task:
      Decode the esoteric meaning of this synchronicity. 
      1. Identify the core symbols involved.
      2. Explain the "resonance" or message the universe might be trying to convey.
      3. Provide a practical "alignment action" to honor this pattern.
      
      Tone:
      Grounded, scholarly, yet deeply resonant. Use the "Archive/Syllabus" aesthetic: serif, italic, professional.
      
      Format:
      Provide a single cohesive interpretation (approx 100-150 words).`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      const interpretation = response.text || "The pattern is present, but its meaning remains veiled.";
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
      tooltipTitle="What is Synchronicity?"
      tooltipContent="A concept introduced by Carl Jung to describe 'meaningful coincidences' that occur with no apparent causal connection but seem to be related by meaning."
    >
      <div className="w-full flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
        <aside className="w-full lg:w-[400px] space-y-8 lg:sticky lg:top-20">
          <div className="space-y-8 p-6 bg-white border border-archive-line shadow-sm animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="space-y-2">
              <label className="text-[10px] font-mono uppercase opacity-40 block ml-1 tracking-widest">The Coincidence</label>
              <textarea 
                placeholder="Describe the coincidence, repeating number, or strange pattern you've noticed..." 
                value={event}
                onChange={(e) => setEvent(e.target.value)}
                className="w-full bg-archive-bg border border-archive-line p-4 font-serif italic text-lg outline-none focus:border-archive-accent shadow-sm min-h-[200px] resize-none"
              />
            </div>

            <button 
              onClick={handleDecode}
              disabled={loading || !event}
              className={`brutalist-button w-full py-5 text-xl flex items-center justify-center gap-3 transition-all ${loading || !event ? "opacity-30" : ""}`}
            >
              {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
              {loading ? 'DECODING RESONANCE...' : 'DECODE SYNCHRONICITY'}
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
                <div className="p-10 md:p-16 border border-archive-line bg-white shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.02] select-none pointer-events-none text-9xl italic">DECODE</div>
                  <div className="absolute top-6 right-6">
                    <ReadAloudButton text={result} className="!p-1 !h-auto !w-auto !bg-transparent !border-none !shadow-none opacity-20 hover:opacity-100" />
                  </div>
                  
                  <div className="space-y-10">
                    <div className="flex items-center gap-3 border-b border-archive-line pb-4">
                      <Sparkles className="text-archive-accent w-4 h-4" />
                      <span className="text-[10px] font-mono text-archive-accent uppercase tracking-[0.3em] font-bold">The Resonance</span>
                    </div>
                    <p className="font-serif italic text-2xl md:text-3xl leading-relaxed text-archive-ink">
                      "{result}"
                    </p>
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
                  content={`Event: ${event}\n\nInterpretation: ${result}`}
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
