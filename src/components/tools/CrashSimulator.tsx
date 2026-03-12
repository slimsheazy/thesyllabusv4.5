import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, ShieldAlert, BarChart3, RefreshCw, Info, CheckCircle2, Search, Zap, ShieldCheck } from 'lucide-react';
import { useSyllabusStore } from '../../store';
import { useHaptics } from '../../hooks/useHaptics';
import { geminiService } from '../../services/geminiService';
import { ToolLayout } from '../shared/ToolLayout';

interface FailureMode {
  mode: string;
  effect: string;
  severity: number;
  occurrence: number;
  detection: number;
  prevention: string;
  rpn: number;
}

export const CrashSimulator: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { recordCalculation } = useSyllabusStore();
  const { triggerClick, triggerSuccess } = useHaptics();
  
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<FailureMode[] | null>(null);

  const runSimulation = async () => {
    if (!goal.trim()) return;
    triggerClick();
    setLoading(true);
    
    try {
      const data = await geminiService.getCrashSimulation(goal);
      const processed = data.failureModes.map(m => ({
        ...m,
        rpn: m.severity * m.occurrence * m.detection
      })).sort((a, b) => b.rpn - a.rpn);

      setResults(processed);
      recordCalculation();
      triggerSuccess();
    } catch (error) {
      console.error("Error running simulation:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout
      title="Crash Simulator"
      subtitle="Worst-case scenario planner via FMEA"
      onBack={onBack}
      tooltipTitle="What is FMEA?"
      tooltipContent="Failure Mode and Effects Analysis (FMEA) is a systematic, proactive method for evaluating a process to identify where and how it might fail and to assess the relative impact of different failures."
    >
      <div className="max-w-5xl mx-auto w-full space-y-12">
        {!results && !loading ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="archive-card p-10 space-y-10"
          >
            <div className="space-y-6 text-center max-w-2xl mx-auto">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-600">
                <ShieldAlert size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-serif italic">Worst-Case Scenario Planner</h3>
                <p className="text-sm opacity-60 leading-relaxed">
                  This tool is designed for cold, analytical pessimism. By identifying potential catastrophes before they happen, you can prioritize which outcomes actually require a contingency plan.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="col-header mb-2 block">Define Your Target Goal</span>
                <div className="relative">
                  <input 
                    type="text" 
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="e.g., Starting a boutique coffee shop"
                    className="w-full bg-archive-bg border-2 border-archive-line p-5 font-serif italic text-xl focus:border-archive-accent outline-none transition-colors pr-12"
                  />
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20" size={20} />
                </div>
              </label>
            </div>

            <div className="pt-8 border-t border-archive-line flex justify-center">
              <button 
                onClick={runSimulation}
                disabled={!goal.trim()}
                className="brutalist-button px-12 py-4 flex items-center gap-3 group disabled:opacity-30"
              >
                <Zap className="w-5 h-5 group-hover:scale-110 transition-transform" />
                SIMULATE CRASH
              </button>
            </div>
          </motion.div>
        ) : loading ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-40 gap-8"
          >
            <div className="relative">
              <div className="w-16 h-16 border-2 border-red-500 border-t-transparent animate-spin rounded-full" />
              <div className="absolute inset-0 flex items-center justify-center text-xl opacity-20 italic">⚠️</div>
            </div>
            <span className="handwritten text-lg text-red-600 animate-pulse uppercase tracking-[0.3em]">Analyzing failure modes...</span>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-12"
          >
            <div className="archive-card p-8 md:p-12 relative overflow-hidden border-2 border-red-500/20">
              <div className="absolute top-0 right-0 p-8 opacity-[0.02] select-none pointer-events-none text-9xl italic">FAILURE</div>
              
              <div className="relative z-10 space-y-12">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-archive-line pb-8">
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-red-600 uppercase tracking-[0.4em] font-bold">Analysis Target</span>
                    <h3 className="text-4xl font-serif italic text-archive-ink">{goal}</h3>
                  </div>
                  <div className="flex items-center gap-4 bg-red-500/5 px-6 py-3 border border-red-500/10">
                    <BarChart3 className="text-red-600 w-5 h-5" />
                    <div className="text-left">
                      <span className="block text-[8px] font-mono uppercase opacity-40">Risk Priority Number</span>
                      <span className="block text-sm font-bold font-mono">RPN = S × O × D</span>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-archive-line">
                        <th className="py-4 col-header">Failure Mode</th>
                        <th className="py-4 col-header text-center">S</th>
                        <th className="py-4 col-header text-center">O</th>
                        <th className="py-4 col-header text-center">D</th>
                        <th className="py-4 col-header text-center">RPN</th>
                        <th className="py-4 col-header">Contingency Plan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results?.map((m, i) => (
                        <tr key={i} className="border-b border-archive-line/5 hover:bg-red-500/[0.02] transition-colors group">
                          <td className="py-6 pr-4">
                            <div className="font-serif italic text-lg text-archive-ink">{m.mode}</div>
                            <div className="text-[10px] opacity-40 mt-1 uppercase tracking-wider">{m.effect}</div>
                          </td>
                          <td className="py-6 text-center font-mono text-sm opacity-60">{m.severity}</td>
                          <td className="py-6 text-center font-mono text-sm opacity-60">{m.occurrence}</td>
                          <td className="py-6 text-center font-mono text-sm opacity-60">{m.detection}</td>
                          <td className="py-6 text-center">
                            <span className={`font-mono font-bold px-2 py-1 ${m.rpn > 300 ? 'bg-red-500 text-white' : m.rpn > 150 ? 'bg-orange-500/10 text-orange-600' : 'bg-green-500/10 text-green-600'}`}>
                              {m.rpn}
                            </span>
                          </td>
                          <td className="py-6 pl-4">
                            <div className="flex items-start gap-3">
                              <ShieldCheck className="w-4 h-4 text-green-600 mt-1 shrink-0" />
                              <p className="text-sm italic font-serif leading-relaxed opacity-80">{m.prevention}</p>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
                  <div className="p-4 bg-archive-bg border border-archive-line space-y-2">
                    <span className="block text-[8px] font-mono uppercase opacity-40">S = Severity</span>
                    <p className="text-[10px] italic">Impact of the failure on the end goal (1-10).</p>
                  </div>
                  <div className="p-4 bg-archive-bg border border-archive-line space-y-2">
                    <span className="block text-[8px] font-mono uppercase opacity-40">O = Occurrence</span>
                    <p className="text-[10px] italic">Probability that the failure will occur (1-10).</p>
                  </div>
                  <div className="p-4 bg-archive-bg border border-archive-line space-y-2">
                    <span className="block text-[8px] font-mono uppercase opacity-40">D = Detection</span>
                    <p className="text-[10px] italic">Difficulty of detecting failure before it happens (1-10).</p>
                  </div>
                </div>

                <div className="flex justify-center pt-8">
                  <button 
                    onClick={() => setResults(null)}
                    className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40 hover:opacity-100 flex items-center gap-2"
                  >
                    <RefreshCw className="w-3 h-3" />
                    NEW SIMULATION
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </ToolLayout>
  );
};
