import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Book, Sparkles, RefreshCw, Loader2, FileText, Image as ImageIcon, Volume2, Bookmark, Check } from 'lucide-react';
import { useSyllabusStore } from '../store';
import { useHaptics } from '../hooks/useHaptics';
import { GoogleGenAI } from "@google/genai";
import { Tooltip } from './Tooltip';
import { ReadAloudButton } from './ReadAloudButton';
import { exportAsImage, exportAsPDF } from '../utils/exportUtils';

interface AkashicRecordsToolProps {
  onBack: () => void;
  onNavigate?: (page: string) => void;
}

export const AkashicRecordsTool: React.FC<AkashicRecordsToolProps> = ({ onBack, onNavigate }) => {
  const { userIdentity, userBirthday, userLocation, recordCalculation, addAkashicEntry } = useSyllabusStore();
  const { triggerClick, triggerSuccess } = useHaptics();
  const [subject, setSubject] = useState({
    name: userIdentity || '',
    birthday: userBirthday || '',
    location: userLocation?.name || '',
    isMe: true
  });
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const handleResetToMe = () => {
    triggerClick();
    setSubject({
      name: userIdentity || '',
      birthday: userBirthday || '',
      location: userLocation?.name || '',
      isMe: true
    });
  };

  React.useEffect(() => {
    if (subject.isMe) {
      setSubject({
        name: userIdentity || '',
        birthday: userBirthday || '',
        location: userLocation?.name || '',
        isMe: true
      });
    }
  }, [userIdentity, userBirthday, userLocation, subject.isMe]);

  const handleSave = () => {
    triggerClick();
    if (result && query) {
      addAkashicEntry(query, result);
      setIsSaved(true);
      triggerSuccess();
    }
  };

  const handleSearch = async () => {
    triggerClick();
    if (!query) return;
    setLoading(true);
    setIsSaved(false);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const prompt = `You are a helpful, chill guide to the Akashic Records. A seeker is asking a question.
      
      Subject Identity:
      - Name: ${subject.name} (Initials: ${initials})
      - Birth: ${subject.birthday}
      - Location: ${subject.location}
      - Inquiry: "${query}"
      
      Task:
      Check the "cosmic files" for them. Give them a straight-up, accessible insight about their question.
      
      Tone:
      Chill, conversational, and grounded. Avoid overly repetitive mystical jargon. Talk like a wise friend who happens to have access to the universe's library.
      
      Requirements:
      1. Keep it personal. Mention their initials "${initials}".
      2. Include a small, oddly specific detail related to their birth date (${subject.birthday}) or location (${subject.location}) to show you're really looking at their file.
      3. Be practical. What does this mean for them right now?
      
      Format:
      Just the insight. No "Record Opened" headers or repetitive intros.
      Keep it between 80 and 150 words.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      setResult(response.text || "The records remain silent for now. Try rephrasing your query.");
      recordCalculation();
      triggerSuccess();
    } catch (error) {
      console.error("Error querying Akashic Records:", error);
      setResult("The connection to the ether has been interrupted. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const initials = subject.name ? subject.name.split(' ').map(n => n[0]).join('').toUpperCase() : '??';

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-archive-bg">
      <header className="border-b border-archive-line p-6 flex items-center justify-between bg-archive-bg">
        <div className="flex items-center gap-8">
          <button onClick={onBack} className="text-xs font-mono opacity-40 hover:opacity-100 transition-opacity">← BACK</button>
          <div className="flex items-center">
            <h1 className="font-serif italic text-2xl tracking-tight">Akashic Records</h1>
            <Tooltip 
              title="What are the Akashic Records?" 
              content="A cosmic library of every thought, word, and action that has ever occurred in the universe, accessible through focused meditation." 
            />
          </div>
        </div>
        <button 
          onClick={() => onNavigate ? onNavigate("BOOK_OF_LIFE") : onBack()}
          className="text-[10px] font-mono uppercase tracking-widest border border-archive-ink/10 px-4 py-2 hover:bg-archive-ink hover:text-archive-bg transition-all flex items-center gap-2"
        >
          <Book size={12} /> View Book of Life
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-12 text-center py-12">
            <div className="space-y-4">
              <h2 className="title-main text-6xl">The Big Archive</h2>
              <p className="opacity-60">Check the records on any theme, person, or vibe.</p>
            </div>

            <div className="max-w-2xl mx-auto space-y-8">
              <div className="p-6 bg-white border border-archive-line shadow-sm space-y-6 text-left">
                <div className="flex justify-between items-center border-b border-archive-line pb-4">
                  <span className="text-[10px] font-mono uppercase opacity-40 tracking-widest">Subject</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleResetToMe}
                      className={`px-3 py-1 text-[10px] font-mono uppercase border transition-all ${subject.isMe ? 'bg-archive-ink text-archive-bg border-archive-ink' : 'border-archive-line opacity-40'}`}
                    >
                      Me
                    </button>
                    <button 
                      onClick={() => setSubject(s => ({ ...s, isMe: false }))}
                      className={`px-3 py-1 text-[10px] font-mono uppercase border transition-all ${!subject.isMe ? 'bg-archive-ink text-archive-bg border-archive-ink' : 'border-archive-line opacity-40'}`}
                    >
                      Someone Else
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono uppercase opacity-40">Name</label>
                    <input 
                      type="text" 
                      value={subject.name}
                      onChange={(e) => setSubject(s => ({ ...s, name: e.target.value, isMe: false }))}
                      className="w-full bg-archive-bg p-2 border border-archive-line text-sm italic outline-none focus:border-archive-accent"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono uppercase opacity-40">Birth Date</label>
                    <input 
                      type="date" 
                      value={subject.birthday}
                      onChange={(e) => setSubject(s => ({ ...s, birthday: e.target.value, isMe: false }))}
                      className="w-full bg-archive-bg p-2 border border-archive-line text-sm italic outline-none focus:border-archive-accent"
                    />
                  </div>
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40" />
                <input 
                  type="text" 
                  placeholder="Enter a theme, name, or question..." 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-white border border-archive-line p-6 pl-12 font-serif italic text-2xl outline-none focus:border-archive-accent shadow-sm"
                />
              </div>

              <button 
                onClick={handleSearch}
                disabled={loading || !query}
                className="brutalist-button w-full py-5 text-xl"
              >
                {loading ? 'CHECKING THE RECORDS...' : 'SEARCH THE ARCHIVE'}
              </button>
            </div>

            <AnimatePresence>
              {result && (
                <motion.div 
                  id="akashic-record-content"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-2xl mx-auto p-12 border border-archive-line bg-white shadow-xl relative overflow-hidden text-left"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none text-8xl font-sans">☊</div>
                  
                  <div className="flex justify-between items-start mb-6">
                    <div className="text-[10px] font-mono uppercase tracking-widest opacity-40">Record Entry: {initials}</div>
                    <ReadAloudButton text={result} />
                  </div>

                  <p className="font-serif italic text-2xl leading-relaxed text-archive-ink">
                    "{result}"
                  </p>
                  <p className="text-[8px] font-mono uppercase tracking-widest opacity-20 mt-4 text-center">
                    Source: Astronomical Ephemeris & Birth Map Analysis
                  </p>
                  <div className="mt-8 pt-8 border-t border-archive-line flex flex-wrap justify-center gap-8">
                    <button 
                      onClick={handleSave}
                      disabled={isSaved}
                      className={`text-[10px] font-mono uppercase tracking-[0.2em] flex items-center gap-2 transition-all ${isSaved ? 'text-emerald-500' : 'opacity-40 hover:opacity-100'}`}
                    >
                      {isSaved ? <Check className="w-3 h-3" /> : <Bookmark className="w-3 h-3" />}
                      {isSaved ? 'Saved to Book of Life' : 'Save to Book of Life'}
                    </button>
                    <button 
                      onClick={() => exportAsPDF('akashic-record-content', `akashic-${subject.name}`)}
                      className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40 hover:opacity-100 flex items-center gap-2"
                    >
                      <FileText className="w-3 h-3" />
                      Export PDF
                    </button>
                    <button 
                      onClick={() => exportAsImage('akashic-record-content', `akashic-${subject.name}`)}
                      className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40 hover:opacity-100 flex items-center gap-2"
                    >
                      <ImageIcon className="w-3 h-3" />
                      Export Image
                    </button>
                    <button 
                      onClick={() => setResult(null)}
                      className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40 hover:opacity-100 flex items-center gap-2"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Close record
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
