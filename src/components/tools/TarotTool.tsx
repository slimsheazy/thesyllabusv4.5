import React, { useState } from 'react';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ChevronDown, Loader2, Zap, Layout } from 'lucide-react';
import { TAROT_CARDS, TarotCard } from '../../data/tarotData';
import { useSyllabusStore } from '../../store';
import { useHaptics } from '../../hooks/useHaptics';
import { geminiService } from '../../services/geminiService';
import { CardDisplay } from './Tarot/CardDisplay';
import { ReadAloudButton } from '../shared/ReadAloudButton';
import { ToolLayout } from '../shared/ToolLayout';
import { ResultSection } from '../shared/ResultSection';

interface DrawnCard extends TarotCard {
  isReversed: boolean;
}

type SpreadType = 'one-card' | 'three-card' | 'celtic-cross';

interface TarotToolProps {
  onBack: () => void;
}

const CELTIC_CROSS_POSITIONS = [
  { label: "The Present", description: "Your current situation and state of mind." },
  { label: "The Challenge", description: "The immediate obstacle or crossing influence." },
  { label: "The Conscious", description: "What you are focusing on or aiming for." },
  { label: "The Subconscious", description: "Underlying feelings or hidden influences." },
  { label: "The Past", description: "Recent events that led to the current situation." },
  { label: "The Future", description: "What is likely to happen next." },
  { label: "Advice", description: "Suggested action or approach to take." },
  { label: "Environment", description: "External factors and people's influence." },
  { label: "Hopes & Fears", description: "Your internal expectations and anxieties." },
  { label: "The Outcome", description: "The final result if current path continues." }
];

const THREE_CARD_POSITIONS = [
  { label: "Past", description: "The foundation or history of the situation." },
  { label: "Present", description: "The current energy and immediate focus." },
  { label: "Future", description: "The potential outcome or next phase." }
];

const ONE_CARD_POSITIONS = [
  { label: "Insight", description: "The core message or singular focus for the inquiry." }
];

