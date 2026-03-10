import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Moon, Quote, Smile, Star, Search, Trash2, Clock, Eye, Download, X, Zap, Book, Printer } from 'lucide-react';
import { useSyllabusStore } from '../store';
import { ZineGenerator } from './ZineGenerator';

interface MasterArchiveProps {
  onBack: () => void;
}

type TimelineItem = {
  id: string;
  type: 'DREAM' | 'QUOTE' | 'MOOD' | 'READING' | 'SYNCHRONICITY' | 'AKASHIC';
  title: string;
  content: string;
  date: string;
  timestamp: number;
  icon: any;
  color: string;
  metadata?: any;
};

export const MasterArchive: React.FC<MasterArchiveProps> = ({ onBack }) => {
  const { 
    dreams, quotes, moodLogs, horaryHistory, synchronicityHistory, akashicHistory,
    removeDream, removeQuote, removeMoodLog, removeHoraryEntry, removeSynchronicityEntry, removeAkashicEntry 
  } = useSyllabusStore();

  const [selectedItem, setSelectedItem] = useState<TimelineItem | null>(null);
  const [showZine, setShowZine] = useState(false);

  const timeline = useMemo(() => {
    const items: TimelineItem[] = [];

    dreams.forEach(d => {
      items.push({
        id: d.id,
        type: 'DREAM',
        title: 'Nocturnal Vision',
        content: d.text,
        date: d.date,
        timestamp: new Date(d.date).getTime(),
        icon: Moon,
        color: 'text-indigo-500'
      });
    });

    quotes.forEach(q => {
      if (q.author === 'You') {
        items.push({
          id: q.id,
          type: 'QUOTE',
          title: 'Personal Wisdom',
          content: q.text,
          date: 'Archived',
          timestamp: 0,
          icon: Quote,
          color: 'text-emerald-500'
        });
      }
    });

    moodLogs.forEach(m => {
      items.push({
        id: m.id,
        type: 'MOOD',
        title: `Resonance: ${m.mood}`,
        content: m.insight,
        date: new Date(m.date).toLocaleDateString(),
        timestamp: new Date(m.date).getTime(),
        icon: Smile,
        color: 'text-amber-500'
      });
    });

    horaryHistory.forEach(h => {
      items.push({
        id: h.id,
        type: 'READING',
        title: 'Celestial Inquiry',
        content: h.question,
        date: new Date(h.date).toLocaleDateString(),
        timestamp: new Date(h.date).getTime(),
        icon: Star,
        color: 'text-archive-accent',
        metadata: {
          outcome: h.outcome,
          judgment: h.judgment,
          location: h.location
        }
      });
    });

    synchronicityHistory.forEach(s => {
      items.push({
        id: s.id,
        type: 'SYNCHRONICITY',
        title: 'Synchronicity Decoded',
        content: s.event,
        date: new Date(s.date).toLocaleDateString(),
        timestamp: new Date(s.date).getTime(),
        icon: Zap,
        color: 'text-archive-accent',
        metadata: {
          interpretation: s.interpretation
        }
      });
    });

    akashicHistory.forEach(a => {
      items.push({
        id: a.id,
        type: 'AKASHIC',
        title: 'Akashic Record',
        content: a.query,
        date: new Date(a.date).toLocaleDateString(),
        timestamp: new Date(a.date).getTime(),
        icon: Book,
        color: 'text-archive-accent',
        metadata: {
          insight: a.insight
        }
      });
    });

    return items.sort((a, b) => b.timestamp - a.timestamp);
  }, [dreams, quotes, moodLogs, horaryHistory, synchronicityHistory]);

  const handleDelete = (item: TimelineItem) => {
    if (!confirm("Are you sure you want to remove this record from the archive?")) return;
    
    switch (item.type) {
      case 'DREAM': removeDream(item.id); break;
      case 'QUOTE': removeQuote(item.id); break;
      case 'MOOD': removeMoodLog(item.id); break;
      case 'READING': removeHoraryEntry(item.id); break;
      case 'SYNCHRONICITY': removeSynchronicityEntry(item.id); break;
      case 'AKASHIC': removeAkashicEntry(item.id); break;
    }
  };

  const handleExport = (item: TimelineItem) => {
    const text = `[${item.type}] ${item.title}\nDate: ${item.date}\nContent: ${item.content}${item.metadata ? `\nOutcome: ${item.metadata.outcome}\nJudgment: ${item.metadata.judgment}` : ''}`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `syllabus-record-${item.id.slice(0, 8)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-archive-bg">
      <header className="border-b border-archive-line p-6 flex items-center justify-between bg-archive-bg">
        <div className="flex items-center gap-8">
          <button onClick={onBack} className="text-xs font-mono opacity-40 hover:opacity-100 transition-opacity">← BACK</button>
          <h1 className="font-serif italic text-2xl tracking-tight">The Master Syllabus</h1>
        </div>
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setShowZine(true)}
            className="text-[10px] font-mono uppercase tracking-widest flex items-center gap-2 hover:text-archive-accent transition-colors"
          >
            <Printer size={14} /> Print Monthly Zine
          </button>
          <div className="flex items-center gap-4 text-[10px] uppercase tracking-syllabus opacity-40">
            <Clock size={14} /> Timeline View
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="title-main text-6xl">Chronological Resonance</h2>
            <p className="opacity-60">Every echo, every vision, every insight recorded in the Syllabus.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {timeline.map((item, idx) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="relative"
              >
                <div className="bg-white border border-archive-line p-8 shadow-sm hover:shadow-md transition-shadow group h-full flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <item.icon size={18} className={item.color} />
                      <span className="text-[10px] font-mono uppercase tracking-[0.2em]">{item.title}</span>
                    </div>
                    <span className="text-[10px] font-mono opacity-40 uppercase tracking-widest">{item.date}</span>
                  </div>
                  
                  <p className="font-serif italic text-xl leading-relaxed text-archive-ink line-clamp-3">
                    {item.content}
                  </p>

                  <div className="mt-6 pt-4 border-t border-archive-line flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[9px] font-mono uppercase opacity-40">ID: {item.id.slice(0, 8)}</span>
                    <div className="flex gap-4">
                       <button 
                        onClick={() => setSelectedItem(item)}
                        className="text-[9px] font-mono uppercase flex items-center gap-1 hover:text-archive-accent transition-colors"
                       >
                         <Eye size={12} /> Details
                       </button>
                       <button 
                        onClick={() => handleExport(item)}
                        className="text-[9px] font-mono uppercase flex items-center gap-1 hover:text-archive-accent transition-colors"
                       >
                         <Download size={12} /> Export
                       </button>
                       <button 
                        onClick={() => handleDelete(item)}
                        className="text-[9px] font-mono uppercase flex items-center gap-1 hover:text-red-500 transition-colors"
                       >
                         <Trash2 size={12} /> Delete
                       </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {timeline.length === 0 && (
              <div className="text-center py-24 border border-dashed border-archive-line rounded-3xl opacity-20 italic font-serif text-2xl">
                The syllabus is currently empty. Begin your journey to record your first resonance.
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-[3000] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="absolute inset-0 bg-archive-bg/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white border border-archive-line p-10 shadow-2xl overflow-y-auto max-h-[80vh] custom-scrollbar"
            >
              <button 
                onClick={() => setSelectedItem(null)}
                className="absolute top-6 right-6 text-archive-ink opacity-40 hover:opacity-100 transition-opacity"
              >
                <X size={20} />
              </button>

              <div className="space-y-8">
                <div className="flex items-center gap-4 border-b border-archive-line pb-6">
                  <selectedItem.icon size={24} className={selectedItem.color} />
                  <div>
                    <h3 className="text-[10px] font-mono uppercase tracking-widest opacity-40">{selectedItem.type} RECORD</h3>
                    <h2 className="text-3xl font-serif italic">{selectedItem.title}</h2>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-mono uppercase opacity-40">Syllabus Content</label>
                    <p className="font-serif italic text-2xl leading-relaxed text-archive-ink columns-1 md:columns-2 gap-8">
                      {selectedItem.content}
                    </p>
                  </div>

                  {selectedItem.metadata && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-archive-line">
                      {selectedItem.metadata.outcome && (
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono uppercase opacity-40">Outcome</label>
                          <p className="handwritten text-lg text-archive-accent">{selectedItem.metadata.outcome}</p>
                        </div>
                      )}
                      {selectedItem.metadata.location && (
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono uppercase opacity-40">Location</label>
                          <p className="handwritten text-lg">{selectedItem.metadata.location}</p>
                        </div>
                      )}
                      {selectedItem.metadata.judgment && (
                        <div className="col-span-full space-y-1">
                          <label className="text-[9px] font-mono uppercase opacity-40">Judgment</label>
                          <p className="handwritten text-lg italic leading-relaxed">{selectedItem.metadata.judgment}</p>
                        </div>
                      )}
                      {selectedItem.metadata.interpretation && (
                        <div className="col-span-full space-y-1">
                          <label className="text-[9px] font-mono uppercase opacity-40">Esoteric Interpretation</label>
                          <p className="handwritten text-lg italic leading-relaxed text-archive-accent">{selectedItem.metadata.interpretation}</p>
                        </div>
                      )}
                      {selectedItem.metadata.insight && (
                        <div className="col-span-full space-y-1">
                          <label className="text-[9px] font-mono uppercase opacity-40">Akashic Insight</label>
                          <p className="handwritten text-lg italic leading-relaxed text-archive-accent">{selectedItem.metadata.insight}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="pt-8 flex justify-between items-center text-[10px] font-mono uppercase opacity-40">
                    <span>Recorded on {selectedItem.date}</span>
                    <span>System ID: {selectedItem.id}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {showZine && (
          <ZineGenerator onClose={() => setShowZine(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};
