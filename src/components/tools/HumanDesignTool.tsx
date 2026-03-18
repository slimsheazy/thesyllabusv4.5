import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Dna, Sparkles, Zap, Target, Shield, RotateCcw } from 'lucide-react';
import { useSyllabusStore } from '../../store';
import { useHaptics } from '../../hooks/useHaptics';
import { useProfile } from '../../hooks/useProfile';
import { geminiService } from '../../services/geminiService';
import { ToolLayout } from '../shared/ToolLayout';
import { ResultSection } from '../shared/ResultSection';
import { HumanDesignAnalysis } from '../../types';

import { BodyGraph } from './HumanDesign/BodyGraph';

export const HumanDesignTool: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { recordCalculation } = useSyllabusStore();
  const { triggerClick, triggerSuccess } = useHaptics();
  const { profile, initials } = useProfile();
  
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<HumanDesignAnalysis | null>(null);

  const runAnalysis = async () => {
    if (!profile.birthday || !profile.location.name) {
      console.error("Missing profile details for Human Design analysis.");
      return;
    }

    triggerClick();
    setLoading(true);
    
    try {
      const result = await geminiService.getHumanDesignAnalysis({
        name: profile.name,
        birthday: profile.birthday,
        birthTime: profile.birthTime,
        location: profile.location
      });
      setAnalysis(result);
      recordCalculation();
      triggerSuccess();
    } catch (error) {
      console.error("Human Design analysis error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout
      title="Human Design"
      subtitle="The Science of Differentiation"
      onBack={onBack}
      tooltipTitle="The BodyGraph"
      tooltipContent="Human Design is a synthesis of ancient wisdom and modern genetics. It provides a map of your unique genetic design and a manual for how to navigate life with ease."
    >
      <div className="max-w-6xl mx-auto w-full space-y-12">
        {!analysis && !loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-8">
            <div className="w-32 h-32 rounded-full border-2 border-archive-ink/10 flex items-center justify-center relative">
              <Dna className="w-16 h-16 opacity-20" />
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-t-2 border-archive-accent rounded-full"
              />
            </div>
            
            <div className="text-center space-y-4 max-w-md">
              <h3 className="text-2xl font-serif italic">Decode Your BodyGraph</h3>
              <p className="text-sm opacity-60 leading-relaxed">
                Using your birth coordinates, we will retrieve your unique energetic blueprint from the Archive.
              </p>
            </div>

            <button 
              onClick={runAnalysis}
              className="brutalist-button px-12 py-4 flex items-center gap-3 group"
            >
              <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
              GENERATE BLUEPRINT
            </button>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-8">
            <div className="relative">
              <div className="w-16 h-16 border-2 border-archive-accent border-t-transparent animate-spin rounded-full" />
              <div className="absolute inset-0 flex items-center justify-center opacity-20">
                <Dna className="w-6 h-6" />
              </div>
            </div>
            <span className="handwritten text-lg text-archive-accent animate-pulse uppercase tracking-[0.3em]">Mapping Genetic Coordinates...</span>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: 'Type', value: analysis?.type, icon: <Zap className="w-3 h-3" /> },
                { label: 'Strategy', value: analysis?.strategy, icon: <Target className="w-3 h-3" /> },
                { label: 'Authority', value: analysis?.authority, icon: <Shield className="w-3 h-3" /> },
                { label: 'Profile', value: analysis?.profile, icon: <Sparkles className="w-3 h-3" /> },
              ].map((item, i) => (
                <div key={i} className="archive-card p-6 space-y-2 border-l-4 border-archive-accent">
                  <div className="flex items-center justify-between opacity-40">
                    <span className="text-[10px] font-mono uppercase tracking-widest">{item.label}</span>
                    {item.icon}
                  </div>
                  <div className="text-lg font-serif italic">{item.value}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Visual BodyGraph */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-4">
                  <h4 className="text-xs font-mono uppercase tracking-[0.3em] opacity-40 mb-4">Visual BodyGraph</h4>
                  <BodyGraph gates={analysis?.gates || []} centers={analysis?.centers || []} />
                  <div className="p-4 bg-archive-ink/5 rounded-archive border border-archive-line">
                    <p className="text-[10px] leading-relaxed opacity-60 italic">
                      The colored shapes represent defined centers, where energy is consistent. White shapes are undefined, where you are open to the environment.
                    </p>
                  </div>
                </div>
              </div>

              {/* Main Analysis */}
              <div className="lg:col-span-2 space-y-8">
                <div className="archive-card p-10 space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-3xl font-serif italic">The Librarian's Synthesis</h3>
                    <div className="horizontal-line opacity-20" />
                    <p className="text-lg leading-relaxed italic opacity-80">
                      {analysis?.summary}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-archive-line">
                    <div className="space-y-2">
                      <span className="col-header">Incarnation Cross</span>
                      <p className="text-sm font-medium">{analysis?.incarnationCross}</p>
                    </div>
                    <div className="space-y-2">
                      <span className="col-header">Definition</span>
                      <p className="text-sm font-medium">{analysis?.definition}</p>
                    </div>
                  </div>
                </div>

                {/* Centers Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysis?.centers.map((center, i) => (
                    <div key={i} className="archive-card p-6 flex gap-4 group">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        center.status === 'Defined' 
                          ? 'bg-archive-accent text-archive-bg' 
                          : 'bg-archive-ink/5 text-archive-ink opacity-40'
                      }`}>
                        <span className="text-xs font-mono font-bold">{center.name[0]}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold uppercase tracking-wider">{center.name}</h4>
                          <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-mono uppercase tracking-tighter ${
                            center.status === 'Defined' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-archive-ink/10 opacity-40'
                          }`}>
                            {center.status}
                          </span>
                        </div>
                        <p className="text-[11px] opacity-60 leading-relaxed group-hover:opacity-100 transition-opacity">
                          {center.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sidebar Info */}
              <div className="space-y-6">
                <div className="archive-card p-8 bg-archive-ink text-archive-bg space-y-6">
                  <h4 className="text-xs font-mono uppercase tracking-[0.3em] opacity-40">Archive Metadata</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-[10px] font-mono border-b border-white/10 pb-2">
                      <span className="opacity-40 uppercase">Subject</span>
                      <span>{profile.name}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-mono border-b border-white/10 pb-2">
                      <span className="opacity-40 uppercase">Coordinates</span>
                      <span>{profile.location.lat.toFixed(2)}, {profile.location.lng.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-mono border-b border-white/10 pb-2">
                      <span className="opacity-40 uppercase">Timestamp</span>
                      <span>{profile.birthday} @ {profile.birthTime}</span>
                    </div>
                  </div>
                  <p className="text-[10px] leading-relaxed opacity-40 italic">
                    The BodyGraph is a mechanical map. It does not require belief, only experimentation with your Strategy and Authority.
                  </p>
                </div>

                <button 
                  onClick={() => setAnalysis(null)}
                  className="w-full py-4 border border-archive-ink/10 text-[10px] font-mono uppercase tracking-widest hover:bg-archive-ink hover:text-archive-bg transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-3 h-3" /> Recalibrate Blueprint
                </button>
              </div>
            </div>

            <ResultSection
              id="human-design-result"
              type="Human Design"
              title="Genetic Blueprint"
              content={analysis?.summary || ""}
              exportName={`human-design-${profile.name}`}
              metadata={{ type: analysis?.type, strategy: analysis?.strategy, authority: analysis?.authority, profile: analysis?.profile }}
            />
          </motion.div>
        )}
      </div>
    </ToolLayout>
  );
};