export const TarotTool: React.FC<TarotToolProps> = ({ onBack }) => {
  const { 
    dreams, quotes, moodLogs, horaryHistory, synchronicityHistory, akashicHistory,
    removeDream, removeQuote, removeMoodLog, removeHoraryEntry, removeSynchronicityEntry, removeAkashicEntry,
    addTarotEntry
  } = useSyllabusStore();

  const { triggerClick, triggerSuccess } = useHaptics();
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [question, setQuestion] = useState('');
  const [spread, setSpread] = useState<SpreadType>('one-card');
  const [showSpreadMenu, setShowSpreadMenu] = useState(false);
  const [synthesis, setSynthesis] = useState<string | null>(null);
  const [cardInterpretations, setCardInterpretations] = useState<string[]>([]);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const drawCards = async () => {
    triggerClick();
    if (!question.trim()) {
      return;
    }
    setIsDrawing(true);
    setDrawnCards([]);
    setSynthesis(null);
    setCardInterpretations([]);
    
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
      const positions = spread === 'one-card' ? ONE_CARD_POSITIONS : 
                        spread === 'three-card' ? THREE_CARD_POSITIONS : 
                        CELTIC_CROSS_POSITIONS;

      const cardsForAI = selected.map((c, i) => ({
        name: c.name,
        isReversed: c.isReversed,
        position: positions[i].label,
        description: positions[i].description
      }));
      
      const result = await geminiService.interpretTarot(question, spread, cardsForAI);
      setSynthesis(result.synthesis);
      setCardInterpretations(result.cardInterpretations);

      // Archive the reading
      addTarotEntry({
        question,
        spread,
        synthesis: result.synthesis,
        cards: selected.map((c, i) => ({
          name: c.name,
          isReversed: c.isReversed,
          position: positions[i].label
        }))
      });
    } catch (error) {
      console.error("Tarot synthesis failed", error);
      setSynthesis("The archive is hazy. Please try again.");
    } finally {
      setIsSynthesizing(false);
    }
  };

  const spreadLabels: Record<SpreadType, string> = {
    'one-card': 'Single Card (Insight)',
    'three-card': 'Three Cards (Past, Present, Future)',
    'celtic-cross': 'Celtic Cross (Comprehensive)'
  };

  const renderCelticCross = () => {
    return (
      <div className="relative w-full max-w-5xl mx-auto min-h-[900px] md:min-h-[750px] mt-12 mb-24">
        {/* The Cross Section */}
        <div className="absolute left-1/2 top-[350px] md:top-[350px] -translate-x-1/2 -translate-y-1/2 w-[320px] h-[480px] md:w-[400px] md:h-[550px] md:left-[35%]">
          {/* 1. Present (Center) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onMouseEnter={() => setHoveredCard(0)}
              onMouseLeave={() => setHoveredCard(null)}
              className="relative cursor-help"
            >
              <CardDisplay card={drawnCards[0]} isReversed={drawnCards[0].isReversed} className="w-24 h-40 md:w-28 md:h-44 shadow-xl" />
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className="text-[7px] font-mono opacity-40 uppercase tracking-widest bg-archive-bg px-1">{CELTIC_CROSS_POSITIONS[0].label}</span>
              </div>
            </motion.div>
          </div>

          {/* 2. Challenge (Crossing) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 rotate-90">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              onMouseEnter={() => setHoveredCard(1)}
              onMouseLeave={() => setHoveredCard(null)}
              className="relative cursor-help"
            >
              <CardDisplay card={drawnCards[1]} isReversed={drawnCards[1].isReversed} className="w-24 h-40 md:w-28 md:h-44 shadow-2xl border-2 border-archive-accent-secondary/20" />
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap -rotate-90">
                <span className="text-[7px] font-mono opacity-40 uppercase tracking-widest bg-archive-bg px-1">{CELTIC_CROSS_POSITIONS[1].label}</span>
              </div>
            </motion.div>
          </div>

          {/* 3. Conscious (Above) */}
          <div className="absolute left-1/2 top-0 -translate-x-1/2">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              onMouseEnter={() => setHoveredCard(2)}
              onMouseLeave={() => setHoveredCard(null)}
              className="relative cursor-help"
            >
              <CardDisplay card={drawnCards[2]} isReversed={drawnCards[2].isReversed} className="w-24 h-40 md:w-28 md:h-44 shadow-lg" />
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className="text-[7px] font-mono opacity-40 uppercase tracking-widest bg-archive-bg px-1">{CELTIC_CROSS_POSITIONS[2].label}</span>
              </div>
            </motion.div>
          </div>

          {/* 4. Subconscious (Below) */}
          <div className="absolute left-1/2 bottom-0 -translate-x-1/2">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              onMouseEnter={() => setHoveredCard(3)}
              onMouseLeave={() => setHoveredCard(null)}
              className="relative cursor-help"
            >
              <CardDisplay card={drawnCards[3]} isReversed={drawnCards[3].isReversed} className="w-24 h-40 md:w-28 md:h-44 shadow-lg" />
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className="text-[7px] font-mono opacity-40 uppercase tracking-widest bg-archive-bg px-1">{CELTIC_CROSS_POSITIONS[3].label}</span>
              </div>
            </motion.div>
          </div>

          {/* 5. Past (Left) */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              onMouseEnter={() => setHoveredCard(4)}
              onMouseLeave={() => setHoveredCard(null)}
              className="relative cursor-help"
            >
              <CardDisplay card={drawnCards[4]} isReversed={drawnCards[4].isReversed} className="w-24 h-40 md:w-28 md:h-44 shadow-lg" />
              <div className="absolute left-1/2 -bottom-6 -translate-x-1/2 whitespace-nowrap">
                <span className="text-[7px] font-mono opacity-40 uppercase tracking-widest bg-archive-bg px-1">{CELTIC_CROSS_POSITIONS[4].label}</span>
              </div>
            </motion.div>
          </div>

          {/* 6. Future (Right) */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.0 }}
              onMouseEnter={() => setHoveredCard(5)}
              onMouseLeave={() => setHoveredCard(null)}
              className="relative cursor-help"
            >
              <CardDisplay card={drawnCards[5]} isReversed={drawnCards[5].isReversed} className="w-24 h-40 md:w-28 md:h-44 shadow-lg" />
              <div className="absolute left-1/2 -bottom-6 -translate-x-1/2 whitespace-nowrap">
                <span className="text-[7px] font-mono opacity-40 uppercase tracking-widest bg-archive-bg px-1">{CELTIC_CROSS_POSITIONS[5].label}</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* The Staff Section (Vertical Line) */}
        <div className="absolute left-1/2 top-[800px] md:top-1/2 md:left-[85%] -translate-x-1/2 md:-translate-y-1/2 flex flex-col-reverse gap-6 md:gap-8">
          {[6, 7, 8, 9].map((idx, i) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2 + (i * 0.2) }}
              onMouseEnter={() => setHoveredCard(idx)}
              onMouseLeave={() => setHoveredCard(null)}
              className="relative cursor-help"
            >
              <CardDisplay card={drawnCards[idx]} isReversed={drawnCards[idx].isReversed} className="w-20 h-32 md:w-28 md:h-44 shadow-lg border border-archive-line/10" />
              <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 whitespace-nowrap hidden md:block">
                <span className="text-[8px] font-mono opacity-40 uppercase tracking-widest">{CELTIC_CROSS_POSITIONS[idx].label}</span>
              </div>
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap md:hidden">
                <span className="text-[7px] font-mono opacity-40 uppercase tracking-widest">{CELTIC_CROSS_POSITIONS[idx].label}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Hover Interpretation Tooltip */}
        <AnimatePresence>
          {hoveredCard !== null && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[200] w-[90%] max-w-lg bg-white/95 backdrop-blur-md border-2 border-archive-accent-secondary p-8 shadow-[0_20px_50px_rgba(0,0,0,0.2)] rounded-2xl pointer-events-none"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-archive-line/20 pb-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono text-archive-accent-secondary uppercase tracking-[0.3em] font-bold">{CELTIC_CROSS_POSITIONS[hoveredCard].label}</span>
                    <span className="text-[9px] font-mono opacity-40 uppercase tracking-widest">{CELTIC_CROSS_POSITIONS[hoveredCard].description}</span>
                  </div>
                  <div className={`px-2 py-1 rounded text-[9px] font-mono uppercase tracking-widest ${drawnCards[hoveredCard].isReversed ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {drawnCards[hoveredCard].isReversed ? 'Reversed' : 'Upright'}
                  </div>
                </div>
                
                <div className="flex gap-4 items-start">
                  <div className="flex-1">
                    <h3 className="text-2xl font-serif italic mb-2">{drawnCards[hoveredCard].name}</h3>
                    <div className="text-sm leading-relaxed text-archive-ink font-serif italic markdown-body">
                      <Markdown>{cardInterpretations[hoveredCard] || (drawnCards[hoveredCard].isReversed ? drawnCards[hoveredCard].reversedMeaning : drawnCards[hoveredCard].uprightMeaning)}</Markdown>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 mt-4 border-t border-archive-line/10 flex justify-between items-center">
                  <span className="text-[8px] font-mono opacity-30 uppercase">Archetypal Resonance: {drawnCards[hoveredCard].arcana} Arcana</span>
                  <Sparkles className="text-archive-accent-secondary opacity-30 w-3 h-3" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <ToolLayout
      title="Tarot Reading"
      subtitle="Archetypal insights for your situation."
      onBack={onBack}
      tooltipTitle="About Tarot"
      tooltipContent="Tarot uses archetypal imagery to reflect your internal state."
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
                className="w-full p-4 bg-archive-bg border border-archive-line italic text-lg outline-none focus:border-archive-accent-secondary shadow-sm min-h-[120px] resize-none"
              />
            </div>

            <button 
              onClick={drawCards}
              disabled={isDrawing || !question.trim()}
              className={`brutalist-button w-full py-5 text-xl transition-all ${isDrawing || !question.trim() ? "opacity-30" : "!bg-archive-accent-secondary text-white"}`}
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
                      <Loader2 className="w-6 h-6 animate-spin opacity-20" />
                    </div>
                  ))}
                </div>
                <p className="handwritten text-lg text-archive-accent-secondary animate-pulse uppercase tracking-[0.3em]">Analyzing...</p>
              </motion.div>
            ) : drawnCards.length > 0 ? (
              <motion.div 
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-16"
              >
                <div className={`flex flex-wrap justify-center gap-8 ${spread === 'celtic-cross' ? 'hidden' : ''}`}>
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
                        <span className="text-[9px] font-mono text-archive-accent-secondary uppercase">{card.isReversed ? 'Reversed' : 'Upright'}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {spread === 'celtic-cross' && renderCelticCross()}

                <div className="space-y-8 max-w-3xl mx-auto">
                  {isSynthesizing ? (
                    <div className="archive-card p-10 flex flex-col items-center gap-4">
                      <Loader2 className="w-6 h-6 animate-spin text-archive-accent-secondary opacity-20" />
                      <span className="handwritten text-archive-accent-secondary animate-pulse uppercase tracking-widest">Analyzing...</span>
                    </div>
                  ) : synthesis && (
                    <div className="archive-card p-10 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-[0.02] select-none pointer-events-none text-9xl italic">SYN</div>
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-archive-line pb-4">
                          <Zap className="text-archive-accent-secondary w-5 h-5" />
                          <span className="text-[10px] font-mono text-archive-accent-secondary uppercase tracking-[0.3em] font-bold">Result</span>
                        </div>
                        <div className="font-serif italic text-2xl leading-relaxed text-archive-ink markdown-body">
                          <Markdown>{synthesis}</Markdown>
                        </div>
                      </div>
                    </div>
                  )}

                  {drawnCards.map((card, idx) => {
                    const positions = spread === 'one-card' ? ONE_CARD_POSITIONS : 
                                      spread === 'three-card' ? THREE_CARD_POSITIONS : 
                                      CELTIC_CROSS_POSITIONS;
                    const interpretation = cardInterpretations[idx] || (card.isReversed ? card.reversedMeaning : card.uprightMeaning);
                    
                    return (
                      <div key={`meaning-${idx}`} className="archive-card p-8 space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-mono text-archive-accent-secondary uppercase tracking-widest">{card.arcana} arcana</span>
                            <h2 className="text-3xl font-serif italic mt-1">{card.name} {card.isReversed && <span className="text-sm opacity-40">(Reversed)</span>}</h2>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className="text-[10px] font-mono opacity-30 uppercase tracking-widest">
                              {positions[idx].label}
                            </span>
                            <ReadAloudButton text={interpretation} className="!p-1 !h-auto !w-auto !bg-transparent !border-none !shadow-none opacity-20 hover:opacity-100" />
                          </div>
                        </div>
                        <div className="font-serif italic text-xl leading-relaxed text-archive-ink border-l-2 border-archive-line pl-6 markdown-body">
                          <Markdown>{`"${interpretation}"`}</Markdown>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <ResultSection
                  id="tarot-reading-content"
                  type="Tarot Reading"
                  title="Archive Entry"
                  content={`Spread: ${spread}\nInquiry: ${question}\n\nSynthesis: ${synthesis}\n\nCards:\n${drawnCards.map((c, i) => `${c.name} (${c.isReversed ? 'Reversed' : 'Upright'}) - ${cardInterpretations[i] || 'No interpretation'}`).join('\n\n')}`}
                  exportName={`tarot-${spread}`}
                  onClose={() => setDrawnCards([])}
                  metadata={{ question, spread, cards: drawnCards.map(c => c.name) }}
                />
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center py-40 opacity-[0.03] select-none pointer-events-none"
              >
                <Layout className="w-32 h-32" />
                <p className="handwritten text-4xl uppercase tracking-[0.4em] mt-8">Enter a question</p>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </ToolLayout>
  );
};
