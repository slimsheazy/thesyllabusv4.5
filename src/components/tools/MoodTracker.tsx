import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smile, RefreshCw, ChevronLeft, FileText, Image as ImageIcon, Volume2, TrendingUp, Sparkles } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';
import { useSyllabusStore } from '../../store';
import { useHaptics } from '../../hooks/useHaptics';
import { ErrorBoundary } from '../ErrorBoundary';
import { geminiService } from '../../services/geminiService';
import { exportAsImage, exportAsPDF } from '../../utils/exportUtils';
import { ReadAloudButton } from '../ReadAloudButton';
import { ToolLayout } from '../shared/ToolLayout';
import { ResultSection } from '../shared/ResultSection';

interface MoodTrackerProps {
  onBack: () => void;
}

type EmotionNode = {
  name: string;
  color: string;
  children?: EmotionNode[];
};

const EMOTIONS: EmotionNode[] = [
  {
    name: 'Joy',
    color: '#FFD700',
    children: [
      { name: 'Content', color: '#FFE44D', children: [{ name: 'Free', color: '#FFF2A6' }, { name: 'Joyful', color: '#FFF2A6' }] },
      { name: 'Proud', color: '#FFE44D', children: [{ name: 'Successful', color: '#FFF2A6' }, { name: 'Confident', color: '#FFF2A6' }] },
      { name: 'Peaceful', color: '#FFE44D', children: [{ name: 'Loving', color: '#FFF2A6' }, { name: 'Thankful', color: '#FFF2A6' }] },
    ]
  },
  {
    name: 'Sadness',
    color: '#4682B4',
    children: [
      { name: 'Lonely', color: '#5F9EA0', children: [{ name: 'Isolated', color: '#B0C4DE' }, { name: 'Abandoned', color: '#B0C4DE' }] },
      { name: 'Disappointed', color: '#5F9EA0', children: [{ name: 'Dismayed', color: '#B0C4DE' }, { name: 'Displeased', color: '#B0C4DE' }] },
      { name: 'Grief', color: '#5F9EA0', children: [{ name: 'Heartbroken', color: '#B0C4DE' }, { name: 'Sorrowful', color: '#B0C4DE' }] },
    ]
  },
  {
    name: 'Anger',
    color: '#CD5C5C',
    children: [
      { name: 'Frustrated', color: '#E9967A', children: [{ name: 'Annoyed', color: '#FADBD8' }, { name: 'Infuriated', color: '#FADBD8' }] },
      { name: 'Hateful', color: '#E9967A', children: [{ name: 'Resentful', color: '#FADBD8' }, { name: 'Violent', color: '#FADBD8' }] },
      { name: 'Critical', color: '#E9967A', children: [{ name: 'Skeptical', color: '#FADBD8' }, { name: 'Dismissive', color: '#FADBD8' }] },
    ]
  },
  {
    name: 'Fear',
    color: '#9370DB',
    children: [
      { name: 'Scared', color: '#BA55D3', children: [{ name: 'Helpless', color: '#E6E6FA' }, { name: 'Frightened', color: '#E6E6FA' }] },
      { name: 'Anxious', color: '#BA55D3', children: [{ name: 'Overwhelmed', color: '#E6E6FA' }, { name: 'Worried', color: '#E6E6FA' }] },
      { name: 'Insecure', color: '#BA55D3', children: [{ name: 'Inadequate', color: '#E6E6FA' }, { name: 'Inferior', color: '#E6E6FA' }] },
    ]
  },
  {
    name: 'Surprise',
    color: '#FF8C00',
    children: [
      { name: 'Amazed', color: '#FFA500', children: [{ name: 'Astonished', color: '#FFE4B5' }, { name: 'Awestruck', color: '#FFE4B5' }] },
      { name: 'Confused', color: '#FFA500', children: [{ name: 'Disoriented', color: '#FFE4B5' }, { name: 'Perplexed', color: '#FFE4B5' }] },
    ]
  }
];

