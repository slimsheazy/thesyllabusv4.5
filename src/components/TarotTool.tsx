import React, { useState } from 'react';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, RefreshCw, Layers, Share2, Download, HelpCircle, ChevronDown, Volume2, FileText, Image as ImageIcon } from 'lucide-react';
import { TAROT_CARDS, TarotCard } from '../data/tarotData';
import { useHaptics } from '../hooks/useHaptics';
import { CardDisplay } from './Tarot/CardDisplay';
import { ReadAloudButton } from './ReadAloudButton';
import { exportAsImage, exportAsPDF } from '../utils/exportUtils';

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
  const [question, setQuestion] = useState('');
  const [spread, setSpread] = useState<SpreadType>('one-card');
  const [showSpreadMenu, setShowSpreadMenu] = useState(false);

  const handleShare = async () => {
    triggerClick();
    if (drawnCards.length === 0) return;
    const text = drawnCards.map(c => `${c.name} (${c.isReversed ? 'Reversed' : 'Upright'}): "${c.isReversed ? c.reversedMeaning : c.uprightMeaning}"`).join('\n');
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Tarot Reading',
          text: `My Tarot Reading for: "${question}"\n\n${text}`,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      navigator.clipboard.writeText(`My Tarot Reading for: "${question}"\n\n${text}`);
      alert('Link copied to clipboard!');
    }
  };

  const handleDownload = () => {
    triggerClick();
    if (drawnCards.length === 0) return;
    const text = drawnCards.map(c => `Card: ${c.name}\nArcana: ${c.arcana}\nOrientation: ${c.isReversed ? 'Reversed' : 'Upright'}\nMeaning: ${c.isReversed ? c.reversedMeaning : c.uprightMeaning}`).join('\n\n');
    const content = `Tarot Reading\nQuestion: ${question}\nSpread: ${spread}\n\n${text}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tarot-reading-${spread}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const drawCards = () => {
    triggerClick();
    if (!question.trim()) {
      alert("Please state your question before drawing cards.");
      return;
    }
    setIsDrawing(true);
    setDrawnCards([]);
    
    const numCards = spread === 'one-card' ? 1 : spread === 'three-card' ? 3 : 10;
    
    setTimeout(() => {
      const shuffled = [...TAROT_CARDS].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, numCards).map(card => ({
        ...card,
        isReversed: Math.random() > 0.7 // 30% chance of reversal
      }));
      setDrawnCards(selected);
      setIsDrawing(false);
      triggerSuccess();
    }, 1500);
  };

  const spreadLabels: Record<SpreadType, string> = {
    'one-card': 'Single Card (Insight)',
    'three-card': 'Three Cards (Past, Present, Future)',
    'celtic-cross': 'Celtic Cross (Comprehensive)'
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-archive-bg">
      <header className="border-b border-archive-line p-6 flex items-center justify-between bg-archive-bg">
        <div className="flex items-center gap-8">
          <button onClick={onBack} className="text-xs font-mono opacity-40 hover:opacity-100 transition-opacity">BACK</button>
          <h1 className="font-serif italic text-2xl tracking-tight">Tarot Reading</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <button 
              onClick={() => setShowSpreadMenu(!showSpreadMenu)}
              className="flex items-center gap-2 border border-archive-line px-4 py-2 text-[10px] font-mono hover:bg-archive-line transition-all"
            >
              <span>SPREAD: {spread.toUpperCase().replace('-', ' ')}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showSpreadMenu ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {showSpreadMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full right-0 mt-2 w-64 bg-white border border-archive-line shadow-xl z-50 overflow-hidden"
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

          <button 
            onClick={drawCards}
            disabled={isDrawing || !question.trim()}
            className="flex items-center gap-2 bg-archive-ink text-archive-bg px-4 py-2 text-sm font-mono hover:opacity-90 transition-opacity disabled:opacity-20"
          >
            <Layers className={`w-4 h-4 ${isDrawing ? 'animate-spin' : ''}`} />
            <span>{isDrawing ? 'DRAWING...' : 'DRAW CARDS'}</span>
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Question Input */}
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="flex items-center gap-2 opacity-40">
              <HelpCircle className="w-4 h-4" />
              <span className="text-[10px] font-mono uppercase tracking-widest">Your Inquiry</span>
            </div>
            <textarea 
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What do you seek to understand?"
              className="w-full bg-transparent border-b border-archive-line p-4 font-serif italic text-3xl outline-none focus:border-archive-accent transition-colors resize-none text-center"
              rows={2}
            />
            <p className="text-[9px] font-mono opacity-30 text-center uppercase tracking-widest">A question is mandatory to consult the cards.</p>
          </div>

          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <AnimatePresence mode="wait">
              {drawnCards.length === 0 && !isDrawing && (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8 text-center"
                >
                  <div className="w-32 h-32 mx-auto border border-archive-line flex items-center justify-center rounded-full opacity-20">
                    <Sparkles className="w-12 h-12" />
                  </div>
                  <div>
                    <h2 className="text-4xl font-serif italic mb-4">Tarot Analysis</h2>
                    <p className="handwritten text-lg opacity-60">Focus on your situation and draw cards for reflection.</p>
                  </div>
                </motion.div>
              )}

              {isDrawing && (
                <motion.div 
                  key="drawing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-8"
                >
                  <div className="flex gap-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-32 h-52 border border-archive-line bg-archive-ink/5 animate-pulse flex items-center justify-center">
                        <RefreshCw className="w-6 h-6 animate-spin opacity-20" />
                      </div>
                    ))}
                  </div>
                  <p className="data-value opacity-40 uppercase tracking-[0.3em]">consulting the chronicle...</p>
                </motion.div>
              )}

              {drawnCards.length > 0 && (
                <motion.div 
                  id="tarot-reading-content"
                  key="result"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full space-y-16 bg-archive-bg p-8 rounded-xl"
                >
                  {/* Spread Layout */}
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

                  {/* Meanings */}
                  <div className="max-w-3xl mx-auto space-y-8">
                    {drawnCards.map((card, idx) => (
                      <div key={`meaning-${idx}`} className="p-8 border border-archive-line bg-white shadow-sm space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="data-value text-archive-accent uppercase tracking-widest text-[10px]">{card.arcana} arcana</span>
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

                    <div className="pt-8 flex flex-wrap justify-center gap-8 border-t border-archive-line">
                      <button 
                        onClick={drawCards}
                        className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40 hover:opacity-100 hover:text-archive-accent transition-all flex items-center gap-2"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Draw again
                      </button>
                      <button 
                        onClick={handleShare}
                        className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40 hover:opacity-100 hover:text-archive-accent transition-all flex items-center gap-2"
                      >
                        <Share2 className="w-3 h-3" />
                        Share reading
                      </button>
                      <button 
                        onClick={() => exportAsPDF('tarot-reading-content', `tarot-${spread}`)}
                        className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40 hover:opacity-100 hover:text-archive-accent transition-all flex items-center gap-2"
                      >
                        <FileText className="w-3 h-3" />
                        Export PDF
                      </button>
                      <button 
                        onClick={() => exportAsImage('tarot-reading-content', `tarot-${spread}`)}
                        className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40 hover:opacity-100 hover:text-archive-accent transition-all flex items-center gap-2"
                      >
                        <ImageIcon className="w-3 h-3" />
                        Export Image
                      </button>
                    </div>
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
