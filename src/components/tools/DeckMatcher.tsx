import React, { useState, useMemo, useEffect } from 'react';
import { geminiService } from '../../services/geminiService';
import { GlossaryTerm } from '../GlossaryEngine';
import { ReadAloudButton } from '../shared/ReadAloudButton';
import { useSyllabusStore } from '../../store';
import { ToolProps } from '../../types';

interface Option {
  text: string;
  weight: Record<string, number>;
}

interface Question {
  id: string;
  prompt: string;
  options: Option[];
}

const QUESTION_POOL: Question[] = [
  {
    id: 'q1',
    prompt: 'How should the artwork feel in your hands?',
    options: [
      { text: 'Crisp, clean, and mathematically perfect', weight: { modern: 2, structured: 1 } },
      { text: 'Weathered, organic, and full of history', weight: { traditional: 2, earthy: 1 } },
      { text: 'Electric, neon, and boundary-pushing', weight: { experimental: 2, modern: 1 } },
      { text: 'Soft, atmospheric, and dream-like', weight: { intuitive: 2, psychological: 1 } },
    ],
  },
  {
    id: 'q2',
    prompt: 'Choose your primary symbolic language:',
    options: [
      { text: 'Ancient alchemy and hermetic seals', weight: { esoteric: 3, traditional: 1 } },
      { text: 'The secret lives of plants and animals', weight: { earthy: 3, intuitive: 1 } },
      { text: 'Abstract shapes and color theory', weight: { modern: 2, experimental: 1 } },
      { text: 'Human anatomy and psychological states', weight: { psychological: 3, structured: 1 } },
    ],
  },
  {
    id: 'q3',
    prompt: 'What draws you into a visual vision?',
    options: [
      { text: 'Dense details hidden in every corner', weight: { esoteric: 2, traditional: 1 } },
      { text: 'A single, powerful focus point', weight: { modern: 2, structured: 1 } },
      { text: 'Vibrant, clashing colors that pop', weight: { experimental: 2, intuitive: 1 } },
      { text: 'Muted tones and subtle textures', weight: { psychological: 2, earthy: 1 } },
    ],
  },
  {
    id: 'q4',
    prompt: 'In which era does your spirit feel most at home?',
    options: [
      { text: 'The distant, forgotten antiquity', weight: { traditional: 2, esoteric: 1 } },
      { text: 'A high-tech, digital future', weight: { modern: 2, experimental: 1 } },
      { text: 'The raw, unindustrialized wilderness', weight: { earthy: 2, intuitive: 1 } },
      { text: 'The Surrealist 1920s Paris', weight: { psychological: 2, experimental: 1 } },
    ],
  },
  {
    id: 'q5',
    prompt: 'How do you want to receive a message?',
    options: [
      { text: 'As a direct, logical instruction', weight: { structured: 3, modern: 1 } },
      { text: 'As a poetic, lingering feeling', weight: { intuitive: 3, earthy: 1 } },
      { text: 'As a shocking, radical revelation', weight: { experimental: 3, esoteric: 1 } },
      { text: 'As a mirror to your inner shadow', weight: { psychological: 3, traditional: 1 } },
    ],
  },
  {
    id: 'q6',
    prompt: 'What is the "texture" of your curiosity right now?',
    options: [
      { text: 'Heavy and grounded (Stone/Root)', weight: { earthy: 2, structured: 1 } },
      { text: 'Light and airy (Smoke/Sky)', weight: { intuitive: 2, experimental: 1 } },
      { text: 'Sharp and cutting (Glass/Steel)', weight: { modern: 2, esoteric: 1 } },
      { text: 'Fluid and deep (Water/Ink)', weight: { psychological: 2, traditional: 1 } },
    ],
  },
  {
    id: 'q7',
    prompt: 'Pick a tool for transformation:',
    options: [
      { text: 'A compass and a straightedge', weight: { structured: 3, modern: 1 } },
      { text: 'A bowl of water and a candle', weight: { intuitive: 3, esoteric: 1 } },
      { text: 'A dirty trowel and fertile soil', weight: { earthy: 3, traditional: 1 } },
      { text: 'A mirror and a dark room', weight: { psychological: 3, experimental: 1 } },
    ],
  },
  {
    id: 'q8',
    prompt: 'Which visual style resonates most?',
    options: [
      { text: 'Fine line engravings', weight: { traditional: 2, esoteric: 1 } },
      { text: 'Bold, graphic pop-art', weight: { modern: 2, experimental: 1 } },
      { text: 'Loose watercolor washes', weight: { intuitive: 2, psychological: 1 } },
      { text: 'Collage of mixed realities', weight: { experimental: 2, modern: 1 } },
    ],
  },
  {
    id: 'q9',
    prompt: 'Choose a landscape for contemplation:',
    options: [
      { text: 'An abandoned concrete Brutalist library', weight: { structured: 2, modern: 1 } },
      { text: 'An ancient, overgrown oak forest', weight: { earthy: 2, traditional: 1 } },
      { text: 'A neon-lit rain-slicked city alley', weight: { experimental: 2, modern: 1 } },
      { text: 'A silent, white-sand desert under moonlight', weight: { intuitive: 2, esoteric: 1 } },
    ],
  },
  {
    id: 'q10',
    prompt: 'What is the purpose of your ritual?',
    options: [
      { text: 'To bring order to my chaos', weight: { structured: 3, modern: 1 } },
      { text: 'To find magic in the mundane', weight: { earthy: 2, intuitive: 1 } },
      { text: 'To break my own habits', weight: { experimental: 3, psychological: 1 } },
      { text: 'To study the old laws', weight: { traditional: 3, esoteric: 1 } },
    ],
  },
  {
    id: 'q11',
    prompt: 'How do symbols function for you?',
    options: [
      { text: 'As keys to unlock hidden knowledge', weight: { esoteric: 3, experimental: 1 } },
      { text: 'As maps for navigating daily life', weight: { structured: 2, modern: 1 } },
      { text: 'As whispers from the natural world', weight: { earthy: 3, intuitive: 1 } },
      { text: 'As mirrors reflecting the soul', weight: { psychological: 3, traditional: 1 } },
    ],
  },
  {
    id: 'q12',
    prompt: 'Choose an element of beauty:',
    options: [
      { text: 'The elegance of a circuit board', weight: { modern: 3, structured: 1 } },
      { text: 'The patterns in a decaying leaf', weight: { earthy: 3, traditional: 1 } },
      { text: 'The vastness of a star cluster', weight: { esoteric: 2, intuitive: 1 } },
      { text: 'The expression in a stranger\'s eyes', weight: { psychological: 3, experimental: 1 } },
    ],
  },
  {
    id: 'q13',
    prompt: 'Should the deck challenge or comfort you?',
    options: [
      { text: 'Challenge: I need a wake-up call', weight: { experimental: 2, psychological: 1 } },
      { text: 'Comfort: I need a safe space', weight: { intuitive: 2, earthy: 1 } },
      { text: 'A bit of both: Hard truths in soft art', weight: { psychological: 2, modern: 1 } },
      { text: 'Neither: I want objective accuracy', weight: { structured: 2, traditional: 1 } },
    ],
  },
  {
    id: 'q14',
    prompt: 'Pick a color palette:',
    options: [
      { text: 'High-contrast Black and White', weight: { structured: 2, modern: 1 } },
      { text: 'Earthy Ochres and Deep Greens', weight: { earthy: 2, traditional: 1 } },
      { text: 'Vivid, Surreal Neons', weight: { experimental: 3, modern: 1 } },
      { text: 'Gold Leaf and Royal Purples', weight: { traditional: 2, esoteric: 2 } },
    ],
  },
  {
    id: 'q15',
    prompt: 'How often will you use this tool?',
    options: [
      { text: 'Every morning (Daily Anchor)', weight: { structured: 1, earthy: 1 } },
      { text: 'Only in times of crisis', weight: { psychological: 2, experimental: 1 } },
      { text: 'During planetary alignments', weight: { esoteric: 3, traditional: 1 } },
      { text: 'Whenever I feel the "nudge"', weight: { intuitive: 2, modern: 1 } },
    ],
  },
];

