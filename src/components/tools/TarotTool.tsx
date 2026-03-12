import React, { useState } from 'react';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, RefreshCw, Layers, ChevronDown, Zap, Loader2 } from 'lucide-react';
import { TAROT_CARDS, TarotCard } from '../../data/tarotData';
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
      <div className="relative w-full max-w-5xl mx-auto min-h-[1000px] md:min-h-[800px] mt-12">
        {/* The Cross */}
        <div className="absolute left-1/2 top-[400px] md:top-[350px] -translate-x-1/2 -translate-y-1/2 w-[400px] h-[500px] md:left-[35%]">
          {/* 1. Present */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div 
              onMouseEnter={() => setHoveredCard(0)}
              onMouseLeave={() => setHoveredCard(null)}
              className="relative"
            >
              <CardDisplay card={drawnCards[0]} isReversed={drawnCards[0].isReversed} className="w-24 h-40 md:w-28 md:h-44" />
              <div className="text-center mt-2">
                <span className="text-[8px] font-mono opacity-40 uppercase tracking-widest">{CELTIC_CROSS_POSITIONS[0].label}</span>
              </div>
            </div>
          </div>

          {/* 2. Challenge (Horizontal) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 rotate-90">
            <div 
              onMouseEnter={() => setHoveredCard(1)}
              onMouseLeave={() => setHoveredCard(null)}
              className="relative"
            >
              <CardDisplay card={drawnCards[1]} isReversed={drawnCards[1].isReversed} className="w-24 h-40 md:w-28 md:h-44" />
              <div className="text-center mt-2 -rotate-90">
                <span className="text-[8px] font-mono opacity-40 uppercase tracking-widest">{CELTIC_CROSS_POSITIONS[1].label}</span>
              </div>
            </div>
          </div>

          {/* 3. Conscious (Above) */}
          <div className="absolute left-1/2 top-0 -translate-x-1/2">
            <div 
              onMouseEnter={() => setHoveredCard(2)}
              onMouseLeave={() => setHoveredCard(null)}
              className="relative"
            >
              <CardDisplay card={drawnCards[2]} isReversed={drawnCards[2].isReversed} className="w-24 h-40 md:w-28 md:h-44" />
              <div className="text-center mt-2">
                <span className="text-[8px] font-mono opacity-40 uppercase tracking-widest">{CELTIC_CROSS_POSITIONS[2].label}</span>
              </div>
            </div>
          </div>

          {/* 4. Subconscious (Below) */}
          <div className="absolute left-1/2 bottom-0 -translate-x-1/2">
            <div 
              onMouseEnter={() => setHoveredCard(3)}
              onMouseLeave={() => setHoveredCard(null)}
              className="relative"
            >
              <CardDisplay card={drawnCards[3]} isReversed={drawnCards[3].isReversed} className="w-24 h-40 md:w-28 md:h-44" />
              <div className="text-center mt-2">
                <span className="text-[8px] font-mono opacity-40 uppercase tracking-widest">{CELTIC_CROSS_POSITIONS[3].label}</span>
              </div>
            </div>
          </div>

          {/* 5. Past (Left) */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2">
            <div 
              onMouseEnter={() => setHoveredCard(4)}
              onMouseLeave={() => setHoveredCard(null)}
              className="relative"
            >
              <CardDisplay card={drawnCards[4]} isReversed={drawnCards[4].isReversed} className="w-24 h-40 md:w-28 md:h-44" />
              <div className="text-center mt-2">
                <span className="text-[8px] font-mono opacity-40 uppercase tracking-widest">{CELTIC_CROSS_POSITIONS[4].label}</span>
              </div>
            </div>
          </div>

          {/* 6. Future (Right) */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2">
            <div 
              onMouseEnter={() => setHoveredCard(5)}
              onMouseLeave={() => setHoveredCard(null)}
              className="relative"
            >
              <CardDisplay card={drawnCards[5]} isReversed={drawnCards[5].isReversed} className="w-24 h-40 md:w-28 md:h-44" />
              <div className="text-center mt-2">
                <span className="text-[8px] font-mono opacity-40 uppercase tracking-widest">{CELTIC_CROSS_POSITIONS[5].label}</span>
              </div>
            </div>
          </div>
        </div>

        {/* The Staff */}
        <div className="absolute left-1/2 top-[850px] md:top-1/2 md:left-[80%] -translate-x-1/2 md:-translate-y-1/2 flex flex-col gap-8">
          {[9, 8, 7, 6].map((idx) => (
            <div 
              key={idx}
              onMouseEnter={() => setHoveredCard(idx)}
              onMouseLeave={() => setHoveredCard(null)}
              className="relative"
            >
              <CardDisplay card={drawnCards[idx]} isReversed={drawnCards[idx].isReversed} className="w-24 h-40 md:w-28 md:h-44" />
              <div className="text-center mt-2">
                <span className="text-[8px] font-mono opacity-40 uppercase tracking-widest">{CELTIC_CROSS_POSITIONS[idx].label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Hover Interpretation Tooltip */}
        <AnimatePresence>
          {hoveredCard !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md bg-white border border-archive-line p-6 shadow-2xl rounded-xl pointer-events-none"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono text-archive-accent uppercase tracking-widest">{CELTIC_CROSS_POSITIONS[hoveredCard].label}</span>
                  <span className="text-[10px] font-mono opacity-40 uppercase">{drawnCards[hoveredCard].isReversed ? 'Reversed' : 'Upright'}</span>
                </div>
                <h3 className="text-xl font-serif italic">{drawnCards[hoveredCard].name}</h3>
                <p className="text-xs opacity-60 italic mb-2">{CELTIC_CROSS_POSITIONS[hoveredCard].description}</p>
                <div className="h-px bg-archive-line opacity-20 my-2" />
                <p className="text-sm leading-relaxed">
                  {cardInterpretations[hoveredCard] || (drawnCards[hoveredCard].isReversed ? drawnCards[hoveredCard].reversedMeaning : drawnCards[hoveredCard].uprightMeaning)}
                </p>
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
                <p className="handwritten text-lg text-archive-accent animate-pulse uppercase tracking-[0.3em]">Analyzing...</p>
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
                        <span className="text-[9px] font-mono text-archive-accent uppercase">{card.isReversed ? 'Reversed' : 'Upright'}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {spread === 'celtic-cross' && renderCelticCross()}

                <div className="space-y-8 max-w-3xl mx-auto">
                  {isSynthesizing ? (
                    <div className="archive-card p-10 flex flex-col items-center gap-4">
                      <Loader2 className="w-8 h-8 animate-spin text-archive-accent opacity-20" />
                      <span className="handwritten text-archive-accent animate-pulse uppercase tracking-widest">Analyzing...</span>
                    </div>
                  ) : synthesis && (
                    <div className="archive-card p-10 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-[0.02] select-none pointer-events-none text-9xl italic">SYN</div>
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-archive-line pb-4">
                          <Zap className="text-archive-accent w-4 h-4" />
                          <span className="text-[10px] font-mono text-archive-accent uppercase tracking-[0.3em] font-bold">Result</span>
                        </div>
                        <p className="font-serif italic text-2xl leading-relaxed text-archive-ink">
                          "{synthesis}"
                        </p>
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
                            <span className="text-[10px] font-mono text-archive-accent uppercase tracking-widest">{card.arcana} arcana</span>
                            <h2 className="text-3xl font-serif italic mt-1">{card.name} {card.isReversed && <span className="text-sm opacity-40">(Reversed)</span>}</h2>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className="text-[10px] font-mono opacity-30 uppercase tracking-widest">
                              {positions[idx].label}
                            </span>
                            <ReadAloudButton text={interpretation} className="!p-1 !h-auto !w-auto !bg-transparent !border-none !shadow-none opacity-20 hover:opacity-100" />
                          </div>
                        </div>
                        <div className="font-serif italic text-xl leading-relaxed text-archive-ink border-l-2 border-archive-line pl-6">
                          <Markdown>{`"${interpretation}"`}</Markdown>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <ResultSection
                  id="tarot-reading-content"
                  title="Archive Entry"
                  content={`Spread: ${spread}\nInquiry: ${question}\n\nSynthesis: ${synthesis}\n\nCards:\n${drawnCards.map((c, i) => `${c.name} (${c.isReversed ? 'Reversed' : 'Upright'}) - ${cardInterpretations[i] || 'No interpretation'}`).join('\n\n')}`}
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
                <p className="handwritten text-4xl uppercase tracking-[0.4em] mt-8">Enter a question</p>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </ToolLayout>
  );
};