export const MoodTracker: React.FC<MoodTrackerProps> = ({ onBack }) => {
  const { recordCalculation, addMoodLog, moodLogs } = useSyllabusStore();
  const { triggerSuccess, triggerClick } = useHaptics();
  const [path, setPath] = useState<EmotionNode[]>([]);
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const moodTrendData = useMemo(() => {
    if (!moodLogs || moodLogs.length === 0) return [];
    
    const moodMap: Record<string, number> = {
      'Joy': 5, 'Content': 4.5, 'Free': 4.8, 'Joyful': 5, 'Proud': 4.7, 'Successful': 4.9, 'Confident': 4.8, 'Peaceful': 4.6, 'Loving': 4.9, 'Thankful': 4.8,
      'Sadness': 1, 'Lonely': 1.5, 'Isolated': 1.2, 'Abandoned': 1.1, 'Disappointed': 1.8, 'Dismayed': 1.6, 'Displeased': 1.7, 'Grief': 1.2, 'Heartbroken': 1.1, 'Sorrowful': 1.3,
      'Anger': 2, 'Frustrated': 2.2, 'Annoyed': 2.4, 'Infuriated': 2.1, 'Hateful': 1.9, 'Resentful': 2.0, 'Violent': 1.8, 'Critical': 2.3, 'Skeptical': 2.4, 'Dismissive': 2.2,
      'Fear': 1.5, 'Scared': 1.4, 'Helpless': 1.2, 'Frightened': 1.3, 'Anxious': 1.6, 'Overwhelmed': 1.5, 'Worried': 1.7, 'Insecure': 1.8, 'Inadequate': 1.6, 'Inferior': 1.5,
      'Surprise': 3.5, 'Amazed': 4.2, 'Astonished': 4.3, 'Awestruck': 4.5, 'Confused': 2.8, 'Disoriented': 2.6, 'Perplexed': 2.7
    };

    return [...moodLogs]
      .reverse()
      .slice(-15) 
      .map(log => ({
        date: new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        value: moodMap[log.mood] || 3,
        mood: log.mood
      }));
  }, [moodLogs]);

  const currentOptions = useMemo(() => {
    if (path.length === 0) return EMOTIONS;
    return path[path.length - 1].children || [];
  }, [path]);

  const handleSelect = async (node: EmotionNode) => {
    triggerClick();
    if (node.children && node.children.length > 0) {
      setPath([...path, node]);
    } else {
      const fullPath = [...path, node].map(n => n.name).join(' > ');
      setLoading(true);
      setInsight(null);
      
      try {
        const text = await geminiService.getEmotionalInsight(fullPath, node.name);
        setInsight(text);
        addMoodLog(node.name, text);
        recordCalculation();
        triggerSuccess();
      } catch (error) {
        console.error("Error getting emotional insight:", error);
        setInsight("The archive is silent, but your heart speaks clearly. Honor this feeling.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <ToolLayout
      title="Emotional Resonance"
      subtitle="Navigating the layers of your current frequency"
      onBack={onBack}
      tooltipTitle="The Emotion Wheel"
      tooltipContent="A tool for identifying and understanding complex emotional states through hierarchical navigation."
    >
      <div className="w-full flex flex-col gap-16">
        <div className="max-w-4xl mx-auto w-full space-y-12">
          <AnimatePresence mode="wait">
            {!insight && !loading ? (
              <motion.div 
                key="wheel"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-12"
              >
                <div className="flex items-center justify-center gap-6">
                  {path.length > 0 && (
                    <button 
                      onClick={() => setPath(path.slice(0, -1))}
                      className="p-3 border border-archive-line hover:bg-archive-ink hover:text-archive-bg transition-all rounded-archive"
                    >
                      <ChevronLeft size={20} />
                    </button>
                  )}
                  <div className="flex items-center gap-3">
                    {path.length === 0 ? (
                      <span className="text-[10px] font-mono uppercase tracking-[0.3em] opacity-40">Select Primary Emotion</span>
                    ) : (
                      path.map((node, i) => (
                        <React.Fragment key={i}>
                          <span className="text-[10px] font-mono uppercase tracking-widest text-archive-accent font-bold">{node.name}</span>
                          {i < path.length - 1 && <span className="opacity-20">/</span>}
                        </React.Fragment>
                      ))
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-6">
                  {currentOptions.map((node) => (
                    <button 
                      key={node.name}
                      onClick={() => handleSelect(node)}
                      style={{ borderColor: node.color }}
                      className="px-10 py-6 border-2 bg-white shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 group relative overflow-hidden rounded-archive"
                    >
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity" style={{ backgroundColor: node.color }} />
                      <span className="font-serif italic text-2xl">{node.name}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : loading ? (
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
                <span className="handwritten text-lg text-archive-accent animate-pulse uppercase tracking-[0.3em]">Distilling the emotional essence...</span>
              </motion.div>
            ) : (
              <motion.div 
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-12"
              >
                <div className="archive-card p-10 md:p-16 relative text-center overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.02] select-none pointer-events-none text-9xl italic">FEEL</div>
                  <div className="absolute top-6 right-6">
                    <ReadAloudButton text={insight!} className="!p-1 !h-auto !w-auto !bg-transparent !border-none !shadow-none opacity-20 hover:opacity-100" />
                  </div>
                  
                  <div className="space-y-8">
                    <div className="flex items-center justify-center gap-3">
                      <Sparkles className="text-archive-accent w-5 h-5" />
                      <span className="text-[10px] font-mono text-archive-accent uppercase tracking-[0.3em] font-bold">Emotional Alchemy</span>
                    </div>
                    <p className="font-serif italic text-3xl md:text-4xl leading-relaxed text-archive-ink">
                      "{insight}"
                    </p>
                  </div>

                  <div className="mt-12 pt-10 border-t border-archive-line flex flex-wrap justify-center gap-8">
                    <button 
                      onClick={() => setInsight(null)}
                      className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40 hover:opacity-100 flex items-center gap-2"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Another Check-in
                    </button>
                  </div>
                </div>

                <ResultSection
                  id="mood-insight-content"
                  title="Archive Record"
                  content={insight!}
                  exportName="emotional-resonance"
                  onClose={() => { setInsight(null); setPath([]); }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {moodTrendData.length > 1 && (
            <div className="space-y-8 pt-16 border-t border-archive-line">
              <div className="flex items-center gap-3">
                <TrendingUp size={16} className="opacity-40" />
                <h3 className="col-header">Emotional Trajectory</h3>
              </div>
              <div className="h-[400px] w-full bg-white p-8 border border-archive-line shadow-sm rounded-archive">
                <ErrorBoundary fallback={
                  <div className="h-full flex flex-col items-center justify-center opacity-20 italic font-serif">
                    The trajectory is currently obscured.
                  </div>
                }>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={moodTrendData}>
                      <defs>
                        <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#F27D26" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#F27D26" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 10, fontFamily: 'monospace' }}
                      />
                      <YAxis 
                        hide
                        domain={[0, 5]}
                      />
                      <RechartsTooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '1px solid #141414',
                          borderRadius: '0',
                          fontFamily: 'serif',
                          fontSize: '12px'
                        }}
                        formatter={(value: any, name: any, props: any) => [props.payload.mood, 'Resonance']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#F27D26" 
                        fillOpacity={1} 
                        fill="url(#colorMood)" 
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ErrorBoundary>
              </div>
              <p className="text-[10px] font-mono uppercase opacity-40 text-center tracking-widest italic">
                A visual record of your shifting frequencies over time.
              </p>
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
};
