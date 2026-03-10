import React, { useState } from 'react';
import { useSyllabusStore } from '../store';
import { useHaptics } from '../hooks/useHaptics';
import { geminiService } from '../services/geminiService';
import { Type } from "@google/genai";
import { WritingEffect } from './WritingEffect';
import { ReadAloudButton } from './ReadAloudButton';
import { ChevronLeft, Sparkles, Loader2, FileText, Image as ImageIcon } from 'lucide-react';
import { Tooltip } from './Tooltip';
import { exportAsImage, exportAsPDF } from '../utils/exportUtils';

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
  const { recordCalculation, userIdentity, userBirthday, setUserIdentity } = useSyllabusStore();
  const { triggerClick, triggerSuccess } = useHaptics();
  const [name, setName] = useState(userIdentity || "");
  const [birthday, setBirthday] = useState(userBirthday || "");
  const [isMe, setIsMe] = useState(true);
  const [system, setSystem] = useState("pythagorean");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<NumerologyAnalysis | null>(null);

  const handleResetToMe = () => {
    triggerClick();
    setName(userIdentity || "");
    setBirthday(userBirthday || "");
    setIsMe(true);
  };

  React.useEffect(() => {
    if (isMe) {
      setName(userIdentity || "");
      setBirthday(userBirthday || "");
    }
  }, [userIdentity, userBirthday, isMe]);

  React.useEffect(() => {
    if (isMe && name && birthday && !result && !loading) {
      getAnalysis();
    }
  }, [isMe, name, birthday, result, loading]);

  const getAnalysis = async () => {
    triggerClick();
    if (!name || !birthday) return;
    setLoading(true);
    setResult(null);
    // Only update global identity if it's "Me"
    if (isMe) {
      setUserIdentity(name);
    }
    try {
      const analysis = await geminiService.generateJson<NumerologyAnalysis>(
        `Calculate personal numerological paths for: Name: ${name}, Birthday: ${birthday}, System: ${system}. IMPORTANT: Return the lifePath, destinyNumber, and soulUrge as digits (e.g., "11", "7", "22") and NOT as words.`,
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
      alert("Something went wrong with the numbers. Try again?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full flex flex-col items-center justify-start py-12 px-4 md:px-8 relative max-w-7xl mx-auto pb-32">
      <button onClick={onBack} className="fixed top-4 right-4 sm:top-8 sm:right-8 brutalist-button !text-[10px] sm:!text-sm !px-3 sm:!px-4 !py-1 z-50 bg-surface shadow-xl flex items-center gap-2">
        <ChevronLeft size={14} /> Back
      </button>

      <div className="w-full flex flex-col gap-12">
        <header className="space-y-6 pt-8 lg:pt-0">
          <div className="space-y-2">
            <div className="flex items-center">
              <h2 className="title-main text-6xl text-marker-teal">Life Path Analysis</h2>
              <Tooltip 
                title="What is Numerology?" 
                content="A numerical analysis of your birth date and name to identify patterns and tendencies." 
              />
            </div>
            <p className="text-marker-teal opacity-60">Analyzing the data of your identity</p>
          </div>
        </header>

        <div className="w-full flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
          <aside className="w-full lg:w-[400px] space-y-8 lg:sticky lg:top-20">
            <div className="space-y-8 p-6 bg-white border border-marker-teal/10 shadow-sm rounded-2xl animate-in fade-in slide-in-from-left-4 duration-300">
              <div className="flex justify-between items-center border-b border-black/5 pb-4">
                <span className="handwritten text-[10px] text-marker-black opacity-40 uppercase tracking-widest">Subject</span>
                <div className="flex gap-2">
                  <button 
                    onClick={handleResetToMe}
                    className={`px-3 py-1 text-[10px] font-mono uppercase border transition-all ${isMe ? 'bg-marker-teal text-white border-marker-teal' : 'border-archive-line opacity-40'}`}
                  >
                    Me
                  </button>
                  <button 
                    onClick={() => setIsMe(false)}
                    className={`px-3 py-1 text-[10px] font-mono uppercase border transition-all ${!isMe ? 'bg-marker-teal text-white border-marker-teal' : 'border-archive-line opacity-40'}`}
                  >
                    Someone Else
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="handwritten text-[10px] text-marker-black opacity-40 block ml-2 uppercase tracking-widest">Calculation System</label>
                <div className="flex gap-2 p-1 bg-surface rounded-xl marker-border">
                  <button onClick={() => setSystem("pythagorean")} className={`flex-1 py-3 px-2 transition-all rounded-lg handwritten text-[10px] uppercase tracking-widest ${system === "pythagorean" ? "bg-marker-teal text-white shadow-md" : "text-marker-teal/40 hover:text-marker-teal"}`}>Pythagorean</button>
                  <button onClick={() => setSystem("chaldean")} className={`flex-1 py-3 px-2 transition-all rounded-lg handwritten text-[10px] uppercase tracking-widest ${system === "chaldean" ? "bg-marker-teal text-white shadow-md" : "text-marker-teal/40 hover:text-marker-teal"}`}>Chaldean</button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="handwritten text-[10px] uppercase text-marker-black opacity-40 block ml-2 tracking-widest">Full Name</label>
                <input type="text" placeholder="e.g. John Doe" className="w-full p-4 text-marker-black text-xl italic bg-surface/50 rounded-lg outline-none border border-transparent focus:border-marker-teal" value={name} onChange={e => { setName(e.target.value); setIsMe(false); }} />
              </div>

              <div className="space-y-2">
                <label className="handwritten text-[10px] uppercase text-marker-black opacity-40 block ml-2 tracking-widest">Birth Date</label>
                <input type="date" className="w-full p-4 text-marker-black text-xl italic bg-surface/50 rounded-lg outline-none border border-transparent focus:border-marker-teal" value={birthday} onChange={e => { setBirthday(e.target.value); setIsMe(false); }} />
              </div>

              <button onClick={getAnalysis} disabled={loading || !name || !birthday} className={`brutalist-button w-full !py-6 !text-2xl transition-all ${!name || !birthday ? "opacity-30" : "!bg-marker-teal text-white shadow-xl"}`}>
                {loading ? "Crunching numbers..." : "Check My Path"}
              </button>
            </div>
          </aside>

          <main className="flex-1 w-full min-h-[600px] pb-32">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full gap-8 py-40">
                <Loader2 className="w-20 h-20 border-4 border-marker-teal border-t-transparent animate-spin rounded-full text-marker-teal" />
                <span className="handwritten text-xl text-marker-teal animate-pulse uppercase tracking-[0.4em]">Doing the math...</span>
              </div>
            ) : result ? (
              <div id="numerology-result-content" className="w-full space-y-10 animate-in fade-in duration-500 bg-archive-bg p-8 rounded-xl">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label: "Life Path", val: result.lifePath },
                    { label: "Destiny", val: result.destinyNumber },
                    { label: "Soul Urge", val: result.soulUrge }
                  ].map((t, m) => (
                    <div key={t.label} className="bg-white p-6 text-center shadow-lg rounded-2xl group transition-transform hover:scale-105 border border-black/5">
                      <span className="handwritten text-[10px] text-marker-black/30 mb-2 block uppercase tracking-widest">{t.label}</span>
                      <span className={`heading-marker text-6xl ${m === 1 ? "text-marker-red" : "text-marker-black"}`}>{t.val}</span>
                    </div>
                  ))}
                </div>

                <div className="p-8 sm:p-10 border border-marker-blue/10 bg-white shadow-2xl rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-[0.03] text-8xl heading-marker italic uppercase pointer-events-none">Results</div>
                  <div className="flex justify-between items-center mb-6 border-b-2 border-marker-blue/10 pb-4 relative z-10">
                    <div className="flex flex-col gap-1">
                      <span className="handwritten text-[10px] uppercase text-marker-blue tracking-widest">Your Narrative</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-white bg-marker-teal px-2 py-1 rounded-full uppercase tracking-tighter shadow-sm">ACTIVE: {system.toUpperCase()}</span>
                      </div>
                    </div>
                    <ReadAloudButton text={result.meaning} className="!py-1 !px-2 !text-[10px] bg-marker-blue/10 border-marker-blue/20 text-marker-blue" />
                  </div>
                  <p className="handwritten text-lg md:text-xl italic text-marker-black/80 leading-relaxed font-medium relative z-10 columns-1 md:columns-2 gap-12 text-left">
                    "<WritingEffect text={result.meaning} />"
                  </p>
                  <p className="mt-4 text-[9px] opacity-30 italic">{result.systemComparison}</p>
                </div>

                <div className="p-10 bg-white shadow-md rounded-2xl text-center border border-black/5 relative">
                  <div className="absolute top-4 right-4">
                    <ReadAloudButton text={result.esotericInsight} className="!p-1 !h-auto !w-auto !bg-transparent !border-none !shadow-none opacity-20 hover:opacity-100" />
                  </div>
                  <div className="handwritten text-[10px] text-marker-red uppercase italic tracking-widest">Final Thought</div>
                  <p className="heading-marker text-3xl sm:text-4xl text-marker-black lowercase leading-tight">{result.esotericInsight}</p>
                </div>

                <div className="flex flex-wrap justify-center gap-8 pt-8 border-t border-black/5">
                  <button 
                    onClick={() => exportAsPDF('numerology-result-content', `numerology-${name}`)}
                    className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40 hover:opacity-100 flex items-center gap-2"
                  >
                    <FileText className="w-3 h-3" />
                    Export PDF
                  </button>
                  <button 
                    onClick={() => exportAsImage('numerology-result-content', `numerology-${name}`)}
                    className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40 hover:opacity-100 flex items-center gap-2"
                  >
                    <ImageIcon className="w-3 h-3" />
                    Export Image
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center opacity-[0.03] flex flex-col items-center justify-center h-full py-40 select-none pointer-events-none">
                <Sparkles size={200} className="mb-8" />
                <p className="handwritten text-4xl uppercase tracking-[0.4em]">Waiting for your info</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
