import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, RotateCcw, Share2, Download, Info } from 'lucide-react';
import { useSyllabusStore } from '../../store';
import { useHaptics } from '../../hooks/useHaptics';
import { ToolLayout } from '../shared/ToolLayout';
import { ReadAloudButton } from '../shared/ReadAloudButton';
import { geminiService } from '../../services/geminiService';
import AstrologyWheel from './CharmCasting/AstrologyWheel';
import CharmBoard, { HouseAssignment } from './CharmCasting/CharmBoard';
import CharmSelector from './CharmCasting/CharmSelector';
import UserInputForm from './CharmCasting/UserInputForm';
import { ALL_CHARMS, HOUSES } from './CharmCasting/constants';
import { Charm } from '../../types';
import { LexiconText } from '../shared/LexiconText';

import { playBase64Audio } from '../../utils/audioUtils';

interface StarboardToolProps {
  onBack: () => void;
}

type CastingState = 'SELECTING' | 'INPUTTING' | 'CASTING' | 'RESULTS';

export const StarboardTool: React.FC<StarboardToolProps> = ({ onBack }) => {
  const { starboard, addStar } = useSyllabusStore();
  const { triggerClick, triggerSuccess } = useHaptics();
  
  const [state, setState] = useState<CastingState>('SELECTING');
  const [selectedCharms, setSelectedCharms] = useState<Charm[]>([]);
  const [question, setQuestion] = useState('');
  const [assignments, setAssignments] = useState<HouseAssignment[]>([]);
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const [isInterpreting, setIsInterpreting] = useState(false);

  const [showInfo, setShowInfo] = useState(false);

  const handleSelectCharm = (charm: Charm) => {
    if (selectedCharms.length < 12) {
      setSelectedCharms([...selectedCharms, charm]);
      triggerClick();
    }
  };

  const handleRemoveCharm = (charm: Charm) => {
    setSelectedCharms(selectedCharms.filter(c => c.name !== charm.name));
    triggerClick();
  };

  const handleRandomize = () => {
    const shuffled = [...ALL_CHARMS].sort(() => 0.5 - Math.random());
    setSelectedCharms(shuffled.slice(0, 12));
    triggerClick();
  };

  const handleConfirmSelection = () => {
    setState('INPUTTING');
    triggerSuccess();
  };

  const handleStartCasting = () => {
    setState('CASTING');
    triggerSuccess();
  };

  const handleHouseAssignments = (newAssignments: HouseAssignment[]) => {
    setAssignments(newAssignments);
    // After a delay to show the casting animation, generate interpretation
    setTimeout(() => {
      generateInterpretation(newAssignments);
    }, 3000);
  };

  const generateInterpretation = async (currentAssignments: HouseAssignment[]) => {
    setIsInterpreting(true);
    setState('RESULTS');
    
    try {
      const castingData = currentAssignments.map(a => {
        const house = HOUSES[a.houseIndex];
        const charmsInHouse = a.charmIndices.map(idx => selectedCharms[idx].name);
        return `House ${house.number} (${house.name} - ${house.keyword}): ${charmsInHouse.join(', ')}`;
      }).join('\n');

      const prompt = `You are the Celestial Navigator of the Starboard, an ancient divination system.
      Interpret this Charm Casting for a seeker.
      
      Seeker's Question/Intent: ${question || 'General guidance for the path ahead.'}
      
      Casting Results (Charms in Astrological Houses):
      ${castingData}
      
      Provide a deep, poetic, and resonant interpretation. 
      Focus on the synthesis of the charms and the houses they landed in.
      Identify the "Luminous Core" of the reading—the central theme.
      Offer a "Celestial Directive"—a practical action or focus for the seeker.
      
      Use a tone that is mystical yet grounded, like an old archive or a forgotten syllabus.
      Format the response using Markdown. Use headers for sections.`;

      const result = await geminiService.generateText(prompt);
      setInterpretation(result);
      
      // Auto-save to archive
      addStar({
        id: `charm-cast-${Date.now()}`,
        type: 'CHARM_CASTING',
        title: `Charm Casting: ${question.slice(0, 30)}${question.length > 30 ? '...' : ''}` || 'Celestial Alignment',
        content: result,
        date: new Date().toISOString(),
        metadata: {
          question,
          assignments: currentAssignments,
          charms: selectedCharms
        }
      });
      
      triggerSuccess();
    } catch (error) {
      console.error('Interpretation error:', error);
      setInterpretation('The stars are veiled. Please try again when the sky clears.');
    } finally {
      setIsInterpreting(false);
    }
  };

  const handleReset = () => {
    setState('SELECTING');
    setSelectedCharms([]);
    setQuestion('');
    setInterpretation(null);
    setAssignments([]);
    triggerClick();
  };

  const handleExport = () => {
    if (!interpretation) return;
    
    const content = `THE STARBOARD: CELESTIAL ALIGNMENT\n` +
      `Date: ${new Date().toLocaleDateString()}\n` +
      `Intent: ${question || 'General Guidance'}\n\n` +
      `INTERPRETATION:\n${interpretation}`;
      
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `starboard-reading-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerSuccess();
  };

  const handleShare = async () => {
    if (!interpretation) return;
    
    const shareData = {
      title: 'My Starboard Reading',
      text: `My celestial alignment for today: ${interpretation.slice(0, 100)}...`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(interpretation);
        alert('Interpretation copied to clipboard.');
      }
      triggerSuccess();
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  return (
    <ToolLayout
      title="The Starboard"
      subtitle="Cast your intentions into the celestial wheel"
      onBack={onBack}
      tooltipTitle="Charm Casting"
      tooltipContent="The Starboard is no longer a simple list. It is a divination tool where your insights are cast as charms onto the 12 houses of the zodiac. Each placement reveals a different facet of your current resonance."
    >
      <div className="w-full max-w-5xl mx-auto min-h-[70vh] flex flex-col items-center justify-center relative">
        
        <AnimatePresence mode="wait">
          {state === 'SELECTING' && (
            <motion.div
              key="selecting"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full"
            >
              <CharmSelector
                allCharms={ALL_CHARMS}
                selectedCharms={selectedCharms}
                onSelectCharm={handleSelectCharm}
                onRemoveCharm={handleRemoveCharm}
                onRandomize={handleRandomize}
                onConfirm={handleConfirmSelection}
              />
            </motion.div>
          )}

          {state === 'INPUTTING' && (
            <motion.div
              key="inputting"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="w-full max-w-md"
            >
              <div className="archive-card bg-archive-bg p-8 space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="font-serif italic text-2xl">Focus Your Intent</h2>
                  <p className="text-xs opacity-50 uppercase tracking-widest">Whisper your query to the void</p>
                </div>
                <UserInputForm
                  question={question}
                  setQuestion={setQuestion}
                  onSubmit={handleStartCasting}
                />
                <button 
                  onClick={() => setState('SELECTING')}
                  className="w-full text-[10px] uppercase tracking-widest opacity-30 hover:opacity-100 transition-opacity"
                >
                  Back to Selection
                </button>
              </div>
            </motion.div>
          )}

          {(state === 'CASTING' || state === 'RESULTS') && (
            <motion.div
              key="casting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full aspect-square max-w-2xl relative"
            >
              <AstrologyWheel houses={HOUSES} />
              <CharmBoard 
                charms={selectedCharms} 
                houses={HOUSES} 
                onHouseAssignments={state === 'CASTING' ? handleHouseAssignments : undefined}
              />

              {state === 'RESULTS' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <AnimatePresence>
                    {isInterpreting ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-archive-ink/80 backdrop-blur-md border border-archive-line p-6 rounded-full flex flex-col items-center gap-3"
                      >
                        <Sparkles className="w-6 h-6 text-archive-accent animate-pulse" />
                        <span className="text-[10px] font-mono uppercase tracking-[0.3em] animate-pulse text-archive-bg">Navigating the Stars...</span>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute bottom-[-10%] left-0 right-0 pointer-events-auto"
                      >
                        <div className="archive-card bg-archive-bg p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                          <div className="flex justify-between items-start mb-6">
                            <div className="space-y-1">
                              <span className="text-[9px] font-mono uppercase tracking-widest text-archive-accent">Celestial Synthesis</span>
                              <h3 className="font-serif italic text-xl text-archive-ink">The Navigator's Report</h3>
                            </div>
                            <div className="flex gap-2">
                              <ReadAloudButton 
                                text={interpretation || ''} 
                                className="!p-2 hover:bg-archive-ink/5 rounded-full transition-colors opacity-40 hover:opacity-100" 
                              />
                              <button onClick={handleReset} className="p-2 hover:bg-archive-ink/5 rounded-full transition-colors" title="New Casting">
                                <RotateCcw className="w-4 h-4 opacity-40 hover:opacity-100" />
                              </button>
                              <button onClick={handleShare} className="p-2 hover:bg-archive-ink/5 rounded-full transition-colors" title="Share Reading">
                                <Share2 className="w-4 h-4 opacity-40 hover:opacity-100" />
                              </button>
                            </div>
                          </div>
                          <div className="font-serif italic text-base leading-relaxed text-archive-ink/80 markdown-body">
                            <LexiconText>{interpretation || ''}</LexiconText>
                          </div>
                          <div className="mt-8 pt-6 border-t border-archive-line flex justify-between items-center">
                            <span className="text-[9px] font-mono opacity-30 uppercase">Alignment Recorded in Master Syllabus</span>
                            <button 
                              onClick={handleExport}
                              className="text-[9px] font-mono uppercase tracking-widest opacity-40 hover:opacity-100 flex items-center gap-2"
                            >
                              <Download className="w-3 h-3" /> Export Record
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Legend / Info Toggle */}
        {state === 'SELECTING' && (
          <div className="fixed bottom-8 right-8">
            <button 
              onClick={() => setShowInfo(true)}
              className="p-3 bg-archive-bg border border-archive-line rounded-full hover:bg-archive-ink hover:text-archive-bg transition-all group shadow-lg"
            >
              <Info className="w-4 h-4 opacity-40 group-hover:opacity-100" />
            </button>
          </div>
        )}

        {/* Info Modal */}
        <AnimatePresence>
          {showInfo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-archive-ink/60 backdrop-blur-sm"
              onClick={() => setShowInfo(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="archive-card bg-archive-bg p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto custom-scrollbar"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-archive-accent">Divination Guide</span>
                    <h2 className="font-serif italic text-2xl text-archive-ink">The Art of Charm Casting</h2>
                  </div>
                  <button onClick={() => setShowInfo(false)} className="text-2xl opacity-30 hover:opacity-100 text-archive-ink">×</button>
                </div>

                <div className="space-y-6 text-sm leading-relaxed text-archive-ink/80">
                  <section className="space-y-2">
                    <h3 className="font-serif italic text-lg text-archive-ink">The Process</h3>
                    <p>Select up to 12 charms that resonate with your current energy. Once selected, focus your intent or ask a specific question. The charms will then be cast onto the celestial wheel, landing in one of the 12 astrological houses.</p>
                  </section>

                  <section className="space-y-3">
                    <h3 className="font-serif italic text-lg text-archive-ink">The 12 Houses</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {HOUSES.map(house => (
                        <div key={house.number} className="p-3 border border-archive-line rounded-lg bg-archive-bg">
                          <span className="text-[10px] font-mono text-archive-accent">House {house.number}</span>
                          <h4 className="font-serif italic text-base">{house.name}</h4>
                          <p className="text-[11px] opacity-60">Represents: {house.keyword}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="space-y-2">
                    <h3 className="font-serif italic text-lg text-archive-ink">Interpretation</h3>
                    <p>The Starboard's Navigator synthesizes the meaning of each charm with the house it occupies. The resulting report offers a poetic reflection on your path, identifying central themes and offering celestial directives for your journey.</p>
                  </section>
                </div>

                <button 
                  onClick={() => setShowInfo(false)}
                  className="mt-8 w-full py-3 border border-archive-accent/30 rounded-lg text-[10px] uppercase tracking-[0.3em] hover:bg-archive-accent/10 transition-colors"
                >
                  Return to the Void
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToolLayout>
  );
};
