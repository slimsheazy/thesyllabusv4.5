import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Moon, Quote, Smile, Star, Search, Trash2, Clock, Eye, Download, X, Zap, Book, Printer, BarChart3, Brain, Loader2 } from 'lucide-react';
import { useSyllabusStore } from '../../store';
import { geminiService } from '../../services/geminiService';
import { ZineGenerator } from '../shared/ZineGenerator';
import { ReadAloudButton } from '../shared/ReadAloudButton';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<TimelineItem['type'] | 'ALL'>('ALL');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesis, setSynthesis] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(false);

  const timeline = useMemo(() => {
    let items: TimelineItem[] = [];

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

    // Apply Filters
    if (filterType !== 'ALL') {
      items = items.filter(i => i.type === filterType);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(i => 
        i.title.toLowerCase().includes(q) || 
        i.content.toLowerCase().includes(q) ||
        (i.metadata?.outcome?.toLowerCase().includes(q)) ||
        (i.metadata?.judgment?.toLowerCase().includes(q)) ||
        (i.metadata?.interpretation?.toLowerCase().includes(q)) ||
        (i.metadata?.insight?.toLowerCase().includes(q))
      );
    }

    return items.sort((a, b) => b.timestamp - a.timestamp);
  }, [dreams, quotes, moodLogs, horaryHistory, synchronicityHistory, akashicHistory, filterType, searchQuery]);

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

  const handleSynthesize = async () => {
    if (timeline.length < 3) {
      alert("The archive needs more data (at least 3 records) to perform a meaningful synthesis.");
      return;
    }
    
    setIsSynthesizing(true);
    setSynthesis(null);
    
    try {
      const records = timeline.slice(0, 15).map(i => `[${i.type}] ${i.title}: ${i.content}`).join('\n');
      
      const prompt = `You are the Master Librarian of the Archive. 
      Analyze the following recent records from a seeker's syllabus and provide a "Deep Resonance Synthesis".
      Identify recurring themes, hidden patterns, and a singular "Core Frequency" for this period.
      
      Records:
      ${records}
      
      Format the response as a poetic but structured report in the 'Archive/Syllabus' aesthetic. 
      Include:
      1. THEMES: 2-3 recurring concepts.
      2. PATTERNS: Observations on how the seeker's mood, dreams, and inquiries correlate.
      3. CORE FREQUENCY: A singular evocative phrase representing the current state.
      
      Keep it under 200 words. Use serif-style language.`;

      const text = await geminiService.generateText(prompt);
      setSynthesis(text);
    } catch (error) {
      console.error("Synthesis error:", error);
      setSynthesis("The records are currently clouded. Return when the celestial alignment is clearer.");
    } finally {
      setIsSynthesizing(false);
    }
  };

  const statsData = useMemo(() => {
    const counts = timeline.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [timeline]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-archive-bg">
      <header className="border-b border-archive-line p-6 flex items-center justify-between bg-archive-bg">
        <div className="flex items-center gap-8">
          <button onClick={onBack} className="text-xs font-mono opacity-40 hover:opacity-100 transition-opacity">← BACK</button>
          <h1 className="font-serif italic text-2xl tracking-tight">The Master Syllabus</h1>
        </div>
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setShowStats(!showStats)}
            className={`text-[10px] font-mono uppercase tracking-widest flex items-center gap-2 transition-colors ${showStats ? 'text-archive-accent' : 'hover:text-archive-accent'}`}
          >
            <BarChart3 size={14} /> {showStats ? 'Hide Stats' : 'Resonance Graph'}
          </button>
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
            
            <div className="pt-6">
              <button 
                onClick={handleSynthesize}
                disabled={isSynthesizing}
                className="brutalist-button px-8 py-3 text-sm flex items-center gap-3 mx-auto group"
              >
                {isSynthesizing ? <Loader2 className="animate-spin w-4 h-4" /> : <Brain className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                {isSynthesizing ? 'SYNTHESIZING...' : 'GENERATE SYLLABUS SYNTHESIS'}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {synthesis && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-10 border border-archive-accent/30 bg-archive-accent/[0.02] relative">
                  <button 
                    onClick={() => setSynthesis(null)}
                    className="absolute top-4 right-4 opacity-20 hover:opacity-100"
                  >
                    <X size={16} />
                  </button>
                  <div className="flex items-center gap-3 mb-6">
                    <Brain className="text-archive-accent" size={18} />
                    <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-archive-accent font-bold">Deep Resonance Synthesis</span>
                    <div className="flex-1" />
                    <ReadAloudButton text={synthesis} className="!p-1 !h-auto !w-auto !bg-transparent !border-none !shadow-none opacity-20 hover:opacity-100" />
                  </div>
                  <div className="prose prose-sm max-w-none font-serif italic text-lg leading-relaxed text-archive-ink whitespace-pre-wrap">
                    {synthesis}
                  </div>
                </div>
              </motion.div>
            )}

            {showStats && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-8 border border-archive-line bg-white shadow-sm h-64">
                  <div className="flex items-center gap-3 mb-6">
                    <BarChart3 className="opacity-40" size={16} />
                    <span className="text-[10px] font-mono uppercase tracking-[0.3em] opacity-40">Entry Frequency by Type</span>
                  </div>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statsData}>
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 9, fontFamily: 'monospace', fill: 'var(--color-archive-ink)', opacity: 0.4 }}
                      />
                      <YAxis hide />
                      <Tooltip 
                        cursor={{ fill: 'var(--color-archive-line)', opacity: 0.1 }}
                        contentStyle={{ backgroundColor: 'white', border: '1px solid var(--color-archive-line)', fontSize: '10px', fontFamily: 'monospace' }}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {statsData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={
                              entry.name === 'DREAM' ? '#6366f1' : 
                              entry.name === 'READING' ? 'var(--color-archive-accent)' :
                              entry.name === 'MOOD' ? '#f59e0b' :
                              entry.name === 'SYNCHRONICITY' ? '#10b981' : '#000'
                            } 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
                <input 
                  type="text" 
                  placeholder="Search the archive..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-archive-line p-3 pl-10 text-sm font-serif italic outline-none focus:border-archive-accent shadow-sm"
                />
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {(['ALL', 'DREAM', 'READING', 'SYNCHRONICITY', 'AKASHIC', 'MOOD'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-3 py-1 text-[9px] font-mono uppercase tracking-widest border transition-all ${filterType === type ? 'bg-archive-ink text-archive-bg border-archive-ink' : 'border-archive-line opacity-40 hover:opacity-100'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
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
                    <div className="flex items-center gap-4">
                      <h2 className="text-3xl font-serif italic">{selectedItem.title}</h2>
                      <ReadAloudButton text={`${selectedItem.content} ${selectedItem.metadata?.judgment || ''} ${selectedItem.metadata?.interpretation || ''} ${selectedItem.metadata?.insight || ''}`} className="!p-1 !h-auto !w-auto !bg-transparent !border-none !shadow-none opacity-20 hover:opacity-100" />
                    </div>
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
