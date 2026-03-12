import React, { useState, useEffect, lazy, Suspense, useMemo } from 'react';
import { useSyllabusStore } from './store';
import { motion, AnimatePresence } from 'motion/react';

// Core Components (Static)
import { ArchiveHeader } from './components/ArchiveHeader';
import { MenuButton } from './components/MenuButton';
import { NavigationOverlay } from './components/NavigationOverlay';
import { HomeView } from './components/HomeView';
import { TransitNotifier } from './components/TransitNotifier';
import { Onboarding } from './components/Onboarding';
import { LoadingView } from './components/shared/LoadingView';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ALL_TOOLS } from './constants/tools';
import { Search } from 'lucide-react';

// Lazy Loaded Tools Registry
const ToolRegistry: Record<string, React.LazyExoticComponent<React.FC<any>>> = {
  HORARY: lazy(() => import('./components/tools/HoraryTool').then(m => ({ default: m.HoraryTool }))),
  NUMEROLOGY: lazy(() => import('./components/tools/NumerologyTool').then(m => ({ default: m.NumerologyTool }))),
  GEMATRIA: lazy(() => import('./components/tools/GematriaTool').then(m => ({ default: m.GematriaTool }))),
  SABIAN: lazy(() => import('./components/tools/SabianSymbolsTool').then(m => ({ default: m.SabianSymbolsTool }))),
  TAROT: lazy(() => import('./components/tools/TarotTool').then(m => ({ default: m.TarotTool }))),
  BIRTH_CHART: lazy(() => import('./components/tools/BirthChartTool').then(m => ({ default: m.BirthChartTool }))),
  FLYING_STAR: lazy(() => import('./components/tools/FlyingStarTool').then(m => ({ default: m.FlyingStarTool }))),
  AKASHIC: lazy(() => import('./components/tools/AkashicRecordsTool').then(m => ({ default: m.AkashicRecordsTool }))),
  LOST_ITEM: lazy(() => import('./components/tools/LostItemFinder').then(m => ({ default: m.LostItemFinder }))),
  SIGIL: lazy(() => import('./components/tools/SigilGenerator').then(m => ({ default: m.SigilGenerator }))),
  BIORHYTHM: lazy(() => import('./components/tools/BiorhythmTool').then(m => ({ default: m.BiorhythmTool }))),
  MAD_LIBS: lazy(() => import('./components/tools/CosmicProphecy').then(m => ({ default: m.CosmicProphecy }))),
  SHARED_INSIGHTS: lazy(() => import('./components/tools/SharedInsights').then(m => ({ default: m.SharedInsights }))),
  DREAM_JOURNAL: lazy(() => import('./components/tools/DreamJournal').then(m => ({ default: m.DreamJournal }))),
  MOOD: lazy(() => import('./components/tools/MoodTracker').then(m => ({ default: m.MoodTracker }))),
  DEATH_CLOCK: lazy(() => import('./components/tools/DeathClock').then(m => ({ default: m.DeathClock }))),
  CRASH_SIMULATOR: lazy(() => import('./components/tools/CrashSimulator').then(m => ({ default: m.CrashSimulator }))),
  RITUAL: lazy(() => import('./components/tools/DailyRitual').then(m => ({ default: m.DailyRitual }))),
  COLOR: lazy(() => import('./components/tools/ColorOracle').then(m => ({ default: m.ColorOracle }))),
  TEA_LEAF: lazy(() => import('./components/tools/TeaLeafReader').then(m => ({ default: m.TeaLeafReader }))),
  CRYSTAL: lazy(() => import('./components/tools/ScryingTool').then(m => ({ default: m.ScryingTool }))),
  PENDULUM: lazy(() => import('./components/tools/PendulumTool').then(m => ({ default: m.PendulumTool }))),
  SYNCHRONICITY: lazy(() => import('./components/tools/SynchronicityDecoder').then(m => ({ default: m.SynchronicityDecoder }))),
  ORACLE: lazy(() => import('./components/tools/GlyphicTool').then(m => ({ default: m.GlyphicTool }))),
  LENORMAND: lazy(() => import('./components/tools/LenormandSpinner').then(m => ({ default: m.LenormandSpinner }))),
  BOOK_OF_LIFE: lazy(() => import('./components/tools/BookOfLife').then(m => ({ default: m.BookOfLife }))),
  MASTER_ARCHIVE: lazy(() => import('./components/tools/MasterArchive').then(m => ({ default: m.MasterArchive }))),
  LEXICON: lazy(() => import('./components/tools/LexiconView').then(m => ({ default: m.LexiconView }))),
  ORACLE_VIEW: lazy(() => import('./components/tools/OracleView').then(m => ({ default: m.OracleView }))),
};