const DeckMatcher: React.FC<ToolProps> = ({ onBack }) => {
  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({
    modern: 0, traditional: 0, esoteric: 0, intuitive: 0,
    earthy: 0, psychological: 0, structured: 0, experimental: 0,
  });
  const [recommendation, setRecommendation] = useState<any>(null);
  const [sampleCards, setSampleCards] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [visualizing, setVisualizing] = useState(false);
  
  const { recordCalculation } = useSyllabusStore();

  // Initialize randomized session
  useEffect(() => {
    const shuffled = [...QUESTION_POOL].sort(() => 0.5 - Math.random());
    setSessionQuestions(shuffled.slice(0, 8)); // Consistently 8 questions for depth without fatigue
  }, []);

  const handleAnswer = (option: Option) => {
    if ('vibrate' in navigator) navigator.vibrate(10);
    
    const newScores = { ...scores };
    Object.entries(option.weight).forEach(([key, value]) => {
      newScores[key] = (newScores[key] || 0) + value;
    });
    setScores(newScores);

    if (currentIndex < sessionQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      generateRecommendation(newScores);
    }
  };

  const generateRecommendation = async (finalScores: Record<string, number>) => {
    setLoading(true);
    const profile = Object.entries(finalScores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([key]) => key)
      .join(', ');

    const result = await geminiService.getDeckRecommendation(profile, finalScores);
    setRecommendation(result);
    recordCalculation();
    setLoading(false);
    
    if (result) {
      setVisualizing(true);
      try {
        const images = await Promise.all([
          geminiService.generateDeckSample(result.description, profile, 1),
          geminiService.generateDeckSample(result.description, profile, 2),
          geminiService.generateDeckSample(result.description, profile, 3)
        ]);
        setSampleCards(images.filter((img): img is string => img !== null));
      } catch (e) {
        console.error("Visual manifestation error:", e);
      } finally {
        setVisualizing(false);
      }
    }
  };

  const restart = () => {
    const shuffled = [...QUESTION_POOL].sort(() => 0.5 - Math.random());
    setSessionQuestions(shuffled.slice(0, 8));
    setCurrentIndex(0);
    setScores({
      modern: 0, traditional: 0, esoteric: 0, intuitive: 0, 
      earthy: 0, psychological: 0, structured: 0, experimental: 0,
    });
    setRecommendation(null);
    setSampleCards([]);
  };

  const currentQuestion = sessionQuestions[currentIndex];
  const progressPercent = ((currentIndex) / 8) * 100;

  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-8 sm:py-20 px-4 sm:px-8 relative max-w-7xl mx-auto">
      <button 
        onClick={onBack} 
        className="fixed top-4 right-4 sm:top-8 sm:right-8 brutalist-button !text-[10px] sm:!text-sm !px-3 sm:!px-4 !py-1 z-50 bg-white"
      >
        Index
      </button>

      <div className="w-full max-w-4xl space-y-8 sm:space-y-16">
        <header className="text-center space-y-2 sm:space-y-4">
          <h2 className="heading-marker text-4xl sm:text-6xl text-marker-purple lowercase">
            <GlossaryTerm word="Oracle">Deck</GlossaryTerm> Matcher
          </h2>
          <p className="handwritten text-sm sm:text-lg text-marker-purple opacity-60 uppercase tracking-widest font-bold">
            Resonance Discovery Session
          </p>
          <div className="w-full h-px bg-marker-black/10 mt-4 sm:mt-8"></div>
        </header>

        {!recommendation && !loading && currentQuestion && (
          <div className="space-y-8 sm:space-y-12">
            {/* Progress Bar */}
            <div className="space-y-2 sm:space-y-3">
              <div className="flex justify-between items-center px-1">
                <span className="handwritten text-[10px] uppercase tracking-widest text-marker-black opacity-40 font-bold">
                  Synthesizing Profile...
                </span>
                <span className="heading-marker text-xl sm:text-2xl text-marker-purple">
                  {currentIndex + 1} / 8
                </span>
              </div>
              <div className="w-full h-1.5 bg-marker-black/5 overflow-hidden marker-border">
                <div 
                  className="h-full bg-marker-purple transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent || 5}%` }}
                />
              </div>
            </div>

            {/* Question */}
            <div className="space-y-6 sm:space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <h3 className="heading-marker text-3xl sm:text-5xl text-marker-black lowercase leading-tight">
                {currentQuestion.prompt}
              </h3>

              {/* Options */}
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                {currentQuestion.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(option)}
                    className="w-full p-5 sm:p-8 text-left marker-border border-marker-black/10 bg-white/40 hover:bg-marker-purple/5 hover:border-marker-purple/40 transition-all group relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-marker-purple opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <span className="handwritten text-xl sm:text-2xl text-marker-black group-hover:text-marker-purple transition-colors font-medium">
                      {option.text}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {(loading || visualizing) && (
          <div className="flex flex-col items-center justify-center py-24 sm:py-32 gap-6 sm:gap-8">
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 border-4 border-marker-purple border-t-transparent animate-spin rounded-full"></div>
              <div className="absolute inset-0 flex items-center justify-center heading-marker text-2xl text-marker-purple opacity-20">Ω</div>
            </div>
            <div className="text-center space-y-2">
              <span className="handwritten text-lg sm:text-xl text-marker-purple animate-pulse italic uppercase tracking-widest font-black">
                {loading ? 'Consulting the Archive...' : 'Materializing Visual Specimen...'}
              </span>
              <p className="handwritten text-xs opacity-40 uppercase tracking-widest">Coalescing vibrational data</p>
            </div>
          </div>
        )}

        {recommendation && !loading && !visualizing && (
          <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
            <div className="text-center space-y-2 sm:space-y-4 pb-6 sm:pb-8 border-b-2 border-marker-purple/10">
              <div className="handwritten text-[10px] sm:text-xs uppercase tracking-[0.5em] text-marker-black opacity-40 font-bold">
                Archival Match Found
              </div>
              <h3 className="heading-marker text-4xl sm:text-7xl text-marker-purple lowercase leading-tight">
                {recommendation.deckName}
              </h3>
              <p className="handwritten text-lg sm:text-xl text-marker-black opacity-60 italic font-medium">
                {recommendation.creator}
              </p>
            </div>

            {sampleCards.length > 0 && (
              <section className="space-y-8">
                <div className="flex items-center gap-4">
                   <span className="handwritten text-xs font-black uppercase text-marker-black/30 tracking-[0.5em]">Visual Archetype Manifest</span>
                   <div className="h-px bg-marker-black/10 flex-grow"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                  {sampleCards.map((url, idx) => (
                    <div key={idx} className="group relative">
                       <div className="absolute inset-0 bg-marker-black translate-x-2 translate-y-2 opacity-5 rounded-lg"></div>
                       <div className="relative z-10 marker-border border-marker-black/20 bg-white p-3 shadow-xl transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl">
                          <img 
                            src={url} 
                            alt={`Sample Card ${idx + 1}`} 
                            className="w-full aspect-[3/4] object-cover grayscale opacity-90 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" 
                          />
                       </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <div className="p-8 sm:p-12 marker-border border-marker-purple bg-white shadow-2xl relative rounded-lg overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-[0.03] select-none pointer-events-none heading-marker text-[12rem] leading-none">MATCH</div>
              <div className="flex justify-between items-center mb-6 sm:mb-8 border-b-2 border-marker-purple/10 pb-4 relative z-10">
                <span className="handwritten text-[10px] sm:text-xs font-black uppercase text-marker-purple tracking-[0.4em]">
                  <GlossaryTerm word="Resonance">Resonance</GlossaryTerm> Analysis
                </span>
                <ReadAloudButton 
                  text={`${recommendation.description}. ${recommendation.whyMatch}`} 
                  className="!py-1.5 !px-3 !text-[10px] bg-marker-purple/5 border-marker-purple/10 text-marker-purple min-h-0" 
                />
              </div>
              <p className="handwritten text-2xl sm:text-4xl italic text-marker-black font-medium leading-relaxed relative z-10">
                "{recommendation.description}"
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="p-8 marker-border border-marker-black/10 bg-white/40 space-y-4">
                  <span className="handwritten text-[10px] sm:text-xs font-bold uppercase text-marker-black/40 tracking-widest block italic border-b border-marker-black/5 pb-2">Heuristic Alignment</span>
                  <p className="heading-marker text-3xl text-marker-black lowercase leading-snug">
                    {recommendation.whyMatch}
                  </p>
               </div>
               
               <div className="p-8 marker-border border-marker-black/10 bg-marker-black/[0.02] space-y-4">
                  <span className="handwritten text-[10px] sm:text-xs font-bold uppercase text-marker-black/40 tracking-widest block italic border-b border-marker-black/5 pb-2">Key Symbolic Themes</span>
                  <div className="flex flex-wrap gap-2">
                    {recommendation.keyThemes && recommendation.keyThemes.map((theme: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-white border border-marker-black/10 text-[9px] font-black uppercase text-marker-black/60 tracking-widest rounded-full">
                        {theme}
                      </span>
                    ))}
                  </div>
               </div>
            </div>

            <div className="p-8 sm:p-12 bg-marker-black/[0.01] marker-border border-marker-black/10 rounded-lg space-y-8 shadow-inner">
              <div className="flex justify-between items-center border-b-2 border-marker-black/5 pb-4">
                 <span className="handwritten text-xs sm:text-sm uppercase tracking-[0.3em] text-marker-black opacity-30 font-black italic">
                   Archival Acquisition Portal
                 </span>
                 <div className="text-right">
                    <span className="text-[10px] font-mono opacity-20 block mb-1">EST. COST</span>
                    <span className="heading-marker text-2xl sm:text-4xl text-marker-purple">
                      {recommendation.estimatedPrice}
                    </span>
                 </div>
              </div>
              
              <div className="space-y-6">
                <p className="handwritten text-xl sm:text-2xl text-marker-black/70 italic leading-relaxed">
                  {recommendation.whereToFind}
                </p>
                <a 
                  href={recommendation.acquisitionLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="brutalist-button w-full !bg-marker-black !text-white !py-6 sm:!py-8 !text-xl group shadow-2xl"
                >
                  Access Procurement Node <span className="ml-4 group-hover:translate-x-2 transition-transform inline-block">→</span>
                </a>
              </div>
            </div>

            <div className="flex justify-center pt-8">
              <button 
                onClick={restart}
                className="text-[10px] sm:text-xs font-black uppercase tracking-[0.4em] text-marker-black/20 hover:text-marker-purple underline decoration-2 underline-offset-8 transition-colors"
              >
                Reset Discovery Protocol
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeckMatcher;
