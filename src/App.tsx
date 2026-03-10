import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useSyllabusStore } from './store';
import { motion, AnimatePresence } from 'motion/react';

// Core Components (Static)
import { ArchiveHeader } from './components/ArchiveHeader';
import { ArchiveList } from './components/ArchiveList';
import { ArchiveCard } from './components/ArchiveCard';
import { ArchiveDetail } from './components/ArchiveDetail';
import { MenuButton } from './components/MenuButton';
import { NavigationOverlay } from './components/NavigationOverlay';
import { HomeView } from './components/HomeView';
import { TransitNotifier } from './components/TransitNotifier';
import { Onboarding } from './components/Onboarding';
import { ErrorBoundary } from './components/ErrorBoundary';

// Lazy Loaded Tools
const HoraryTool = lazy(() => import('./components/HoraryTool').then(m => ({ default: m.HoraryTool })));
const NumerologyTool = lazy(() => import('./components/NumerologyTool').then(m => ({ default: m.NumerologyTool })));
const SabianSymbolsTool = lazy(() => import('./components/SabianSymbolsTool').then(m => ({ default: m.SabianSymbolsTool })));
const TarotTool = lazy(() => import('./components/TarotTool').then(m => ({ default: m.TarotTool })));
const BirthChartTool = lazy(() => import('./components/BirthChartTool').then(m => ({ default: m.BirthChartTool })));
const FlyingStarTool = lazy(() => import('./components/FlyingStarTool').then(m => ({ default: m.FlyingStarTool })));
const AkashicRecordsTool = lazy(() => import('./components/AkashicRecordsTool').then(m => ({ default: m.AkashicRecordsTool })));
const LostItemFinder = lazy(() => import('./components/LostItemFinder').then(m => ({ default: m.LostItemFinder })));
const SigilMaker = lazy(() => import('./components/SigilMaker').then(m => ({ default: m.SigilMaker })));
const BiorhythmTool = lazy(() => import('./components/BiorhythmTool').then(m => ({ default: m.BiorhythmTool })));
const CosmicMadLibs = lazy(() => import('./components/CosmicMadLibs').then(m => ({ default: m.CosmicMadLibs })));
const SharedInsights = lazy(() => import('./components/SharedInsights').then(m => ({ default: m.SharedInsights })));
const DreamJournal = lazy(() => import('./components/DreamJournal').then(m => ({ default: m.DreamJournal })));
const MoodTracker = lazy(() => import('./components/MoodTracker').then(m => ({ default: m.MoodTracker })));
const DailyRitual = lazy(() => import('./components/DailyRitual').then(m => ({ default: m.DailyRitual })));
const ColorOracle = lazy(() => import('./components/ColorOracle').then(m => ({ default: m.ColorOracle })));
const TeaLeafReader = lazy(() => import('./components/TeaLeafReader').then(m => ({ default: m.TeaLeafReader })));
const CrystalBall = lazy(() => import('./components/CrystalBall').then(m => ({ default: m.CrystalBall })));
const PendulumTool = lazy(() => import('./components/PendulumTool').then(m => ({ default: m.PendulumTool })));
const SynchronicityDecoder = lazy(() => import('./components/SynchronicityDecoder').then(m => ({ default: m.SynchronicityDecoder })));
const OracleTool = lazy(() => import('./components/OracleTool').then(m => ({ default: m.OracleTool })));
const MasterArchive = lazy(() => import('./components/MasterArchive').then(m => ({ default: m.MasterArchive })));
const GematriaTool = lazy(() => import('./components/GematriaTool').then(m => ({ default: m.GematriaTool })));
const LenormandSpinner = lazy(() => import('./components/LenormandSpinner').then(m => ({ default: m.LenormandSpinner })));
const BookOfLife = lazy(() => import('./components/BookOfLife').then(m => ({ default: m.BookOfLife })));
import { ALL_TOOLS } from './constants/tools';
import { Search } from 'lucide-react';

const LoadingView = () => (
  <div className="flex-1 flex items-center justify-center bg-archive-bg h-screen">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-2 border-archive-ink/10 border-t-archive-accent rounded-full animate-spin" />
      <p className="handwritten text-lg italic opacity-40">Consulting the records...</p>
    </div>
  </div>
);

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
  };

  const filteredTools = ALL_TOOLS.filter(tool => 
    tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderContent = () => {
    switch (currentPage) {
      case "HOME":
        return <HomeView onEnter={() => setIsMenuOpen(true)} />;
      case "HORARY":
        return <HoraryTool onBack={() => handleNavigate("HOME")} />;
      case "NUMEROLOGY":
        return <NumerologyTool onBack={() => handleNavigate("HOME")} />;
      case "GEMATRIA":
        return <GematriaTool onBack={() => handleNavigate("HOME")} />;
      case "SABIAN":
        return <SabianSymbolsTool onBack={() => handleNavigate("HOME")} />;
      case "TAROT":
        return <TarotTool onBack={() => handleNavigate("HOME")} />;
      case "BIRTH_CHART":
        return <BirthChartTool onBack={() => handleNavigate("HOME")} />;
      case "FLYING_STAR":
        return <FlyingStarTool onBack={() => handleNavigate("HOME")} />;
      case "AKASHIC":
        return <AkashicRecordsTool onBack={() => handleNavigate("HOME")} onNavigate={handleNavigate} />;
      case "LOST_ITEM":
        return <LostItemFinder onBack={() => handleNavigate("HOME")} />;
      case "SIGIL":
        return <SigilMaker onBack={() => handleNavigate("HOME")} />;
      case "BIORHYTHM":
        return <BiorhythmTool onBack={() => handleNavigate("HOME")} />;
      case "MAD_LIBS":
        return <CosmicMadLibs onBack={() => handleNavigate("HOME")} />;
      case "SHARED_INSIGHTS":
        return <SharedInsights onBack={() => handleNavigate("HOME")} />;
      case "DREAM_JOURNAL":
        return <DreamJournal onBack={() => handleNavigate("HOME")} />;
      case "MOOD":
        return <MoodTracker onBack={() => handleNavigate("HOME")} />;
      case "RITUAL":
        return <DailyRitual onBack={() => handleNavigate("HOME")} />;
      case "COLOR":
        return <ColorOracle onBack={() => handleNavigate("HOME")} />;
      case "TEA_LEAF":
        return <TeaLeafReader onBack={() => handleNavigate("HOME")} />;
      case "CRYSTAL":
        return <CrystalBall onBack={() => handleNavigate("HOME")} />;
      case "PENDULUM":
        return <PendulumTool onBack={() => handleNavigate("HOME")} />;
      case "SYNCHRONICITY":
        return <SynchronicityDecoder onBack={() => handleNavigate("HOME")} />;
      case "ORACLE":
        return <OracleTool onBack={() => handleNavigate("HOME")} />;
      case "LENORMAND":
        return <LenormandSpinner onBack={() => handleNavigate("HOME")} />;
      case "BOOK_OF_LIFE":
        return <BookOfLife onBack={() => handleNavigate("HOME")} />;
      case "MASTER_ARCHIVE":
        return <MasterArchive onBack={() => handleNavigate("HOME")} />;
      case "EXPLORER":
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
      default:
        return null;
    }
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

      <AnimatePresence>
        {/* Detail view removed as it was for mock sites */}
      </AnimatePresence>
    </div>
  );
}
