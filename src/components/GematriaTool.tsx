import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Hash, RefreshCw, ChevronLeft, Info, Sparkles, FileText, Image as ImageIcon, Volume2, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { useSyllabusStore } from '../store';
import { useHaptics } from '../hooks/useHaptics';
import { ErrorBoundary } from './ErrorBoundary';
import { Tooltip } from './Tooltip';
import { ReadAloudButton } from './ReadAloudButton';
import { exportAsImage, exportAsPDF } from '../utils/exportUtils';

interface GematriaToolProps {
  onBack: () => void;
}

type System = 'pythagorean' | 'chaldean' | 'agrippa' | 'english';

const SYSTEMS: Record<System, { name: string; desc: string; mapping: Record<string, number> }> = {
  pythagorean: {
    name: 'Pythagorean',
    desc: 'The most common Western system. Letters are assigned 1-9 sequentially.',
    mapping: {
      a: 1, j: 1, s: 1,
      b: 2, k: 2, t: 2,
      c: 3, l: 3, u: 3,
      d: 4, m: 4, v: 4,
      e: 5, n: 5, w: 5,
      f: 6, o: 6, x: 6,
      g: 7, p: 7, y: 7,
      h: 8, q: 8, z: 8,
      i: 9, r: 9
    }
  },
  chaldean: {
    name: 'Chaldean',
    desc: 'Ancient Babylonian system. Based on sound frequencies. No number 9.',
    mapping: {
      a: 1, i: 1, j: 1, q: 1, y: 1,
      b: 2, k: 2, r: 2,
      c: 3, g: 3, l: 3, s: 3,
      d: 4, m: 4, t: 4,
      e: 5, h: 5, n: 5, x: 5,
      u: 6, v: 6, w: 6,
      o: 7, z: 7,
      f: 8, p: 8
    }
  },
  agrippa: {
    name: 'Agrippa (Gematria)',
    desc: 'Occult system used by Heinrich Cornelius Agrippa. Aligns with Hebrew values.',
    mapping: {
      a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9,
      k: 10, l: 20, m: 30, n: 40, o: 50, p: 60, q: 70, r: 80, s: 90,
      t: 100, u: 200, x: 300, y: 400, z: 500, j: 600, v: 700, w: 900
    }
  },
  english: {
    name: 'English Ordinal',
    desc: 'Simple A=1, B=2... Z=26 mapping.',
    mapping: {
      a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9, j: 10,
      k: 11, l: 12, m: 13, n: 14, o: 15, p: 16, q: 17, r: 18, s: 19,
      t: 20, u: 21, v: 22, w: 23, x: 24, y: 25, z: 26
    }
  }
};

