import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Search, Book, X, Calendar, Info } from 'lucide-react';
import { useSyllabusStore } from '../../store';
import { ReadAloudButton } from '../shared/ReadAloudButton';

interface LexiconViewProps {
  onBack: () => void;
}

export const LexiconView: React.FC<LexiconViewProps> = ({ onBack }) => {
  const { unlockedTerms } = useSyllabusStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);

  const terms = Object.entries(unlockedTerms).sort((a, b) => a[0].localeCompare(b[0]));
  
  const filteredTerms = terms.filter(([word, data]) => 
    word.toLowerCase().includes(searchQuery.toLowerCase()) ||
    data.definition.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-archive-bg">
      <header className="border-b border-archive-line p-6 flex items-center justify-between bg-archive-bg">
        <div className="flex items-center gap-8">
          <button onClick={onBack} className="text-xs font-mono opacity-40 hover:opacity-100 transition-opacity flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" /> BACK
          </button>
          <h1 className="font-serif italic text-2xl tracking-tight">Lexicon of Discovery</h1>
        </div>
        <div className="flex items-center gap-4 text-[10px] uppercase tracking-syllabus opacity-40">
          <Book className="w-3 h-3" /> {terms.length} Terms Unlocked
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="title-main text-6xl">The Seeker's Vocabulary</h2>
            <p className="opacity-60">Every term encountered and decoded during your journey through the Syllabus.</p>
          </div>

          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search the lexicon..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-archive-bg border border-archive-line p-4 pl-12 text-sm font-serif italic outline-none focus:border-archive-accent shadow-sm rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredTerms.map(([word, data]) => (
              <motion.button
                key={word}
                layoutId={`term-${word}`}
                onClick={() => setSelectedTerm(word)}
                className="p-6 bg-archive-bg border border-archive-line text-left hover:shadow-lg transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-20 transition-opacity">
                  <Book className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-serif italic mb-2 text-archive-ink group-hover:text-archive-accent transition-colors">{word}</h3>
                <p className="text-[10px] font-mono uppercase opacity-40 mb-4">Discovered: {new Date(data.discoveredAt).toLocaleDateString()}</p>
                <p className="handwritten text-sm italic opacity-60 line-clamp-2">{data.definition}</p>
              </motion.button>
            ))}

            {terms.length === 0 && (
              <div className="col-span-full py-24 text-center border border-dashed border-archive-line rounded-3xl opacity-20">
                <p className="italic font-serif text-2xl">Your lexicon is currently empty.</p>
                <p className="text-sm font-mono uppercase mt-2">Explore the tools to unlock new terminology.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedTerm && (
          <div className="fixed inset-0 z-[3000] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTerm(null)}
              className="absolute inset-0 bg-archive-bg/80 backdrop-blur-sm"
            />
            <motion.div 
              layoutId={`term-${selectedTerm}`}
              className="relative w-full max-w-lg bg-archive-bg border border-archive-line p-10 shadow-2xl"
            >
              <button 
                onClick={() => setSelectedTerm(null)}
                className="absolute top-6 right-6 text-archive-ink opacity-40 hover:opacity-100 transition-opacity font-mono text-xs flex items-center gap-1"
              >
                CLOSE <X className="w-3 h-3" />
              </button>

              <div className="space-y-8">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h2 className="text-5xl font-serif italic text-archive-accent">{selectedTerm}</h2>
                    <ReadAloudButton text={`${selectedTerm}: ${unlockedTerms[selectedTerm].definition}. ${unlockedTerms[selectedTerm].etymology || ''}`} className="!p-1 !h-auto !w-auto !bg-transparent !border-none !shadow-none opacity-20 hover:opacity-100" />
                  </div>
                  <div className="flex items-center gap-4 text-[10px] font-mono uppercase opacity-40">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(unlockedTerms[selectedTerm].discoveredAt).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><Info className="w-3 h-3" /> Lexicon Entry</span>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-mono uppercase opacity-40">Definition</label>
                    <p className="font-serif italic text-2xl leading-relaxed text-archive-ink">
                      {unlockedTerms[selectedTerm].definition}
                    </p>
                  </div>

                  {unlockedTerms[selectedTerm].etymology && (
                    <div className="space-y-2 pt-6 border-t border-archive-line">
                      <label className="text-[9px] font-mono uppercase opacity-40">Etymology & Resonance</label>
                      <p className="handwritten text-lg italic leading-relaxed opacity-70">
                        {unlockedTerms[selectedTerm].etymology}
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-8 text-center">
                  <button 
                    onClick={() => setSelectedTerm(null)}
                    className="text-[10px] font-mono uppercase tracking-widest border-b border-archive-ink/20 hover:border-archive-ink transition-colors"
                  >
                    Close Entry
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
