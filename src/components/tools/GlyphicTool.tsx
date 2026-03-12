import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Sparkles, AlertCircle, Volume2, FileText, Image as ImageIcon, Search } from 'lucide-react';
import { geminiService } from '../../services/geminiService';
import { useSyllabusStore } from '../../store';
import { useHaptics } from '../../hooks/useHaptics';
import { ReadAloudButton } from '../shared/ReadAloudButton';
import { ToolLayout } from '../shared/ToolLayout';
import { ResultSection } from '../shared/ResultSection';
import Markdown from 'react-markdown';
import { Type } from "@google/genai";

interface GlyphicResult {
  word: string;
  definition: string;
  reading: string;
  imageUrl: string;
}

interface GlyphicToolProps {
  onBack: () => void;
}

export const GlyphicTool: React.FC<GlyphicToolProps> = ({ onBack }) => {
  const { recordCalculation } = useSyllabusStore();
  const { triggerClick, triggerSuccess } = useHaptics();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GlyphicResult | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);

  const generateGlyph = async () => {
    triggerClick();
    if (!query.trim()) {
      inputRef.current?.focus();
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await geminiService.generateGlyphic(query);
      setResult(data);
      recordCalculation();
      triggerSuccess();
    } catch (err) {
      console.error(err);
      setError("The archive is unresponsive. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout
      title="The Oracle"
      subtitle="Visual and conceptual insights."
      onBack={onBack}
      tooltipTitle="About The Oracle"
      tooltipContent="Generates a unique visual and conceptual anchor based on your inquiry, providing a symbolic card for contemplation."
    >
      <div className="w-full flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
        <aside className="w-full lg:w-[400px] space-y-8 lg:sticky lg:top-20">
          <div className="archive-card p-6 animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="archive-form-group">
              <label className="archive-label">Your Inquiry</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                <input 
                  ref={inputRef}
                  type="text" 
                  placeholder="What do you seek to understand?" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && generateGlyph()}
                  className="archive-input pl-12"
                />
              </div>
            </div>

            <button 
              onClick={generateGlyph}
              disabled={loading || !query.trim()}
              className={`brutalist-button w-full py-5 text-xl mt-8 transition-all ${loading || !query.trim() ? "opacity-30" : ""}`}
            >
              {loading ? "CONSULTING..." : "DRAW CARD"}
            </button>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-lg flex items-center gap-3 text-red-600 text-[10px] italic">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
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
                <span className="handwritten text-lg text-archive-accent animate-pulse uppercase tracking-[0.3em]">Drawing from the deep...</span>
              </motion.div>
            ) : result ? (
              <motion.div 
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-12"
              >
                {/* Oracle Card Aesthetic */}
                <div className="max-w-xl mx-auto archive-card !p-0 shadow-2xl overflow-hidden bg-black border-4 border-archive-ink">
                  <div className="relative aspect-[3/4] bg-archive-ink flex items-center justify-center overflow-hidden">
                    {result.imageUrl ? (
                      <img 
                        src={result.imageUrl} 
                        alt={result.word} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="text-white/20 italic">Visual data missing</div>
                    )}
                  </div>

                  <div className="p-10 md:p-12 bg-black text-white text-center space-y-8">
                    <div className="space-y-4">
                      <h3 className="text-5xl md:text-6xl font-sans font-bold tracking-tighter uppercase text-white">
                        {result.word}
                      </h3>
                      <div className="w-12 h-0.5 bg-white/20 mx-auto" />
                    </div>

                    <div className="space-y-6 relative">
                      <div className="font-serif italic text-xl md:text-2xl leading-relaxed text-white/90 max-w-md mx-auto">
                        "{result.reading}"
                      </div>
                      
                      <div className="pt-4 flex justify-center">
                        <ReadAloudButton 
                          text={result.reading} 
                          className="!p-2 !h-auto !w-auto !bg-white/5 !border-white/10 !text-white hover:!bg-white/10 transition-colors" 
                        />
                      </div>
                    </div>

                    <div className="pt-8 border-t border-white/10">
                      <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/40">
                        {result.definition}
                      </p>
                    </div>
                  </div>
                </div>

                <ResultSection
                  id="oracle-card-content"
                  title="Archive Record"
                  content={`${result.word}\n\n${result.definition}\n\n${result.reading}`}
                  exportName={`oracle-${result.word.toLowerCase()}`}
                  onClose={() => setResult(null)}
                />
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center py-40 opacity-[0.03] select-none pointer-events-none"
              >
                <ImageIcon size={160} />
                <p className="handwritten text-4xl uppercase tracking-[0.4em] mt-8">Awaiting Inquiry</p>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </ToolLayout>
  );
};
