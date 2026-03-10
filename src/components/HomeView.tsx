import React from 'react';
import { useSyllabusStore } from '../store';
import { ReadAloudButton } from './ReadAloudButton';

interface HomeViewProps {
  onEnter: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onEnter }) => {
  const { calculationsRun, userIdentity } = useSyllabusStore();
  
  const level = calculationsRun >= 25 ? "Expert Seeker" : 
                calculationsRun >= 15 ? "Deep Diver" : 
                calculationsRun >= 10 ? "Regular Visitor" : 
                calculationsRun >= 5 ? "Curious Student" : "Newcomer";

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-6 sm:p-12 overflow-hidden bg-archive-bg">
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
  );
};
