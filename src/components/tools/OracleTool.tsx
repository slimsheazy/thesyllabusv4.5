import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Sparkles, AlertCircle, Volume2, FileText, Image as ImageIcon, Search } from 'lucide-react';
import { geminiService } from '../../services/geminiService';
import { useSyllabusStore } from '../../store';
import { useHaptics } from '../../hooks/useHaptics';
import { ReadAloudButton } from '../shared/ReadAloudButton';
import { ToolLayout } from '../shared/ToolLayout';
import { ResultSection } from '../shared/ResultSection';
import { Type } from "@google/genai";

interface OracleCard {
  word: string;
  partOfSpeech: string;
  definition: string;
  reading: string;
  quote: string;
  quoteAuthor: string;
  quoteSource: string;
}

interface OracleToolProps {
  onBack: () => void;
}

export const OracleTool: React.FC<OracleToolProps> = ({ onBack }) => {
  const { recordCalculation } = useSyllabusStore();
  const { triggerClick, triggerSuccess } = useHaptics();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [card, setCard] = useState<OracleCard | null>(null);
  const [orientation, setOrientation] = useState<'Upright' | 'Reversed'>('Upright');
  
  const inputRef = useRef<HTMLInputElement>(null);

  const drawCard = async () => {
    triggerClick();
    if (!query.trim()) {
      inputRef.current?.focus();
      return;
    }

    setLoading(true);
    setError(null);
    setCard(null);
    const isReversed = Math.random() < 0.35;
    const currentOrientation = isReversed ? 'Reversed' : 'Upright';
    setOrientation(currentOrientation);

    try {
      const prompt = `You are an oracle card generator for "The Syllabus", an intellectual and psychological archive. 
      The user submitted: "${query}"

      Select a real, specific English word that carries depth — something like "palimpsest", "apophenia", "liminal", "kenosis", "sonder", "lacuna", "aporia", "cathexis". The word should resonate thematically with the user's query but not restate it literally.

      This is an intellectual oracle — grounded, layered, psychological. Not mystical, not vague. Like holding a precise linguistic mirror up to a person's situation.

      The card orientation is: ${currentOrientation}
      Upright = the concept actively present or working in the querent's favor.
      Reversed = the concept blocked, turned inward, or operating below awareness.`;

      const schema = {
        type: Type.OBJECT,
        properties: {
          word: { type: Type.STRING, description: "WORD IN ALL CAPS" },
          partOfSpeech: { type: Type.STRING, description: "e.g., noun, verb, adjective" },
          definition: { type: Type.STRING, description: "Precise dictionary definition." },
          reading: { type: Type.STRING, description: "1-2 paragraphs. Intellectual and grounded. Connect the word's meaning to the user's query. Let the ${currentOrientation} orientation shape the lens." },
          quote: { type: Type.STRING, description: "A real, accurate quote from a real person that resonates with the word" },
          quoteAuthor: { type: Type.STRING, description: "Full Name" },
          quoteSource: { type: Type.STRING, description: "Title of work if known, else empty string" }
        },
        required: ["word", "partOfSpeech", "definition", "reading", "quote", "quoteAuthor", "quoteSource"]
      };

      const result = await geminiService.generateJson<OracleCard>(prompt, schema, "gemini-3.1-pro-preview");
      setCard(result);
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
      subtitle="Psychological insights from language."
      onBack={onBack}
      tooltipTitle="About the Oracle"
      tooltipContent="Uses language and psychology to provide insights into your situation."
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
                  onKeyDown={(e) => e.key === 'Enter' && drawCard()}
                  className="archive-input pl-12"
                />
              </div>
            </div>

            <button 
              onClick={drawCard}
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
                <span className="handwritten text-lg text-archive-accent animate-pulse uppercase tracking-[0.3em]">Analyzing...</span>
              </motion.div>
            ) : card ? (
              <motion.div 
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-12"
              >
                <div className="archive-card shadow-2xl overflow-hidden">
                  <div className="relative h-64 bg-archive-ink flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-archive-accent/20 via-transparent to-transparent" />
                      <div className="w-full h-full" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.05) 20px, rgba(255,255,255,0.05) 21px)' }} />
                    </div>

                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 0.15, rotate: orientation === 'Reversed' ? 180 : 0 }}
                      className="text-[120px] font-serif italic text-white uppercase tracking-tighter select-none"
                    >
                      {card.word}
                    </motion.div>

                    <div className="absolute top-6 right-6 border border-white/20 px-3 py-1 text-[10px] font-mono text-white/40 uppercase tracking-widest">
                      {orientation}
                    </div>
                  </div>

                  <div className="p-10 md:p-12 space-y-10">
                    <div className="space-y-2">
                      <h3 className="text-6xl font-serif italic tracking-tight text-archive-ink uppercase">{card.word}</h3>
                      <p className="text-sm font-serif italic opacity-40">{card.partOfSpeech} • {card.definition}</p>
                    </div>

                    <div className="space-y-6">
                      <div className="flex justify-between items-center border-b border-archive-line pb-4">
                        <h4 className="col-header">The Reading</h4>
                        <ReadAloudButton text={card.reading} className="!p-1 !h-auto !w-auto !bg-transparent !border-none !shadow-none opacity-20 hover:opacity-100" />
                      </div>
                      <div className="font-serif italic text-2xl leading-relaxed text-archive-ink/80">
                        {card.reading.split('\n').map((p, i) => (
                          <p key={i} className={i > 0 ? 'mt-6' : ''}>{p}</p>
                        ))}
                      </div>
                    </div>

                    <div className="border-l-4 border-archive-accent pl-8 py-4 bg-archive-accent/5 relative group">
                      <p className="font-serif italic text-2xl opacity-80 leading-relaxed">"{card.quote}"</p>
                      <p className="text-[10px] uppercase tracking-widest opacity-40 mt-4">
                        — {card.quoteAuthor}{card.quoteSource ? `, ${card.quoteSource}` : ''}
                      </p>
                    </div>
                  </div>
                </div>

                <ResultSection
                  id="oracle-card-content"
                  title="Archive Record"
                  content={`${card.word} (${card.partOfSpeech})\n\n${card.definition}\n\n${card.reading}\n\n"${card.quote}" — ${card.quoteAuthor}`}
                  exportName={`oracle-${card.word.toLowerCase()}`}
                  onClose={() => setCard(null)}
                />
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center py-40 opacity-[0.03] select-none pointer-events-none"
              >
                <Sparkles size={160} />
                <p className="handwritten text-4xl uppercase tracking-[0.4em] mt-8">Enter a question</p>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </ToolLayout>
  );
};
