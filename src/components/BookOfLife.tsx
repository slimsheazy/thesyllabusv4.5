import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Book, Star, Trash2, ChevronLeft, ChevronRight, Edit3, Save, X, Sparkles } from 'lucide-react';
import { useSyllabusStore } from '../store';
import { useHaptics } from '../hooks/useHaptics';

interface BookOfLifeProps {
  onBack: () => void;
}

export const BookOfLife: React.FC<BookOfLifeProps> = ({ onBack }) => {
  const { akashicHistory, updateAkashicEntry, removeAkashicEntry } = useSyllabusStore();
  const { triggerTick, triggerClick, triggerRustle } = useHaptics();
  const [currentPage, setCurrentPage] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [reflection, setReflection] = useState('');

  const entriesPerPage = 1;
  const totalPages = Math.max(1, akashicHistory.length);
  const currentEntry = akashicHistory[currentPage];

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      triggerRustle();
      setCurrentPage(prev => prev + 1);
      setEditingId(null);
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      triggerRustle();
      setCurrentPage(prev => prev - 1);
      setEditingId(null);
    }
  };

  const startEditing = () => {
    if (currentEntry) {
      setEditingId(currentEntry.id);
      setReflection(currentEntry.reflection || '');
      triggerClick();
    }
  };

  const saveReflection = () => {
    if (editingId) {
      updateAkashicEntry(editingId, { reflection });
      setEditingId(null);
      triggerClick();
    }
  };

  const setResonance = (val: number) => {
    if (currentEntry) {
      updateAkashicEntry(currentEntry.id, { resonance: val });
      triggerTick();
    }
  };

  const handleDelete = () => {
    if (currentEntry && confirm("Eradicate this record from your Book of Life?")) {
      removeAkashicEntry(currentEntry.id);
      if (currentPage >= akashicHistory.length - 1 && currentPage > 0) {
        setCurrentPage(prev => prev - 1);
      }
      triggerClick();
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#f5f2ed]">
      <header className="border-b border-archive-ink/10 p-6 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <button onClick={onBack} className="text-xs font-mono opacity-40 hover:opacity-100 transition-opacity">← BACK</button>
          <h1 className="font-serif italic text-2xl tracking-tight text-[#1a1a1a]">The Book of Life</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-mono uppercase opacity-40 tracking-widest">
            Folio {akashicHistory.length > 0 ? currentPage + 1 : 0} of {akashicHistory.length}
          </span>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden">
        {/* Background texture/elements */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-archive-ink rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-archive-ink rounded-full" />
        </div>

        {akashicHistory.length === 0 ? (
          <div className="text-center space-y-4 max-w-md">
            <Book className="w-12 h-12 mx-auto opacity-10" />
            <h2 className="font-serif italic text-2xl opacity-40">Your Book of Life is currently empty.</h2>
            <p className="handwritten text-lg opacity-30 italic">Consult the Akashic Records to begin your chronicle.</p>
            <button 
              onClick={onBack}
              className="mt-8 text-[10px] font-mono uppercase tracking-widest border-b border-archive-ink/20 hover:border-archive-ink transition-colors"
            >
              Consult Records
            </button>
          </div>
        ) : (
          <div className="w-full max-w-4xl flex items-center gap-8">
            <button 
              onClick={handlePrev}
              disabled={currentPage === 0}
              className="p-4 rounded-full hover:bg-archive-ink/5 disabled:opacity-5 transition-all"
            >
              <ChevronLeft size={32} />
            </button>

            <div className="flex-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentEntry.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-sm p-12 min-h-[600px] flex flex-col relative"
                >
                  {/* Page binding effect */}
                  <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/5 to-transparent pointer-events-none" />
                  
                  <div className="flex justify-between items-start mb-12">
                    <div className="space-y-1">
                      <p className="text-[10px] font-mono uppercase tracking-widest opacity-40">Inquiry</p>
                      <h3 className="font-serif italic text-xl">"{currentEntry.query}"</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-mono uppercase tracking-widest opacity-40">Dated</p>
                      <p className="text-xs font-mono">{new Date(currentEntry.date).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex-1 space-y-8">
                    <div className="space-y-4">
                      <p className="text-[10px] font-mono uppercase tracking-widest opacity-40 flex items-center gap-2">
                        <Sparkles size={10} /> The Insight
                      </p>
                      <p className="font-serif italic text-2xl leading-relaxed text-[#1a1a1a]">
                        {currentEntry.insight}
                      </p>
                    </div>

                    <div className="pt-12 border-t border-archive-ink/5 space-y-6">
                      <div className="flex justify-between items-center">
                        <p className="text-[10px] font-mono uppercase tracking-widest opacity-40">Personal Reflection</p>
                        {!editingId && (
                          <button 
                            onClick={startEditing}
                            className="text-[9px] font-mono uppercase opacity-40 hover:opacity-100 flex items-center gap-1 transition-opacity"
                          >
                            <Edit3 size={10} /> {currentEntry.reflection ? 'Edit' : 'Add Note'}
                          </button>
                        )}
                      </div>

                      {editingId ? (
                        <div className="space-y-4">
                          <textarea 
                            autoFocus
                            value={reflection}
                            onChange={(e) => setReflection(e.target.value)}
                            placeholder="How does this resonate with your journey?"
                            className="w-full bg-[#fcfbf9] border border-archive-ink/10 p-4 handwritten text-lg italic outline-none focus:border-archive-accent min-h-[120px]"
                          />
                          <div className="flex justify-end gap-4">
                            <button onClick={() => setEditingId(null)} className="text-[10px] font-mono uppercase opacity-40 hover:opacity-100">Cancel</button>
                            <button onClick={saveReflection} className="text-[10px] font-mono uppercase text-archive-accent flex items-center gap-2">
                              <Save size={12} /> Save Reflection
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="handwritten text-xl italic opacity-60 leading-relaxed min-h-[40px]">
                          {currentEntry.reflection || "No reflections recorded yet..."}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-12 pt-8 border-t border-archive-ink/5 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <p className="text-[9px] font-mono uppercase tracking-widest opacity-30">Resonance</p>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button 
                            key={star}
                            onClick={() => setResonance(star)}
                            className={`transition-all ${star <= (currentEntry.resonance || 0) ? 'text-archive-accent scale-110' : 'text-archive-ink/10 hover:text-archive-ink/30'}`}
                          >
                            <Star size={14} fill={star <= (currentEntry.resonance || 0) ? "currentColor" : "none"} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <button 
                      onClick={handleDelete}
                      className="text-red-500/20 hover:text-red-500 transition-colors p-2"
                      title="Eradicate Record"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <button 
              onClick={handleNext}
              disabled={currentPage === totalPages - 1}
              className="p-4 rounded-full hover:bg-archive-ink/5 disabled:opacity-5 transition-all"
            >
              <ChevronRight size={32} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
