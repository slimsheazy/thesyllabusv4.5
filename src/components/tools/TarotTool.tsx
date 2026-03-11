import React, { useState } from 'react';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, RefreshCw, Layers, ChevronDown, Zap, Loader2 } from 'lucide-react';
import { TAROT_CARDS, TarotCard } from '../../data/tarotData';
import { useHaptics } from '../../hooks/useHaptics';
import { geminiService } from '../../services/geminiService';
import { CardDisplay } from './Tarot/CardDisplay';
import { ReadAloudButton } from '../ReadAloudButton';
import { ToolLayout } from '../shared/ToolLayout';
import { ResultSection } from '../shared/ResultSection';

interface DrawnCard extends TarotCard {
  isReversed: boolean;
}

type SpreadType = 'one-card' | 'three-card' | 'celtic-cross';

interface TarotToolProps {
  onBack: () => void;
}

export const TarotTool: React.FC<TarotToolProps> = ({ onBack }) => {
  const { triggerClick, triggerSuccess } = useHaptics();
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [question, setQuestion] = useState('');
  const [spread, setSpread] = useState<SpreadType>('one-card');
  const [showSpreadMenu, setShowSpreadMenu] = useState(false);
  const [synthesis, setSynthesis] = useState<string | null>(null);

  const drawCards = async () => {
    triggerClick();
    if (!question.trim()) {
      return;
    }
    setIsDrawing(true);
    setDrawnCards([]);
    setSynthesis(null);
    
    const numCards = spread === 'one-card' ? 1 : spread === 'three-card' ? 3 : 10;
    
    // Simulate drawing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const shuffled = [...TAROT_CARDS].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, numCards).map(card => ({
      ...card,
      isReversed: Math.random() > 0.7 // 30% chance of reversal
    }));
    
    setDrawnCards(selected);
    setIsDrawing(false);
    triggerSuccess();

    // Start synthesis
    setIsSynthesizing(true);
    try {
      const cardList = selected.map((c, i) => `${i + 1}. ${c.name} (${c.isReversed ? 'Reversed' : 'Upright'})`).join('\n');
      const prompt = `As a master Tarot reader, provide a concise synthesis for a ${spread} spread.
      Inquiry: "${question}"
      Cards drawn:
      ${cardList}
      
      Synthesize these archetypes into a cohesive narrative for the seeker. 
      Keep it under 100 words. Use the "Archive/Syllabus" aesthetic: poetic, direct, and slightly esoteric.`;
      
      const text = await geminiService.generateText(prompt);
      setSynthesis(text);
    } catch (error) {
      console.error("Tarot synthesis failed", error);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const spreadLabels: Record<SpreadType, string> = {
    'one-card': 'Single Card (Insight)',
    'three-card': 'Three Cards (Past, Present, Future)',
    'celtic-cross': 'Celtic Cross (Comprehensive)'
  };

  return (
    <ToolLayout
      title="Tarot Reading"
      subtitle="Consulting the symbolic archetypes of the collective archive"
      onBack={onBack}
      tooltipTitle="The Symbolic Archive"
      tooltipContent="Tarot is a system of archetypal imagery that mirrors the internal landscape. Each card is a fragment of the collective human archive."
    >
      <div className="w-full flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
        <aside className="w-full lg:w-[400px] space-y-8 lg:sticky lg:top-20">
          <div className="archive-card p-6 space-y-8 animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="space-y-2">
              <label className="text-[10px] font-mono uppercase opacity-40 block ml-1 tracking-widest">Spread Type</label>
              <div className="relative">
                <button 
                  onClick={() => setShowSpreadMenu(!showSpreadMenu)}
                  className="w-full flex items-center justify-between p-4 bg-archive-bg border border-archive-line text-[10px] font-mono uppercase tracking-widest hover:bg-archive-line/10 transition-all"
                >
                  <span>{spread.replace('-', ' ')}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${showSpreadMenu ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {showSpreadMenu && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white border border-archive-line shadow-xl z-50 overflow-hidden"
                    >
                      {(Object.keys(spreadLabels) as SpreadType[]).map((s) => (
                        <button
                          key={s}
                          onClick={() => { setSpread(s); setShowSpreadMenu(false); }}
                          className={`w-full text-left px-4 py-3 text-[10px] font-mono hover:bg-archive-line transition-colors border-b border-archive-line last:border-0 ${spread === s ? 'bg-archive-ink text-archive-bg' : ''}`}
                        >
                          {spreadLabels[s].toUpperCase()}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-mono uppercase opacity-40 block ml-1 tracking-widest">Your Inquiry</label>
              <textarea 
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="What do you seek to understand?"
                className="w-full p-4 bg-archive-bg border border-archive-line italic text-lg outline-none focus:border-archive-accent shadow-sm min-h-[120px] resize-none"
              />
            </div>

            <button 
              onClick={drawCards}
              disabled={isDrawing || !question.trim()}
              className={`brutalist-button w-full py-5 text-xl transition-all ${isDrawing || !question.trim() ? "opacity-30" : "!bg-archive-accent text-white"}`}
            >
              {isDrawing ? "DRAWING..." : "DRAW CARDS"}
            </button>
          </div>
        </aside>

        <main className="flex-1 w-full min-h-[600px] pb-32">
          <AnimatePresence mode="wait">
            {isDrawing ? (
              <motion.div 
                key="drawing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-40 gap-8"
              >
                <div className="flex gap-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-24 h-40 border border-archive-line bg-archive-ink/5 animate-pulse flex items-center justify-center">
                      <RefreshCw className="w-6 h-6 animate-spin opacity-20" />
                    </div>
                  ))}
                </div>
                <p className="handwritten text-lg text-archive-accent animate-pulse uppercase tracking-[0.3em]">Consulting the archetypes...</p>
              </motion.div>
            ) : drawnCards.length > 0 ? (
              <motion.div 
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-16"
              >
                <div className={`flex flex-wrap justify-center gap-8 ${spread === 'celtic-cross' ? 'max-w-4xl mx-auto' : ''}`}>
                  {drawnCards.map((card, idx) => (
                    <motion.div 
                      key={`${card.name}-${idx}`}
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex flex-col items-center gap-4"
                    >
                      <CardDisplay card={card} isReversed={card.isReversed} />
                      <div className="text-center">
                        <span className="text-[8px] font-mono opacity-40 uppercase tracking-widest">
                          {spread === 'three-card' ? (idx === 0 ? 'Past' : idx === 1 ? 'Present' : 'Future') : `Card ${idx + 1}`}
                        </span>
                        <h3 className="font-serif italic text-lg">{card.name}</h3>
                        <span className="text-[9px] font-mono text-archive-accent uppercase">{card.isReversed ? 'Reversed' : 'Upright'}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="space-y-8 max-w-3xl mx-auto">
                  {isSynthesizing ? (
                    <div className="archive-card p-10 flex flex-col items-center gap-4">
                      <Loader2 className="w-8 h-8 animate-spin text-archive-accent opacity-20" />
                      <span className="handwritten text-archive-accent animate-pulse uppercase tracking-widest">Synthesizing Archetypes...</span>
                    </div>
                  ) : synthesis && (
                    <div className="archive-card p-10 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-[0.02] select-none pointer-events-none text-9xl italic">SYN</div>
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-archive-line pb-4">
                          <Zap className="text-archive-accent w-4 h-4" />
                          <span className="text-[10px] font-mono text-archive-accent uppercase tracking-[0.3em] font-bold">Synthesis</span>
                        </div>
                        <p className="font-serif italic text-2xl leading-relaxed text-archive-ink">
                          "{synthesis}"
                        </p>
                      </div>
                    </div>
                  )}

                  {drawnCards.map((card, idx) => (
                    <div key={`meaning-${idx}`} className="archive-card p-8 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-mono text-archive-accent uppercase tracking-widest">{card.arcana} arcana</span>
                          <h2 className="text-3xl font-serif italic mt-1">{card.name} {card.isReversed && <span className="text-sm opacity-40">(Reversed)</span>}</h2>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="text-[10px] font-mono opacity-30 uppercase tracking-widest">
                            {spread === 'three-card' ? (idx === 0 ? 'Past' : idx === 1 ? 'Present' : 'Future') : `Position ${idx + 1}`}
                          </span>
                          <ReadAloudButton text={card.isReversed ? card.reversedMeaning : card.uprightMeaning} className="!p-1 !h-auto !w-auto !bg-transparent !border-none !shadow-none opacity-20 hover:opacity-100" />
                        </div>
                      </div>
                      <div className="font-serif italic text-xl leading-relaxed text-archive-ink border-l-2 border-archive-line pl-6">
                        <Markdown>{`"${card.isReversed ? card.reversedMeaning : card.uprightMeaning}"`}</Markdown>
                      </div>
                    </div>
                  ))}
                </div>

                <ResultSection
                  id="tarot-reading-content"
                  title="Archive Entry"
                  content={`Spread: ${spread}\nInquiry: ${question}\n\nSynthesis: ${synthesis}\n\nCards: ${drawnCards.map(c => `${c.name} (${c.isReversed ? 'Reversed' : 'Upright'})`).join(', ')}`}
                  exportName={`tarot-${spread}`}
                  onClose={() => setDrawnCards([])}
                />
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center py-40 opacity-[0.03] select-none pointer-events-none"
              >
                <Layers size={160} />
                <p className="handwritten text-4xl uppercase tracking-[0.4em] mt-8">Awaiting Spread</p>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </ToolLayout>
  );
};
