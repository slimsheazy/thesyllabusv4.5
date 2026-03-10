import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, RefreshCw, FileText, Image as ImageIcon, Volume2, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { useSyllabusStore } from '../store';
import { useHaptics } from '../hooks/useHaptics';
import { ErrorBoundary } from './ErrorBoundary';
import { Tooltip } from './Tooltip';
import { ReadAloudButton } from './ReadAloudButton';
import { exportAsImage, exportAsPDF } from '../utils/exportUtils';

interface BiorhythmToolProps {
  onBack: () => void;
}

export const BiorhythmTool: React.FC<BiorhythmToolProps> = ({ onBack }) => {
  const { userBirthday, recordCalculation } = useSyllabusStore();
  const { triggerClick, triggerSuccess } = useHaptics();
  const [subjectBirthday, setSubjectBirthday] = useState(userBirthday || '');
  const [isMe, setIsMe] = useState(true);
  const [data, setData] = useState<any>(null);

  const handleResetToMe = () => {
    triggerClick();
    setSubjectBirthday(userBirthday || '');
    setIsMe(true);
  };

  useEffect(() => {
    if (isMe) {
      setSubjectBirthday(userBirthday || "");
    }
  }, [userBirthday, isMe]);

  const calculateBiorhythms = () => {
    if (!subjectBirthday) return;
    
    const birthDate = new Date(subjectBirthday);
    const today = new Date();
    
    // Use UTC midnights to calculate absolute days between dates, 
    // ignoring time of day and DST shifts.
    const start = Date.UTC(birthDate.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    const end = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
    const diffDays = Math.floor((end - start) / (1000 * 60 * 60 * 24));

    const physical = Math.sin((2 * Math.PI * diffDays) / 23);
    const emotional = Math.sin((2 * Math.PI * diffDays) / 28);
    const intellectual = Math.sin((2 * Math.PI * diffDays) / 33);

    setData({ physical, emotional, intellectual });
    recordCalculation();
    triggerSuccess();
  };

  const chartData = useMemo(() => {
    if (!subjectBirthday) return [];
    
    const birthDate = new Date(subjectBirthday);
    const today = new Date();
    const results = [];
    
    for (let i = -5; i < 25; i++) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + i);
      
      const start = Date.UTC(birthDate.getFullYear(), birthDate.getMonth(), birthDate.getDate());
      const end = Date.UTC(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
      const diffDays = Math.floor((end - start) / (1000 * 60 * 60 * 24));
      
      results.push({
        date: targetDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        isToday: i === 0,
        physical: Math.sin((2 * Math.PI * diffDays) / 23) * 100,
        emotional: Math.sin((2 * Math.PI * diffDays) / 28) * 100,
        intellectual: Math.sin((2 * Math.PI * diffDays) / 33) * 100,
      });
    }
    return results;
  }, [subjectBirthday]);

  useEffect(() => {
    if (subjectBirthday) calculateBiorhythms();
  }, [subjectBirthday]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-archive-bg">
      <header className="border-b border-archive-line p-6 flex items-center justify-between bg-archive-bg">
        <div className="flex items-center gap-8">
          <button onClick={onBack} className="text-xs font-mono opacity-40 hover:opacity-100 transition-opacity">← BACK</button>
          <div className="flex items-center">
            <h1 className="font-serif italic text-2xl tracking-tight">Biorhythm Cycles</h1>
            <Tooltip 
              title="What are Biorhythms?" 
              content="A theory that our lives are influenced by rhythmic biological cycles (physical, emotional, and intellectual) that start at birth." 
            />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 p-6 bg-white border border-archive-line shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
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
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase opacity-40 tracking-widest">Birth Date</span>
              <input 
                type="date" 
                value={subjectBirthday}
                onChange={(e) => { setSubjectBirthday(e.target.value); setIsMe(false); }}
                className="bg-archive-bg border border-archive-line p-2 text-xs font-mono outline-none focus:border-archive-accent"
              />
            </div>
          </div>

          {!subjectBirthday ? (
            <div className="text-center py-24 space-y-6">
              <h2 className="text-4xl font-serif italic">Calibration Required</h2>
              <p className="handwritten text-xl opacity-60">Please set a birth date to track natural cycles.</p>
            </div>
          ) : (
            <div id="biorhythm-content" className="space-y-12 py-12 bg-archive-bg p-8 rounded-xl">
              <div className="text-center space-y-4">
                <h2 className="text-5xl font-serif italic">Your Natural Rhythm</h2>
                <p className="handwritten text-xl opacity-60">Track the physical, emotional, and intellectual waves of your life.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { label: 'Physical', value: data?.physical, color: 'text-rose-500', desc: 'Energy, strength, coordination' },
                  { label: 'Emotional', value: data?.emotional, color: 'text-archive-accent', desc: 'Sensitivity, mood, creativity' },
                  { label: 'Intellectual', value: data?.intellectual, color: 'text-blue-500', desc: 'Logic, memory, alertness' },
                ].map((cycle) => (
                  <div key={cycle.label} className="p-8 border border-archive-line bg-white shadow-sm flex flex-col items-center text-center gap-4">
                    <p className="col-header">{cycle.label}</p>
                    <div className="relative w-32 h-32 flex items-center justify-center">
                      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-5" />
                        <motion.circle 
                          cx="50" cy="50" r="45" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="4" 
                          strokeDasharray="283"
                          strokeDashoffset={283 - (283 * ((cycle.value + 1) / 2))}
                          className={cycle.color}
                          initial={{ strokeDashoffset: 283 }}
                          animate={{ strokeDashoffset: 283 - (283 * ((cycle.value + 1) / 2)) }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                      </svg>
                      <span className="absolute text-2xl font-serif italic">
                        {Math.round(((cycle.value + 1) / 2) * 100)}%
                      </span>
                    </div>
                    <p className="text-[10px] font-mono uppercase opacity-40 leading-relaxed">{cycle.desc}</p>
                  </div>
                ))}
              </div>

                <div className="max-w-2xl mx-auto p-8 border border-archive-line bg-white/50 relative">
                <div className="absolute top-4 right-4">
                  <ReadAloudButton text={`Your cycles are currently in a state of ${data?.physical > 0 ? 'high energy' : 'restoration'}. It's a good time for ${data?.intellectual > 0 ? 'complex problem solving' : 'intuitive reflection'}.`} className="!p-1 !h-auto !w-auto !bg-transparent !border-none !shadow-none opacity-20 hover:opacity-100" />
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <Activity size={16} className="text-archive-accent" />
                  <span className="data-value text-archive-accent uppercase tracking-widest">Cycle Synthesis</span>
                </div>
                <p className="font-serif italic text-xl leading-relaxed opacity-80">
                  Your cycles are currently in a state of {data?.physical > 0 ? 'high energy' : 'restoration'}. 
                  It's a good time for {data?.intellectual > 0 ? 'complex problem solving' : 'intuitive reflection'}.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-archive-line pb-2">
                  <TrendingUp size={16} className="opacity-40" />
                  <h3 className="col-header">30-Day Projection</h3>
                </div>
                <div className="h-[400px] w-full bg-white p-6 border border-archive-line shadow-sm">
                  <ErrorBoundary fallback={
                    <div className="h-full flex flex-col items-center justify-center opacity-20 italic font-serif">
                      The projection is currently unreadable.
                    </div>
                  }>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 10, fontFamily: 'monospace' }}
                        interval={4}
                      />
                      <YAxis 
                        tick={{ fontSize: 10, fontFamily: 'monospace' }}
                        domain={[-100, 100]}
                      />
                      <RechartsTooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '1px solid #141414',
                          borderRadius: '0',
                          fontFamily: 'serif',
                          fontSize: '12px'
                        }}
                      />
                      <Legend 
                        wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontFamily: 'monospace', textTransform: 'uppercase' }}
                      />
                      <ReferenceLine y={0} stroke="#141414" strokeWidth={1} opacity={0.1} />
                      <ReferenceLine x={chartData.find(d => d.isToday)?.date} stroke="#F27D26" strokeDasharray="3 3" label={{ value: 'TODAY', position: 'top', fontSize: 8, fill: '#F27D26' }} />
                      <Line 
                        type="monotone" 
                        dataKey="physical" 
                        stroke="#f43f5e" 
                        strokeWidth={2} 
                        dot={false}
                        activeDot={{ r: 4 }}
                        name="Physical"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="emotional" 
                        stroke="#F27D26" 
                        strokeWidth={2} 
                        dot={false}
                        activeDot={{ r: 4 }}
                        name="Emotional"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="intellectual" 
                        stroke="#3b82f6" 
                        strokeWidth={2} 
                        dot={false}
                        activeDot={{ r: 4 }}
                        name="Intellectual"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ErrorBoundary>
              </div>
            </div>

              <div className="pt-12 border-t border-archive-line flex flex-wrap justify-center gap-8">
                <button 
                  onClick={() => exportAsPDF('biorhythm-content', 'biorhythms')}
                  className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40 hover:opacity-100 flex items-center gap-2"
                >
                  <FileText className="w-3 h-3" />
                  Export PDF
                </button>
                <button 
                  onClick={() => exportAsImage('biorhythm-content', 'biorhythms')}
                  className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40 hover:opacity-100 flex items-center gap-2"
                >
                  <ImageIcon className="w-3 h-3" />
                  Export Image
                </button>
                <button 
                  onClick={calculateBiorhythms}
                  className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40 hover:opacity-100 flex items-center gap-2"
                >
                  <RefreshCw className="w-3 h-3" />
                  Refresh cycles
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
