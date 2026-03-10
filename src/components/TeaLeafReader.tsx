import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coffee, RefreshCw, Loader2, Sparkles, Volume2, FileText, Image as ImageIcon } from 'lucide-react';
import { useSyllabusStore } from '../store';
import { useHaptics } from '../hooks/useHaptics';
import { Tooltip } from './Tooltip';
import { ReadAloudButton } from './ReadAloudButton';
import { exportAsImage, exportAsPDF } from '../utils/exportUtils';
import { GoogleGenAI } from "@google/genai";

interface TeaLeafReaderProps {
  onBack: () => void;
}

export const TeaLeafReader: React.FC<TeaLeafReaderProps> = ({ onBack }) => {
  const { userIdentity, userBirthday, recordCalculation } = useSyllabusStore();
  const { triggerClick, triggerSuccess } = useHaptics();
  const [reading, setReading] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [vision, setVision] = useState<string | null>(null);

  const [showHint, setShowHint] = useState(false);

  const readLeaves = async () => {
    triggerClick();
    setLoading(true);
    setReading(null);
    setVision(null);
    setShowHint(false);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `You are a master of Tasseography (tea leaf reading). 
      The seeker is ${userIdentity || 'a mysterious soul'} born on ${userBirthday || 'an unknown date'}.
      
      First, describe a specific, evocative pattern formed by the tea leaves in the bottom of a white ceramic cup. 
      Then, provide a deep, poetic interpretation of this pattern as it relates to the seeker's destiny.
      
      Format the response as:
      VISION: [A short, vivid description of the pattern, e.g., "A skeletal key entwined with a blooming jasmine vine"]
      INTERPRETATION: [A 60-80 word poetic and insightful reading]
      
      Use the "Archive/Syllabus" aesthetic: serif, italic, slightly cryptic but deeply resonant.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      const text = response.text || "";
      const visionMatch = text.match(/VISION:\s*(.*)/i);
      const interpretationMatch = text.match(/INTERPRETATION:\s*([\s\S]*)/i);

      setVision(visionMatch ? visionMatch[1].trim() : "A swirling mist of leaves");
      setReading(interpretationMatch ? interpretationMatch[1].trim() : text);
      
      recordCalculation();
      triggerSuccess();
    } catch (error) {
      console.error("Error reading tea leaves:", error);
      setReading("The leaves have settled into an illegible sludge. Brew another pot.");
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
            <h1 className="font-serif italic text-2xl tracking-tight">Tea Leaf Reading</h1>
            <Tooltip 
              title="What is Tea Leaf Reading?" 
              content="A divination method that interprets patterns in tea leaves or coffee grounds to gain insight into the future." 
            />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-4xl mx-auto">
          {!reading && !loading ? (
            <div className="space-y-12 text-center py-12">
              <div className="space-y-4">
                <h2 className="text-5xl font-serif italic">Tasseography</h2>
                <p className="handwritten text-xl opacity-60">Interpret the patterns left behind in the cup of your life.</p>
              </div>

              <div className="relative w-64 h-64 mx-auto">
                <div className="absolute inset-0 bg-white rounded-full border-4 border-archive-line shadow-xl overflow-hidden">
                  <div className="absolute inset-4 rounded-full border border-archive-line/20" />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5" />
                  <Coffee size={64} className="absolute inset-0 m-auto text-archive-ink opacity-5" />
                </div>
              </div>

              <button 
                onClick={readLeaves}
                className="brutalist-button px-12 py-5 text-xl flex items-center gap-3 mx-auto"
              >
                <Coffee className="w-6 h-6" />
                BREW AND READ
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
                    <div className="absolute inset-0 bg-white rounded-full border-4 border-archive-line shadow-lg overflow-hidden">
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0"
                      >
                        {[...Array(12)].map((_, i) => (
                          <div 
                            key={i}
                            className="absolute w-2 h-4 bg-archive-ink/20 rounded-full"
                            style={{ 
                              top: `${Math.random() * 80 + 10}%`, 
                              left: `${Math.random() * 80 + 10}%`,
                              transform: `rotate(${Math.random() * 360}deg)`
                            }}
                          />
                        ))}
                      </motion.div>
                    </div>
                    <Loader2 className="w-12 h-12 animate-spin mx-auto opacity-20 absolute inset-0 m-auto" />
                  </div>
                  <p className="handwritten text-xl opacity-40">The leaves are settling...</p>
                </div>
              ) : (
                <div className="space-y-12">
                  <div id="tea-leaf-content" className="p-12 border border-archive-line bg-white shadow-2xl relative">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none text-8xl font-sans">☊</div>
                    
                    {/* Teacup Visual with Patterns */}
                    <div className="flex justify-center mb-12">
                      <div className="relative w-64 h-64 bg-white rounded-full border-8 border-archive-line shadow-inner overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-tr from-archive-bg/50 to-transparent" />
                        {/* Simulated Tea Leaf Patterns */}
                        <div className="absolute inset-0 p-8">
                          {[...Array(20)].map((_, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 0.6, scale: 1 }}
                              transition={{ delay: i * 0.05 }}
                              className="absolute bg-archive-ink rounded-full"
                              style={{ 
                                width: `${Math.random() * 8 + 2}px`,
                                height: `${Math.random() * 15 + 5}px`,
                                top: `${Math.random() * 80 + 10}%`,
                                left: `${Math.random() * 80 + 10}%`,
                                transform: `rotate(${Math.random() * 360}deg)`
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {vision && (
                      <div className="mb-8 pb-8 border-b border-archive-line">
                        <span className="text-[10px] font-mono uppercase tracking-[0.3em] opacity-40 block mb-4">The Pattern Observed</span>
                        <h3 className="text-3xl font-serif italic text-archive-ink">
                          {vision}
                        </h3>
                        <p className="handwritten text-lg opacity-60 mt-4">Gaze upon the shapes above. What do you see before the archive speaks?</p>
                      </div>
                    )}

                    <div className="space-y-8">
                      {!showHint ? (
                        <button 
                          onClick={() => setShowHint(true)}
                          className="text-xs font-mono uppercase tracking-widest border border-archive-line px-6 py-3 hover:bg-archive-ink hover:text-archive-bg transition-all"
                        >
                          Reveal Interpretation
                        </button>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-8"
                        >
                          <div className="flex justify-center">
                            <Sparkles size={32} className="text-archive-accent opacity-20" />
                          </div>
                          
                          <div className="space-y-4">
                            <p className="font-serif italic text-2xl leading-relaxed text-archive-ink">
                              "{reading}"
                            </p>
                            <div className="flex justify-center">
                              <ReadAloudButton text={reading} className="!py-1 !px-3 !text-[10px]" />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-center gap-6">
                    <button 
                      onClick={() => exportAsPDF('tea-leaf-content', 'tea-leaf-reading')}
                      className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40 hover:opacity-100 flex items-center gap-2"
                    >
                      <FileText className="w-3 h-3" />
                      Export PDF
                    </button>
                    <button 
                      onClick={() => exportAsImage('tea-leaf-content', 'tea-leaf-reading')}
                      className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40 hover:opacity-100 flex items-center gap-2"
                    >
                      <ImageIcon className="w-3 h-3" />
                      Export Image
                    </button>
                    <button 
                      onClick={() => setReading(null)}
                      className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40 hover:opacity-100 flex items-center gap-2"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Brew another pot
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
