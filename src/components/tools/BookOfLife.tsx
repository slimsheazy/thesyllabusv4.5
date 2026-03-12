import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Book, Star, Trash2, ChevronLeft, ChevronRight, Edit3, Save, X, Sparkles, Archive } from 'lucide-react';
import { useSyllabusStore } from '../../store';
import { useHaptics } from '../../hooks/useHaptics';
import { ToolLayout } from '../shared/ToolLayout';
import { ReadAloudButton } from '../shared/ReadAloudButton';

interface BookOfLifeProps {
  onBack: () => void;
}

export const BookOfLife: React.FC<BookOfLifeProps> = ({ onBack }) => {
  const { akashicHistory, updateAkashicEntry, removeAkashicEntry } = useSyllabusStore();
  const { triggerTick, triggerClick, triggerRustle } = useHaptics();
  const [currentPage, setCurrentPage] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [reflection, setReflection] = useState('');

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
    <ToolLayout
      title="The Book of Life"
      subtitle="Your personal chronicle of saved Akashic insights"
      onBack={onBack}
      tooltipTitle="The Great Chronicle"
      tooltipContent="Every insight you save from the Akashic Records is inscribed here. This is your personal ledger of wisdom and resonance."
    >
      <div className="w-full flex flex-col gap-12 pb-32">
        {akashicHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 opacity-[0.03] select-none pointer-events-none">
            <Book size={160} />
            <p className="handwritten text-4xl uppercase tracking-[0.4em] mt-8">The Pages are Blank</p>
            <p className="font-serif italic text-xl mt-4">Consult the Akashic Records to begin your chronicle.</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto w-full flex flex-col gap-8">
            {/* Pagination Controls */}
            <div className="flex items-center justify-between border-b border-archive-line pb-4">
              <div className="flex items-center gap-4">
                <Archive size={16} className="opacity-40" />
                <span className="text-[10px] font-mono uppercase tracking-widest opacity-40">
                  Folio {currentPage + 1} of {akashicHistory.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handlePrev}
                  disabled={currentPage === 0}
                  className="p-2 border border-archive-line hover:bg-archive-ink hover:text-archive-bg disabled:opacity-10 transition-all rounded-archive"
                >
                  <ChevronLeft size={16} />
                </button>
                <button 
                  onClick={handleNext}
                  disabled={currentPage === totalPages - 1}
                  className="p-2 border border-archive-line hover:bg-archive-ink hover:text-archive-bg disabled:opacity-10 transition-all rounded-archive"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Page Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentEntry.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="archive-card p-12 min-h-[600px] flex flex-col relative overflow-hidden"
              >
                {/* Visual Flourish */}
                <div className="absolute top-0 right-0 p-8 opacity-[0.02] select-none pointer-events-none text-9xl italic">FOLIO</div>
                
                <div className="flex justify-between items-start mb-12 border-b border-archive-line pb-8">
                  <div className="space-y-2">
                    <p className="archive-label !mb-0">Inquiry</p>
                    <h3 className="font-serif italic text-2xl text-archive-ink">"{currentEntry.query}"</h3>
                  </div>
                  <div className="text-right">
                    <p className="archive-label !mb-0">Dated</p>
                    <p className="text-xs font-mono opacity-40">{new Date(currentEntry.date).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex-1 space-y-12">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="archive-label flex items-center gap-2">
                        <Sparkles size={10} /> The Insight
                      </p>
                      <ReadAloudButton text={currentEntry.insight} className="!p-1 !h-auto !w-auto !bg-transparent !border-none !shadow-none opacity-20 hover:opacity-100" />
                    </div>
                    <p className="font-serif italic text-3xl leading-relaxed text-archive-ink">
                      {currentEntry.insight}
                    </p>
                  </div>

                  <div className="pt-12 border-t border-archive-line space-y-6">
                    <div className="flex justify-between items-center">
                      <p className="archive-label !mb-0">Personal Reflection</p>
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
                      <div className="archive-form-group">
                        <textarea 
                          autoFocus
                          value={reflection}
                          onChange={(e) => setReflection(e.target.value)}
                          placeholder="How does this resonate with your journey?"
                          className="archive-input min-h-[150px] !italic !text-lg"
                        />
                        <div className="flex justify-end gap-4 mt-4">
                          <button onClick={() => setEditingId(null)} className="text-[10px] font-mono uppercase opacity-40 hover:opacity-100">Cancel</button>
                          <button onClick={saveReflection} className="text-[10px] font-mono uppercase text-archive-accent flex items-center gap-2 font-bold">
                            <Save size={12} /> Save Reflection
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="handwritten text-2xl italic opacity-60 leading-relaxed min-h-[60px]">
                        {currentEntry.reflection || "No reflections recorded yet..."}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-12 pt-8 border-t border-archive-line flex justify-between items-center">
                  <div className="flex items-center gap-6">
                    <p className="archive-label !mb-0">Resonance</p>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button 
                          key={star}
                          onClick={() => setResonance(star)}
                          className={`transition-all ${star <= (currentEntry.resonance || 0) ? 'text-archive-accent scale-110' : 'text-archive-ink/10 hover:text-archive-ink/30'}`}
                        >
                          <Star size={18} fill={star <= (currentEntry.resonance || 0) ? "currentColor" : "none"} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={handleDelete}
                    className="text-red-500/20 hover:text-red-500 transition-colors p-2"
                    title="Eradicate Record"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};