export const GematriaTool: React.FC<GematriaToolProps> = ({ onBack }) => {
  const { recordCalculation, userIdentity } = useSyllabusStore();
  const { triggerClick, triggerSuccess } = useHaptics();
  const [input, setInput] = useState(userIdentity || '');
  const [isMe, setIsMe] = useState(true);
  const [selectedSystem, setSelectedSystem] = useState<System>('pythagorean');

  const handleResetToMe = () => {
    triggerClick();
    setInput(userIdentity || '');
    setIsMe(true);
  };

  React.useEffect(() => {
    if (isMe) {
      setInput(userIdentity || "");
    }
  }, [userIdentity, isMe]);

  const calculation = useMemo(() => {
    if (!input) return null;
    
    const system = SYSTEMS[selectedSystem];
    const letters = input.toLowerCase().replace(/[^a-z]/g, '').split('');
    
    const values = letters.map(l => ({
      char: l,
      val: system.mapping[l] || 0
    }));
    
    const total = values.reduce((acc, curr) => acc + curr.val, 0);
    
    // Reduce total to single digit (except for master numbers 11, 22, 33 in some systems, but we'll keep it simple for now)
    const reduce = (num: number): number => {
      if (num < 10) return num;
      return reduce(num.toString().split('').reduce((a, b) => a + parseInt(b), 0));
    };
    
    const reduced = reduce(total);
    
    // Frequency distribution of reduced values (1-9)
    const frequency: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
    values.forEach(v => {
      const r = reduce(v.val);
      if (r > 0) frequency[r] = (frequency[r] || 0) + 1;
    });

    const freqData = Object.entries(frequency).map(([num, count]) => ({
      number: num,
      count
    }));

    return { values, total, reduced, freqData };
  }, [input, selectedSystem]);

  const handleCalculate = () => {
    if (input) {
      recordCalculation();
      triggerSuccess();
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-archive-bg">
      <header className="border-b border-archive-line p-6 flex items-center justify-between bg-archive-bg">
        <div className="flex items-center gap-8">
          <button onClick={onBack} className="text-xs font-mono opacity-40 hover:opacity-100 transition-opacity">← BACK</button>
          <div className="flex items-center">
            <h1 className="font-serif italic text-2xl tracking-tight">Name to Number (Gematria)</h1>
            <Tooltip 
              title="What is Gematria?" 
              content="An alphanumeric code of assigning a numerical value to a name, word, or phrase based on its letters." 
            />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-5xl font-serif italic">Numerical Analysis</h2>
            <p className="handwritten text-xl opacity-60">Analyze the numerical value of any name or word.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-1 space-y-8">
              <div className="flex justify-between items-center border-b border-archive-line pb-4">
                <span className="text-[10px] font-mono uppercase opacity-40 tracking-widest">Subject</span>
                <div className="flex gap-2">
                  <button 
                    onClick={handleResetToMe}
                    className={`px-3 py-1 text-[10px] font-mono uppercase border transition-all ${isMe ? 'bg-archive-ink text-archive-bg border-archive-ink' : 'border-archive-line opacity-40'}`}
                  >
                    Me
                  </button>
                  <button 
                    onClick={() => setIsMe(false)}
                    className={`px-3 py-1 text-[10px] font-mono uppercase border transition-all ${!isMe ? 'bg-archive-ink text-archive-bg border-archive-ink' : 'border-archive-line opacity-40'}`}
                  >
                    Someone Else
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-mono uppercase opacity-40 tracking-widest">Calculation System</label>
                <div className="space-y-2">
                  {(Object.keys(SYSTEMS) as System[]).map((sys) => (
                    <button
                      key={sys}
                      onClick={() => setSelectedSystem(sys)}
                      className={`w-full text-left p-4 border transition-all ${selectedSystem === sys ? 'border-archive-accent bg-white shadow-md' : 'border-archive-line opacity-60 hover:opacity-100'}`}
                    >
                      <p className="font-serif italic text-lg">{SYSTEMS[sys].name}</p>
                      <p className="text-[10px] font-mono opacity-40 mt-1 uppercase leading-tight">{SYSTEMS[sys].desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-mono uppercase opacity-40 tracking-widest">Name or Word</label>
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => { setInput(e.target.value); setIsMe(false); }}
                  onBlur={handleCalculate}
                  placeholder="Type here..."
                  className="w-full bg-white border border-archive-line p-6 font-serif italic text-2xl outline-none focus:border-archive-accent shadow-sm"
                />
              </div>
            </div>

            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {calculation ? (
                  <motion.div 
                    id="gematria-analysis-content"
                    key={input + selectedSystem}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-8 bg-archive-bg p-8 rounded-xl"
                  >
                    <div className="grid grid-cols-2 gap-8">
                      <div className="p-8 border border-archive-line bg-white shadow-sm text-center">
                        <p className="col-header mb-2">Total Value</p>
                        <p className="text-6xl font-serif italic text-archive-accent">{calculation.total}</p>
                      </div>
                      <div className="p-8 border border-archive-line bg-white shadow-sm text-center">
                        <p className="col-header mb-2">Reduced Number</p>
                        <p className="text-6xl font-serif italic">{calculation.reduced}</p>
                      </div>
                    </div>

                    <div className="p-8 border border-archive-line bg-white/50">
                      <p className="col-header mb-6">Letter Breakdown</p>
                      <div className="flex flex-wrap gap-4">
                        {calculation.values.map((v, i) => (
                          <div key={i} className="flex flex-col items-center p-3 border border-archive-line bg-white min-w-[50px]">
                            <span className="text-2xl font-serif italic">{v.char}</span>
                            <span className="text-[10px] font-mono opacity-40 mt-1">{v.val}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center gap-3 border-b border-archive-line pb-2">
                        <BarChart3 size={16} className="opacity-40" />
                        <h3 className="col-header">Frequency Distribution</h3>
                      </div>
                      <div className="h-[200px] w-full bg-white p-6 border border-archive-line shadow-sm">
                        <ErrorBoundary fallback={
                          <div className="h-full flex flex-col items-center justify-center opacity-20 italic font-serif text-xs">
                            Distribution data obscured.
                          </div>
                        }>
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={calculation.freqData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                            <XAxis 
                              dataKey="number" 
                              tick={{ fontSize: 10, fontFamily: 'monospace' }}
                            />
                            <YAxis 
                              tick={{ fontSize: 10, fontFamily: 'monospace' }}
                              allowDecimals={false}
                            />
                            <RechartsTooltip 
                              cursor={{ fill: '#f9f9f9' }}
                              contentStyle={{ 
                                backgroundColor: '#fff', 
                                border: '1px solid #141414',
                                borderRadius: '0',
                                fontFamily: 'serif',
                                fontSize: '12px'
                              }}
                            />
                            <Bar dataKey="count" fill="#F27D26">
                              {calculation.freqData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={parseInt(entry.number) === calculation.reduced ? '#F27D26' : '#141414'} opacity={parseInt(entry.number) === calculation.reduced ? 1 : 0.1} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </ErrorBoundary>
                    </div>
                  </div>

                    <div className="p-8 border border-archive-line bg-white shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none text-8xl font-sans">☊</div>
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                          <Sparkles size={16} className="text-archive-accent" />
                          <span className="data-value text-archive-accent uppercase tracking-widest">Resonance Insight</span>
                        </div>
                        <ReadAloudButton text={`The name ${input} vibrates at the frequency of ${calculation.reduced}. ${
                          calculation.reduced === 1 ? "This is the number of leadership, independence, and new beginnings." :
                          calculation.reduced === 2 ? "This is the number of cooperation, diplomacy, and sensitivity." :
                          calculation.reduced === 3 ? "This is the number of self-expression, creativity, and optimism." :
                          calculation.reduced === 4 ? "This is the number of stability, hard work, and practicality." :
                          calculation.reduced === 5 ? "This is the number of freedom, adventure, and adaptability." :
                          calculation.reduced === 6 ? "This is the number of responsibility, harmony, and nurturing." :
                          calculation.reduced === 7 ? "This is the number of analysis, introspection, and spirituality." :
                          calculation.reduced === 8 ? "This is the number of power, abundance, and material success." :
                          calculation.reduced === 9 ? "This is the number of compassion, humanitarianism, and completion." : ""
                        }`} className="!p-1 !h-auto !w-auto !bg-transparent !border-none !shadow-none opacity-20 hover:opacity-100" />
                      </div>
                      <p className="font-serif italic text-xl leading-relaxed opacity-80">
                        The name "{input}" vibrates at the frequency of {calculation.reduced}. 
                        {calculation.reduced === 1 && " This is the number of leadership, independence, and new beginnings."}
                        {calculation.reduced === 2 && " This is the number of cooperation, diplomacy, and sensitivity."}
                        {calculation.reduced === 3 && " This is the number of self-expression, creativity, and optimism."}
                        {calculation.reduced === 4 && " This is the number of stability, hard work, and practicality."}
                        {calculation.reduced === 5 && " This is the number of freedom, adventure, and adaptability."}
                        {calculation.reduced === 6 && " This is the number of responsibility, harmony, and nurturing."}
                        {calculation.reduced === 7 && " This is the number of analysis, introspection, and spirituality."}
                        {calculation.reduced === 8 && " This is the number of power, abundance, and material success."}
                        {calculation.reduced === 9 && " This is the number of compassion, humanitarianism, and completion."}
                      </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-8 pt-8 border-t border-black/5">
                      <button 
                        onClick={() => exportAsPDF('gematria-analysis-content', `gematria-${input}`)}
                        className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40 hover:opacity-100 flex items-center gap-2"
                      >
                        <FileText className="w-3 h-3" />
                        Export PDF
                      </button>
                      <button 
                        onClick={() => exportAsImage('gematria-analysis-content', `gematria-${input}`)}
                        className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40 hover:opacity-100 flex items-center gap-2"
                      >
                        <ImageIcon className="w-3 h-3" />
                        Export Image
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center py-24 opacity-[0.03] select-none pointer-events-none">
                    <Hash size={160} />
                    <p className="handwritten text-4xl uppercase tracking-[0.4em] mt-8">Awaiting Input</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
