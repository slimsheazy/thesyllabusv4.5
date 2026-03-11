import React, { useMemo, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BirthChartPlanet } from '../types';

const SYMBOLS = ["♈︎", "♉︎", "♊︎", "♋︎", "♌︎", "♍︎", "♎︎", "♏︎", "♐︎", "♑︎", "♒︎", "♓︎"];
const SIGN_NAMES = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];

interface ZodiacWheelProps {
  size?: number;
  planets?: BirthChartPlanet[];
  ascendantDegree?: number;
  onPlanetClick?: (planet: BirthChartPlanet) => void;
}

const PLANET_SYMBOLS: Record<string, string> = {
  "Sun": "☉",
  "Moon": "☽",
  "Mercury": "☿",
  "Venus": "♀",
  "Mars": "♂",
  "Jupiter": "♃",
  "Saturn": "♄",
  "Uranus": "♅",
  "Neptune": "♆",
  "Pluto": "♇",
  "Ascendant": "ASC",
  "MC": "MC"
};

const ASPECTS = [
  { name: "Conjunction", angle: 0, orb: 8, symbol: "☌" },
  { name: "Opposition", angle: 180, orb: 8, symbol: "☍" },
  { name: "Trine", angle: 120, orb: 8, symbol: "△" },
  { name: "Square", angle: 90, orb: 8, symbol: "□" },
  { name: "Sextile", angle: 60, orb: 6, symbol: "⚹" }
];

