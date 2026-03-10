import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PenTool, Download, Trash2, Sparkles, RefreshCw, Share2, Loader2, FileText, Image as ImageIcon, Volume2 } from 'lucide-react';
import { Tooltip } from './Tooltip';
import { GoogleGenAI } from "@google/genai";
import { useSyllabusStore } from '../store';
import { useHaptics } from '../hooks/useHaptics';
import { exportAsImage, exportAsPDF } from '../utils/exportUtils';
import { ReadAloudButton } from './ReadAloudButton';

interface SigilMakerToolProps {
  onBack: () => void;
}

export const SigilMaker: React.FC<SigilMakerToolProps> = ({ onBack }) => {
  const { userIdentity, recordCalculation } = useSyllabusStore();
  const { triggerClick, triggerSuccess } = useHaptics();
  const [intent, setIntent] = useState('');
  const [loading, setLoading] = useState(false);
  const [sigil, setSigil] = useState<string | null>(null);
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 256, height: 256 });
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        
        // Buffer/Debounce the resize event
        if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
        resizeTimeoutRef.current = setTimeout(() => {
          setContainerSize({ width, height });
        }, 150);
      }
    });

    observer.observe(containerRef.current);
    return () => {
      observer.disconnect();
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
    };
  }, []);

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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Sigil',
          text: `I created a sigil for "${intent}" in the Archive.`,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const generateSigil = async () => {
    triggerClick();
    if (!intent) return;
    
    setLoading(true);
    setInterpretation(null);
    
    // Geometric algorithm: use a grid-based approach
    const processed = intent.toLowerCase().replace(/[^a-z]/g, '');
    const unique = Array.from(new Set(processed)).join('');
    
    // Create a geometric path based on a 4x4 grid (0-100 scale)
    // We'll use the character codes to pick points on a grid
    const gridPoints = [
      {x: 20, y: 20}, {x: 50, y: 20}, {x: 80, y: 20},
      {x: 20, y: 50}, {x: 50, y: 50}, {x: 80, y: 50},
      {x: 20, y: 80}, {x: 50, y: 80}, {x: 80, y: 80},
      {x: 35, y: 35}, {x: 65, y: 35}, {x: 35, y: 65}, {x: 65, y: 65}
    ];

    let path = "";
    const points: {x: number, y: number}[] = [];
    
    for (let i = 0; i < unique.length; i++) {
      const charCode = unique.charCodeAt(i);
      const pointIndex = charCode % gridPoints.length;
      points.push(gridPoints[pointIndex]);
    }

    // Ensure at least 3 points for a geometric shape
    if (points.length < 3) {
      points.push({x: 50, y: 10}, {x: 90, y: 90}, {x: 10, y: 90});
    }

    // Build the path with straight lines for a geometric look
    path = `M ${points[0].x} ${points[0].y} `;
    for (let i = 1; i < points.length; i++) {
      path += `L ${points[i].x} ${points[i].y} `;
    }
    path += 'Z';
    
    setSigil(path);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `You are a master of practical sigil magic. 
      A seeker named ${userIdentity || 'a mysterious soul'} has created a geometric sigil for the intent: "${intent}".
      
      Provide a clear "decoding" of the sigil's symbolic structure and a set of practical, grounded instructions for activation.
      The instructions MUST be "normal" and easy to perform, such as:
      - Focused meditation for 5 minutes while holding the image.
      - Carrying the sigil in a wallet or pocket.
      - Placing the sigil under a pillow or on a workspace.
      - Drawing the sigil slowly on a piece of paper.
      
      Avoid any "crazy", extreme, or impractical suggestions.
      Use the "Archive/Syllabus" aesthetic: serif, italic, professional and grounded.
      Keep it around 70 words.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      setInterpretation(response.text || "The symbol is charged with silent power.");
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
    <div className="flex-1 flex flex-col overflow-hidden bg-archive-bg">
      <header className="border-b border-archive-line p-6 flex items-center justify-between bg-archive-bg">
        <div className="flex items-center gap-8">
          <button onClick={onBack} className="text-xs font-mono opacity-40 hover:opacity-100 transition-opacity">← BACK</button>
          <div className="flex items-center">
            <h1 className="font-serif italic text-2xl tracking-tight">Sigil Maker</h1>
            <Tooltip 
              title="What is a Sigil?" 
              content="A symbolic representation of a specific intent or desire, used to focus the subconscious mind on manifestation." 
            />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-12 text-center py-12">
            <div className="space-y-4">
              <h2 className="text-5xl font-serif italic">Manifest Intent</h2>
              <p className="handwritten text-xl opacity-60">Transform your desires into a unique symbolic glyph.</p>
            </div>

            <div className="max-w-2xl mx-auto space-y-8">
              <div className="relative">
                <PenTool className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40" />
                <input 
                  type="text" 
                  placeholder="What is your intent?" 
                  value={intent}
                  onChange={(e) => setIntent(e.target.value)}
                  className="w-full bg-white border border-archive-line p-6 pl-12 font-serif italic text-2xl outline-none focus:border-archive-accent shadow-sm"
                />
              </div>

              <button 
                onClick={generateSigil}
                disabled={loading || !intent}
                className="brutalist-button w-full py-5 text-xl flex items-center justify-center gap-3"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
                {loading ? 'FORGING SYMBOL...' : 'CREATE SIGIL'}
              </button>
            </div>

            <AnimatePresence>
              {(sigil || loading) && (
                <motion.div 
                  id="sigil-maker-content"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full max-w-2xl mx-auto p-12 border border-archive-line bg-white shadow-xl flex flex-col items-center gap-12"
                >
                  <div 
                    ref={containerRef}
                    className="w-full max-w-md aspect-square border border-archive-line flex items-center justify-center p-8 bg-archive-bg/30 relative"
                  >
                    {loading && !sigil && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="w-12 h-12 animate-spin opacity-10" />
                      </div>
                    )}
                    {sigil && (
                      <svg 
                        ref={svgRef}
                        viewBox="0 0 100 100" 
                        style={{ width: '100%', height: '100%' }}
                      >
                        <motion.path 
                          d={sigil} 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 2, ease: "easeInOut" }}
                        />
                      </svg>
                    )}
                  </div>

                  <div className="space-y-8 w-full text-left">
                    <div className="flex justify-between items-center border-b border-archive-line pb-4">
                      <p className="data-value text-archive-accent uppercase tracking-widest text-xs">Sigil of {intent}</p>
                      <ReadAloudButton text={interpretation} className="!p-1 !h-auto !w-auto !bg-transparent !border-none !shadow-none opacity-20 hover:opacity-100" />
                    </div>
                    
                    {interpretation ? (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-6"
                      >
                        <p className="font-serif italic text-xl leading-relaxed text-archive-ink">
                          {interpretation}
                        </p>
                        <div className="flex flex-wrap gap-4 pt-4">
                          <button 
                            onClick={() => exportAsPDF('sigil-maker-content', `sigil-${intent}`)}
                            className="flex-1 flex items-center justify-center gap-2 border border-archive-line py-2 text-[10px] font-mono uppercase hover:bg-archive-ink hover:text-archive-bg transition-all"
                          >
                            <FileText size={12} /> PDF
                          </button>
                          <button 
                            onClick={() => exportAsImage('sigil-maker-content', `sigil-${intent}`)}
                            className="flex-1 flex items-center justify-center gap-2 border border-archive-line py-2 text-[10px] font-mono uppercase hover:bg-archive-ink hover:text-archive-bg transition-all"
                          >
                            <ImageIcon size={12} /> Image
                          </button>
                          <button 
                            onClick={handleDownload}
                            className="flex-1 flex items-center justify-center gap-2 border border-archive-line py-2 text-[10px] font-mono uppercase hover:bg-archive-ink hover:text-archive-bg transition-all"
                          >
                            <Download size={12} /> SVG
                          </button>
                          <button 
                            onClick={handleShare}
                            className="flex-1 flex items-center justify-center gap-2 border border-archive-line py-2 text-[10px] font-mono uppercase hover:bg-archive-ink hover:text-archive-bg transition-all"
                          >
                            <Share2 size={12} /> Share
                          </button>
                          <button onClick={() => { setSigil(null); setInterpretation(null); }} className="flex-1 flex items-center justify-center gap-2 border border-archive-line py-2 text-[10px] font-mono uppercase hover:bg-archive-ink hover:text-archive-bg transition-all">
                            <Trash2 size={12} /> Clear
                          </button>
                        </div>
                      </motion.div>
                    ) : loading && (
                      <div className="space-y-4 animate-pulse">
                        <div className="h-4 bg-archive-bg w-3/4" />
                        <div className="h-4 bg-archive-bg w-1/2" />
                        <div className="h-4 bg-archive-bg w-2/3" />
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
