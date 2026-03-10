import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, Compass, Sparkles, RefreshCw, Volume2, Loader2 } from 'lucide-react';
import { Tooltip } from './Tooltip';
import { ReadAloudButton } from './ReadAloudButton';
import { GoogleGenAI } from "@google/genai";
import { useSyllabusStore } from '../store';
import { useHaptics } from '../hooks/useHaptics';

interface FlyingStarToolProps {
  onBack: () => void;
}

export const FlyingStarTool: React.FC<FlyingStarToolProps> = ({ onBack }) => {
  const { triggerClick, triggerSuccess } = useHaptics();
  const [facingDirection, setFacingDirection] = useState<string>('N');
  const [loading, setLoading] = useState(false);
  const [grid, setGrid] = useState<number[][] | null>(null);
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const { recordCalculation } = useSyllabusStore();

  const calculateStars = async () => {
    triggerClick();
    setLoading(true);
    try {
      // Real Lo Shu Square is the base
      const baseGrid = [
        [4, 9, 2],
        [3, 5, 7],
        [8, 1, 6]
      ];
      
      // In a real system, we'd rotate or shift based on direction and period.
      // For now, we'll use the base grid but get a real AI interpretation.
      
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `As a Feng Shui expert, interpret a Flying Star Bagua map for a home facing ${facingDirection}.
      The current Lo Shu configuration is:
      [4, 9, 2]
      [3, 5, 7]
      [8, 1, 6]
      
      Provide a practical, grounded interpretation of the energy flow. 
      Identify one "wealth" sector and one "health" sector based on this orientation.
      Suggest one simple remedy (e.g., placing a plant, a mirror, or a specific color).
      Keep it under 80 words and use the "Archive/Syllabus" aesthetic (poetic but direct).`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      setGrid(baseGrid);
      setInterpretation(response.text || "The energy remains unmapped.");
      recordCalculation();
      triggerSuccess();
    } catch (error) {
      console.error("Feng Shui calculation failed", error);
      setInterpretation("The Qi is currently turbulent. Try re-mapping later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-archive-bg">
      <header className="border-b border-archive-line p-6 flex items-center justify-between bg-archive-bg">
        <div className="flex items-center gap-8">
          <button onClick={onBack} className="text-xs font-mono opacity-40 hover:opacity-100 transition-opacity">BACK</button>
          <div className="flex items-center">
            <h1 className="font-serif italic text-2xl tracking-tight">Flying Star Feng Shui</h1>
            <Tooltip 
              title="What is Flying Star Feng Shui?" 
              content="A classical Feng Shui system that tracks the movement of energy (Qi) through time and space to harmonize a building's environment." 
            />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-4xl mx-auto">
          {!grid && (
            <div className="space-y-12 text-center py-12">
              <div className="space-y-4">
                <h2 className="text-5xl font-serif italic">Home Resonance</h2>
                <p className="handwritten text-xl opacity-60">Analyze the energy flow of your living space based on its orientation.</p>
              </div>

              <div className="max-w-md mx-auto space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-mono uppercase opacity-40 flex items-center gap-2 justify-center"><Compass size={12} /> Facing Direction</label>
                  <select 
                    value={facingDirection}
                    onChange={(e) => setFacingDirection(e.target.value)}
                    className="w-full bg-white border border-archive-line p-4 font-serif italic text-xl outline-none focus:border-archive-accent appearance-none text-center"
                  >
                    <option value="N">North (0°)</option>
                    <option value="NE">North-East (45°)</option>
                    <option value="E">East (90°)</option>
                    <option value="SE">South-East (135°)</option>
                    <option value="S">South (180°)</option>
                    <option value="SW">South-West (225°)</option>
                    <option value="W">West (270°)</option>
                    <option value="NW">North-West (315°)</option>
                  </select>
                </div>

                <button 
                  onClick={calculateStars}
                  disabled={loading}
                  className="brutalist-button w-full py-4 text-lg"
                >
                  {loading ? 'ANALYZING VIBE...' : 'MAP ENERGY'}
                </button>
              </div>
            </div>
          )}

          <AnimatePresence>
            {grid && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-12 pb-24"
              >
                <div className="text-center space-y-2">
                  <h3 className="text-3xl font-serif italic">The Bagua Map</h3>
                  <p className="data-value opacity-40 uppercase tracking-widest">Facing {facingDirection}</p>
                </div>

                <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto aspect-square">
                  {grid.flat().map((star, idx) => (
                    <div key={idx} className="border border-archive-line bg-white flex flex-col items-center justify-center p-8 shadow-sm group hover:bg-archive-ink hover:text-archive-bg transition-all">
                      <span className="text-4xl font-serif italic mb-2">{star}</span>
                      <span className="text-[8px] font-mono uppercase opacity-40 group-hover:opacity-100">Sector {idx + 1}</span>
                    </div>
                  ))}
                </div>

                <div className="max-w-2xl mx-auto p-8 border border-archive-line bg-white/50 text-center relative">
                  {interpretation && (
                    <>
                      <div className="absolute top-4 right-4">
                        <ReadAloudButton text={interpretation} className="!p-1 !h-auto !w-auto !bg-transparent !border-none !shadow-none opacity-20 hover:opacity-100" />
                      </div>
                      <p className="font-serif italic text-lg opacity-80">
                        {interpretation}
                      </p>
                    </>
                  )}
                </div>

                <div className="pt-12 border-t border-archive-line flex justify-center">
                  <button 
                    onClick={() => setGrid(null)}
                    className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40 hover:opacity-100 flex items-center gap-2"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Reset analysis
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
