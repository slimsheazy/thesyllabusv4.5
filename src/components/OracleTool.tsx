import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Sparkles, AlertCircle, Volume2, FileText, Image as ImageIcon } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { useSyllabusStore } from '../store';
import { useHaptics } from '../hooks/useHaptics';
import { Tooltip } from './Tooltip';
import { ReadAloudButton } from './ReadAloudButton';
import { exportAsImage, exportAsPDF } from '../utils/exportUtils';

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
  const [lastQuery, setLastQuery] = useState("");
  
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
    setLastQuery(query);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: `You are an oracle card generator for "The Syllabus", an intellectual and psychological archive. 
        The user submitted: "${query}"

        Select a real, specific English word that carries depth — something like "palimpsest", "apophenia", "liminal", "kenosis", "sonder", "lacuna", "aporia", "cathexis". The word should resonate thematically with the user's query but not restate it literally.

        This is an intellectual oracle — grounded, layered, psychological. Not mystical, not vague. Like holding a precise linguistic mirror up to a person's situation.

        The card orientation is: ${currentOrientation}
        Upright = the concept actively present or working in the querent's favor.
        Reversed = the concept blocked, turned inward, or operating below awareness.

        Respond with a JSON object following this schema:`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
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
          }
        }
      });

      const result = JSON.parse(response.text);
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

  const reset = () => {
    triggerClick();
    setCard(null);
    setQuery("");
    setError(null);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-archive-bg">
      <header className="border-b border-archive-line p-6 flex items-center justify-between bg-archive-bg">
        <div className="flex items-center gap-8">
          <button onClick={onBack} className="text-xs font-mono opacity-40 hover:opacity-100 transition-opacity">BACK</button>
          <div className="flex items-center">
            <h1 className="font-serif italic text-2xl tracking-tight">The Oracle</h1>
            <Tooltip 
              title="What is The Oracle?" 
              content="A linguistic mirror that selects a profound concept to reflect your current situation through the lens of etymology and psychology." 
            />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-xl mx-auto space-y-8">
          {/* Input Row */}
          <div className="flex gap-2">
            <input 
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && drawCard()}
              placeholder="What's on your mind..."
              className="flex-1 bg-transparent border border-archive-ink/20 rounded-sm px-4 py-3 font-sans text-lg outline-none focus:border-archive-accent transition-colors placeholder:italic placeholder:opacity-30"
              maxLength={200}
              disabled={loading}
            />
            <button 
              onClick={drawCard}
              disabled={loading || !query.trim()}
              className="brutalist-button px-8 py-3 text-xs tracking-[0.2em] disabled:opacity-20"
            >
              {loading ? 'CONSULTING...' : 'DRAW'}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {!card && !loading && !error && (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-64 border border-dashed border-archive-line rounded-sm flex flex-col items-center justify-center gap-4 opacity-30"
              >
                <div className="text-6xl font-serif">◈</div>
                <div className="text-[10px] uppercase tracking-[0.2em] font-mono">Awaiting a query</div>
              </motion.div>
            )}

            {loading && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-64 flex flex-col items-center justify-center gap-6"
              >
                <div className="flex gap-2">
                  {[0, 1, 2].map(i => (
                    <motion.div 
                      key={i}
                      animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1, 0.8] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                      className="w-2 h-2 bg-archive-ink rounded-full"
                    />
                  ))}
                </div>
                <div className="text-[10px] uppercase tracking-[0.2em] font-mono opacity-40">Consulting the archive</div>
              </motion.div>
            )}

            {error && (
              <motion.div 
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-64 flex flex-col items-center justify-center gap-4 text-red-500/60"
              >
                <AlertCircle className="w-8 h-8" />
                <div className="text-[10px] uppercase tracking-[0.1em] font-mono">{error}</div>
                <button onClick={drawCard} className="text-[10px] underline uppercase tracking-widest mt-2">Retry</button>
              </motion.div>
            )}

            {card && !loading && (
              <motion.div 
                id="oracle-card-content"
                key="card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-archive-ink rounded-sm overflow-hidden bg-white shadow-2xl"
              >
                {/* Card Image Area */}
                <div className="relative h-48 bg-archive-ink overflow-hidden flex items-center justify-center">
                  {/* Background Textures */}
                  <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-archive-accent/20 via-transparent to-transparent" />
                    <div className="w-full h-full" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.05) 20px, rgba(255,255,255,0.05) 21px)' }} />
                  </div>

                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.1, rotate: orientation === 'Reversed' ? 180 : 0 }}
                    className="text-8xl font-serif italic text-white uppercase tracking-tighter select-none"
                  >
                    {card.word}
                  </motion.div>

                  <div className="absolute top-4 right-4 border border-white/20 rounded-sm px-2 py-1 text-[8px] font-mono text-white/40 uppercase tracking-widest">
                    {orientation}
                  </div>
                  <div className="absolute bottom-4 left-4 text-[8px] font-mono text-white/20 uppercase tracking-[0.3em]">
                    Oracle · Collage
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-8 space-y-6">
                  <div>
                    <h3 className="text-5xl font-serif italic tracking-tight text-archive-ink uppercase">{card.word}</h3>
                    <p className="text-xs font-serif italic opacity-40 mt-1">{card.partOfSpeech}</p>
                  </div>

                  <div className="text-[10px] font-mono leading-relaxed opacity-50 border-b border-archive-line pb-4">
                    {card.definition}
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="text-[10px] uppercase tracking-[0.2em] text-archive-accent font-bold">
                        {orientation}
                      </div>
                      <ReadAloudButton text={card.reading} className="!p-1 !h-auto !w-auto !bg-transparent !border-none !shadow-none opacity-20 hover:opacity-100" />
                    </div>
                    <div className="text-lg font-sans leading-relaxed text-archive-ink/80">
                      {card.reading.split('\n').map((p, i) => (
                        <p key={i} className={i > 0 ? 'mt-4' : ''}>{p}</p>
                      ))}
                    </div>
                  </div>

                  <div className="border-l-2 border-archive-accent pl-6 py-2 bg-archive-accent/5 relative group">
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ReadAloudButton text={card.quote} className="!p-1 !h-auto !w-auto !bg-transparent !border-none !shadow-none" />
                    </div>
                    <p className="font-serif italic text-xl opacity-80">"{card.quote}"</p>
                    <p className="text-[10px] uppercase tracking-widest opacity-40 mt-2">
                      — {card.quoteAuthor}{card.quoteSource ? `, ${card.quoteSource}` : ''}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-archive-line flex items-center justify-between gap-4">
                    <div className="flex gap-4">
                      <button 
                        onClick={() => exportAsPDF('oracle-card-content', `oracle-${card.word}`)}
                        className="text-[10px] uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity flex items-center gap-1"
                      >
                        <FileText className="w-3 h-3" />
                        PDF
                      </button>
                      <button 
                        onClick={() => exportAsImage('oracle-card-content', `oracle-${card.word}`)}
                        className="text-[10px] uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity flex items-center gap-1"
                      >
                        <ImageIcon className="w-3 h-3" />
                        Image
                      </button>
                    </div>
                    <button 
                      onClick={reset}
                      className="flex items-center gap-2 text-[10px] uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity whitespace-nowrap"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Draw again
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
