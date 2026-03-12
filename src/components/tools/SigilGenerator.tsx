import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PenTool, Download, Sparkles } from 'lucide-react';
import { useSyllabusStore } from '../../store';
import { useHaptics } from '../../hooks/useHaptics';
import { geminiService } from '../../services/geminiService';
import { ReadAloudButton } from '../shared/ReadAloudButton';
import { ToolLayout } from '../shared/ToolLayout';
import { ResultSection } from '../shared/ResultSection';

interface SigilGeneratorProps {
  onBack: () => void;
}

export const SigilGenerator: React.FC<SigilGeneratorProps> = ({ onBack }) => {
  const { userIdentity, recordCalculation } = useSyllabusStore();
  const { triggerClick, triggerSuccess } = useHaptics();
  const [intent, setIntent] = useState('');
  const [loading, setLoading] = useState(false);
  const [sigil, setSigil] = useState<string | null>(null);
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const handleDownload = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = `sigil-${intent.toLowerCase().replace(/\s+/g, '-')}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const generateSigil = async () => {
    triggerClick();
    if (!intent.trim()) return;
    
    setLoading(true);
    setInterpretation(null);
    
    // Simple algorithm to generate a path from text
    const processed = intent.toLowerCase().replace(/[^a-z]/g, '');
    const unique = Array.from(new Set(processed)).join('');
    
    const gridPoints = [
      {x: 20, y: 20}, {x: 50, y: 20}, {x: 80, y: 20},
      {x: 20, y: 50}, {x: 50, y: 50}, {x: 80, y: 50},
      {x: 20, y: 80}, {x: 50, y: 80}, {x: 80, y: 80},
      {x: 35, y: 35}, {x: 65, y: 35}, {x: 35, y: 65}, {x: 65, y: 65}
    ];

    const points: {x: number, y: number}[] = [];
    for (let i = 0; i < unique.length; i++) {
      const charCode = unique.charCodeAt(i);
      const pointIndex = charCode % gridPoints.length;
      points.push(gridPoints[pointIndex]);
    }

    if (points.length < 3) {
      points.push({x: 50, y: 10}, {x: 90, y: 90}, {x: 10, y: 90});
    }

    let path = `M ${points[0].x} ${points[0].y} `;
    for (let i = 1; i < points.length; i++) {
      path += `L ${points[i].x} ${points[i].y} `;
    }
    path += 'Z';
    
    setSigil(path);

    try {
      const text = await geminiService.decodeSigil(intent, userIdentity || undefined);
      setInterpretation(text || "The symbol is charged with silent power.");
      recordCalculation();
      triggerSuccess();
    } catch (error) {
      console.error("Error interpreting sigil:", error);
      setInterpretation("The intent is sealed. Carry this symbol with you as a reminder of your focus.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout
      title="Sigil Generator"
      subtitle="Transforming intent into symbolic resonance"
      onBack={onBack}
      tooltipTitle="What is a Sigil?"
      tooltipContent="A symbolic representation of a specific intent or desire, used to focus the subconscious mind on manifestation."
    >
      <div className="w-full flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
        <aside className="w-full lg:w-[400px] space-y-8 lg:sticky lg:top-20">
          <div className="archive-card p-6 animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="archive-form-group">
              <label className="archive-label">Your Intent</label>
              <div className="relative">
                <PenTool className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                <input 
                  type="text" 
                  placeholder="State your desire..." 
                  value={intent}
                  onChange={(e) => setIntent(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && generateSigil()}
                  className="archive-input pl-12"
                />
              </div>
            </div>

            <button 
              onClick={generateSigil}
              disabled={loading || !intent.trim()}
              className={`brutalist-button w-full py-5 text-xl mt-8 transition-all ${loading || !intent.trim() ? "opacity-30" : ""}`}
            >
              {loading ? "FORGING..." : "CREATE SIGIL"}
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
                  <div className="absolute inset-0 flex items-center justify-center text-xl opacity-20 italic">☉</div>
                </div>
                <span className="handwritten text-lg text-archive-accent animate-pulse uppercase tracking-[0.3em]">Forging the symbolic resonance...</span>
              </motion.div>
            ) : sigil ? (
              <motion.div 
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-12"
              >
                <div className="archive-card p-8 md:p-12 flex flex-col items-center gap-12">
                  <div 
                    ref={containerRef}
                    className="w-full max-w-md aspect-square border border-archive-line flex items-center justify-center p-12 bg-archive-bg/30 relative overflow-hidden rounded-archive-lg"
                  >
                    <div className="absolute inset-0 opacity-[0.02] pointer-events-none select-none text-[200px] font-serif italic -rotate-12">SIGIL</div>
                    <svg 
                      ref={svgRef}
                      viewBox="0 0 100 100" 
                      className="w-full h-full drop-shadow-2xl"
                    >
                      <motion.path 
                        d={sigil} 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="1.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2, ease: "easeInOut" }}
                      />
                    </svg>
                  </div>

                  <div className="w-full space-y-8">
                    <div className="flex justify-between items-center border-b border-archive-line pb-4">
                      <h3 className="col-header">Decoding & Activation</h3>
                      <div className="flex gap-4">
                        <button 
                          onClick={handleDownload}
                          className="text-[10px] font-mono uppercase opacity-40 hover:opacity-100 transition-opacity flex items-center gap-1"
                          title="Download SVG"
                        >
                          <Download size={12} /> SVG
                        </button>
                        <ReadAloudButton text={interpretation} className="!p-1 !h-auto !w-auto !bg-transparent !border-none !shadow-none opacity-20 hover:opacity-100" />
                      </div>
                    </div>
                    
                    <div className="handwritten text-xl md:text-2xl text-archive-ink leading-relaxed italic font-medium">
                      {interpretation}
                    </div>
                  </div>
                </div>

                <ResultSection
                  id="sigil-generator-content"
                  title="Archive Record"
                  content={`Sigil for intent: "${intent}".\n\n${interpretation}`}
                  exportName={`sigil-${intent.replace(/\s+/g, '-')}`}
                  onClose={() => { setSigil(null); setInterpretation(null); }}
                />
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center py-40 opacity-[0.03] select-none pointer-events-none"
              >
                <PenTool size={160} />
                <p className="handwritten text-4xl uppercase tracking-[0.4em] mt-8">Awaiting Intent</p>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </ToolLayout>
  );
};
