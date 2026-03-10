import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smile, RefreshCw, ChevronLeft, FileText, Image as ImageIcon, Volume2, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';
import { useSyllabusStore } from '../store';
import { useHaptics } from '../hooks/useHaptics';
import { ErrorBoundary } from './ErrorBoundary';
import { GoogleGenAI } from "@google/genai";
import { exportAsImage, exportAsPDF } from '../utils/exportUtils';
import { ReadAloudButton } from './ReadAloudButton';

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
      .slice(-15) // Last 15 logs
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
      // Final selection
      const fullPath = [...path, node].map(n => n.name).join(' > ');
      setLoading(true);
      setInsight(null);
      
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const prompt = `You are an emotional alchemist. A seeker has identified their current resonance as: ${fullPath}.
        
        Provide a deep, poetic, and resonant insight for this specific emotional state. 
        Acknowledge the nuance of the tertiary emotion (${node.name}).
        
        Format the response as a single poetic paragraph (40-60 words).
        Use the "Archive/Syllabus" aesthetic: serif, italic, profoundly insightful.`;

        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: prompt,
        });

        const text = response.text || "Your resonance is noted in the archive.";
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

  const handleBack = () => {
    triggerClick();
    setPath(path.slice(0, -1));
  };

  const handleReset = () => {
    triggerClick();
    setPath([]);
    setInsight(null);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-archive-bg">
      <header className="border-b border-archive-line p-6 flex items-center justify-between bg-archive-bg">
        <div className="flex items-center gap-8">
          <button onClick={onBack} className="text-xs font-mono opacity-40 hover:opacity-100 transition-opacity">← BACK</button>
          <h1 className="font-serif italic text-2xl tracking-tight">Emotional Resonance</h1>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="title-main text-6xl">The Emotion Wheel</h2>
            <p className="opacity-60">Navigate the layers of your current frequency to find its deeper meaning.</p>
          </div>

          {!insight && !loading && (
            <div className="space-y-8">
              <div className="flex items-center justify-center gap-4">
                {path.length > 0 && (
                  <button 
                    onClick={handleBack}
                    className="p-2 border border-archive-line hover:bg-archive-ink hover:text-white transition-all"
                  >
                    <ChevronLeft size={20} />
                  </button>
                )}
                <div className="flex gap-2">
                  {path.map((node, i) => (
                    <React.Fragment key={i}>
                      <span className="text-xs font-mono uppercase tracking-widest opacity-40">{node.name}</span>
                      {i < path.length - 1 && <span className="opacity-20">/</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-4">
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={path.length}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex flex-wrap justify-center gap-4"
                  >
                    {currentOptions.map((node) => (
                      <button 
                        key={node.name}
                        onClick={() => handleSelect(node)}
                        style={{ borderColor: node.color }}
                        className="px-8 py-4 border-2 bg-white shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
                      >
                        <span className="font-serif italic text-xl">{node.name}</span>
                      </button>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          )}

          {loading && (
            <div className="py-24 text-center space-y-6">
              <div className="w-12 h-12 border-2 border-archive-accent border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="handwritten text-xl opacity-40">Distilling the essence of your resonance...</p>
            </div>
          )}

          <AnimatePresence>
            {insight && (
              <motion.div 
                id="mood-insight-content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto p-12 border border-archive-line bg-white shadow-xl relative text-center"
              >
                <div className="absolute top-2 right-2">
                  <ReadAloudButton text={insight} className="!p-1 !h-auto !w-auto !bg-transparent !border-none !shadow-none opacity-20 hover:opacity-100" />
                </div>
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none text-8xl font-sans">☊</div>
                <p className="font-serif italic text-2xl leading-relaxed text-archive-ink">
                  "{insight}"
                </p>
                <div className="mt-8 pt-8 border-t border-archive-line flex flex-wrap justify-center gap-8">
                  <button 
                    onClick={() => exportAsPDF('mood-insight-content', 'mood-insight')}
                    className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40 hover:opacity-100 flex items-center gap-2"
                  >
                    <FileText className="w-3 h-3" />
                    Export PDF
                  </button>
                  <button 
                    onClick={() => exportAsImage('mood-insight-content', 'mood-insight')}
                    className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40 hover:opacity-100 flex items-center gap-2"
                  >
                    <ImageIcon className="w-3 h-3" />
                    Export Image
                  </button>
                  <button 
                    onClick={handleReset}
                    className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40 hover:opacity-100 flex items-center gap-2"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Reset check-in
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {moodTrendData.length > 1 && (
            <div className="space-y-6 pt-12 border-t border-archive-line">
              <div className="flex items-center gap-3">
                <TrendingUp size={16} className="opacity-40" />
                <h3 className="col-header">Emotional Trajectory</h3>
              </div>
              <div className="h-[300px] w-full bg-white p-6 border border-archive-line shadow-sm">
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
    </div>
  );
};
