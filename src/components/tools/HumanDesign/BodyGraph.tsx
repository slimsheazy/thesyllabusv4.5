import React from 'react';
import { motion } from 'motion/react';

interface BodyGraphProps {
  gates: number[];
  centers: { name: string; status: 'Defined' | 'Undefined'; description: string }[];
  onSelectCenter: (center: { name: string; status: 'Defined' | 'Undefined'; description: string }) => void;
  onSelectGate: (gate: number) => void;
}

const CENTER_COORDS: Record<string, { x: number; y: number; shape: 'triangle' | 'square' | 'diamond' }> = {
  'Head': { x: 50, y: 10, shape: 'triangle' },
  'Ajna': { x: 50, y: 22, shape: 'triangle' },
  'Throat': { x: 50, y: 35, shape: 'square' },
  'G': { x: 50, y: 50, shape: 'diamond' },
  'Heart': { x: 65, y: 55, shape: 'triangle' },
  'Sacral': { x: 50, y: 75, shape: 'square' },
  'Spleen': { x: 30, y: 65, shape: 'triangle' },
  'Solar Plexus': { x: 70, y: 65, shape: 'triangle' },
  'Root': { x: 50, y: 90, shape: 'square' }
};

export const BodyGraph: React.FC<BodyGraphProps> = ({ gates, centers, onSelectCenter, onSelectGate }) => {
  return (
    <div className="relative w-full aspect-[3/4] bg-archive-bg border border-archive-line rounded-archive p-4 overflow-hidden">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Simplified Channels (Lines between centers) */}
        <g className="opacity-10">
          <line x1="50" y1="10" x2="50" y2="22" stroke="currentColor" strokeWidth="0.5" />
          <line x1="50" y1="22" x2="50" y2="35" stroke="currentColor" strokeWidth="0.5" />
          <line x1="50" y1="35" x2="50" y2="50" stroke="currentColor" strokeWidth="0.5" />
          <line x1="50" y1="50" x2="50" y2="75" stroke="currentColor" strokeWidth="0.5" />
          <line x1="50" y1="75" x2="50" y2="90" stroke="currentColor" strokeWidth="0.5" />
          <line x1="50" y1="50" x2="65" y2="55" stroke="currentColor" strokeWidth="0.5" />
          <line x1="30" y1="65" x2="50" y2="75" stroke="currentColor" strokeWidth="0.5" />
          <line x1="70" y1="65" x2="50" y2="75" stroke="currentColor" strokeWidth="0.5" />
        </g>

        {/* Centers */}
        {Object.entries(CENTER_COORDS).map(([name, coord]) => {
          const centerData = centers.find(c => c.name === name);
          const isDefined = centerData?.status === 'Defined';
          
          return (
            <g 
              key={name} 
              className="transition-all duration-500 cursor-pointer hover:opacity-80"
              onClick={() => centerData && onSelectCenter(centerData)}
            >
              {coord.shape === 'triangle' && (
                <polygon 
                  points={`${coord.x},${coord.y-4} ${coord.x-5},${coord.y+4} ${coord.x+5},${coord.y+4}`}
                  className={`${isDefined ? 'fill-archive-accent stroke-archive-accent' : 'fill-transparent stroke-archive-ink/20'} transition-colors`}
                  strokeWidth="0.5"
                />
              )}
              {coord.shape === 'square' && (
                <rect 
                  x={coord.x-4} y={coord.y-4} width={8} height={8}
                  className={`${isDefined ? 'fill-archive-accent stroke-archive-accent' : 'fill-transparent stroke-archive-ink/20'} transition-colors`}
                  strokeWidth="0.5"
                />
              )}
              {coord.shape === 'diamond' && (
                <rect 
                  x={coord.x-4} y={coord.y-4} width={8} height={8}
                  transform={`rotate(45 ${coord.x} ${coord.y})`}
                  className={`${isDefined ? 'fill-archive-accent stroke-archive-accent' : 'fill-transparent stroke-archive-ink/20'} transition-colors`}
                  strokeWidth="0.5"
                />
              )}
              <text 
                x={coord.x} y={coord.y + 8} 
                textAnchor="middle" 
                className="text-[2px] font-mono uppercase tracking-tighter fill-archive-ink/40 pointer-events-none"
              >
                {name}
              </text>
            </g>
          );
        })}

        {/* Gates (Simplified visualization as dots on the periphery) */}
        <g className="opacity-20">
          {Array.from({ length: 64 }).map((_, i) => {
            const angle = (i / 64) * Math.PI * 2;
            const r = 45;
            const x = 50 + r * Math.cos(angle);
            const y = 50 + r * Math.sin(angle);
            const isActive = gates.includes(i + 1);
            
            return (
              <circle 
                key={i} 
                cx={x} cy={y} r={isActive ? 1.2 : 0.5} 
                className={`${isActive ? 'fill-archive-accent cursor-pointer hover:fill-archive-ink' : 'fill-archive-ink/20'}`}
                onClick={() => isActive && onSelectGate(i + 1)}
              />
            );
          })}
        </g>
      </svg>

      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
        <div className="space-y-1">
          <p className="text-[8px] font-mono uppercase tracking-widest opacity-40">Active Gates</p>
          <div className="flex flex-wrap gap-1 max-w-[150px]">
            {gates.sort((a, b) => a - b).map(gate => (
              <span key={gate} className="text-[7px] font-mono text-archive-accent">{gate}</span>
            ))}
          </div>
        </div>
        <div className="text-right">
          <p className="text-[8px] font-mono uppercase tracking-widest opacity-40">BodyGraph 1.1</p>
          <p className="text-[6px] font-mono opacity-20 italic">Interactive Mode</p>
        </div>
      </div>
    </div>
  );
};
