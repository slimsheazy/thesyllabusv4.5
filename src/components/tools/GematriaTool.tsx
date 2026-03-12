import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Hash } from 'lucide-react';
import { useSyllabusStore } from '../../store';
import { useHaptics } from '../../hooks/useHaptics';
import { useProfile } from '../../hooks/useProfile';
import { geminiService } from '../../services/geminiService';
import { ToolLayout } from '../shared/ToolLayout';
import { ResultSection } from '../shared/ResultSection';
import { ReadAloudButton } from '../shared/ReadAloudButton';
import { ProfileSelector } from '../shared/ProfileSelector';
import { ErrorBoundary } from '../ErrorBoundary';
import Markdown from 'react-markdown';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid, Cell } from 'recharts';

interface GematriaToolProps {
  onBack: () => void;
}

type Cipher = 'PYTHAGOREAN' | 'CHALDEAN' | 'AGRIPPA' | 'ENGLISH';

const CIPHERS: Cipher[] = ['PYTHAGOREAN', 'CHALDEAN', 'AGRIPPA', 'ENGLISH'];

export const GematriaTool: React.FC<GematriaToolProps> = ({ onBack }) => {
  const { recordCalculation } = useSyllabusStore();
  const { triggerClick, triggerSuccess } = useHaptics();
  const { profile, setMe, setSomeoneElse, updateProfile } = useProfile();
  const [cipher, setCipher] = useState<Cipher>('PYTHAGOREAN');
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const calculation = useMemo(() => {
    if (!profile.name) return null;
    
    const cleanName = profile.name.toUpperCase().replace(/[^A-Z]/g, '');
    let sum = 0;
    const freq: Record<number, number> = {};

    const getVal = (char: string, type: Cipher): number => {
      const code = char.charCodeAt(0) - 65;
      switch (type) {
        case 'PYTHAGOREAN': return (code % 9) + 1;
        case 'CHALDEAN': {
          const chaldeanMap: Record<string, number> = {
            A:1, I:1, J:1, Q:1, Y:1,
            B:2, K:2, R:2,
            C:3, G:3, L:3, S:3,
            D:4, M:4, T:4,
            E:5, H:5, N:5, X:5,
            U:6, V:6, W:6,
            O:7, Z:7,
            F:8, P:8
          };
          return chaldeanMap[char] || 0;
        }
        case 'AGRIPPA': {
          const values = [1,2,3,4,5,6,7,8,9,10,20,30,40,50,60,70,80,90,100,200,300,400,500,600,700,800];
          return values[code] || 0;
        }
        case 'ENGLISH': return code + 1;
        default: return 0;
      }
    };
    
    for (let i = 0; i < cleanName.length; i++) {
      const val = getVal(cleanName[i], cipher);
      sum += val;
      const reducedVal = (val > 9 && cipher !== 'AGRIPPA') ? (val % 9 || 9) : val;
      freq[reducedVal] = (freq[reducedVal] || 0) + 1;
    }

    const reduce = (n: number): number => {
      if (n <= 9) return n;
      if (n === 11 || n === 22 || n === 33) return n;
      return reduce(n.toString().split('').reduce((a, b) => a + parseInt(b), 0));
    };

    const reduced = reduce(sum);
    const freqData = Array.from({ length: 9 }, (_, i) => ({
      number: (i + 1).toString(),
      count: freq[i + 1] || 0
    }));

    return {
      absolute: sum,
      reduced,
      charCount: cleanName.length,
      freqData
    };
  }, [profile.name, cipher]);

  const handleCalculate = async () => {
    triggerClick();
    if (!calculation || !profile.name) return;
    
    setLoading(true);
    setInterpretation(null);
    
    try {
      const text = await geminiService.interpretGematria(profile.name, calculation.reduced, cipher);
      setInterpretation(text);
      recordCalculation();
      triggerSuccess();
    } catch (error) {
      console.error("Error interpreting gematria:", error);
      setInterpretation("The numerical vibration is sealed in silence.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout
      title="Gematria"
      subtitle="The numerical vibration of names and words"
      onBack={onBack}
      tooltipTitle="What is Gematria?"
      tooltipContent="An alphanumeric code of assigning a numerical value to a name, word, or phrase based on its letters."
    >
      <div className="w-full flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
        <aside className="w-full lg:w-[400px] space-y-8 lg:sticky lg:top-20">
          <div className="archive-card p-6 animate-in fade-in slide-in-from-left-4 duration-300">
            <ProfileSelector 
              isMe={profile.isMe}
              onMe={setMe}
              onSomeoneElse={setSomeoneElse}
            />

            <div className="archive-form-group mt-6">
              <label className="archive-label">Cipher System</label>
              <div className="grid grid-cols-2 gap-2">
                {CIPHERS.map((c) => (
                  <button
                    key={c}
                    onClick={() => { setCipher(c); setInterpretation(null); }}
                    className={`p-2 text-[8px] font-mono uppercase tracking-widest border rounded-archive transition-all ${cipher === c ? 'bg-archive-ink text-archive-bg border-archive-ink' : 'border-archive-line opacity-40 hover:opacity-100'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="archive-form-group">
              <label className="archive-label">Input Name/Word</label>
              <input 
                type="text" 
                placeholder="e.g. ABRAHADABRA" 
                className="archive-input !text-2xl !font-mono" 
                value={profile.name} 
                onChange={e => { updateProfile({ name: e.target.value }); setInterpretation(null); }} 
                onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
              />
            </div>

            <button 
              onClick={handleCalculate} 
              disabled={loading || !profile.name} 
              className={`brutalist-button w-full py-5 text-xl mt-8 transition-all ${loading || !profile.name ? "opacity-30" : ""}`}
            >
              {loading ? "CALCULATING..." : "REVEAL RESONANCE"}
            </button>
          </div>
        </aside>

        <main className="flex-1 w-full min-h-[600px] pb-32">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-40 gap-8"
              >
                <div className="relative">
                  <div className="w-16 h-16 border-2 border-archive-accent border-t-transparent animate-spin rounded-full" />
                  <div className="absolute inset-0 flex items-center justify-center text-xl opacity-20 italic">☉</div>
                </div>
                <span className="handwritten text-lg text-archive-accent animate-pulse uppercase tracking-[0.3em]">Calculating numerical resonance...</span>
              </motion.div>
            ) : calculation && interpretation ? (
              <motion.div 
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-12"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="archive-card p-8 text-center space-y-2">
                    <span className="col-header">Absolute Sum</span>
                    <div className="text-5xl font-mono tracking-tighter">{calculation.absolute}</div>
                  </div>
                  <div className="archive-card p-8 text-center space-y-2">
                    <span className="col-header">Reduced Value</span>
                    <div className="text-5xl font-mono tracking-tighter text-archive-accent">{calculation.reduced}</div>
                  </div>
                  <div className="archive-card p-8 text-center space-y-2">
                    <span className="col-header">Character Count</span>
                    <div className="text-5xl font-mono tracking-tighter">{calculation.charCount}</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Hash size={14} className="opacity-40" />
                    <h3 className="col-header">Frequency Distribution</h3>
                  </div>
                  <div className="h-[240px] w-full archive-card p-6">
                    <ErrorBoundary fallback={
                      <div className="h-full flex flex-col items-center justify-center opacity-20 italic font-serif text-xs">
                        Distribution data obscured.
                      </div>
                    }>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={calculation.freqData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(20,20,20,0.05)" vertical={false} />
                          <XAxis 
                            dataKey="number" 
                            tick={{ fontSize: 10, fontFamily: 'monospace', fill: 'rgba(20,20,20,0.4)' }}
                            axisLine={{ stroke: 'rgba(20,20,20,0.1)' }}
                          />
                          <YAxis 
                            tick={{ fontSize: 10, fontFamily: 'monospace', fill: 'rgba(20,20,20,0.4)' }}
                            axisLine={{ stroke: 'rgba(20,20,20,0.1)' }}
                            allowDecimals={false}
                          />
                          <RechartsTooltip 
                            cursor={{ fill: 'rgba(20,20,20,0.02)' }}
                            contentStyle={{ 
                              backgroundColor: '#fff', 
                              border: '1px solid #141414',
                              borderRadius: '0',
                              fontFamily: 'serif',
                              fontSize: '12px',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}
                          />
                          <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                            {calculation.freqData.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={parseInt(entry.number) === calculation.reduced ? '#F27D26' : '#141414'} 
                                opacity={parseInt(entry.number) === calculation.reduced ? 1 : 0.1} 
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </ErrorBoundary>
                  </div>
                </div>

                <div className="archive-card p-8 md:p-12 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.02] select-none pointer-events-none text-8xl italic">VIBE</div>
                  <div className="flex justify-end mb-4">
                    <ReadAloudButton text={interpretation} className="!p-1 !h-auto !w-auto !bg-transparent !border-none !shadow-none opacity-20 hover:opacity-100" />
                  </div>
                  <div className="handwritten text-2xl md:text-3xl text-archive-ink leading-relaxed italic font-medium">
                    <Markdown>{interpretation}</Markdown>
                  </div>
                </div>

                <ResultSection
                  id="gematria-resonance-content"
                  title="Archive Record"
                  content={`The name ${profile.name} vibrates at the frequency of ${calculation.reduced} using the ${cipher} system.\n\nInterpretation: ${interpretation}`}
                  exportName={`gematria-${profile.name}-${cipher}`}
                  onClose={() => { setInterpretation(null); }}
                />
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center py-40 opacity-[0.03] select-none pointer-events-none"
              >
                <Hash size={160} />
                <p className="handwritten text-4xl uppercase tracking-[0.4em] mt-8">Awaiting Input</p>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </ToolLayout>
  );
};
