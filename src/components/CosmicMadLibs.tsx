import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, RefreshCw, Loader2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { useSyllabusStore } from '../store';
import { useHaptics } from '../hooks/useHaptics';

interface CosmicMadLibsProps {
  onBack: () => void;
}

export const CosmicMadLibs: React.FC<CosmicMadLibsProps> = ({ onBack }) => {
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
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `You are a cosmic storyteller. 
      Create a short, poetic, and profound prophecy for ${userIdentity || 'a seeker'} using the following words as inspiration:
      - Adjective: ${adjective}
      - Celestial Body: ${celestialBody}
      - Verb: ${verb}
      - Emotion: ${emotion}
      - Object: ${object}
      
      The prophecy should feel like it was found in an ancient archive. 
      Use the "Archive/Syllabus" aesthetic: serif, italic, slightly cryptic but deeply resonant.
      Keep it between 50 and 80 words.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      setStory(response.text || "The stars are silent.");
      recordCalculation();
      triggerSuccess();
    } catch (error) {
      console.error("Error generating cosmic story:", error);
      setStory(`The ${adjective} energy of ${celestialBody} will soon ${verb} your path. You will feel ${emotion} when you find the ${object}.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-archive-bg">
      <header className="border-b border-archive-line p-6 flex items-center justify-between bg-archive-bg">
        <div className="flex items-center gap-8">
          <button onClick={onBack} className="text-xs font-mono opacity-40 hover:opacity-100 transition-opacity">← BACK</button>
          <h1 className="font-serif italic text-2xl tracking-tight">Cosmic Mad Libs</h1>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-4xl mx-auto">
          {!story && !loading ? (
            <div className="space-y-12 py-12">
              <div className="text-center space-y-4">
                <h2 className="text-5xl font-serif italic">Write Your Destiny</h2>
                <p className="handwritten text-xl opacity-60">Fill in the blanks to reveal a hidden cosmic narrative.</p>
              </div>

              <div className="max-w-xl mx-auto space-y-6">
                {Object.keys(inputs).map((key) => (
                  <div key={key} className="space-y-2">
                    <label className="text-[10px] font-mono uppercase opacity-40 block text-left">{key.replace(/([A-Z])/g, ' $1')}</label>
                    <input 
                      type="text" 
                      value={(inputs as any)[key]}
                      onChange={(e) => setInputs({ ...inputs, [key]: e.target.value })}
                      placeholder={`Enter a ${key}...`}
                      className="w-full bg-white border border-archive-line p-4 font-serif italic text-xl outline-none focus:border-archive-accent"
                    />
                  </div>
                ))}

                <button 
                  onClick={generateStory}
                  className="brutalist-button w-full py-5 text-xl flex items-center justify-center gap-3"
                >
                  <Sparkles className="w-5 h-5" />
                  REVEAL PROPHECY
                </button>
              </div>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto py-24 text-center space-y-12"
            >
              {loading ? (
                <div className="space-y-6">
                  <Loader2 className="w-12 h-12 animate-spin mx-auto opacity-20" />
                  <p className="handwritten text-xl opacity-40">Weaving the threads of fate...</p>
                </div>
              ) : (
                <>
                  <div className="p-12 border border-archive-line bg-white shadow-2xl relative">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none text-8xl font-sans">☊</div>
                    <p className="font-serif italic text-3xl leading-relaxed text-archive-ink">
                      "{story}"
                    </p>
                  </div>

                  <div className="flex justify-center gap-6">
                    <button 
                      onClick={() => setStory(null)}
                      className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40 hover:opacity-100 flex items-center gap-2"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Write another
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
