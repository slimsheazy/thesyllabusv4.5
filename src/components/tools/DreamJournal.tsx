import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Moon, Save, Trash2, RefreshCw, Search, Calendar, Filter, X, Sparkles, Loader2, FileText, Image as ImageIcon, Volume2, Archive } from 'lucide-react';
import { useSyllabusStore } from '../../store';
import { geminiService } from '../../services/geminiService';
import { useHaptics } from '../../hooks/useHaptics';
import { useProfile } from '../../hooks/useProfile';
import { exportAsImage, exportAsPDF } from '../../utils/exportUtils';
import { ReadAloudButton } from '../shared/ReadAloudButton';
import { ToolLayout } from '../shared/ToolLayout';
import { ResultSection } from '../shared/ResultSection';
import { ProfileSelector } from '../shared/ProfileSelector';
import Markdown from 'react-markdown';

interface DreamJournalProps {
  onBack: () => void;
}

export const DreamJournal: React.FC<DreamJournalProps> = ({ onBack }) => {
  const { triggerClick, triggerSuccess, triggerTick } = useHaptics();
  const { profile, setMe, setSomeoneElse, updateProfile } = useProfile();
  const { 
    dreams, addDream, removeDream, visibleDreamsCount, 
    loadMoreDreams: storeLoadMore, resetVisibleDreams, 
    recordCalculation 
  } = useSyllabusStore();

  const [currentDream, setCurrentDream] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [interpreting, setInterpreting] = useState(false);
  const [interpretation, setInterpretation] = useState<string | null>(null);

  useEffect(() => {
    resetVisibleDreams();
  }, [resetVisibleDreams]);

  const interpretDream = async () => {
    if (!currentDream) return;
    triggerClick();
    setInterpreting(true);
    setInterpretation(null);
    
    try {
      const text = await geminiService.interpretDream(currentDream, profile);
      setInterpretation(text);
      recordCalculation();
      triggerSuccess();
    } catch (error) {
      console.error("Error interpreting dream:", error);
      setInterpretation("The symbols are veiled. Reflect on the feeling of the dream rather than the images.");
    } finally {
      setInterpreting(false);
    }
  };

  const saveDream = () => {
    if (!currentDream) return;
    triggerSuccess();
    const textToSave = interpretation 
      ? `${currentDream}\n\n[INTERPRETATION]\n${interpretation}`
      : currentDream;
    addDream(textToSave);
    setCurrentDream('');
    setInterpretation(null);
  };

  const filteredDreams = useMemo(() => {
    return dreams.filter(dream => {
      const matchesSearch = dream.text.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDate = !dateFilter || dream.date === new Date(dateFilter).toLocaleDateString();
      return matchesSearch && matchesDate;
    });
  }, [dreams, searchTerm, dateFilter]);

  const paginatedDreams = useMemo(() => {
    return filteredDreams.slice(0, visibleDreamsCount);
  }, [filteredDreams, visibleDreamsCount]);

  const clearFilters = () => {
    triggerClick();
    setSearchTerm('');
    setDateFilter('');
  };

  return (
    <ToolLayout
      title="The Dream Journal"
      subtitle="Recording the visions of the nocturnal archive"
      onBack={onBack}
      tooltipTitle="Dream Analysis"
      tooltipContent="A space to record and analyze your dreams using Jungian archetypes and esoteric symbolism. The subconscious speaks in symbols."
    >
      <div className="w-full flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
        <aside className="w-full lg:w-[400px] space-y-8 lg:sticky lg:top-20">
          <div className="archive-card p-6 animate-in fade-in slide-in-from-left-4 duration-300">
            <ProfileSelector 
              isMe={profile.isMe}
              onMe={setMe}
              onSomeoneElse={setSomeoneElse}
            />

            <div className="archive-form-group mt-6">
              <label className="archive-label">The Vision</label>
              <textarea 
                value={currentDream}
                onChange={(e) => setCurrentDream(e.target.value)}
                placeholder="What did you see? What did you feel?"
                className="archive-input min-h-[200px] !italic !text-lg resize-none"
              />
            </div>

            <div className="flex flex-col gap-3 mt-6">
              <button 
                onClick={interpretDream}
                disabled={!currentDream || interpreting}
                className={`brutalist-button w-full py-4 text-lg flex items-center justify-center gap-3 transition-all ${!currentDream || interpreting ? "opacity-30" : ""}`}
              >
                {interpreting ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
                {interpreting ? 'DECODING...' : 'INTERPRET DREAM'}
              </button>
              <button 
                onClick={saveDream}
                disabled={!currentDream}
                className={`w-full py-4 border border-archive-line text-[10px] font-mono uppercase tracking-widest hover:bg-archive-ink hover:text-archive-bg transition-all rounded-archive ${!currentDream ? "opacity-30" : ""}`}
              >
                <Save size={14} className="inline mr-2" /> Record Without Interpretation
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-1 w-full min-h-[600px] pb-32">
          <AnimatePresence mode="wait">
            {interpreting ? (
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
                <span className="handwritten text-lg text-archive-accent animate-pulse uppercase tracking-[0.3em]">Decoding the nocturnal resonance...</span>
              </motion.div>
            ) : interpretation ? (
              <motion.div 
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-12"
              >
                <div className="archive-card p-8 md:p-12 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.02] select-none pointer-events-none text-8xl italic">DREAM</div>
                  <div className="flex justify-between items-center mb-8 border-b border-archive-line pb-4">
                    <h3 className="col-header border-none pb-0">Interpretation</h3>
                    <ReadAloudButton text={interpretation} className="!p-1 !h-auto !w-auto !bg-transparent !border-none !shadow-none opacity-20 hover:opacity-100" />
                  </div>
                  <div className="handwritten text-xl md:text-2xl text-archive-ink leading-relaxed italic font-medium">
                    <Markdown>{interpretation}</Markdown>
                  </div>
                  <div className="mt-10 flex justify-end">
                    <button 
                      onClick={saveDream}
                      className="text-[10px] font-mono uppercase tracking-widest text-archive-accent hover:underline"
                    >
                      Save to Journal →
                    </button>
                  </div>
                </div>

                <ResultSection
                  id="dream-interpretation-content"
                  title="Archive Record"
                  content={`Dream: ${currentDream}\n\nInterpretation: ${interpretation}`}
                  exportName="dream-analysis"
                  onClose={() => setInterpretation(null)}
                />
              </motion.div>
            ) : (
              <div className="space-y-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-archive-line pb-4">
                  <div className="flex items-center gap-3">
                    <Archive size={16} className="opacity-40" />
                    <h3 className="col-header pb-0 border-none">Past Visions</h3>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" />
                      <input 
                        type="text"
                        placeholder="Search keywords..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-white border border-archive-line pl-9 pr-4 py-2 text-sm font-serif italic outline-none focus:border-archive-accent w-full md:w-48 rounded-archive"
                      />
                    </div>
                    <div className="relative">
                      <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" />
                      <input 
                        type="date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="bg-white border border-archive-line pl-9 pr-4 py-2 text-sm font-serif italic outline-none focus:border-archive-accent w-full md:w-48 rounded-archive"
                      />
                    </div>
                    {(searchTerm || dateFilter) && (
                      <button 
                        onClick={clearFilters}
                        className="text-[10px] font-mono uppercase opacity-40 hover:opacity-100 flex items-center gap-1"
                      >
                        <X size={12} /> Clear
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <AnimatePresence mode="popLayout">
                    {paginatedDreams.map((dream) => (
                      <motion.div 
                        key={dream.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="archive-card p-8 relative group hover:shadow-md transition-all"
                      >
                        <div className="flex justify-between items-start mb-6 border-b border-archive-line pb-4">
                          <span className="text-[10px] font-mono opacity-40 uppercase tracking-widest">{dream.date}</span>
                          <button 
                            onClick={() => { triggerClick(); removeDream(dream.id); }}
                            className="opacity-0 group-hover:opacity-40 hover:!opacity-100 transition-opacity text-archive-accent"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="font-serif italic text-xl leading-relaxed text-archive-ink whitespace-pre-wrap">
                          {dream.text}
                        </div>
                        <div className="mt-6 text-[10px] opacity-10 italic font-serif">#VISION</div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {filteredDreams.length > visibleDreamsCount && (
                    <div className="col-span-full pt-8 flex justify-center">
                      <button 
                        onClick={() => { triggerTick(); storeLoadMore(); }}
                        className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40 hover:opacity-100 border-b border-archive-line pb-1 transition-all"
                      >
                        Load More Visions ({filteredDreams.length - visibleDreamsCount} remaining)
                      </button>
                    </div>
                  )}

                  {filteredDreams.length === 0 && (
                    <div className="col-span-full text-center py-40 opacity-[0.03] select-none pointer-events-none">
                      <Moon size={160} className="mx-auto" />
                      <p className="handwritten text-4xl uppercase tracking-[0.4em] mt-8">
                        {dreams.length === 0 ? "The journal is waiting" : "No visions found"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </ToolLayout>
  );
};
