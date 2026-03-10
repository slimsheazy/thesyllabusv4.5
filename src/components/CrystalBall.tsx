import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, RefreshCw, Loader2, Volume2, FileText, Image as ImageIcon } from 'lucide-react';
import { useSyllabusStore } from '../store';
import { useHaptics } from '../hooks/useHaptics';
import { Tooltip } from './Tooltip';
import { ReadAloudButton } from './ReadAloudButton';
import { exportAsImage, exportAsPDF } from '../utils/exportUtils';
import { GoogleGenAI } from "@google/genai";

interface CrystalBallProps {
  onBack: () => void;
}

export const CrystalBall: React.FC<CrystalBallProps> = ({ onBack }) => {
  const { userIdentity, userBirthday, recordCalculation } = useSyllabusStore();
  const { triggerClick, triggerSuccess } = useHaptics();
  const [vision, setVision] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const gaze = async () => {
    triggerClick();
    setLoading(true);
    setVision(null);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `You are a master of scrying and crystal ball divination.
      The seeker is ${userIdentity || 'a mysterious soul'} born on ${userBirthday || 'an unknown date'}.
      
      Provide a deep, poetic, and visual prophecy for the seeker. 
      Describe a specific image or scene that appears in the crystal ball and interpret its meaning for their path.
      
      Use the "Archive/Syllabus" aesthetic: serif, italic, slightly cryptic but profoundly resonant.
      Keep it between 50 and 80 words.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      setVision(response.text || "The fog is thick. Patience is required.");
      recordCalculation();
      triggerSuccess();
    } catch (error) {
      console.error("Error scrying:", error);
      setVision("A path of silver light appears before you. Trust the journey.");
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
            <h1 className="font-serif italic text-2xl tracking-tight">Obsidian Scrying</h1>
            <Tooltip 
              title="What is Obsidian Scrying?" 
              content="The practice of gazing into a polished black stone, like obsidian, to induce visions or gain psychic insight through reflection and depth." 
            />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-4xl mx-auto">
          {!vision && !loading ? (
            <div className="space-y-12 text-center py-12">
              <div className="space-y-4">
                <h2 className="text-5xl font-serif italic">The Obsidian Mirror</h2>
                <p className="handwritten text-xl opacity-60">Gaze into the dark, reflective depths to receive a visual prophecy.</p>
              </div>

              <div className="relative w-64 h-64 mx-auto">
                {/* Obsidian Ball Visual */}
                <div className="absolute inset-0 rounded-full bg-black shadow-[inset_0_0_50px_rgba(255,255,255,0.1),0_0_30px_rgba(0,0,0,0.5)] overflow-hidden">
                  <div className="absolute top-[10%] left-[20%] w-[40%] h-[20%] bg-white/10 rounded-full blur-md rotate-[-20deg]" />
                  <div className="absolute bottom-[15%] right-[25%] w-[20%] h-[10%] bg-white/5 rounded-full blur-sm" />
                  <motion.div 
                    animate={{ 
                      opacity: [0.1, 0.2, 0.1],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 5, repeat: Infinity }}
                    className="absolute inset-0 bg-gradient-to-tr from-transparent via-archive-accent/5 to-transparent"
                  />
                </div>
                
                <motion.div 
                  animate={{ scale: [1, 1.05, 1], opacity: [0.1, 0.2, 0.1] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute inset-[-20px] bg-archive-accent rounded-full blur-3xl opacity-10"
                />
              </div>

              <button 
                onClick={gaze}
                className="brutalist-button px-12 py-5 text-xl flex items-center gap-3 mx-auto"
              >
                <Sparkles className="w-6 h-6" />
                GAZE INTO THE DARKNESS
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
                  <div className="relative w-48 h-48 mx-auto mb-12">
                    {/* Obsidian Ball Loading */}
                    <div className="absolute inset-0 rounded-full bg-black shadow-inner overflow-hidden">
                      <motion.div 
                        animate={{ 
                          rotate: 360,
                          opacity: [0.1, 0.3, 0.1]
                        }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent"
                      />
                    </div>
                    <Loader2 className="w-12 h-12 animate-spin mx-auto opacity-20 absolute inset-0 m-auto text-white" />
                  </div>
                  <p className="handwritten text-xl opacity-40">The shadows are shifting...</p>
                </div>
              ) : (
                <div className="space-y-12 relative">
                  {/* Smoke Animation */}
                  <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-full h-48 pointer-events-none overflow-hidden">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ y: 100, x: (i - 2) * 20, opacity: 0, scale: 0.5 }}
                        animate={{ 
                          y: -100, 
                          x: (i - 2) * 40 + (Math.random() * 20 - 10),
                          opacity: [0, 0.3, 0],
                          scale: [0.5, 1.5, 2]
                        }}
                        transition={{ 
                          duration: 4 + Math.random() * 2, 
                          repeat: Infinity,
                          delay: i * 0.5
                        }}
                        className="absolute bottom-0 left-1/2 w-12 h-12 bg-archive-ink/10 rounded-full blur-xl"
                      />
                    ))}
                  </div>

                  <div id="crystal-ball-content" className="p-12 border border-archive-line bg-white shadow-2xl relative z-10">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none text-8xl font-sans">☊</div>
                    <div className="space-y-6">
                      <p className="font-serif italic text-3xl leading-relaxed text-archive-ink">
                        "{vision}"
                      </p>
                      <div className="flex justify-center">
                        <ReadAloudButton text={vision || ""} className="!py-1 !px-3 !text-[10px]" />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center gap-6">
                    <button 
                      onClick={() => exportAsPDF('crystal-ball-content', 'scrying-vision')}
                      className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40 hover:opacity-100 flex items-center gap-2"
                    >
                      <FileText className="w-3 h-3" />
                      Export PDF
                    </button>
                    <button 
                      onClick={() => exportAsImage('crystal-ball-content', 'scrying-vision')}
                      className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40 hover:opacity-100 flex items-center gap-2"
                    >
                      <ImageIcon className="w-3 h-3" />
                      Export Image
                    </button>
                    <button 
                      onClick={() => setVision(null)}
                      className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40 hover:opacity-100 flex items-center gap-2"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Gaze again
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
