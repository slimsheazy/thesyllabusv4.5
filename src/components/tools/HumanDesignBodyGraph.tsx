import React, { useState } from 'react';

interface Center {
  id: string;
  label: string;
  type: string;
  coords: string;
}

interface CenterData {
  defined: boolean;
  gates?: string[];
}

interface BodyGraphProps {
  activeData?: Record<string, CenterData>;
  onCenterClick?: (center: Center) => void;
}

// Define the geometric coordinates for the centers
const CENTERS: Center[] = [
  { id: 'head', label: 'Head', type: 'triangle', coords: "M100,20 L130,70 L70,70 Z" },
  { id: 'ajna', label: 'Ajna', type: 'inverted-triangle', coords: "M70,80 L130,80 L100,130 Z" },
  { id: 'throat', label: 'Throat', type: 'square', coords: "M75,140 H125 V190 H75 Z" },
  { id: 'g-center', label: 'G-Center', type: 'diamond', coords: "M100,200 L130,235 L100,270 L70,235 Z" },
  { id: 'heart', label: 'Heart', type: 'small-triangle', coords: "M135,220 L155,240 L135,260 Z" },
  { id: 'sacral', label: 'Sacral', type: 'square', coords: "M80,280 H120 V320 H80 Z" },
  { id: 'root', label: 'Root', type: 'square', coords: "M80,340 H120 V380 H80 Z" },
  { id: 'splenic', label: 'Splenic', type: 'triangle', coords: "M30,260 L60,310 L10,310 Z" },
  { id: 'solar-plexus', label: 'Solar Plexus', type: 'triangle', coords: "M170,260 L140,310 L190,310 Z" },
];

const BodyGraph: React.FC<BodyGraphProps> = ({ activeData, onCenterClick }) => {
  const [selectedCenter, setSelectedCenter] = useState<Center | null>(null);

  const handleCenterClick = (center: Center) => {
    setSelectedCenter(center);
    if (onCenterClick) onCenterClick(center);
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 p-6 bg-slate-50 rounded-xl shadow-inner">
      {/* SVG Container */}
      <div className="relative w-full max-w-md bg-white p-4 rounded-lg border border-slate-200">
        <svg 
          viewBox="0 0 200 400" 
          className="w-full h-auto drop-shadow-sm"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Connection Channels (Background Layer) */}
          <g id="channels" stroke="#e2e8f0" strokeWidth="4" fill="none">
             <line x1="100" y1="70" x2="100" y2="80" />
             <line x1="100" y1="130" x2="100" y2="140" />
             {/* Add additional logic for active/defined channels here */}
          </g>

          {/* Centers Layer */}
          <g id="centers">
            {CENTERS.map((center) => (
              <path
                key={center.id}
                d={center.coords}
                className={`cursor-pointer transition-all duration-200 hover:opacity-80 
                  ${selectedCenter?.id === center.id ? 'stroke-blue-500 stroke-2' : 'stroke-slate-400 stroke-1'}
                  ${activeData?.[center.id]?.defined ? 'fill-amber-400' : 'fill-white'}
                `}
                onClick={() => handleCenterClick(center)}
              />
            ))}
          </g>
        </svg>
      </div>

      {/* Data Display Panel */}
      <div className="flex-1 min-w-[300px]">
        {selectedCenter ? (
          <div className="p-4 bg-white border-l-4 border-blue-500 rounded-r-lg shadow-sm animate-in fade-in slide-in-from-right-4">
            <h3 className="text-xl font-bold text-slate-800">{selectedCenter.label} Center</h3>
            <p className="mt-2 text-slate-600 leading-relaxed">
              Definition: {activeData?.[selectedCenter.id]?.defined ? 'Defined' : 'Undetermined'}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="text-xs font-mono bg-slate-100 p-2 rounded">
                Active Gates: {activeData?.[selectedCenter.id]?.gates?.join(', ') || 'None'}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg text-slate-400 italic p-8 text-center">
            Click on a center in the BodyGraph to view specific details and active gates.
          </div>
        )}
      </div>
    </div>
  );
};

export default BodyGraph;
