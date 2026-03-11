import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Palette, RefreshCw, Loader2, Sparkles, Zap } from 'lucide-react';
import { useSyllabusStore } from '../../store';
import { useHaptics } from '../../hooks/useHaptics';
import { geminiService } from '../../services/geminiService';
import { Type } from "@google/genai";
import { ToolLayout } from '../shared/ToolLayout';
import { ResultSection } from '../shared/ResultSection';

interface ColorOracleProps {
  onBack: () => void;
}

export const ColorOracle: React.FC<ColorOracleProps> = ({ onBack }) => {
  const { recordCalculation } = useSyllabusStore();
  const { triggerClick, triggerSuccess } = useHaptics();
  const [color, setColor] = useState<{ hex: string; name: string; meaning: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const drawColor = async () => {
    triggerClick();
    setLoading(true);
    setColor(null);
    
    try {
      const randomHex = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
      
      const prompt = `You are a master of color therapy and vibrational resonance.
      A random color with hex code ${randomHex} has been drawn from the spectrum of destiny.
      
      Provide a poetic name for this specific color (e.g., "Obsidian Night", "Ghost Orchid", "Solar Flare") and a deep, poetic meaning for someone who has encountered it today.
      
      Use the "Archive/Syllabus" aesthetic: serif, italic, slightly cryptic but profoundly insightful.`;

      const schema = {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Poetic Color Name" },
          meaning: { type: Type.STRING, description: "A 40-60 word poetic interpretation of this color's vibration" }
        },
        required: ["name", "meaning"]
      };

      const result = await geminiService.generateJson<{ name: string; meaning: string }>(prompt, schema);

      const newColor = {
        hex: randomHex,
        name: result.name || "The Unknown Hue",
        meaning: result.meaning || "A color that defies definition, appearing at the threshold of perception."
      };
      setColor(newColor);
      recordCalculation();
      triggerSuccess();
    } catch (error) {
      console.error("Error drawing color:", error);
      setColor({
        hex: "#1A535C",
        name: "Deep Sea",
        meaning: "Intuition, mystery, and the wisdom found in silence."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout
      title="The Color Oracle"
      subtitle="Vibrational frequencies of the chromatic archive"
      onBack={onBack}
      tooltipTitle="Chromatic Resonance"
      tooltipContent="A system that uses the vibrational frequency of colors to reflect your current emotional state. The spectrum is the archive of light's intent."
    >
      <div className="w-full flex flex-col items-center">
        <AnimatePresence mode="wait">
          {!color && !loading ? (
            <motion.div 
              key="initial"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl w-full space-y-12 text-center py-20"
            >
              <div className="space-y-6">
                <div className="flex justify-center gap-4 opacity-10">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-12 h-12 rounded-full bg-archive-ink" />
                  ))}
                </div>
                <h2 className="title-main text-6xl">Chromatic Insight</h2>
                <p className="font-serif italic text-xl opacity-60">
                  Receive a color that resonates with your current energetic state.
                </p>
              </div>

              <button 
                onClick={drawColor}
                className="brutalist-button px-16 py-6 text-2xl flex items-center gap-4 mx-auto group"
              >
                <Palette className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                DRAW A COLOR
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
              <span className="handwritten text-lg text-archive-accent animate-pulse uppercase tracking-[0.3em]">Mixing the pigments of destiny...</span>
            </motion.div>
          ) : (
            <motion.div 
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-3xl w-full space-y-12"
            >
              <div className="archive-card p-10 md:p-16 relative overflow-hidden flex flex-col items-center text-center gap-10">
                <div className="absolute top-0 right-0 p-8 opacity-[0.02] select-none pointer-events-none text-9xl italic">COLOR</div>
                
                <motion.div 
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="w-48 h-48 rounded-full shadow-2xl border-4 border-white ring-1 ring-archive-line"
                  style={{ backgroundColor: color!.hex }}
                />

                <div className="space-y-8">
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <Zap className="text-archive-accent w-4 h-4" />
                      <span className="text-[10px] font-mono text-archive-accent uppercase tracking-[0.3em] font-bold">The Resonance</span>
                    </div>
                    <h3 className="text-5xl font-serif italic text-archive-ink">{color!.name}</h3>
                  </div>
                  <p className="font-serif italic text-2xl md:text-3xl leading-relaxed text-archive-ink/80">
                    "{color!.meaning}"
                  </p>
                </div>

                <div className="mt-8 pt-10 border-t border-archive-line w-full flex justify-center">
                  <button 
                    onClick={() => setColor(null)}
                    className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40 hover:opacity-100 flex items-center gap-2"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Draw Another
                  </button>
                </div>
              </div>

              <ResultSection
                id="color-oracle-content"
                title="Archive Entry"
                content={`Color: ${color!.name} (${color!.hex})\n\nMeaning: ${color!.meaning}`}
                exportName={`color-${color!.name.toLowerCase().replace(/\s+/g, '-')}`}
                onClose={() => setColor(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToolLayout>
  );
};
