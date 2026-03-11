import React, { useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSyllabusStore } from '../store';
import { Printer, X, Download, BookOpen, Scissors, Calendar as CalendarIcon } from 'lucide-react';
import { exportAsPDF } from '../utils/exportUtils';

interface ZineGeneratorProps {
  onClose: () => void;
}

type ZineTheme = 'CLASSIC' | 'MINIMAL' | 'OCCULT';

export const ZineGenerator: React.FC<ZineGeneratorProps> = ({ onClose }) => {
  const { 
    dreams, horaryHistory, synchronicityHistory, akashicHistory, moodLogs, userIdentity 
  } = useSyllabusStore();
  const [isExporting, setIsExporting] = useState(false);
  const [theme, setTheme] = useState<ZineTheme>('CLASSIC');
  const zineRef = useRef<HTMLDivElement>(null);

  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const currentYear = new Date().getFullYear();

  const themeStyles = {
    CLASSIC: {
      bg: '#F5F2ED',
      border: 'border-black/20',
      accent: 'text-archive-accent',
      font: 'font-serif',
      pattern: 'paper-fibers'
    },
    MINIMAL: {
      bg: '#FFFFFF',
      border: 'border-zinc-200',
      accent: 'text-zinc-900',
      font: 'font-sans',
      pattern: 'none'
    },
    OCCULT: {
      bg: '#141414',
      border: 'border-white/10',
      accent: 'text-archive-accent',
      font: 'font-serif',
      pattern: 'dark-matter',
      text: 'text-archive-bg'
    }
  };

  const currentStyle = themeStyles[theme];

  const monthData = useMemo(() => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const filterByMonth = (items: any[]) => items.filter(item => {
      const date = new Date(item.date);
      return date >= firstDayOfMonth;
    });

    return {
      dreams: filterByMonth(dreams),
      readings: filterByMonth(horaryHistory),
      synchronicities: filterByMonth(synchronicityHistory),
      akashic: filterByMonth(akashicHistory),
      moods: filterByMonth(moodLogs)
    };
  }, [dreams, horaryHistory, synchronicityHistory, akashicHistory, moodLogs]);

  const handlePrint = async () => {
    setIsExporting(true);
    try {
      await exportAsPDF('zine-content', `Syllabus-Zine-${currentMonth}-${currentYear}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[4000] flex items-center justify-center p-4 sm:p-8">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-archive-ink/90 backdrop-blur-md"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-5xl h-full flex flex-col bg-archive-bg border border-archive-line shadow-2xl overflow-hidden rounded-2xl"
      >
        {/* Header */}
        <header className="p-6 border-b border-archive-line flex items-center justify-between bg-white/50 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <BookOpen className="text-archive-accent" />
            <div>
              <h2 className="font-serif italic text-xl">Personal Almanac Generator</h2>
              <div className="flex gap-2 mt-1">
                {(['CLASSIC', 'MINIMAL', 'OCCULT'] as const).map(t => (
                  <button 
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`text-[8px] font-mono uppercase tracking-widest px-2 py-0.5 border transition-all ${theme === t ? 'bg-archive-ink text-archive-bg border-archive-ink' : 'border-archive-line opacity-40 hover:opacity-100'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={handlePrint}
              disabled={isExporting}
              className="brutalist-button !py-2 !px-4 flex items-center gap-2 text-sm"
            >
              {isExporting ? 'Generating...' : (
                <>
                  <Printer size={16} /> Print to Zine
                </>
              )}
            </button>
            <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
        </header>

        {/* Preview Area */}
        <div className="flex-1 overflow-y-auto p-12 bg-zinc-200/50 custom-scrollbar">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8 flex items-center justify-center gap-4 text-[10px] uppercase tracking-[0.3em] opacity-30">
              <Scissors size={14} /> 
              <span>Fold along the lines for the physical archive</span>
              <Scissors size={14} className="rotate-180" />
            </div>

            {/* The Zine Content */}
            <div 
              id="zine-content" 
              ref={zineRef}
              className={`shadow-2xl p-0 overflow-hidden border-[12px] border-white relative transition-colors duration-500 ${theme === 'OCCULT' ? 'text-archive-bg' : 'text-archive-ink'}`}
              style={{ 
                width: '210mm', 
                minHeight: '297mm', 
                margin: '0 auto',
                backgroundColor: currentStyle.bg,
                backgroundImage: currentStyle.pattern !== 'none' ? `url("https://www.transparenttextures.com/patterns/${currentStyle.pattern}.png")` : 'none',
                backgroundBlendMode: theme === 'OCCULT' ? 'screen' : 'multiply'
              }}
            >
              {/* Page 1: Cover */}
              <div className={`h-[148.5mm] border-b border-dashed ${currentStyle.border} p-12 flex flex-col justify-between relative`}>
                <div className="absolute top-0 right-0 p-8 opacity-5 text-9xl font-sans">☊</div>
                <div className="space-y-4">
                  <div className={`h-px w-12 ${theme === 'OCCULT' ? 'bg-archive-bg' : 'bg-archive-ink'}`} />
                  <p className="text-[10px] uppercase tracking-[0.5em] font-mono">The Syllabus Chronicle</p>
                </div>
                
                <div className="space-y-6">
                  <h1 className={`text-7xl ${currentStyle.font} italic leading-none`}>Personal<br />Almanac</h1>
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-[1px] ${theme === 'OCCULT' ? 'bg-white/10' : 'bg-archive-ink/20'}`} />
                    <div>
                      <p className="text-sm font-mono uppercase tracking-widest">{userIdentity || 'The Observer'}</p>
                      <p className="text-[10px] opacity-40 uppercase tracking-widest">{currentMonth} {currentYear}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-end">
                  <div className="text-[8px] font-mono uppercase opacity-30 leading-tight">
                    Vol. 01 • No. {new Date().getMonth() + 1}<br />
                    Archived Resonance Data
                  </div>
                  <div className={`w-16 h-16 border ${theme === 'OCCULT' ? 'border-white/10' : 'border-archive-ink/20'} flex items-center justify-center`}>
                    <span className={`text-xs ${currentStyle.font} italic`}>SYL</span>
                  </div>
                </div>
              </div>

              {/* Page 2: Summary & Moods */}
              <div className={`h-[148.5mm] border-b border-dashed ${currentStyle.border} p-12 grid grid-cols-2 gap-12`}>
                <div className={`space-y-8 border-r border-dashed ${currentStyle.border} pr-12`}>
                  <h2 className="text-xs font-mono uppercase tracking-[0.3em] border-b border-black/10 pb-2">Monthly Resonance</h2>
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <p className="text-[9px] uppercase opacity-40">Total Records</p>
                      <p className={`text-3xl ${currentStyle.font} italic`}>
                        {monthData.dreams.length + monthData.readings.length + monthData.synchronicities.length + monthData.akashic.length}
                      </p>
                    </div>
                    <div className="space-y-4">
                      <p className="text-[9px] uppercase opacity-40">Mood Frequency</p>
                      <div className="space-y-2">
                        {monthData.moods.slice(0, 5).map((m, i) => (
                          <div key={i} className="flex justify-between items-center text-[10px]">
                            <span className={`${currentStyle.font} italic`}>{m.mood}</span>
                            <span className="font-mono opacity-40">{new Date(m.date).toLocaleDateString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-8">
                  <h2 className="text-xs font-mono uppercase tracking-[0.3em] border-b border-black/10 pb-2">Observations</h2>
                  <p className="handwritten text-sm leading-relaxed opacity-80">
                    The month of {currentMonth} has been a period of significant celestial movement. 
                    The archive records {monthData.dreams.length} nocturnal visions and {monthData.readings.length} inquiries into the hidden order.
                  </p>
                  <div className="pt-8">
                    <div className={`w-full aspect-square border border-dashed ${currentStyle.border} flex items-center justify-center p-4`}>
                      <div className="text-[8px] font-mono uppercase opacity-20 text-center">
                        [ Signature / Seal ]
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Page 3: Dreams */}
              <div className={`h-[148.5mm] border-b border-dashed ${currentStyle.border} p-12`}>
                <h2 className="text-xs font-mono uppercase tracking-[0.3em] border-b border-black/10 pb-4 mb-8 flex justify-between items-center">
                  <span>Nocturnal Visions</span>
                  <span className="opacity-40">{monthData.dreams.length} Records</span>
                </h2>
                <div className="space-y-8">
                  {monthData.dreams.slice(0, 3).map((dream, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[8px] font-mono uppercase opacity-40">Vision {i + 1}</span>
                        <span className="text-[8px] font-mono opacity-40">{new Date(dream.date).toLocaleDateString()}</span>
                      </div>
                      <p className={`${currentStyle.font} italic text-sm leading-relaxed line-clamp-4`}>
                        "{dream.text}"
                      </p>
                    </div>
                  ))}
                  {monthData.dreams.length > 3 && (
                    <p className="text-[8px] font-mono uppercase opacity-20 text-center pt-4">
                      + {monthData.dreams.length - 3} additional visions recorded in the digital archive
                    </p>
                  )}
                </div>
              </div>

              {/* Page 4: Readings & Insights */}
              <div className="h-[148.5mm] p-12">
                <h2 className="text-xs font-mono uppercase tracking-[0.3em] border-b border-black/10 pb-4 mb-8">Celestial Inquiries</h2>
                <div className="space-y-10">
                  {monthData.readings.slice(0, 2).map((reading, i) => (
                    <div key={i} className="space-y-4">
                      <div className="space-y-1">
                        <p className="text-[8px] font-mono uppercase opacity-40">Inquiry: {reading.question}</p>
                        <p className={`handwritten text-sm ${currentStyle.accent}`}>Outcome: {reading.outcome}</p>
                      </div>
                      <p className="text-[10px] italic opacity-70 leading-relaxed">
                        {reading.judgment}
                      </p>
                    </div>
                  ))}
                  
                  <div className={`pt-12 border-t border-dashed ${currentStyle.border}`}>
                    <div className="flex justify-between items-end">
                      <div className="space-y-2">
                        <p className="text-[8px] font-mono uppercase opacity-40">Archive Verification</p>
                        <div className="flex gap-1">
                          {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className={`w-1 h-1 ${theme === 'OCCULT' ? 'bg-white/10' : 'bg-archive-ink/20'} rounded-full`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-[8px] font-mono uppercase opacity-20">End of Monthly Report</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <footer className="p-6 border-t border-archive-line bg-white/50 flex justify-between items-center">
          <p className="text-[10px] font-mono opacity-40">Format: A4 Booklet • 4 Pages • High Resolution</p>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 text-[10px] font-mono opacity-40">
              <Scissors size={12} /> Cut
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono opacity-40">
              <BookOpen size={12} /> Fold
            </div>
          </div>
        </footer>
      </motion.div>
    </div>
  );
};
