import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, RefreshCw, FileText, Image as ImageIcon, TrendingUp, Calendar, Sparkles } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { useSyllabusStore } from '../../store';
import { useHaptics } from '../../hooks/useHaptics';
import { useProfile } from '../../hooks/useProfile';
import { ErrorBoundary } from '../ErrorBoundary';
import { ReadAloudButton } from '../ReadAloudButton';
import { ToolLayout } from '../shared/ToolLayout';
import { ResultSection } from '../shared/ResultSection';
import { ProfileSelector } from '../shared/ProfileSelector';

interface BiorhythmToolProps {
  onBack: () => void;
}

export const BiorhythmTool: React.FC<BiorhythmToolProps> = ({ onBack }) => {
  const { recordCalculation } = useSyllabusStore();
  const { triggerClick, triggerSuccess } = useHaptics();
  const { profile, setMe, setSomeoneElse, updateProfile, isValid } = useProfile();
  const [data, setData] = useState<any>(null);

  const calculateBiorhythms = () => {
    if (!profile.birthday) return;
    
    const birthDate = new Date(profile.birthday);
    const today = new Date();
    
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
    if (!profile.birthday) return [];
    
    const birthDate = new Date(profile.birthday);
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
  }, [profile.birthday]);

  useEffect(() => {
    if (profile.birthday) calculateBiorhythms();
  }, [profile.birthday]);

  const synthesisText = useMemo(() => {
    if (!data) return "";
    const physState = data.physical > 0 ? 'high energy' : 'restoration';
    const intState = data.intellectual > 0 ? 'complex problem solving' : 'intuitive reflection';
    return `Your cycles are currently in a state of ${physState}. It's a good time for ${intState}.`;
  }, [data]);

  return (
    <ToolLayout
      title="Biorhythm Cycles"
      subtitle="Tracking the natural waves of your life"
      onBack={onBack}
      tooltipTitle="The Biological Pulse"
      tooltipContent="A theory that our lives are influenced by rhythmic biological cycles (physical, emotional, and intellectual) that start at birth. The subconscious flows in waves."
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
              <label className="archive-label">Birth Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                <input 
                  type="date" 
                  value={profile.birthday}
                  onChange={(e) => updateProfile({ birthday: e.target.value })}
                  className="archive-input pl-12"
                />
              </div>
            </div>

            <button 
              onClick={calculateBiorhythms}
              disabled={!profile.birthday}
              className={`brutalist-button w-full py-5 text-xl transition-all mt-6 ${!profile.birthday ? "opacity-30" : ""}`}
            >
              REFRESH CYCLES
            </button>
          </div>
        </aside>

        <main className="flex-1 w-full min-h-[600px] pb-32">
          <AnimatePresence mode="wait">
            {!profile.birthday ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center py-40 opacity-[0.03] select-none pointer-events-none"
              >
                <Activity size={160} />
                <p className="handwritten text-4xl uppercase tracking-[0.4em] mt-8">Awaiting Configuration</p>
              </motion.div>
            ) : (
              <motion.div 
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-16"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    { label: 'Physical', value: data?.physical, color: 'text-rose-500', desc: 'Energy, strength, coordination' },
                    { label: 'Emotional', value: data?.emotional, color: 'text-archive-accent', desc: 'Sensitivity, mood, creativity' },
                    { label: 'Intellectual', value: data?.intellectual, color: 'text-blue-500', desc: 'Logic, memory, alertness' },
                  ].map((cycle) => (
                    <div key={cycle.label} className="archive-card p-8 flex flex-col items-center text-center gap-4 relative overflow-hidden group">
                      <div className={`absolute -right-4 -bottom-4 text-7xl opacity-[0.03] group-hover:opacity-[0.05] transition-opacity ${cycle.color}`}>☉</div>
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

                <div className="archive-card p-8 md:p-10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.02] select-none pointer-events-none text-8xl italic">CYCLE</div>
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                      <Sparkles className="text-archive-accent w-4 h-4" />
                      <h3 className="col-header border-none pb-0">Synthesis</h3>
                    </div>
                    <ReadAloudButton text={synthesisText} className="!p-1 !h-auto !w-auto !bg-transparent !border-none !shadow-none opacity-20 hover:opacity-100" />
                  </div>
                  <p className="font-serif italic text-2xl leading-relaxed text-archive-ink">
                    "{synthesisText}"
                  </p>
                </div>

                <div className="space-y-8">
                  <div className="flex items-center gap-3 border-b border-archive-line pb-2">
                    <TrendingUp size={16} className="opacity-40" />
                    <h3 className="col-header pb-0 border-none">30-Day Projection</h3>
                  </div>
                  <div className="h-[400px] w-full bg-white p-6 border border-archive-line shadow-sm rounded-archive">
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

                <ResultSection
                  id="biorhythm-content"
                  title="Archive Record"
                  content={`Biorhythm analysis for birth date: ${profile.birthday}.\n\nPhysical: ${Math.round(data?.physical * 100)}%\nEmotional: ${Math.round(data?.emotional * 100)}%\nIntellectual: ${Math.round(data?.intellectual * 100)}%`}
                  exportName={`biorhythm-${profile.birthday}`}
                  onClose={() => setData(null)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </ToolLayout>
  );
};
