import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, RotateCcw, HelpCircle, Loader2, Coins } from 'lucide-react';
import { useSyllabusStore } from '../../store';
import { useHaptics } from '../../hooks/useHaptics';
import { geminiService } from '../../services/geminiService';
import { ToolLayout } from '../shared/ToolLayout';
import { ResultSection } from '../shared/ResultSection';
import { LexiconText } from '../shared/LexiconText';

interface IChingToolProps {
  onBack: () => void;
}

type LineValue = 6 | 7 | 8 | 9;

export const IChingTool: React.FC<IChingToolProps> = ({ onBack }) => {
  const { recordCalculation } = useSyllabusStore();
  const { triggerClick, triggerSuccess } = useHaptics();
  const [question, setQuestion] = useState('');
  const [lines, setLines] = useState<LineValue[]>([]);
  const [casting, setCasting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reading, setReading] = useState<any>(null);

  const castLine = () => {
    if (lines.length >= 6 || casting) return;
    
    setCasting(true);
    triggerClick();

    // Simulate 3 coins
    // Heads = 3, Tails = 2
    setTimeout(() => {
      const coins = Array.from({ length: 3 }, () => Math.random() > 0.5 ? 3 : 2);
      const sum = coins.reduce((a, b) => a + b, 0) as LineValue;
      setLines(prev => [...prev, sum]);
      setCasting(false);
    }, 600);
  };

  const handleInterpret = async () => {
    if (lines.length < 6 || !question.trim()) return;
    
    setLoading(true);
    try {
      const changingLines = lines
        .map((val, idx) => (val === 6 || val === 9 ? idx + 1 : null))
        .filter((val): val is number => val !== null);
      
      const result = await geminiService.getIChingReading(lines, changingLines, question);
      setReading(result);
      recordCalculation();
      triggerSuccess();
    } catch (error) {
      console.error("I-Ching error:", error);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setLines([]);
    setReading(null);
    setQuestion('');
  };

  const renderLine = (val: LineValue, index: number) => {
    const isChanging = val === 6 || val === 9;
    const isYang = val === 7 || val === 9;
    
    return (
      <motion.div 
        key={index}
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        className="relative h-4 w-full max-w-[200px] flex items-center justify-center"
      >
        {isYang ? (
          <div className={`h-full w-full bg-archive-ink ${isChanging ? 'opacity-100' : 'opacity-80'}`} />
        ) : (
          <div className="h-full w-full flex gap-4">
            <div className={`h-full flex-1 bg-archive-ink ${isChanging ? 'opacity-100' : 'opacity-80'}`} />
            <div className={`h-full flex-1 bg-archive-ink ${isChanging ? 'opacity-100' : 'opacity-80'}`} />
          </div>
        )}
        {isChanging && (
          <div className="absolute -right-8 top-1/2 -translate-y-1/2">
            <div className="w-2 h-2 rounded-full bg-archive-accent animate-pulse" />
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <ToolLayout
      title="I Ching"
      subtitle="The Book of Changes"
      onBack={onBack}
      tooltipTitle="The Oracle of Changes"
      tooltipContent="An ancient Chinese divination system based on the interaction of Yin and Yang. Six lines form a hexagram, representing the current state and its potential transformation."
    >
      <div className="w-full flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
        <aside className="w-full lg:w-[400px] space-y-8 lg:sticky lg:top-20">
          <div className="archive-card p-6 animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="archive-form-group">
              <label className="archive-label">The Inquiry</label>
              <textarea 
                placeholder="What is the nature of this moment?" 
                className="archive-input min-h-[100px] resize-none"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
            </div>

            <div className="mt-8 space-y-6">
              <div className="flex flex-col-reverse items-center gap-3 min-h-[160px] border-y border-archive-line py-6">
                {lines.map((val, idx) => renderLine(val, idx))}
                {lines.length === 0 && !casting && (
                  <div className="h-full flex flex-col items-center justify-center opacity-20 italic font-serif text-sm">
                    The hexagram is empty.
                  </div>
                )}
                {casting && (
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.5, ease: "linear" }}
                  >
                    <Coins className="w-8 h-8 opacity-40" />
                  </motion.div>
                )}
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest opacity-40">
                <span>Lines Cast: {lines.length}/6</span>
                {lines.length > 0 && (
                  <button onClick={() => setLines([])} className="hover:text-archive-accent transition-colors">Reset Lines</button>
                )}
              </div>

              <button 
                onClick={castLine}
                disabled={lines.length >= 6 || casting}
                className={`brutalist-button w-full py-5 text-xl flex items-center justify-center gap-3 ${lines.length >= 6 || casting ? "opacity-30" : ""}`}
              >
                {casting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Coins className="w-5 h-5" />}
                {lines.length === 0 ? "CAST FIRST LINE" : lines.length < 6 ? "CAST NEXT LINE" : "HEXAGRAM COMPLETE"}
              </button>

              {lines.length === 6 && !reading && (
                <button 
                  onClick={handleInterpret}
                  disabled={loading || !question.trim()}
                  className={`brutalist-button w-full py-5 text-xl bg-archive-accent text-white border-archive-accent ${loading || !question.trim() ? "opacity-30" : ""}`}
                >
                  {loading ? "CONSULTING..." : "INTERPRET HEXAGRAM"}
                </button>
              )}
            </div>
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
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sun className="w-6 h-6 opacity-20" />
                  </div>
                </div>
                <span className="handwritten text-lg text-archive-accent animate-pulse uppercase tracking-[0.3em]">Consulting the Book of Changes...</span>
              </motion.div>
            ) : reading ? (
              <motion.div 
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-12"
              >
                <ResultSection
                  id="iching-reading-content"
                  title={`Hexagram ${reading.hexagramNumber}: ${reading.hexagramName}`}
                  content={reading.synthesis}
                  exportName={`iching-${reading.hexagramNumber}`}
                  onClose={reset}
                  type="I_CHING"
                  metadata={{ question, lines, reading }}
                >
                  <div className="space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div className="space-y-6">
                        <div className="flex items-center gap-2 border-b border-archive-line pb-2">
                          <HelpCircle className="w-3 h-3 opacity-40" />
                          <h3 className="col-header">The Judgment</h3>
                        </div>
                        <div className="handwritten text-xl italic leading-relaxed text-archive-ink/80">
                          <LexiconText>{reading.judgment}</LexiconText>
                        </div>
                      </div>
                      <div className="space-y-6">
                        <div className="flex items-center gap-2 border-b border-archive-line pb-2">
                          <HelpCircle className="w-3 h-3 opacity-40" />
                          <h3 className="col-header">The Image</h3>
                        </div>
                        <div className="handwritten text-xl italic leading-relaxed text-archive-ink/80">
                          <LexiconText>{reading.image}</LexiconText>
                        </div>
                      </div>
                    </div>

                    {reading.changingLinesInterpretation.length > 0 && (
                      <div className="space-y-6">
                        <div className="flex items-center gap-2 border-b border-archive-line pb-2">
                          <RotateCcw className="w-3 h-3 opacity-40" />
                          <h3 className="col-header">Changing Lines & Transformation</h3>
                        </div>
                        <div className="space-y-4">
                          {reading.changingLinesInterpretation.map((line: string, i: number) => (
                            <div key={i} className="handwritten text-lg italic border-l-2 border-archive-accent pl-6 py-2">
                              <LexiconText>{line}</LexiconText>
                            </div>
                          ))}
                        </div>
                        {reading.transformedHexagramName && (
                          <div className="mt-8 p-6 bg-archive-ink/5 border border-archive-line rounded-xl">
                            <span className="text-[10px] font-mono uppercase tracking-widest opacity-40 block mb-2">Transformed Hexagram</span>
                            <h4 className="font-serif italic text-2xl">
                              {reading.transformedHexagramNumber}: {reading.transformedHexagramName}
                            </h4>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="space-y-6">
                      <div className="flex items-center gap-2 border-b border-archive-line pb-2">
                        <Sun className="w-3 h-3 opacity-40" />
                        <h3 className="col-header">Synthesis</h3>
                      </div>
                      <div className="font-serif italic text-2xl leading-relaxed text-archive-ink markdown-body">
                        <LexiconText>{reading.synthesis}</LexiconText>
                      </div>
                    </div>
                  </div>
                </ResultSection>
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center py-40 opacity-[0.03] select-none pointer-events-none"
              >
                <Coins className="w-32 h-32" />
                <p className="handwritten text-4xl uppercase tracking-[0.4em] mt-8">Awaiting Resonance</p>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </ToolLayout>
  );
};
