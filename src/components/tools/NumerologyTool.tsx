import React, { useState, useEffect, useCallback } from 'react';
import { useSyllabusStore } from '../../store';
import { useHaptics } from '../../hooks/useHaptics';
import { useProfile } from '../../hooks/useProfile';
import { geminiService } from '../../services/geminiService';
import { Type } from "@google/genai";
import { WritingEffect } from '../shared/WritingEffect';
import { ReadAloudButton } from '../shared/ReadAloudButton';
import { Loader2, Sparkles, Zap, Hash } from 'lucide-react';
import { ToolLayout } from '../shared/ToolLayout';
import { ResultSection } from '../shared/ResultSection';
import { ProfileSelector } from '../shared/ProfileSelector';

interface NumerologyToolProps {
  onBack: () => void;
}

interface NumerologyAnalysis {
  systemComparison: string;
  lifePath: string;
  destinyNumber: string;
  soulUrge: string;
  meaning: string;
  esotericInsight: string;
}

export const NumerologyTool: React.FC<NumerologyToolProps> = ({ onBack }) => {
  const { recordCalculation, setUserIdentity } = useSyllabusStore();
  const { triggerClick, triggerSuccess } = useHaptics();
  const { profile, setMe, setSomeoneElse, updateProfile, isValid } = useProfile();
  const [system, setSystem] = useState("pythagorean");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<NumerologyAnalysis | null>(null);

  const getAnalysis = useCallback(async () => {
    triggerClick();
    if (!isValid) return;
    setLoading(true);
    setResult(null);
    
    if (profile.isMe) {
      setUserIdentity(profile.name);
    }
    
    try {
      const analysis = await geminiService.generateJson<NumerologyAnalysis>(
        `Calculate personal numerological paths for: Name: ${profile.name}, Birthday: ${profile.birthday}, System: ${system}. IMPORTANT: Return the lifePath, destinyNumber, and soulUrge as digits (e.g., "11", "7", "22") and NOT as words.`,
        {
          type: Type.OBJECT,
          properties: {
            systemComparison: { type: Type.STRING },
            lifePath: { type: Type.STRING },
            destinyNumber: { type: Type.STRING },
            soulUrge: { type: Type.STRING },
            meaning: { type: Type.STRING },
            esotericInsight: { type: Type.STRING }
          },
          required: ["systemComparison", "lifePath", "destinyNumber", "soulUrge", "meaning", "esotericInsight"]
        }
      );
      if (analysis) {
        setResult(analysis);
        recordCalculation();
        triggerSuccess();
      }
    } catch (error) {
      console.error("Numerology analysis failed:", error);
    } finally {
      setLoading(false);
    }
  }, [profile.name, profile.birthday, profile.isMe, system, isValid, setUserIdentity, recordCalculation, triggerSuccess, triggerClick]);

  useEffect(() => {
    if (profile.isMe && profile.name && profile.birthday && !result && !loading) {
      getAnalysis();
    }
  }, [profile.isMe, profile.name, profile.birthday, result, loading, getAnalysis]);

  return (
    <ToolLayout
      title="Life Path Analysis"
      subtitle="Analyzing the numerical data of your identity"
      onBack={onBack}
      tooltipTitle="The Numerical Archive"
      tooltipContent="Numerology is the study of the esoteric relationship between numbers and physical objects or living things. Your name and birth date are numerical keys to your archive."
    >
      <div className="w-full flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
        <aside className="w-full lg:w-[400px] space-y-8 lg:sticky lg:top-20">
          <div className="archive-card p-6 space-y-8 animate-in fade-in slide-in-from-left-4 duration-300">
            <ProfileSelector 
              isMe={profile.isMe}
              onMe={setMe}
              onSomeoneElse={setSomeoneElse}
            />

            <div className="space-y-3">
              <label className="handwritten text-[10px] text-archive-ink opacity-40 block ml-2 uppercase tracking-widest">Calculation System</label>
              <div className="flex gap-2 p-1 bg-archive-bg rounded-xl border border-archive-line">
                <button 
                  onClick={() => setSystem("pythagorean")} 
                  className={`flex-1 py-3 px-2 transition-all rounded-lg handwritten text-[10px] uppercase tracking-widest ${system === "pythagorean" ? "bg-archive-ink text-archive-bg shadow-md" : "text-archive-ink/40 hover:text-archive-ink"}`}
                >
                  Pythagorean
                </button>
                <button 
                  onClick={() => setSystem("chaldean")} 
                  className={`flex-1 py-3 px-2 transition-all rounded-lg handwritten text-[10px] uppercase tracking-widest ${system === "chaldean" ? "bg-archive-ink text-archive-bg shadow-md" : "text-archive-ink/40 hover:text-archive-ink"}`}
                >
                  Chaldean
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="handwritten text-[10px] uppercase text-archive-ink opacity-40 block ml-2 tracking-widest">Full Name</label>
              <input 
                type="text" 
                placeholder="e.g. John Doe" 
                className="w-full p-4 text-archive-ink text-xl italic bg-archive-bg/50 rounded-lg outline-none border border-transparent focus:border-archive-accent" 
                value={profile.name} 
                onChange={e => updateProfile({ name: e.target.value })} 
              />
            </div>

            <div className="space-y-2">
              <label className="handwritten text-[10px] uppercase text-archive-ink opacity-40 block ml-2 tracking-widest">Birth Date</label>
              <input 
                type="date" 
                className="w-full p-4 text-archive-ink text-xl italic bg-archive-bg/50 rounded-lg outline-none border border-transparent focus:border-archive-accent" 
                value={profile.birthday} 
                onChange={e => updateProfile({ birthday: e.target.value })} 
              />
            </div>

            <button 
              onClick={getAnalysis} 
              disabled={loading || !isValid} 
              className={`brutalist-button w-full !py-6 !text-2xl transition-all ${!isValid ? "opacity-30" : "!bg-archive-accent text-white shadow-xl"}`}
            >
              {loading ? "Crunching numbers..." : "Check My Path"}
            </button>
          </div>
        </aside>

        <main className="flex-1 w-full min-h-[600px] pb-32">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-8 py-40">
              <Loader2 className="w-20 h-20 border-4 border-archive-accent border-t-transparent animate-spin rounded-full text-archive-accent" />
              <span className="handwritten text-xl text-archive-accent animate-pulse uppercase tracking-[0.4em]">Doing the math...</span>
            </div>
          ) : result ? (
            <div className="w-full space-y-10 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "Life Path", val: result.lifePath },
                  { label: "Destiny", val: result.destinyNumber },
                  { label: "Soul Urge", val: result.soulUrge }
                ].map((t, m) => (
                  <div key={t.label} className="archive-card p-6 text-center group transition-transform hover:scale-105">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Hash className="w-3 h-3 text-archive-accent opacity-40" />
                      <span className="handwritten text-[10px] text-archive-ink/30 block uppercase tracking-widest">{t.label}</span>
                    </div>
                    <span className={`heading-marker text-6xl ${m === 1 ? "text-archive-accent" : "text-archive-ink"}`}>{t.val}</span>
                  </div>
                ))}
              </div>

              <ResultSection
                id="numerology-result-content"
                title="Archive Resonance"
                content={result.meaning}
                exportName={`numerology-${profile.name}`}
              >
                <div className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-archive-line pb-4">
                    <Zap className="text-archive-accent w-4 h-4" />
                    <span className="text-[10px] font-mono text-archive-accent uppercase tracking-[0.3em] font-bold">Interpretation</span>
                  </div>
                  <div className="font-serif text-lg md:text-xl italic text-archive-ink/80 leading-relaxed relative z-10 columns-1 md:columns-2 gap-12 text-left">
                    <WritingEffect text={result.meaning} />
                  </div>
                  <p className="mt-4 text-[9px] opacity-30 italic font-mono uppercase tracking-widest">{result.systemComparison}</p>
                </div>
              </ResultSection>

              <div className="archive-card p-10 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.02] select-none pointer-events-none text-9xl italic">PATH</div>
                <div className="absolute top-6 right-6">
                  <ReadAloudButton text={result.esotericInsight} className="!p-1 !h-auto !w-auto !bg-transparent !border-none !shadow-none opacity-20 hover:opacity-100" />
                </div>
                <div className="handwritten text-[10px] text-archive-accent uppercase italic tracking-widest mb-4">Final Insight</div>
                <p className="heading-marker text-3xl sm:text-4xl text-archive-ink lowercase leading-tight">{result.esotericInsight}</p>
              </div>
            </div>
          ) : (
            <div className="text-center opacity-[0.03] flex flex-col items-center justify-center h-full py-40 select-none pointer-events-none">
              <Sparkles size={200} className="mb-8" />
              <p className="handwritten text-4xl uppercase tracking-[0.4em]">Waiting for your data</p>
            </div>
          )}
        </main>
      </div>
    </ToolLayout>
  );
};