export default function App() {
  const [currentPage, setCurrentPage] = useState("HOME");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { updateLastAccess, isEclipseMode, isCalibrated } = useSyllabusStore();

  useEffect(() => {
    updateLastAccess();
    document.documentElement.classList.toggle('eclipse-mode', isEclipseMode);
  }, [isEclipseMode]);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    setIsMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const filteredTools = useMemo(() => 
    ALL_TOOLS.filter(tool => 
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.desc.toLowerCase().includes(searchQuery.toLowerCase())
    ), [searchQuery]
  );

  const renderContent = () => {
    if (currentPage === "HOME") {
      return <HomeView onEnter={() => setIsMenuOpen(true)} onNavigate={handleNavigate} />;
    }

    if (currentPage === "EXPLORER") {
      return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-archive-bg">
          <ArchiveHeader 
            title="Toolbox Explorer" 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <AnimatePresence mode="wait">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12"
              >
                <div className="flex items-center gap-2 mb-6 border-b border-archive-line pb-2">
                  <Search className="w-4 h-4 opacity-40" />
                  <h2 className="label-gidole">{searchQuery ? 'Matching Tools' : 'Available Tools'}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTools.map((tool) => (
                    <button
                      key={tool.page}
                      onClick={() => handleNavigate(tool.page)}
                      className="text-left p-4 border border-archive-line hover:bg-archive-ink hover:text-archive-bg transition-all group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="heading-marker text-lg">{tool.name}</span>
                        <span className="text-[10px] opacity-40 group-hover:opacity-100">TOOL</span>
                      </div>
                      <p className="handwritten text-sm opacity-60 group-hover:opacity-100 line-clamp-2 italic">{tool.desc}</p>
                    </button>
                  ))}
                </div>
              </motion.div>

              {filteredTools.length === 0 && searchQuery && (
                <motion.div 
                  key="no-results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-20 text-center"
                >
                  <div className="text-4xl mb-4 opacity-20">∅</div>
                  <p className="handwritten text-xl italic opacity-40">No tools found for "{searchQuery}"</p>
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="mt-4 text-[10px] uppercase tracking-widest border-b border-archive-ink/20 hover:border-archive-ink transition-colors"
                  >
                    Clear Search
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      );
    }

    const ToolComponent = ToolRegistry[currentPage];
    if (ToolComponent) {
      return <ToolComponent onBack={() => handleNavigate("HOME")} onNavigate={handleNavigate} />;
    }

    return <HomeView onEnter={() => setIsMenuOpen(true)} onNavigate={handleNavigate} />;
  };

  return (
    <div className="min-h-screen w-full relative bg-archive-bg selection:bg-archive-accent selection:text-white">
      {!isCalibrated && <Onboarding />}
      
      <TransitNotifier />
      
      <MenuButton isOpen={isMenuOpen} onClick={() => setIsMenuOpen(!isMenuOpen)} />

      <NavigationOverlay isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} onNavigate={handleNavigate} />

      <main className="min-h-screen w-full">
        <AnimatePresence mode="wait">
          <Suspense fallback={<LoadingView />}>
            <ErrorBoundary key={currentPage}>
              {renderContent()}
            </ErrorBoundary>
          </Suspense>
        </AnimatePresence>
      </main>
    </div>
  );
}
