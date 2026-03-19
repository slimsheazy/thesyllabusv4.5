import React, { useState } from 'react';
import { GlossaryTerm } from '../GlossaryEngine';
import { geminiService } from '../../services/geminiService';
import { useSyllabusStore } from '../../store';
import { ReadAloudButton } from '../shared/ReadAloudButton';
import { ToolProps } from '../../types';

interface Shelf {
  id: string;
  name: string;
  books: { title: string, author: string }[];
  color: string;
}

const SHELVES: Shelf[] = [
  {
    id: 'philosophy',
    name: 'Gnostic & Stoic Philosophy',
    color: 'var(--marker-blue)',
    books: [
      { title: 'The Meditations', author: 'Marcus Aurelius' },
      { title: 'The Enchiridion', author: 'Epictetus' },
      { title: 'The Gospel of Thomas', author: 'Didymos Judas Thomas' },
      { title: 'Pistis Sophia', author: 'Ancient Coptic Text' }
    ]
  },
  {
    id: 'poetry',
    name: 'Transcendent Poetry',
    color: 'var(--marker-purple)',
    books: [
      { title: 'Leaves of Grass', author: 'Walt Whitman' },
      { title: 'The Divine Comedy', author: 'Dante Alighieri' },
      { title: 'The Rubaiyat', author: 'Omar Khayyam' },
      { title: 'Sonnets', author: 'William Shakespeare' }
    ]
  },
  {
    id: 'mystery',
    name: 'Gothic & Victorian Mystery',
    color: 'var(--marker-red)',
    books: [
      { title: 'The King in Yellow', author: 'Robert W. Chambers' },
      { title: 'The Great God Pan', author: 'Arthur Machen' },
      { title: 'Frankenstein', author: 'Mary Shelley' },
      { title: 'The House on the Borderland', author: 'William Hope Hodgson' }
    ]
  },
  {
    id: 'hermetic',
    name: 'Hermetic & Occult',
    color: 'var(--marker-teal)',
    books: [
      { title: 'The Kybalion', author: 'The Three Initiates' },
      { title: 'The Corpus Hermeticum', author: 'Hermes Trismegistus' },
      { title: 'The Secret Doctrine', author: 'H.P. Blavatsky' },
      { title: 'Morals and Dogma', author: 'Albert Pike' }
    ]
  }
];

