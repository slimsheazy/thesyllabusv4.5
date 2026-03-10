import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Moon, Save, Trash2, RefreshCw, Search, Calendar, Filter, X, Sparkles, Loader2, FileText, Image as ImageIcon, Volume2 } from 'lucide-react';
import { useSyllabusStore } from '../store';
import { GoogleGenAI } from "@google/genai";
import { useHaptics } from '../hooks/useHaptics';
import { exportAsImage, exportAsPDF } from '../utils/exportUtils';
import { ReadAloudButton } from './ReadAloudButton';

interface DreamJournalProps {
  onBack: () => void;
}

export const DreamJournal: React.FC<DreamJournalProps> = ({ onBack }) => {
  const { triggerClick, triggerSuccess, triggerTick } = useHaptics();
  const { 
    dreams, addDream, removeDream, visibleDreamsCount, 
    loadMoreDreams: storeLoadMore, resetVisibleDreams, 
    userIdentity, userBirthday, recordCalculation 
  } = useSyllabusStore();

  const handleLoadMore = () => {
    triggerTick();
    storeLoadMore();
  };
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
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `You are an expert in Jungian dream analysis and esoteric symbolism.
      The dreamer is ${userIdentity || 'a mysterious soul'} born on ${userBirthday || 'an unknown date'}.
      They had the following dream: "${currentDream}"
      
      Provide a deep, poetic, and insightful interpretation of this dream. 
      Focus on the symbols, the emotional resonance, and what the subconscious might be trying to communicate.
      
      Use the "Archive/Syllabus" aesthetic: serif, italic, slightly cryptic but profoundly resonant.
      Keep it between 60 and 90 words.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      setInterpretation(response.text || "The dream is a silent mirror.");
      recordCalculation();
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
    <div className="flex-1 flex flex-col overflow-hidden bg-archive-bg">
      <header className="border-b border-archive-line p-6 flex items-center justify-between bg-archive-bg">
        <div className="flex items-center gap-8">
          <button onClick={onBack} className="text-xs font-mono opacity-40 hover:opacity-100 transition-opacity">← BACK</button>
          <h1 className="font-serif italic text-2xl tracking-tight">The Dream Journal</h1>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="title-main text-6xl">Nocturnal Echoes</h2>
            <p className="opacity-60">Record the visions that visit you in the quiet of the night.</p>
          </div>

          <div className="max-w-2xl mx-auto space-y-6">
            <textarea 
              value={currentDream}
              onChange={(e) => setCurrentDream(e.target.value)}
              placeholder="What did you see? What did you feel?"
              className="w-full bg-white border border-archive-line p-8 font-serif italic text-xl outline-none focus:border-archive-accent min-h-[200px] shadow-sm"
            />
            
            <AnimatePresence>
              {interpretation && (
                <motion.div 
                  id="dream-interpretation-content"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-8 border border-archive-line bg-archive-bg/50 italic font-serif text-lg leading-relaxed relative"
                >
                  <div className="absolute top-2 right-2 flex items-center gap-2">
                    <ReadAloudButton text={interpretation} className="!p-1 !h-auto !w-auto !bg-transparent !border-none !shadow-none opacity-20 hover:opacity-100" />
                    <div className="opacity-10"><Sparkles size={16} /></div>
                  </div>
                  <p className="text-archive-ink opacity-80 columns-1 md:columns-2 gap-8">{interpretation}</p>
                  
                  <div className="mt-8 pt-4 border-t border-archive-line/20 flex gap-6 justify-center">
                    <button 
                      onClick={() => exportAsPDF('dream-interpretation-content', 'dream-interpretation')}
                      className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40 hover:opacity-100 flex items-center gap-2"
                    >
                      <FileText className="w-3 h-3" />
                      PDF
                    </button>
                    <button 
                      onClick={() => exportAsImage('dream-interpretation-content', 'dream-interpretation')}
                      className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40 hover:opacity-100 flex items-center gap-2"
                    >
                      <ImageIcon className="w-3 h-3" />
                      Image
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-4">
              <button 
                onClick={interpretDream}
                disabled={!currentDream || interpreting}
                className="flex-1 border border-archive-line py-5 text-xl flex items-center justify-center gap-3 hover:bg-archive-ink hover:text-archive-bg transition-all disabled:opacity-20"
              >
                {interpreting ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
                {interpreting ? 'DECODING...' : 'INTERPRET'}
              </button>
              <button 
                onClick={saveDream}
                disabled={!currentDream}
                className="brutalist-button flex-[2] py-5 text-xl flex items-center justify-center gap-3"
              >
                <Save size={20} /> RECORD VISION
              </button>
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-archive-line pb-4">
              <h3 className="col-header pb-0 border-none">Past Visions</h3>
              
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" />
                  <input 
                    type="text"
                    placeholder="Search keywords..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-white border border-archive-line pl-9 pr-4 py-2 text-sm font-serif italic outline-none focus:border-archive-accent w-full md:w-48"
                  />
                </div>
                <div className="relative">
                  <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" />
                  <input 
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="bg-white border border-archive-line pl-9 pr-4 py-2 text-sm font-serif italic outline-none focus:border-archive-accent w-full md:w-48"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatePresence mode="popLayout">
                {paginatedDreams.map((dream) => (
                  <motion.div 
                    key={dream.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-8 border border-archive-line bg-white shadow-sm relative group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[10px] font-mono opacity-40 uppercase tracking-widest">{dream.date}</span>
                      <button 
                        onClick={() => { triggerClick(); removeDream(dream.id); }}
                        className="opacity-0 group-hover:opacity-40 hover:!opacity-100 transition-opacity"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="font-serif italic text-xl leading-relaxed text-archive-ink whitespace-pre-wrap">
                      {dream.text}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {filteredDreams.length > visibleDreamsCount && (
                <div className="pt-8 flex justify-center">
                  <button 
                    onClick={handleLoadMore}
                    className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40 hover:opacity-100 border-b border-archive-line pb-1 transition-all"
                  >
                    Load More Visions ({filteredDreams.length - visibleDreamsCount} remaining)
                  </button>
                </div>
              )}

              {filteredDreams.length === 0 && (
                <div className="text-center py-24 opacity-20 italic font-serif">
                  {dreams.length === 0 ? "No dreams recorded yet. The journal is waiting." : "No visions match your search."}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
