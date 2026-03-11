import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Book, Bookmark, Check } from 'lucide-react';
import { useSyllabusStore } from '../../store';
import { useHaptics } from '../../hooks/useHaptics';
import { useProfile } from '../../hooks/useProfile';
import { geminiService } from '../../services/geminiService';
import { ToolLayout } from '../shared/ToolLayout';
import { ResultSection } from '../shared/ResultSection';
import { ProfileSelector } from '../shared/ProfileSelector';

interface AkashicRecordsToolProps {
  onBack: () => void;
  onNavigate?: (page: string) => void;
}

export const AkashicRecordsTool: React.FC<AkashicRecordsToolProps> = ({ onBack, onNavigate }) => {
  const { recordCalculation, addAkashicEntry } = useSyllabusStore();
  const { triggerClick, triggerSuccess } = useHaptics();
  const { profile, setMe, setSomeoneElse, updateProfile, initials } = useProfile();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

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
      const text = await geminiService.queryAkashicRecords(query, profile, initials);
      setResult(text || "The records remain silent for now. Try rephrasing your query.");
      recordCalculation();
      triggerSuccess();
    } catch (error) {
      console.error("Error querying Akashic Records:", error);
      setResult("The connection to the ether has been interrupted. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout
      title="Akashic Records"
      onBack={onBack}
      tooltipTitle="What are the Akashic Records?"
      tooltipContent="A cosmic library of every thought, word, and action that has ever occurred in the universe, accessible through focused meditation."
      headerRight={
        <button 
          onClick={() => onNavigate ? onNavigate("BOOK_OF_LIFE") : onBack()}
          className="text-[10px] font-mono uppercase tracking-widest border border-archive-ink/10 px-4 py-2 hover:bg-archive-ink hover:text-archive-bg transition-all flex items-center gap-2 rounded-archive"
        >
          <Book size={12} /> View Book of Life
        </button>
      }
    >
      <div className="max-w-4xl mx-auto">
        <div className="space-y-12 text-center py-12">
          <div className="space-y-4">
            <h2 className="title-main text-6xl">The Big Archive</h2>
            <p className="opacity-60">Check the records on any theme, person, or vibe.</p>
          </div>

          <div className="max-w-2xl mx-auto space-y-8">
            <div className="archive-card p-6 space-y-6 text-left">
              <ProfileSelector 
                isMe={profile.isMe}
                onMe={setMe}
                onSomeoneElse={setSomeoneElse}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="archive-form-group">
                  <label className="archive-label">Name</label>
                  <input 
                    type="text" 
                    value={profile.name}
                    onChange={(e) => updateProfile({ name: e.target.value })}
                    className="archive-input !p-2 !text-sm"
                  />
                </div>
                <div className="archive-form-group">
                  <label className="archive-label">Birth Date</label>
                  <input 
                    type="date" 
                    value={profile.birthday}
                    onChange={(e) => updateProfile({ birthday: e.target.value })}
                    className="archive-input !p-2 !text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="archive-form-group text-left">
              <label className="archive-label">Your Inquiry</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40" />
                <input 
                  type="text" 
                  placeholder="Enter a theme, name, or question..." 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="archive-input pl-12 !text-2xl"
                />
              </div>
            </div>

            <button 
              onClick={handleSearch}
              disabled={loading || !query}
              className={`brutalist-button w-full py-5 text-xl ${loading || !query ? 'opacity-30' : ''}`}
            >
              {loading ? 'CHECKING THE RECORDS...' : 'SEARCH THE ARCHIVE'}
            </button>
          </div>

          <AnimatePresence>
            {result && (
              <ResultSection
                id="akashic-record-content"
                title="The Record"
                content={result}
                exportName={`akashic-${profile.name}`}
                onClose={() => setResult(null)}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="text-[10px] font-mono uppercase tracking-widest opacity-40">Record Entry: {initials}</div>
                </div>

                <p className="font-serif italic text-2xl leading-relaxed text-archive-ink">
                  "{result}"
                </p>
                <p className="text-[8px] font-mono uppercase tracking-widest opacity-20 mt-4 text-center">
                  Source: Astronomical Ephemeris & Birth Map Analysis
                </p>
                <div className="mt-8 pt-8 border-t border-archive-line flex justify-center">
                  <button 
                    onClick={handleSave}
                    disabled={isSaved}
                    className={`text-[10px] font-mono uppercase tracking-[0.2em] flex items-center gap-2 transition-all ${isSaved ? 'text-emerald-500' : 'opacity-40 hover:opacity-100'}`}
                  >
                    {isSaved ? <Check className="w-3 h-3" /> : <Bookmark className="w-3 h-3" />}
                    {isSaved ? 'Saved to Book of Life' : 'Save to Book of Life'}
                  </button>
                </div>
              </ResultSection>
            )}
          </AnimatePresence>
        </div>
      </div>
    </ToolLayout>
  );
};
