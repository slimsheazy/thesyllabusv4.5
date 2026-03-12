import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Quote, RefreshCw, Plus, Loader2, Send, Users, MessageSquare } from 'lucide-react';
import { useSyllabusStore } from '../../store';
import { useHaptics } from '../../hooks/useHaptics';
import { ToolLayout } from '../shared/ToolLayout';
import { ReadAloudButton } from '../shared/ReadAloudButton';

interface QuoteWallProps {
  onBack: () => void;
}

interface Insight {
  id: string;
  text: string;
  author: string;
  date: string;
}

export const SharedInsights: React.FC<QuoteWallProps> = ({ onBack }) => {
  const { userIdentity } = useSyllabusStore();
  const { triggerClick, triggerSuccess } = useHaptics();
  const [sharedQuotes, setSharedQuotes] = useState<Insight[]>([]);
  const [newQuote, setNewQuote] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchInsights = useCallback(async () => {
    try {
      const response = await fetch('/api/insights');
      const data = await response.json();
      setSharedQuotes(data);
    } catch (error) {
      console.error('Failed to fetch insights:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInsights();

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socket = new WebSocket(`${protocol}//${window.location.host}`);

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'NEW_INSIGHT') {
        setSharedQuotes((prev) => {
          if (prev.some(q => q.id === message.payload.id)) return prev;
          return [message.payload, ...prev];
        });
      }
    };

    return () => socket.close();
  }, [fetchInsights]);

  const handleAddQuote = async () => {
    if (!newQuote.trim() || submitting) return;
    triggerClick();
    setSubmitting(true);
    try {
      const response = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: newQuote.trim(),
          author: userIdentity || 'Anonymous Seeker',
        }),
      });
      
      if (response.ok) {
        setNewQuote('');
        triggerSuccess();
      }
    } catch (error) {
      console.error('Failed to submit insight:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ToolLayout
      title="Shared Insights"
      subtitle="Observations from the collective archive"
      onBack={onBack}
      tooltipTitle="Collective Consciousness"
      tooltipContent="A real-time collection of observations and insights shared by seekers across the archive. Every contribution ripples through the network."
    >
      <div className="w-full flex flex-col gap-16">
        {/* Input Section */}
        <div className="max-w-2xl mx-auto w-full">
          <div className="archive-card p-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="archive-form-group">
              <div className="flex items-center justify-between mb-2">
                <label className="archive-label !mb-0">Contribute Observation</label>
                <div className="flex items-center gap-1 opacity-20 text-[8px] font-mono uppercase">
                  <Users size={8} />
                  <span>{userIdentity || 'Anonymous'}</span>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-20" />
                  <input 
                    type="text" 
                    value={newQuote}
                    onChange={(e) => setNewQuote(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddQuote()}
                    placeholder="Share a realization..."
                    className="archive-input pl-12 !italic !text-lg"
                  />
                </div>
                <button 
                  onClick={handleAddQuote}
                  disabled={submitting || !newQuote.trim()}
                  className={`brutalist-button px-8 flex items-center justify-center transition-all ${submitting || !newQuote.trim() ? 'opacity-20' : ''}`}
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send size={18} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Insights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-32">
          {loading ? (
            <div className="col-span-full flex flex-col items-center py-40 opacity-20">
              <div className="relative mb-8">
                <div className="w-16 h-16 border-2 border-archive-ink border-t-transparent animate-spin rounded-full" />
                <div className="absolute inset-0 flex items-center justify-center text-xl">☉</div>
              </div>
              <p className="handwritten text-xl italic uppercase tracking-[0.3em]">Accessing the collective consciousness...</p>
            </div>
          ) : sharedQuotes.length === 0 ? (
            <div className="col-span-full flex flex-col items-center py-40 opacity-[0.03] select-none pointer-events-none">
              <Quote size={160} />
              <p className="handwritten text-4xl uppercase tracking-[0.4em] mt-8">Silence in the Archive</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {sharedQuotes.map((quote) => (
                <motion.div 
                  key={quote.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -20 }}
                  className="archive-card p-8 relative group hover:shadow-xl transition-all duration-500"
                >
                  <Quote className="absolute top-4 right-4 w-6 h-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity" />
                  <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ReadAloudButton text={quote.text} className="!p-1 !h-auto !w-auto !bg-transparent !border-none !shadow-none opacity-20 hover:opacity-100" />
                  </div>
                  <p className="font-serif italic text-2xl leading-relaxed text-archive-ink mb-12">
                    "{quote.text}"
                  </p>
                  <div className="flex justify-between items-end border-t border-archive-line pt-6">
                    <div className="space-y-1">
                      <p className="text-[10px] font-mono uppercase tracking-widest opacity-40">{quote.author}</p>
                      <p className="text-[8px] font-mono uppercase opacity-20">{new Date(quote.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-[10px] opacity-10 italic font-serif">#INSIGHT</div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </ToolLayout>
  );
};
