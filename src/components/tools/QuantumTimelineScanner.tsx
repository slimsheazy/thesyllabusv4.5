import React, { useState, useCallback, memo, useEffect } from 'react';
import { Target, Activity, History, ChevronLeft, Zap, RefreshCcw } from 'lucide-react';
import { useSyllabusStore } from '../../store';
import { logCalculation, getLogs } from '../../services/dbService';
import { getQuantumTimelineScan } from '../../services/geminiService';
import { WritingEffect } from '../shared/WritingEffect';
import { audioManager } from '../AudioManager';
import { QuantumTimelineResult, ToolProps } from '../../types';

interface QuantumState extends QuantumTimelineResult {
  id: string;
  timestamp: string;
  intent: string;
  signature: string;
  timelineIndex: number; // 0 for Current, 1 for Desired
}

const LABELS = ['A', 'B', 'C', 'D', 'E'];
type ViewMode = 'calibrate' | 'navigator' | 'history';

const SignalGrid = memo(({ selected, onToggle, disabled }: { selected: string[], onToggle: (id: string) => void, disabled?: boolean }) => (
  <div className="flex flex-col items-center gap-4">
    <div className="grid grid-cols-5 gap-4">
      {LABELS.map((label) => (
        <button
          key={label}
          onClick={() => onToggle(label)}
          disabled={disabled || (selected.length >= 3 && !selected.includes(label))}
          className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${
            selected.includes(label)
              ? 'bg-marker-black text-white border-marker-black'
              : 'border-marker-black/20 hover:border-marker-black'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
    <p className="handwritten text-sm text-marker-black/60">Select 3 nodes to calibrate signature.</p>
  </div>
));

const RealityTrack = memo(({ 
  reality, 
  isActive, 
  onSwitch 
}: { 
  reality: { stateLabel: string; entropyLevel: string; frequencyMarker: string; realityFragments: string[] }; 
  isActive: boolean;
  onSwitch: () => void;
}) => (
  <div className={`p-6 rounded-xl border-2 transition-all ${isActive ? 'border-marker-black bg-marker-black/5' : 'border-marker-black/10'}`}>
    <h3 className="handwritten text-2xl font-bold mb-2">{reality.stateLabel}</h3>
    <div className="space-y-2 text-sm text-marker-black/70">
      <p>Entropy: {reality.entropyLevel}</p>
      <p>Frequency: {reality.frequencyMarker}</p>
      <ul className="list-disc list-inside">
        {reality.realityFragments.map((f, i) => <li key={i}>{f}</li>)}
      </ul>
    </div>
    {!isActive && (
      <button onClick={onSwitch} className="mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:underline">
        <RefreshCcw size={12} /> Switch Your View
      </button>
    )}
  </div>
));

const TimelineNavigator = memo(({ 
  result, 
  onBack 
}: { 
  result: QuantumTimelineResult; 
  onBack: () => void 
}) => {
  const [activeReality, setActiveReality] = useState(0); // 0: Current, 1: Desired

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest">
          <ChevronLeft size={16} /> Back
        </button>
        <h2 className="handwritten text-3xl">Quantum Navigation</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RealityTrack 
          reality={result.currentReality} 
          isActive={activeReality === 0} 
          onSwitch={() => setActiveReality(0)} 
        />
        <RealityTrack 
          reality={result.desiredReality} 
          isActive={activeReality === 1} 
          onSwitch={() => setActiveReality(1)} 
        />
      </div>

      <div className="p-6 bg-marker-black/5 rounded-xl border-2 border-marker-black/10 space-y-4">
        <h4 className="handwritten text-xl font-bold">Quantum Catalyst</h4>
        <p className="text-sm text-marker-black/80"><strong>Delta:</strong> {result.quantumJump.behavioralDelta}</p>
        <p className="text-sm text-marker-black/80"><strong>Bridge:</strong> {result.quantumJump.bridgeAction}</p>
        <p className="text-sm text-marker-black/80"><strong>Frequency:</strong> {result.quantumJump.shiftFrequency}</p>
      </div>
    </div>
  );
});

export const QuantumTimelineScanner = ({ onBack }: ToolProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>('calibrate');
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeResult, setActiveResult] = useState<QuantumState | null>(null);
  const [history, setHistory] = useState<QuantumState[]>([]);
  const [intent, setIntent] = useState('');

  useEffect(() => {
    getLogs('quantum_scan').then(setHistory);
  }, []);

  const toggleNode = useCallback((node: string) => {
    setSelectedNodes(prev => 
      prev.includes(node) ? prev.filter(n => n !== node) : [...prev, node]
    );
    audioManager.playRustle();
  }, []);

  const startScan = async () => {
    if (selectedNodes.length !== 3 || !intent) return;
    setLoading(true);
    audioManager.playPenScratch();
    
    try {
      const signature = selectedNodes.sort().join('');
      const result = await getQuantumTimelineScan({ intent, signature });
      const newState: QuantumState = {
        ...result,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        intent,
        signature,
        timelineIndex: 0
      };
      
      await logCalculation('quantum_scan', newState);
      setActiveResult(newState);
      setHistory(prev => [newState, ...prev]);
      setViewMode('navigator');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {viewMode === 'calibrate' && (
        <div className="space-y-6">
          <h2 className="handwritten text-4xl text-center">Quantum Timeline Scanner</h2>
          <input 
            value={intent}
            onChange={(e) => setIntent(e.target.value)}
            placeholder="Enter your quantum intent..."
            className="w-full p-4 border-2 border-marker-black/20 rounded-xl"
          />
          <SignalGrid selected={selectedNodes} onToggle={toggleNode} />
          <button 
            onClick={startScan}
            disabled={selectedNodes.length !== 3 || !intent || loading}
            className="w-full py-4 bg-marker-black text-white rounded-xl font-bold uppercase tracking-widest disabled:opacity-50"
          >
            {loading ? 'Scanning...' : 'Initiate Scan'}
          </button>
        </div>
      )}

      {viewMode === 'navigator' && activeResult && (
        <TimelineNavigator result={activeResult} onBack={() => setViewMode('calibrate')} />
      )}

      {viewMode === 'history' && (
        <div className="space-y-6">
          <h2 className="handwritten text-3xl">Scan History</h2>
          {history.map(h => (
            <div key={h.id} className="p-4 border-2 border-marker-black/10 rounded-xl cursor-pointer hover:bg-marker-black/5" onClick={() => { setActiveResult(h); setViewMode('navigator'); }}>
              <p className="font-bold">{h.intent}</p>
              <p className="text-xs text-marker-black/60">{new Date(h.timestamp).toLocaleDateString()}</p>
            </div>
          ))}
          <button onClick={() => setViewMode('calibrate')} className="w-full py-2 border-2 border-marker-black/20 rounded-xl">Back</button>
        </div>
      )}
    </div>
  );
};
