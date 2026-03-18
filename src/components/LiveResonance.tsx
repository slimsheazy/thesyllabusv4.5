import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Circle, Moon, Clock, Sun } from 'lucide-react';
import { useSyllabusStore } from '../store';
import { getMoonPhase, getPlanetaryHour, getAllPlanetPositions } from '../utils/astronomy';
import { useProfile } from '../hooks/useProfile';

export const LiveResonance: React.FC = () => {
  const { profile } = useProfile();
  const [now, setNow] = useState(new Date());
  const [moonData, setMoonData] = useState(getMoonPhase(new Date()));
  const [planetaryHour, setPlanetaryHour] = useState(
    getPlanetaryHour(new Date(), profile.location.lat || 0, profile.location.lng || 0)
  );
  const [planets, setPlanets] = useState(getAllPlanetPositions(new Date()));

  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setNow(d);
      setMoonData(getMoonPhase(d));
      setPlanetaryHour(getPlanetaryHour(d, profile.location.lat || 0, profile.location.lng || 0));
      setPlanets(getAllPlanetPositions(d));
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [profile.location.lat, profile.location.lng]);

  const sunPos = planets.find(p => p.name === 'Sun');
  const moonPos = planets.find(p => p.name === 'Moon');

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-12 space-y-12">
      <div className="flex flex-col gap-8 items-start">
        {/* Live Status */}
        <div className="flex-1 space-y-8 w-full">
          <div className="flex items-center gap-3 border-b border-archive-line pb-4">
            <Circle className="w-3 h-3 text-archive-accent fill-current animate-pulse" />
            <h2 className="text-xs font-mono uppercase tracking-[0.3em] opacity-40">Live Resonance Data</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Moon Phase */}
            <div className="p-8 border border-archive-line bg-archive-bg shadow-sm relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                <Moon className="w-32 h-32" />
              </div>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-[10px] font-mono uppercase tracking-widest opacity-40">Moon Phase</span>
              </div>
              <p className="text-3xl font-serif italic mb-2">{moonData.name}</p>
              <div className="w-full h-1 bg-archive-line/20 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(moonData.phase / 360) * 100}%` }}
                  className="h-full bg-archive-ink"
                />
              </div>
            </div>

            {/* Planetary Hour */}
            <div className="p-8 border border-archive-line bg-archive-bg shadow-sm relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                <Clock className="w-32 h-32" />
              </div>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-[10px] font-mono uppercase tracking-widest opacity-40">Planetary Hour</span>
              </div>
              {planetaryHour ? (
                <>
                  <p className="text-3xl font-serif italic mb-2">Hour of {planetaryHour.ruler}</p>
                  <p className="text-[10px] font-mono uppercase tracking-widest opacity-40">
                    {planetaryHour.isDay ? 'Day' : 'Night'} Hour {planetaryHour.hour} of 12
                  </p>
                </>
              ) : (
                <p className="text-sm italic opacity-40">Location data required for precise calculation.</p>
              )}
            </div>
          </div>

          {/* Current Placements */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
             <div className="p-6 border border-archive-line bg-archive-bg/30 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-widest opacity-40 mb-1">Sun in</p>
                  <p className="text-xl font-serif italic">{sunPos?.sign} {Math.floor(sunPos?.degree || 0)}deg</p>
                </div>
                <Sun className="w-8 h-8 opacity-20" />
             </div>
             <div className="p-6 border border-archive-line bg-archive-bg/30 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-widest opacity-40 mb-1">Moon in</p>
                  <p className="text-xl font-serif italic">{moonPos?.sign} {Math.floor(moonPos?.degree || 0)}deg</p>
                </div>
                <Moon className="w-8 h-8 opacity-20" />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
