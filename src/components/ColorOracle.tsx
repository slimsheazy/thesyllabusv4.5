import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Palette, RefreshCw, Loader2, Sparkles } from 'lucide-react';
import { useSyllabusStore } from '../store';
import { useHaptics } from '../hooks/useHaptics';
import { Tooltip } from './Tooltip';
import { GoogleGenAI } from "@google/genai";
import { extractJSON } from '../utils/jsonUtils';
import { hashString } from '../utils/hashUtils';

interface ColorOracleProps {
  onBack: () => void;
}

export const ColorOracle: React.FC<ColorOracleProps> = ({ onBack }) => {
  const { 
    userIdentity, userBirthday, recordCalculation,
    interpretationCache, setInterpretationCache
  } = useSyllabusStore();
  const { triggerClick, triggerSuccess } = useHaptics();
  const [color, setColor] = useState<{ hex: string; name: string; meaning: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const drawColor = async () => {
    triggerClick();
    setLoading(true);
    setColor(null);
    
    try {
      // Generate a truly random hex color
      const randomHex = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
      
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `You are a master of color therapy and vibrational resonance.
      A random color with hex code ${randomHex} has been drawn from the spectrum of destiny.
      
      Provide a poetic name for this specific color (e.g., "Obsidian Night", "Ghost Orchid", "Solar Flare") and a deep, poetic meaning for someone who has encountered it today.
      
      Format the response as JSON:
      {
        "name": "Poetic Color Name",
        "meaning": "A 40-60 word poetic interpretation of this color's vibration"
      }
      
      Use the "Archive/Syllabus" aesthetic: serif, italic, slightly cryptic but profoundly insightful.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const result = extractJSON<any>(response.text || "{}");
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
    <div className="flex-1 flex flex-col overflow-hidden bg-archive-bg">
      <header className="border-b border-archive-line p-6 flex items-center justify-between bg-archive-bg">
        <div className="flex items-center gap-8">
          <button onClick={onBack} className="text-xs font-mono opacity-40 hover:opacity-100 transition-opacity">← BACK</button>
          <div className="flex items-center">
            <h1 className="font-serif italic text-2xl tracking-tight">The Color Oracle</h1>
            <Tooltip 
              title="What is the Color Oracle?" 
              content="A system that uses the vibrational frequency of colors to reflect your current emotional state or provide guidance." 
            />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-4xl mx-auto">
          {!color && !loading ? (
            <div className="space-y-12 text-center py-12">
              <div className="space-y-4">
                <h2 className="text-5xl font-serif italic">Chromatic Insight</h2>
                <p className="handwritten text-xl opacity-60">Receive a color that resonates with your current energetic state.</p>
              </div>

              <button 
                onClick={drawColor}
                className="brutalist-button px-12 py-5 text-xl flex items-center gap-3 mx-auto"
              >
                <Palette className="w-6 h-6" />
                DRAW A COLOR
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
                  <p className="handwritten text-xl opacity-40">Mixing the pigments of destiny...</p>
                </div>
              ) : color && (
                <div className="space-y-12">
                  <div className="p-12 border border-archive-line bg-white shadow-2xl relative flex flex-col items-center gap-8">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none text-8xl font-sans">☊</div>
                    <div 
                      className="w-32 h-32 rounded-full shadow-inner border border-archive-line"
                      style={{ backgroundColor: color.hex }}
                    />
                    <div className="space-y-4">
                      <h3 className="text-4xl font-serif italic">{color.name}</h3>
                      <p className="font-serif italic text-2xl leading-relaxed text-archive-ink">
                        "{color.meaning}"
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-center gap-6">
                    <button 
                      onClick={() => setColor(null)}
                      className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40 hover:opacity-100 flex items-center gap-2"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Draw another
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
