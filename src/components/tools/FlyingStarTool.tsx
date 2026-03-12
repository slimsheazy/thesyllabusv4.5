import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, Compass, Sparkles, RefreshCw, Loader2, Zap } from 'lucide-react';
import { geminiService } from '../../services/geminiService';
import { useSyllabusStore } from '../../store';
import { useHaptics } from '../../hooks/useHaptics';
import { ToolLayout } from '../shared/ToolLayout';
import { ResultSection } from '../shared/ResultSection';
import { ReadAloudButton } from '../shared/ReadAloudButton';

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
      
      const prompt = `As a Feng Shui expert, interpret a Flying Star Bagua map for a home facing ${facingDirection}.
      The current Lo Shu configuration is:
      [4, 9, 2]
      [3, 5, 7]
      [8, 1, 6]
      
      Provide a practical, grounded interpretation of the energy flow. 
      Identify one "wealth" sector and one "health" sector based on this orientation.
      Suggest one simple remedy (e.g., placing a plant, a mirror, or a specific color).
      Keep it under 80 words and use the "Archive/Syllabus" aesthetic (poetic but direct).`;

      const text = await geminiService.generateText(prompt);

      setGrid(baseGrid);
      setInterpretation(text || "The energy remains unmapped.");
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
    <ToolLayout
      title="Flying Star Feng Shui"
      subtitle="Harmonizing the energy flow of your physical archive"
      onBack={onBack}
      tooltipTitle="The Spatial Archive"
      tooltipContent="A classical Feng Shui system that tracks the movement of energy (Qi) through time and space. The home is an extension of the internal archive."
    >
      <div className="w-full flex flex-col items-center">
        <AnimatePresence mode="wait">
          {!grid && !loading ? (
            <motion.div 
              key="initial"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl w-full space-y-12 text-center py-20"
            >
              <div className="space-y-6">
                <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 border border-archive-line rotate-45 opacity-20" />
                  <div className="absolute inset-4 border border-archive-line rotate-45 opacity-10" />
                  <Compass size={80} className="text-archive-ink opacity-10" />
                  <Home size={40} className="absolute inset-0 m-auto text-archive-accent opacity-40" />
                </div>
                <h2 className="title-main text-6xl">Home Resonance</h2>
                <p className="font-serif italic text-xl opacity-60">
                  Analyze the energy flow of your living space based on its orientation.
                </p>
              </div>

              <div className="max-w-md mx-auto space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-mono uppercase opacity-40 flex items-center gap-2 justify-center tracking-widest">
                    <Compass size={12} /> Facing Direction
                  </label>
                  <select 
                    value={facingDirection}
                    onChange={(e) => setFacingDirection(e.target.value)}
                    className="w-full bg-white border border-archive-line p-6 font-serif italic text-2xl outline-none focus:border-archive-accent appearance-none text-center shadow-sm"
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
                  className="brutalist-button w-full py-6 text-2xl flex items-center justify-center gap-4"
                >
                  <Sparkles className="w-6 h-6" />
                  MAP ENERGY
                </button>
              </div>
            </motion.div>
          ) : loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-40 gap-8"
            >
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 border-2 border-archive-line animate-pulse" />
                <div className="absolute inset-4 border border-archive-line animate-pulse delay-75" />
                <Loader2 className="w-12 h-12 animate-spin mx-auto opacity-20 absolute inset-0 m-auto" />
              </div>
              <span className="handwritten text-lg text-archive-accent animate-pulse uppercase tracking-[0.3em]">Analyzing the Qi flow...</span>
            </motion.div>
          ) : (
            <motion.div 
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-4xl w-full space-y-12"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                <div className="space-y-8">
                  <div className="text-center lg:text-left space-y-2">
                    <h3 className="text-4xl font-serif italic">The Bagua Map</h3>
                    <p className="font-mono text-[10px] opacity-40 uppercase tracking-widest">Facing {facingDirection}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 aspect-square max-w-md mx-auto lg:mx-0">
                    {grid!.flat().map((star, idx) => (
                      <div key={idx} className="archive-card flex flex-col items-center justify-center p-8 group hover:bg-archive-ink hover:text-archive-bg transition-all relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-[0.05] text-xs font-mono">{idx + 1}</div>
                        <span className="text-5xl font-serif italic mb-2">{star}</span>
                        <span className="text-[8px] font-mono uppercase opacity-40 group-hover:opacity-100 tracking-widest">Sector</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="archive-card p-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.02] select-none pointer-events-none text-9xl italic">QI</div>
                    
                    <div className="space-y-8">
                    <div className="flex justify-between items-center border-b border-archive-line pb-4">
                      <div className="flex items-center gap-3">
                        <Zap className="text-archive-accent w-4 h-4" />
                        <span className="text-[10px] font-mono text-archive-accent uppercase tracking-[0.3em] font-bold">Interpretation</span>
                      </div>
                      <ReadAloudButton text={interpretation} className="!p-1 !h-auto !w-auto !bg-transparent !border-none !shadow-none opacity-20 hover:opacity-100" />
                    </div>
                      <p className="font-serif italic text-2xl leading-relaxed text-archive-ink">
                        "{interpretation}"
                      </p>
                    </div>

                    <div className="mt-12 pt-10 border-t border-archive-line flex justify-center">
                      <button 
                        onClick={() => setGrid(null)}
                        className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40 hover:opacity-100 flex items-center gap-2"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Reset Analysis
                      </button>
                    </div>
                  </div>

                  <ResultSection
                    id="flying-star-content"
                    title="Archive Record"
                    content={`Facing: ${facingDirection}\n\nGrid: ${grid!.flat().join(', ')}\n\nInterpretation: ${interpretation}`}
                    exportName={`feng-shui-${facingDirection}`}
                    onClose={() => setGrid(null)}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToolLayout>
  );
};
