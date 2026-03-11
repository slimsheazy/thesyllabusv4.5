import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Brain, Loader2, User, Sparkles, Trash2, MessageSquare, History } from 'lucide-react';
import { useSyllabusStore } from '../../store';
import { geminiService } from '../../services/geminiService';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface OracleViewProps {
  onBack: () => void;
}

export const OracleView: React.FC<OracleViewProps> = ({ onBack }) => {
  const { 
    dreams, quotes, moodLogs, horaryHistory, synchronicityHistory, akashicHistory,
    oracleMessages, addOracleMessage, clearOracleMessages 
  } = useSyllabusStore();
  
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [oracleMessages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      role: 'user' as const,
      content: input
    };

    addOracleMessage(userMessage);
    setInput('');
    setLoading(true);

    try {
      // Prepare context from the archive
      const context = `
        Seeker's Archive Context:
        - Dreams: ${dreams.length} recorded. Latest: ${dreams[0]?.text.slice(0, 100) || 'None'}
        - Moods: ${moodLogs.length} recorded. Latest: ${moodLogs[0]?.mood || 'None'}
        - Horary Questions: ${horaryHistory.length} asked.
        - Akashic Insights: ${akashicHistory.length} received.
        - Recent Synchronicity: ${synchronicityHistory[0]?.event || 'None'}
      `;

      const prompt = `You are the Master Librarian of the Archive. You are wise, slightly cryptic, but profoundly practical. 
      You help seekers understand the patterns in their Syllabus.
      
      ${context}
      
      Seeker's Question: ${input}
      
      Respond in the 'Archive/Syllabus' aesthetic: serif-style language, italicized insights, and a focus on resonance and patterns. 
      If the seeker asks about their data, refer to the context provided above.
      Keep responses concise and evocative.`;

      const text = await geminiService.generateText(prompt);

      addOracleMessage({
        role: 'assistant',
        content: text
      });
    } catch (error) {
      console.error("Oracle error:", error);
      addOracleMessage({
        role: 'assistant',
        content: "The records are currently veiled. Perhaps the question is not yet ripe for an answer."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-archive-bg">
      <header className="border-b border-archive-line p-6 flex items-center justify-between bg-archive-bg">
        <div className="flex items-center gap-8">
          <button onClick={onBack} className="text-xs font-mono opacity-40 hover:opacity-100 transition-opacity">← BACK</button>
          <h1 className="font-serif italic text-2xl tracking-tight">Consult the Librarian</h1>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={clearOracleMessages}
            className="text-[10px] font-mono uppercase tracking-widest opacity-40 hover:opacity-100 flex items-center gap-2"
          >
            <Trash2 size={14} /> Clear Dialogue
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full overflow-hidden">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar"
        >
          {oracleMessages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-40">
              <Brain size={64} strokeWidth={1} />
              <div className="space-y-2">
                <h2 className="text-3xl font-serif italic">The Librarian Awaits</h2>
                <p className="handwritten text-lg italic max-w-md mx-auto">
                  Ask about recurring themes in your dreams, the meaning of your recent moods, or seek guidance on your next step in the Syllabus.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-3 pt-4">
                {["What patterns do you see in my dreams?", "How does my mood relate to my readings?", "What is the core frequency of my archive?"].map((q, i) => (
                  <button 
                    key={i}
                    onClick={() => setInput(q)}
                    className="px-4 py-2 border border-archive-line rounded-full text-[10px] font-mono uppercase hover:bg-archive-ink hover:text-archive-bg transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence mode="popLayout">
            {oracleMessages.map((msg, idx) => (
              <motion.div 
                key={msg.timestamp}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] p-6 rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-archive-ink text-archive-bg' 
                    : 'bg-white border border-archive-line shadow-sm'
                }`}>
                  <div className="flex items-center gap-2 mb-3 opacity-40">
                    {msg.role === 'user' ? <User size={12} /> : <Brain size={12} />}
                    <span className="text-[9px] font-mono uppercase tracking-widest">
                      {msg.role === 'user' ? 'Seeker' : 'Librarian'}
                    </span>
                  </div>
                  <p className={`font-serif italic text-lg leading-relaxed ${msg.role === 'user' ? '' : 'text-archive-ink'}`}>
                    {msg.content}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-white border border-archive-line p-6 rounded-2xl shadow-sm flex items-center gap-4">
                <Loader2 size={16} className="animate-spin text-archive-accent" />
                <span className="handwritten text-lg italic opacity-40">The Librarian is consulting the scrolls...</span>
              </div>
            </motion.div>
          )}
        </div>

        <div className="p-8 border-t border-archive-line bg-archive-bg">
          <div className="relative">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Speak to the Librarian..."
              className="w-full bg-white border border-archive-line p-5 pr-16 text-lg font-serif italic outline-none focus:border-archive-accent shadow-lg rounded-2xl"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-archive-ink text-archive-bg rounded-xl hover:scale-110 transition-transform disabled:opacity-20"
            >
              <Send size={20} />
            </button>
          </div>
          <p className="text-center text-[9px] font-mono uppercase opacity-30 mt-4 tracking-[0.2em]">
            The Librarian's insights are based on your recorded resonances.
          </p>
        </div>
      </div>
    </div>
  );
};