export const ZodiacWheel: React.FC<ZodiacWheelProps> = React.memo(({ size: initialSize, planets = [], ascendantDegree = 0, onPlanetClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(initialSize || 400);
  const [hoveredPlanet, setHoveredPlanet] = useState<BirthChartPlanet | null>(null);
  const [hoveredHouse, setHoveredHouse] = useState<number | null>(null);

  useEffect(() => {
    if (initialSize) {
      setSize(initialSize);
      return;
    }

    const updateSize = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        if (width > 0) {
          setSize(width);
        }
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [initialSize]);

  const radius = size / 2;
  const innerRadius = radius * 0.75;
  const houseRadius = radius * 0.55;
  const symbolRadius = radius * 0.87;

  const getSvgAngle = (astrologicalDegree: number) => {
    return (180 + astrologicalDegree) % 360;
  };

  const getCoords = (degree: number, r: number) => {
    const angle = getSvgAngle(degree) * (Math.PI / 180);
    return {
      x: radius + r * Math.cos(angle),
      y: radius + r * Math.sin(angle)
    };
  };

  const getHouse = (degree: number) => {
    const relativeDegree = (degree - ascendantDegree + 360) % 360;
    return Math.floor(relativeDegree / 30) + 1;
  };

  const getSign = (degree: number) => {
    const signIndex = Math.floor(degree / 30);
    const signDegree = degree % 30;
    return { name: SIGN_NAMES[signIndex], degree: signDegree };
  };

  const calculateAspects = (targetPlanet: BirthChartPlanet) => {
    const results: { planet: string; aspect: string; symbol: string; diff: number }[] = [];
    
    planets.forEach(other => {
      if (other.name === targetPlanet.name) return;
      
      const diff = Math.abs(targetPlanet.degree - other.degree);
      const normalizedDiff = diff > 180 ? 360 - diff : diff;
      
      ASPECTS.forEach(aspect => {
        const orb = Math.abs(normalizedDiff - aspect.angle);
        if (orb <= aspect.orb) {
          results.push({
            planet: other.name,
            aspect: aspect.name,
            symbol: aspect.symbol,
            diff: orb
          });
        }
      });
    });
    
    return results;
  };

  // Pre-calculate paths for better performance
  const signDividersPath = useMemo(() => {
    let d = "";
    for (let i = 0; i < 12; i++) {
      const startDeg = i * 30;
      const p1 = getCoords(startDeg, radius);
      const p2 = getCoords(startDeg, innerRadius);
      d += `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} `;
    }
    return d;
  }, [size]);

  const houseLinesPath = useMemo(() => {
    let d = "";
    for (let i = 1; i < 12; i++) { // Skip 0 (Ascendant) as it's drawn separately
      const houseStartDeg = (ascendantDegree + i * 30) % 360;
      const p1 = getCoords(houseStartDeg, innerRadius);
      const p2 = getCoords(houseStartDeg, houseRadius);
      d += `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} `;
    }
    return d;
  }, [size, ascendantDegree]);

  return (
    <div ref={containerRef} className="relative flex items-center justify-center w-full max-w-full aspect-square" style={{ height: initialSize ? initialSize : 'auto' }}>
      <svg 
        width={size} 
        height={size} 
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible will-change-transform"
        textRendering="optimizeLegibility"
        shapeRendering="geometricPrecision"
      >
        {/* Outer Background */}
        <circle cx={radius} cy={radius} r={radius} fill="none" stroke="currentColor" strokeWidth="1" className="opacity-10" />
        
        {/* Sign Dividers (Combined into one path) */}
        <path d={signDividersPath} stroke="currentColor" strokeWidth="1" className="opacity-20" fill="none" />

        {/* Zodiac Sign Symbols */}
        {SYMBOLS.map((symbol, i) => {
          const midDeg = i * 30 + 15;
          const pText = getCoords(midDeg, symbolRadius);
          return (
            <text 
              key={i}
              x={pText.x} y={pText.y} 
              textAnchor="middle" dominantBaseline="middle" 
              className="text-lg font-serif opacity-60 fill-current"
            >
              {symbol}
            </text>
          );
        })}
        
        <circle cx={radius} cy={radius} r={innerRadius} fill="none" stroke="currentColor" strokeWidth="1" className="opacity-20" />

        {/* House Hit Areas (Invisible segments for hover) */}
        {Array.from({ length: 12 }).map((_, i) => {
          const startDeg = (ascendantDegree + i * 30) % 360;
          const endDeg = (ascendantDegree + (i + 1) * 30) % 360;
          
          const p1 = getCoords(startDeg, houseRadius);
          const p2 = getCoords(startDeg, innerRadius);
          const p3 = getCoords(endDeg, innerRadius);
          const p4 = getCoords(endDeg, houseRadius);
          
          const largeArc = 0; // Always 30 degrees
          
          const d = `
            M ${p1.x} ${p1.y}
            L ${p2.x} ${p2.y}
            A ${innerRadius} ${innerRadius} 0 ${largeArc} 1 ${p3.x} ${p3.y}
            L ${p4.x} ${p4.y}
            A ${houseRadius} ${houseRadius} 0 ${largeArc} 0 ${p1.x} ${p1.y}
            Z
          `;
          
          return (
            <g key={`house-seg-${i}`}>
              <path 
                d={d}
                fill={hoveredHouse === i + 1 ? "currentColor" : "transparent"}
                className={`transition-colors duration-300 ${hoveredHouse === i + 1 ? "opacity-[0.03]" : "opacity-0"}`}
              />
              <path 
                d={d}
                fill="transparent"
                className="cursor-help"
                onMouseEnter={() => setHoveredHouse(i + 1)}
                onMouseLeave={() => setHoveredHouse(null)}
              />
            </g>
          );
        })}

        {/* House System */}
        <path d={houseLinesPath} stroke="currentColor" strokeWidth="1" className="opacity-10" fill="none" />
        
        {/* Ascendant Line (Highlighted) */}
        {(() => {
          const p1 = getCoords(ascendantDegree, innerRadius);
          const p2 = getCoords(ascendantDegree, houseRadius);
          return <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="currentColor" strokeWidth="2" className="opacity-60" />;
        })()}

        {/* House Numbers */}
        {Array.from({ length: 12 }).map((_, i) => {
          const houseMidDeg = (ascendantDegree + i * 30 + 15) % 360;
          const pText = getCoords(houseMidDeg, houseRadius - 15);
          return (
            <text 
              key={i} 
              x={pText.x} y={pText.y} 
              textAnchor="middle" dominantBaseline="middle" 
              className="text-[9px] font-mono opacity-30 fill-current"
            >
              {i + 1}
            </text>
          );
        })}
        
        <circle cx={radius} cy={radius} r={houseRadius} fill="none" stroke="currentColor" strokeWidth="1" className="opacity-10" />

        {/* Planets */}
        {planets.map((planet, i) => {
          const pPos = getCoords(planet.degree, innerRadius - 10);
          const symbol = planet.symbol || PLANET_SYMBOLS[planet.name] || "?";
          const isHovered = hoveredPlanet?.name === planet.name;
          
          return (
            <g 
              key={i} 
              className="cursor-pointer"
              onMouseEnter={() => setHoveredPlanet(planet)}
              onMouseLeave={() => setHoveredPlanet(null)}
              onClick={() => onPlanetClick?.(planet)}
            >
              {/* Hit Area */}
              <circle cx={pPos.x} cy={pPos.y} r="15" fill="transparent" />
              
              <motion.circle 
                animate={{ scale: isHovered ? 1.5 : 1 }}
                cx={pPos.x} cy={pPos.y} r="3" 
                fill="currentColor" 
                className={isHovered ? "text-archive-accent" : "text-archive-accent opacity-60"} 
              />
              
              <motion.text 
                animate={{ 
                  y: isHovered ? -18 : -12,
                  scale: isHovered ? 1.2 : 1
                }}
                x={pPos.x} y={pPos.y} 
                textAnchor="middle" 
                className={`text-xs font-serif fill-current ${isHovered ? "text-archive-accent" : "text-archive-accent opacity-60"}`}
              >
                {symbol}
              </motion.text>
            </g>
          );
        })}

        {/* Ascendant Marker (Full Diameter) */}
        {(() => {
          const p1 = getCoords(ascendantDegree, radius);
          const p2 = getCoords(ascendantDegree + 180, radius);
          return <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" className="opacity-10" />;
        })()}
      </svg>

      {/* Center Point */}
      <div className="absolute w-1.5 h-1.5 bg-archive-ink rounded-full opacity-20" />

      {/* Hover Tooltip */}
      <AnimatePresence mode="wait">
        {hoveredPlanet && (
          <motion.div
            key="planet-tooltip"
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute z-50 bg-white border border-archive-line p-4 shadow-2xl rounded-archive pointer-events-none min-w-[200px]"
            style={{
              left: getCoords(hoveredPlanet.degree, innerRadius + 40).x,
              top: getCoords(hoveredPlanet.degree, innerRadius + 40).y,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-archive-line pb-1">
                <span className="font-serif italic text-lg">{hoveredPlanet.name}</span>
                <span className="text-archive-accent text-xl">{PLANET_SYMBOLS[hoveredPlanet.name]}</span>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono uppercase opacity-60">
                  <span>Sign</span>
                  <span className="text-archive-ink">{getSign(hoveredPlanet.degree).name} {getSign(hoveredPlanet.degree).degree.toFixed(1)}°</span>
                </div>
                <div className="flex justify-between text-[10px] font-mono uppercase opacity-60">
                  <span>House</span>
                  <span className="text-archive-ink">{getHouse(hoveredPlanet.degree)}</span>
                </div>
              </div>

              {calculateAspects(hoveredPlanet).length > 0 && (
                <div className="pt-2 border-t border-archive-line space-y-1">
                  <p className="text-[8px] font-mono uppercase opacity-30 tracking-widest mb-1">Aspects</p>
                  {calculateAspects(hoveredPlanet).map((asp, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[10px] font-mono">
                      <span className="opacity-60 flex items-center gap-1">
                        <span className="text-archive-accent">{asp.symbol}</span> {asp.aspect}
                      </span>
                      <span className="opacity-40">w/ {asp.planet}</span>
                    </div>
                  ))}
                </div>
              )}

              {onPlanetClick && (
                <div className="pt-2 text-center border-t border-archive-line">
                  <span className="handwritten text-[10px] text-archive-accent animate-pulse">Click to interpret</span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {hoveredHouse && !hoveredPlanet && (
          <motion.div
            key="house-tooltip"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute z-50 bg-archive-ink text-archive-bg p-3 shadow-2xl rounded-archive pointer-events-none min-w-[120px]"
            style={{
              left: radius,
              top: radius,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="text-center space-y-1">
              <p className="text-[8px] font-mono uppercase tracking-[0.2em] opacity-40">House</p>
              <p className="font-serif italic text-2xl">{hoveredHouse}</p>
              <p className="text-[9px] font-mono uppercase opacity-60">
                {getSign((ascendantDegree + (hoveredHouse - 1) * 30) % 360).name} Cusp
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
