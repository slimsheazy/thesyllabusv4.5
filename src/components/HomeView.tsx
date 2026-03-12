import React from 'react';
import { useSyllabusStore } from '../store';
import { ReadAloudButton } from './shared/ReadAloudButton';
import { LiveResonance } from './LiveResonance';
import { ALL_TOOLS } from '../constants/tools';
import { Pin, ArrowRight, Book, Brain, Clock } from 'lucide-react';
import { useSeekerLevel } from '../hooks/useSeekerLevel';

interface HomeViewProps {
  onEnter: () => void;
  onNavigate: (page: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onEnter, onNavigate }) => {
  const { userIdentity, pinnedTools } = useSyllabusStore();
  const { level, calculationsRun } = useSeekerLevel();
  
  const pinnedItems = ALL_TOOLS.filter(tool => pinnedTools.includes(tool.page));

  return (
    <div className="relative min-h-screen flex flex-col bg-archive-bg">
      <div className="relative min-h-screen flex flex-col items-center justify-center p-6 sm:p-12 overflow-hidden">
        <div className="max-w-4xl w-full space-y-6 sm:space-y-12 flex flex-col items-center py-12 z-10">
          <header className="space-y-4 text-center max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="flex flex-col items-center gap-2">
              <div className="px-3 py-0.5 border border-archive-line rounded-full bg-white shadow-sm flex items-center gap-2">
                <span className="text-xs text-archive-accent animate-pulse">☉</span>
                <span className="label-gidole opacity-40">
                  {userIdentity ? `Info on ${userIdentity}` : "Your Personal Study Guide"}
                </span>
              </div>
              {calculationsRun > 0 && (
                <div className="label-gidole text-archive-accent">
                  Your Level: {level}
                </div>
              )}
            </div>
            <h1 className="title-main text-archive-ink">the syllabus</h1>
            <div className="flex flex-col items-center gap-4">
              <p className="body-gidole opacity-60 max-w-md mx-auto">
                A bunch of easy tools and shared tips to help you figure out the big stuff in life.
              </p>
              <ReadAloudButton text="the syllabus. A bunch of easy tools and shared tips to help you figure out the big stuff in life." className="!p-2 !h-auto !w-auto !bg-transparent !border-none !shadow-none opacity-20 hover:opacity-100" />
            </div>
          </header>

          <div className="flex gap-6 pt-4 pb-8 animate-in fade-in zoom-in-95 duration-1000 delay-300">
            <button 
              onClick={onEnter}
              className="brutalist-button px-12 py-5 text-xl bg-archive-ink text-archive-bg shadow-xl hover:scale-105 transition-transform"
            >
              Start Exploring
            </button>
          </div>

          <div className="pt-8 opacity-10 flex flex-col items-center gap-3">
            <div className="w-px h-16 bg-gradient-to-b from-archive-ink to-transparent" />
            <span className="label-gidole">scroll down</span>
          </div>
        </div>

        <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute bottom-[-20%] right-[-10%] w-[50rem] h-[50rem] border border-archive-ink/[0.03] rounded-full" />
          <div className="absolute top-[-10%] left-[-15%] w-[35rem] h-[35rem] border border-archive-ink/[0.03] rounded-full" />
        </div>
      </div>

      <section className="border-t border-archive-line bg-white/30 backdrop-blur-sm py-20">
        <div className="max-w-6xl mx-auto px-6 space-y-24">
          <LiveResonance />

          {pinnedItems.length > 0 && (
            <div className="space-y-8">
              <div className="flex items-center gap-3 border-b border-archive-line pb-4">
                <Pin className="text-archive-accent" size={20} />
                <h2 className="title-main text-4xl">Pinned Records</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pinnedItems.map((tool) => (
                  <button 
                    key={tool.page}
                    onClick={() => onNavigate(tool.page)}
                    className="archive-card-interactive p-8"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                      <ArrowRight size={40} />
                    </div>
                    <h3 className="text-2xl font-serif italic mb-2 text-archive-ink group-hover:text-archive-accent transition-colors">{tool.name}</h3>
                    <p className="handwritten text-sm italic opacity-60 line-clamp-2">{tool.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <button 
              onClick={() => onNavigate("MASTER_ARCHIVE")}
              className="archive-card-interactive p-10 group text-center space-y-4"
            >
              <Clock className="mx-auto opacity-20 group-hover:opacity-100 group-hover:text-archive-accent transition-all" size={32} />
              <h3 className="text-xl font-serif italic">Master Archive</h3>
              <p className="text-[10px] font-mono uppercase opacity-40">View all recorded resonances</p>
            </button>
            <button 
              onClick={() => onNavigate("LEXICON")}
              className="archive-card-interactive p-10 group text-center space-y-4"
            >
              <Book className="mx-auto opacity-20 group-hover:opacity-100 group-hover:text-archive-accent transition-all" size={32} />
              <h3 className="text-xl font-serif italic">Lexicon</h3>
              <p className="text-[10px] font-mono uppercase opacity-40">Your discovered vocabulary</p>
            </button>
            <button 
              onClick={() => onNavigate("ORACLE")}
              className="archive-card-interactive p-10 group text-center space-y-4"
            >
              <Brain className="mx-auto opacity-20 group-hover:opacity-100 group-hover:text-archive-accent transition-all" size={32} />
              <h3 className="text-xl font-serif italic">The Librarian</h3>
              <p className="text-[10px] font-mono uppercase opacity-40">Consult the archive's wisdom</p>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
