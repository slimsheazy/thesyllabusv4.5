import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Pencil, Sun, ArrowDown, RotateCcw } from 'lucide-react';
import { useSyllabusStore } from '../../store';
import { useHaptics } from '../../hooks/useHaptics';
import { geminiService } from '../../services/geminiService';
import { ReadAloudButton } from '../shared/ReadAloudButton';
import { ToolLayout } from '../shared/ToolLayout';
import { ResultSection } from '../shared/ResultSection';

import Markdown from 'react-markdown';

interface SigilGeneratorProps {
  onBack: () => void;
}

export const SigilGenerator: React.FC<SigilGeneratorProps> = ({ onBack }) => {
  const { userIdentity, recordCalculation, addSigil } = useSyllabusStore();
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
    
    // Complex algorithm to generate a multi-layered sigil
    const processed = intent.toLowerCase().replace(/[^a-z]/g, '');
    const unique = Array.from(new Set(processed)).join('');
    
    const gridPoints = [
      {x: 20, y: 20}, {x: 50, y: 20}, {x: 80, y: 20},
      {x: 20, y: 50}, {x: 50, y: 50}, {x: 80, y: 50},
      {x: 20, y: 80}, {x: 50, y: 80}, {x: 80, y: 80},
      {x: 35, y: 35}, {x: 65, y: 35}, {x: 35, y: 65}, {x: 65, y: 65},
      {x: 50, y: 10}, {x: 50, y: 90}, {x: 10, y: 50}, {x: 90, y: 50},
      {x: 25, y: 25}, {x: 75, y: 25}, {x: 25, y: 75}, {x: 75, y: 75}
    ];

    const points: {x: number, y: number}[] = [];
    for (let i = 0; i < unique.length; i++) {
      const charCode = unique.charCodeAt(i);
      const pointIndex = (charCode * (i + 1)) % gridPoints.length;
      points.push(gridPoints[pointIndex]);
    }

    if (points.length < 5) {
      // Add some geometric anchors if intent is short
      points.push({x: 50, y: 50}, {x: 20, y: 80}, {x: 80, y: 80}, {x: 50, y: 20});
    }

    // Main Path: Using Bezier curves for complexity
    let path = `M ${points[0].x} ${points[0].y} `;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i-1];
      const curr = points[i];
      const cx = (prev.x + curr.x) / 2;
      const cy = (prev.y + curr.y) / 2;
      path += `Q ${prev.x} ${prev.y}, ${cx} ${cy} `;
      path += `T ${curr.x} ${curr.y} `;
    }
    
    // Add a secondary "resonance" path
    let secondaryPath = `M ${100 - points[0].x} ${100 - points[0].y} `;
    for (let i = 1; i < Math.min(points.length, 6); i++) {
      const curr = points[i];
      secondaryPath += `L ${100 - curr.x} ${100 - curr.y} `;
    }

    setSigil(`${path} ${secondaryPath}`);

    try {
      const text = await geminiService.decodeSigil(intent, userIdentity || undefined);
      setInterpretation(text || "The symbol is charged with silent power.");
      // Save to record but don't display as redundant text block
      addSigil(intent, text || "The symbol is charged with silent power.", `${path} ${secondaryPath}`);
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
      title="Sigil Engine"
      subtitle="Geometric Intent Transduction"
      onBack={onBack}
      tooltipTitle="Sigil Construction"
      tooltipContent="Geometric representation of intent vectors, processed through a non-linear symbolic engine."
    >
      <div className="w-full flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
        <aside className="w-full lg:w-[400px] space-y-8 lg:sticky lg:top-20">
          <div className="archive-card p-6 animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="archive-form-group">
              <label className="archive-label">Intent Vector</label>
              <div className="relative">
                <Pencil className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40 w-3 h-3" />
                <input 
                  type="text" 
                  placeholder="State your intent..." 
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
              {loading ? "TRANSDUCING..." : "GENERATE SIGIL"}
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
                  <div className="absolute inset-0 flex items-center justify-center opacity-20">
                    <Sun className="w-6 h-6" />
                  </div>
                </div>
                <span className="handwritten text-lg text-archive-accent animate-pulse uppercase tracking-[0.3em]">Processing intent vectors...</span>
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
                        strokeWidth="1.2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 3, ease: "easeInOut" }}
                      />
                      {/* Add some geometric accents */}
                      <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.2" strokeDasharray="1 2" opacity="0.2" />
                      <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.1" opacity="0.1" />
                    </svg>
                  </div>

                  <div className="w-full space-y-8 text-center">
                    <div className="flex justify-center items-center border-b border-archive-line pb-4">
                      <h3 className="col-header uppercase tracking-[0.3em]">Sigil Activated & Recorded</h3>
                    </div>
                    
                    <p className="font-mono text-[10px] uppercase tracking-widest opacity-40">
                      The symbolic resonance has been committed to the Master Record.
                    </p>

                    <div className="flex justify-center gap-4">
                      <button 
                        onClick={handleDownload}
                        className="text-[10px] font-mono uppercase opacity-40 hover:opacity-100 transition-opacity flex items-center gap-1 border border-archive-line px-3 py-1 rounded-archive"
                        title="Download SVG"
                      >
                        <ArrowDown className="w-3 h-3" /> Download SVG
                      </button>
                    </div>
                  </div>

                  <div className="mt-8 pt-10 border-t border-archive-line w-full flex justify-center">
                    <button 
                      onClick={() => { setSigil(null); setInterpretation(null); }}
                      className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40 hover:opacity-100 flex items-center gap-2"
                    >
                      <RotateCcw className="w-3 h-3" /> Generate New Vector
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center py-40 opacity-[0.03] select-none pointer-events-none"
              >
                <Pencil className="w-32 h-32" />
                <p className="handwritten text-4xl uppercase tracking-[0.4em] mt-8">Awaiting Intent</p>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </ToolLayout>
  );
};
