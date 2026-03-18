import React, { useState } from 'react';
import Markdown from 'react-markdown';
import { useSyllabusStore } from '../../store';
import { geminiService } from '../../services/geminiService';
import { motion, AnimatePresence } from 'motion/react';
import { Book, Loader2, X, Info } from 'lucide-react';
import { ReadAloudButton } from './ReadAloudButton';

interface LexiconTextProps {
  children: string;
}

export const LexiconText: React.FC<LexiconTextProps> = ({ children }) => {
  const { unlockedTerms, unlockTerm } = useSyllabusStore();
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [definition, setDefinition] = useState<{ word: string; definition: string; etymology?: string } | null>(null);

  const handleWordClick = async (word: string) => {
    const cleanWord = word.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").toLowerCase();
    if (cleanWord.length < 3) return;

    if (unlockedTerms[cleanWord]) {
      setDefinition({ word: cleanWord, ...unlockedTerms[cleanWord] });
      setSelectedWord(cleanWord);
      return;
    }

    setSelectedWord(cleanWord);
    setLoading(true);
    try {
      const result = await geminiService.getWordDefinition(cleanWord);
      setDefinition(result);
      unlockTerm(result.word, result.definition, result.etymology || "");
    } catch (error) {
      console.error("Lexicon error:", error);
      setDefinition(null);
    } finally {
      setLoading(false);
    }
  };

  const processText = (text: string) => {
    return text.split(/(\s+)/).map((part, i) => {
      if (/\s+/.test(part)) return part;
      const cleanWord = part.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").toLowerCase();
      if (cleanWord.length < 3) return part;
      
      const isUnlocked = !!unlockedTerms[cleanWord];
      
      return (
        <span 
          key={i}
          onClick={(e) => {
            e.stopPropagation();
            handleWordClick(part);
          }}
          className={`cursor-pointer transition-colors ${isUnlocked ? 'text-archive-accent border-b border-archive-accent/30' : 'hover:text-archive-accent/60'}`}
        >
          {part}
        </span>
      );
    });
  };

  return (
    <>
      <Markdown
        components={{
          p: ({ children }) => <p className="mb-4">{React.Children.map(children, child => typeof child === 'string' ? processText(child) : child)}</p>,
          li: ({ children }) => <li>{React.Children.map(children, child => typeof child === 'string' ? processText(child) : child)}</li>,
          em: ({ children }) => <em>{React.Children.map(children, child => typeof child === 'string' ? processText(child) : child)}</em>,
          strong: ({ children }) => <strong>{React.Children.map(children, child => typeof child === 'string' ? processText(child) : child)}</strong>,
        }}
      >
        {children}
      </Markdown>

      <AnimatePresence>
        {selectedWord && (
          <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6 pointer-events-none">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedWord(null)}
              className="absolute inset-0 bg-archive-bg/40 backdrop-blur-[2px] pointer-events-auto"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-archive-bg border border-archive-line p-8 shadow-2xl pointer-events-auto rounded-2xl"
            >
              <button 
                onClick={() => setSelectedWord(null)}
                className="absolute top-4 right-4 text-archive-ink opacity-40 hover:opacity-100 transition-opacity font-mono text-[10px] flex items-center gap-1"
              >
                CLOSE <X className="w-3 h-3" />
              </button>

              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-4 opacity-40">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <p className="handwritten text-lg italic">Consulting the lexicon...</p>
                </div>
              ) : definition ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h2 className="text-3xl font-serif italic text-archive-accent">{definition.word}</h2>
                      <ReadAloudButton text={`${definition.word}: ${definition.definition}. ${definition.etymology || ''}`} className="!p-1 !h-auto !w-auto !bg-transparent !border-none !shadow-none opacity-20 hover:opacity-100" />
                    </div>
                    <div className="flex items-center gap-4 text-[9px] font-mono uppercase opacity-40">
                      <span className="flex items-center gap-1"><Info className="w-3 h-3" /> Lexicon Entry</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[8px] font-mono uppercase opacity-40">Definition</label>
                      <p className="font-serif italic text-lg leading-relaxed text-archive-ink">
                        {definition.definition}
                      </p>
                    </div>

                    {definition.etymology && (
                      <div className="space-y-1 pt-4 border-t border-archive-line">
                        <label className="text-[8px] font-mono uppercase opacity-40">Etymology</label>
                        <p className="handwritten text-sm italic leading-relaxed opacity-70">
                          {definition.etymology}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center opacity-40">
                  <p className="handwritten text-lg italic">The records are silent on this term.</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
