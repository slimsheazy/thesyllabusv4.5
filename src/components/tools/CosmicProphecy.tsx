import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PenTool, Sun, Sparkles } from 'lucide-react';
import { useSyllabusStore } from '../../store';
import { useHaptics } from '../../hooks/useHaptics';
import { geminiService } from '../../services/geminiService';
import { ToolLayout } from '../shared/ToolLayout';
import { ResultSection } from '../shared/ResultSection';
import { WritingEffect } from '../shared/WritingEffect';

interface CosmicProphecyProps {
  onBack: () => void;
}

export const CosmicProphecy: React.FC<CosmicProphecyProps> = ({ onBack }) => {
  const { userIdentity, recordCalculation } = useSyllabusStore();
  const { triggerClick, triggerSuccess } = useHaptics();
  const [inputs, setInputs] = useState({
    adjective: '',
    celestialBody: '',
    verb: '',
    emotion: '',
    object: ''
  });
  const [story, setStory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateStory = async () => {
    triggerClick();
    const { adjective, celestialBody, verb, emotion, object } = inputs;
    if (!adjective || !celestialBody || !verb || !emotion || !object) return;

    setLoading(true);
    try {
      const text = await geminiService.generateProphecy(inputs, userIdentity || undefined);
      setStory(text || "The stars are silent.");
      recordCalculation();
      triggerSuccess();
    } catch (error) {
      console.error("Error generating cosmic story:", error);
      setStory(`The ${adjective} energy of ${celestialBody} will soon ${verb} your path. You will feel ${emotion} when you find the ${object}.`);
    } finally {
      setLoading(false);
    }
  };

  const isComplete = Object.values(inputs).every(v => v.trim() !== '');

  return (
    <ToolLayout
      title="Cosmic Prophecy"
      subtitle="Weaving destiny through linguistic fragments"
      onBack={onBack}
      tooltipTitle="What is this?"
      tooltipContent="A creative divination tool that uses your chosen words to generate a unique cosmic prophecy."
    >
      <div className="w-full flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
        <aside className="w-full lg:w-[400px] space-y-8 lg:sticky lg:top-20">
          <div className="archive-card bg-archive-bg p-6 animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="space-y-6">
              {Object.keys(inputs).map((key) => (
                  <div key={key} className="archive-form-group">
                    <label className="archive-label">{key.replace(/([A-Z])/g, ' $1')}</label>
                    <div className="relative">
                      <PenTool className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                      <input 
                        type="text" 
                        value={(inputs as any)[key]}
                        onChange={(e) => setInputs({ ...inputs, [key]: e.target.value })}
                        placeholder={`Enter a ${key}...`}
                        className="archive-input pl-12"
                      />
                    </div>
                  </div>
              ))}
            </div>

            <button 
              onClick={generateStory}
              disabled={loading || !isComplete}
              className={`brutalist-button w-full py-5 text-xl mt-8 transition-all ${loading || !isComplete ? "opacity-30" : ""}`}
            >
              {loading ? "WEAVING..." : "REVEAL PROPHECY"}
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
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sun className="w-6 h-6 opacity-20" />
                  </div>
                </div>
                <span className="handwritten text-lg text-archive-accent animate-pulse uppercase tracking-[0.3em]">Decoding the threads of fate...</span>
              </motion.div>
            ) : story ? (
              <motion.div 
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-12"
              >
                <ResultSection
                  id="cosmic-prophecy-content"
                  title="Archive Entry"
                  content={story}
                  exportName="cosmic-prophecy"
                  onClose={() => setStory(null)}
                  type="COSMIC_PROPHECY"
                  metadata={{ inputs, story }}
                >
                  <div className="handwritten text-2xl md:text-3xl text-archive-ink leading-relaxed italic font-medium">
                    "<WritingEffect text={story} />"
                  </div>
                </ResultSection>
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center py-40 opacity-[0.03] select-none pointer-events-none"
              >
                <Sparkles className="w-32 h-32" />
                <p className="handwritten text-4xl uppercase tracking-[0.4em] mt-8">Awaiting Fragments</p>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </ToolLayout>
  );
};