const StichomancyTool: React.FC<ToolProps> = ({ onBack }) => {
  const [selectedShelf, setSelectedShelf] = useState<Shelf>(SHELVES[0]);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { recordCalculation } = useSyllabusStore();

  const handleScry = async () => {
    if ('vibrate' in navigator) navigator.vibrate([10, 30, 10]);
    setLoading(true);
    setResult(null);

    const randomBook = selectedShelf.books[Math.floor(Math.random() * selectedShelf.books.length)];
    const data = await geminiService.getStichomancyPassage(selectedShelf.name, randomBook.title, randomBook.author);
    
    if (data) {
      setResult(data);
      recordCalculation();
      if ('vibrate' in navigator) navigator.vibrate(50);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-12 sm:py-20 px-4 sm:px-8 relative max-w-6xl mx-auto overflow-x-hidden">
      <button 
        onClick={onBack} 
        className="fixed top-4 right-4 sm:top-8 sm:right-8 brutalist-button !text-[10px] sm:!text-sm !px-3 sm:!px-4 !py-1 z-50 bg-white"
      >
        Index
      </button>

      <div className="w-full space-y-12 sm:space-y-16">
        <header className="text-center space-y-4">
          <h2 className="heading-marker text-5xl sm:text-7xl text-marker-green lowercase leading-none">
            Archival <GlossaryTerm word="Stichomancy">Stichomancy</GlossaryTerm>
          </h2>
          <p className="handwritten text-sm sm:text-lg text-marker-green opacity-40 font-bold uppercase tracking-widest italic">
            Divination through random <GlossaryTerm word="Lexicon">passage</GlossaryTerm> selection
          </p>
          <div className="w-full h-px bg-marker-green/10 mt-4"></div>
        </header>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Controls */}
          <div className="w-full lg:w-[350px] space-y-8 lg:sticky lg:top-20">
             <div className="p-6 marker-border border-marker-black bg-white shadow-xl space-y-6">
                <span className="handwritten text-[10px] font-black uppercase text-marker-black/40 tracking-[0.3em] block border-b border-marker-black/5 pb-2">Select Archive Shelf</span>
                <div className="flex flex-col gap-2">
                   {SHELVES.map(s => (
                     <button 
                       key={s.id}
                       onClick={() => {
                         if ('vibrate' in navigator) navigator.vibrate(5);
                         setSelectedShelf(s);
                       }}
                       className={`p-4 marker-border text-left transition-all group ${selectedShelf.id === s.id ? 'bg-marker-black text-white border-marker-black shadow-lg scale-[1.02]' : 'bg-white border-marker-black/10 text-marker-black/40 hover:text-marker-black'}`}
                     >
                        <div className="flex items-center gap-3">
                           <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }}></div>
                           <span className="handwritten text-xs font-bold uppercase tracking-widest">{s.name}</span>
                        </div>
                     </button>
                   ))}
                </div>
                <button 
                  onClick={handleScry}
                  disabled={loading}
                  className="brutalist-button w-full !py-6 !text-xl !bg-marker-green !text-white !border-marker-green shadow-xl mt-4"
                >
                  {loading ? 'Consulting Volumes...' : 'Close Eyes & Point'}
                </button>
             </div>
             
             <div className="p-6 marker-border border-marker-black/5 bg-marker-black/[0.02] space-y-2 italic text-center">
                <p className="handwritten text-sm text-marker-black/40 leading-relaxed">
                  "The volume is selected by chance; the line is selected by spirit."
                </p>
             </div>
          </div>

          {/* Result Area */}
          <div className="flex-1 w-full min-h-[500px] pb-24">
             {loading ? (
               <div className="flex flex-col items-center justify-center h-full py-40 gap-10">
                  <div className="relative">
                     <div className="w-20 h-20 border-2 border-marker-green border-t-transparent animate-spin rounded-full"></div>
                     <div className="absolute inset-0 flex items-center justify-center heading-marker text-2xl text-marker-green opacity-20">Ω</div>
                  </div>
                  <span className="handwritten text-xl text-marker-green animate-pulse font-black uppercase tracking-[0.4em]">Leafing through the void...</span>
               </div>
             ) : result ? (
               <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                  
                  {/* The Torn Page Fragment */}
                  <div className="relative group">
                     {/* Torn Paper Effect */}
                     <div className="absolute inset-0 bg-marker-black translate-x-2 translate-y-2 opacity-5 rounded-sm"></div>
                     
                     <div className="relative z-10 bg-[#fdfbf7] p-8 sm:p-14 marker-border border-marker-black shadow-2xl overflow-hidden min-h-[350px] flex flex-col justify-center">
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/[0.02] pointer-events-none"></div>
                        
                        <div className="flex justify-between items-start mb-10 border-b border-marker-black/10 pb-4">
                           <div className="space-y-1">
                              <span className="text-[10px] font-mono text-marker-black/40 uppercase tracking-widest">Fragment ID: {result.bookInfo.year || 'UNDATED'}</span>
                              <h3 className="heading-marker text-3xl sm:text-4xl text-marker-black lowercase">{result.bookInfo.title}</h3>
                              <p className="handwritten text-lg text-marker-black/60 italic">— {result.bookInfo.author}</p>
                           </div>
                           <ReadAloudButton text={result.quote} className="!py-1 !px-3" />
                        </div>

                        <div className="relative">
                           <span className="absolute -left-6 -top-4 text-7xl text-marker-black/5 heading-marker select-none pointer-events-none">"</span>
                           <p className="handwritten text-3xl sm:text-4xl lg:text-5xl italic text-marker-black font-medium leading-[1.3] relative z-10">
                              {result.quote}
                           </p>
                        </div>
                        
                        <div className="mt-12 pt-6 border-t border-marker-black/5 flex justify-end">
                           <span className="handwritten text-[10px] font-black uppercase text-marker-black/20 tracking-[0.5em] italic">The records are silent otherwise.</span>
                        </div>
                     </div>
                  </div>

                  {/* Divinatory Interpretation */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-0 marker-border border-marker-blue bg-white shadow-xl overflow-hidden rounded-lg">
                     <div className="md:col-span-1 bg-marker-blue flex items-center justify-center p-8">
                        <span className="heading-marker text-7xl text-white rotate-[-90deg] md:rotate-0">!</span>
                     </div>
                     <div className="md:col-span-4 p-8 sm:p-10 flex flex-col justify-center space-y-4">
                        <div className="flex justify-between items-center">
                           <span className="handwritten text-[10px] font-black uppercase text-marker-blue tracking-[0.4em] italic">Vibrational Interpretation</span>
                           <ReadAloudButton text={result.divinatoryMeaning} className="!py-0.5 !px-2 !text-[9px] bg-marker-blue/5 min-h-0" />
                        </div>
                        <p className="handwritten text-2xl sm:text-3xl text-marker-black/80 leading-relaxed font-medium">
                           "{result.divinatoryMeaning}"
                        </p>
                     </div>
                  </div>

                  {/* Historical Insight */}
                  <div className="p-8 marker-border border-marker-black/10 bg-marker-black/[0.01] flex gap-6 items-start">
                     <div className="w-10 h-10 border border-marker-black/20 flex items-center justify-center font-serif text-xl opacity-30 shrink-0">i</div>
                     <div className="space-y-1">
                        <span className="handwritten text-[10px] font-bold uppercase opacity-30 tracking-widest">Archival Metadata</span>
                        <p className="handwritten text-lg text-marker-black/60 italic leading-snug">{result.sourceInsight}</p>
                     </div>
                  </div>

                  <div className="flex justify-center pt-8">
                     <button 
                        onClick={() => { setResult(null); if ('vibrate' in navigator) navigator.vibrate(5); }}
                        className="text-[10px] font-black uppercase text-marker-black/20 hover:text-marker-green underline decoration-2 underline-offset-4 tracking-[0.4em] transition-colors"
                     >
                        Release Fragment back to Library
                     </button>
                  </div>

               </div>
             ) : (
               <div className="flex flex-col items-center justify-center py-24 sm:py-48 opacity-[0.03] select-none pointer-events-none">
                  <div className="text-[12rem] sm:text-[18rem] heading-marker leading-none uppercase">Scroll</div>
                  <p className="handwritten text-4xl mt-4 uppercase tracking-[0.5em]">Awaiting Contact</p>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StichomancyTool;
