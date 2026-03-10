import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, RefreshCw, Loader2, FileText, Image as ImageIcon, Volume2 } from 'lucide-react';
import { useSyllabusStore } from '../store';
import { useHaptics } from '../hooks/useHaptics';
import { Tooltip } from './Tooltip';
import { ReadAloudButton } from './ReadAloudButton';
import { exportAsImage, exportAsPDF } from '../utils/exportUtils';
import { GoogleGenAI } from "@google/genai";

interface SynchronicityDecoderProps {
  onBack: () => void;
}

export const SynchronicityDecoder: React.FC<SynchronicityDecoderProps> = ({ onBack }) => {
  const { userIdentity, userBirthday, recordCalculation, addSynchronicityEntry } = useSyllabusStore();
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
      A seeker named ${userIdentity || 'a mysterious soul'} (born ${userBirthday || 'unknown date'}) has noticed a meaningful coincidence:
      
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
    <div className="flex-1 flex flex-col overflow-hidden bg-archive-bg">
      <header className="border-b border-archive-line p-6 flex items-center justify-between bg-archive-bg">
        <div className="flex items-center gap-8">
          <button onClick={onBack} className="text-xs font-mono opacity-40 hover:opacity-100 transition-opacity">← BACK</button>
          <div className="flex items-center">
            <h1 className="font-serif italic text-2xl tracking-tight">Synchronicity Decoder</h1>
            <Tooltip 
              title="What is Synchronicity?" 
              content="A concept introduced by Carl Jung to describe 'meaningful coincidences' that occur with no apparent causal connection but seem to be related by meaning." 
            />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-12 text-center py-12">
            <div className="space-y-4">
              <h2 className="title-main text-6xl">Decode the Pattern</h2>
              <p className="opacity-60">Translate the meaningful coincidences of your life into actionable wisdom.</p>
            </div>

            <div className="max-w-2xl mx-auto space-y-8">
              <div className="relative">
                <textarea 
                  placeholder="Describe the coincidence, repeating number, or strange pattern you've noticed..." 
                  value={event}
                  onChange={(e) => setEvent(e.target.value)}
                  className="w-full bg-white border border-archive-line p-8 font-serif italic text-xl outline-none focus:border-archive-accent shadow-sm min-h-[160px] resize-none"
                />
              </div>

              <button 
                onClick={handleDecode}
                disabled={loading || !event}
                className="brutalist-button w-full py-5 text-xl flex items-center justify-center gap-3"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
                {loading ? 'DECODING RESONANCE...' : 'DECODE SYNCHRONICITY'}
              </button>
            </div>

            <AnimatePresence>
              {result && (
                <motion.div 
                  id="synchronicity-result-content"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-2xl mx-auto p-12 border border-archive-line bg-white shadow-xl relative overflow-hidden text-left"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none text-8xl font-sans">☊</div>
                  
                  <div className="flex justify-between items-start mb-8">
                    <div className="space-y-1">
                      <div className="text-[10px] font-mono uppercase tracking-widest opacity-40">Decoded Pattern</div>
                      <h3 className="heading-marker text-3xl text-marker-black lowercase">The Resonance</h3>
                    </div>
                    <ReadAloudButton text={result} />
                  </div>

                  <p className="font-serif italic text-2xl leading-relaxed text-archive-ink mb-12">
                    "{result}"
                  </p>

                  <div className="flex flex-wrap justify-center gap-8 pt-8 border-t border-archive-line">
                    <button 
                      onClick={() => exportAsPDF('synchronicity-result-content', 'synchronicity-decoding')}
                      className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40 hover:opacity-100 flex items-center gap-2"
                    >
                      <FileText className="w-3 h-3" />
                      Export PDF
                    </button>
                    <button 
                      onClick={() => exportAsImage('synchronicity-result-content', 'synchronicity-decoding')}
                      className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40 hover:opacity-100 flex items-center gap-2"
                    >
                      <ImageIcon className="w-3 h-3" />
                      Export Image
                    </button>
                    <button 
                      onClick={() => setResult(null)}
                      className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40 hover:opacity-100 flex items-center gap-2"
                    >
                      <RefreshCw className="w-3 h-3" />
                      New Query
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
