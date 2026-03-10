import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, Moon, Coffee, Sparkles, RefreshCw, Loader2, Volume2 } from 'lucide-react';
import { useSyllabusStore } from '../store';
import { GoogleGenAI } from "@google/genai";
import { useHaptics } from '../hooks/useHaptics';
import { ReadAloudButton } from './ReadAloudButton';

interface DailyRitualProps {
  onBack: () => void;
}

export const DailyRitual: React.FC<DailyRitualProps> = ({ onBack }) => {
  const { userIdentity, userBirthday, userLocation, recordCalculation } = useSyllabusStore();
  const { triggerSuccess, triggerClick } = useHaptics();
  const [ritual, setRitual] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getRitual = async () => {
    triggerClick();
    setLoading(true);
    setRitual(null);
    setOutcome(null);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const hour = new Date().getHours();
      const timeOfDay = hour >= 5 && hour < 12 ? 'Morning' : 
                        hour >= 12 && hour < 18 ? 'Midday' : 'Evening';
      
      const prompt = `You are a high priestess of the Archive, a guide for daily spiritual hygiene.
      The seeker is ${userIdentity || 'a mysterious soul'} born on ${userBirthday || 'an unknown date'} in ${userLocation?.name || 'an unknown location'}.
      The current time is ${timeOfDay}.
      
      Provide a specific, simple, and evocative ritual for the seeker to perform right now. 
      It should involve common elements like water, light, breath, or writing.
      The ritual should feel sacred, ancient, and deeply personal.
      
      Format the response as JSON:
      {
        "ritual": "A 40-70 word poetic description of the ritual in the 'Archive/Syllabus' aesthetic: serif, italic, slightly cryptic but profoundly practical.",
        "outcome": "A 20-30 word explanation in practical, down-to-earth terms of what the user will actually gain or feel after performing it (e.g., 'increased mental clarity' or 'physical grounding')."
      }`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const result = JSON.parse(response.text || "{}");
      setRitual(result.ritual || "Breathe deeply. The ritual is silence.");
      setOutcome(result.outcome || "A moment of stillness in a busy world.");
      triggerSuccess();
      recordCalculation();
    } catch (error) {
      console.error("Error getting daily ritual:", error);
      setRitual("Light a single match. Watch it burn. Remember your own flame.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-archive-bg">
      <header className="border-b border-archive-line p-6 flex items-center justify-between bg-archive-bg">
        <div className="flex items-center gap-8">
          <button onClick={onBack} className="text-xs font-mono opacity-40 hover:opacity-100 transition-opacity">← BACK</button>
          <h1 className="font-serif italic text-2xl tracking-tight">Daily Rituals</h1>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-4xl mx-auto">
          {!ritual && !loading ? (
            <div className="space-y-12 text-center py-12">
              <div className="space-y-4">
                <h2 className="title-main text-6xl">Sacred Moments</h2>
                <p className="opacity-60">Receive a small ritual tailored to your current energy and time.</p>
              </div>

              <button 
                onClick={getRitual}
                className="brutalist-button px-12 py-5 text-xl flex items-center gap-3 mx-auto"
              >
                <Sparkles className="w-6 h-6" />
                RECEIVE RITUAL
              </button>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl mx-auto py-12 text-center space-y-12"
            >
              {loading ? (
                <div className="py-24 space-y-6">
                  <Loader2 className="w-12 h-12 animate-spin mx-auto opacity-20" />
                  <p className="handwritten text-xl opacity-40">Consulting the ancient ways...</p>
                </div>
              ) : (
                <div className="space-y-12">
                  <div className="p-12 border border-archive-line bg-white shadow-2xl relative space-y-8">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none text-8xl font-sans">☊</div>
                    <div className="absolute top-4 right-4">
                      <ReadAloudButton text={`${ritual}. Expected outcome: ${outcome}`} className="!p-1 !h-auto !w-auto !bg-transparent !border-none !shadow-none opacity-20 hover:opacity-100" />
                    </div>
                    <div className="space-y-4">
                      <p className="font-serif italic text-3xl leading-relaxed text-archive-ink text-left">
                        "{ritual}"
                      </p>
                    </div>
                    
                    {outcome && (
                      <div className="pt-8 border-t border-archive-line text-left">
                        <h4 className="text-[10px] font-mono uppercase tracking-widest opacity-40 mb-2">Expected Outcome</h4>
                        <p className="font-serif text-lg text-archive-ink/80">
                          {outcome}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-center gap-6">
                    <button 
                      onClick={() => setRitual(null)}
                      className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40 hover:opacity-100 flex items-center gap-2"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Another ritual
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
