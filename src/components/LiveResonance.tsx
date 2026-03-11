import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Moon, Sun, Clock, MapPin, Sparkles, Activity } from 'lucide-react';
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
    <div className="w-full max-w-6xl mx-auto p-6 sm:p-12 space-y-12">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Left Column: Live Status */}
        <div className="flex-1 space-y-8 w-full">
          <div className="flex items-center gap-3 border-b border-archive-line pb-4">
            <Activity className="text-archive-accent animate-pulse" size={18} />
            <h2 className="text-xs font-mono uppercase tracking-[0.3em] opacity-40">Live Resonance Data</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Moon Phase */}
            <div className="p-8 border border-archive-line bg-white shadow-sm relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 text-8xl opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">☽</div>
              <div className="flex items-center gap-3 mb-6">
                <Moon size={16} className="opacity-40" />
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
            <div className="p-8 border border-archive-line bg-white shadow-sm relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 text-8xl opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">♄</div>
              <div className="flex items-center gap-3 mb-6">
                <Clock size={16} className="opacity-40" />
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
                  <p className="text-xl font-serif italic">{sunPos?.sign} {Math.floor(sunPos?.degree || 0)}°</p>
                </div>
                <span className="text-3xl opacity-20">☉</span>
             </div>
             <div className="p-6 border border-archive-line bg-archive-bg/30 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-widest opacity-40 mb-1">Moon in</p>
                  <p className="text-xl font-serif italic">{moonPos?.sign} {Math.floor(moonPos?.degree || 0)}°</p>
                </div>
                <span className="text-3xl opacity-20">☽</span>
             </div>
          </div>
        </div>

        {/* Right Column: Collective Stream */}
        <div className="w-full md:w-80 space-y-6">
          <div className="flex items-center gap-3 border-b border-archive-line pb-4">
            <Sparkles className="text-archive-accent" size={18} />
            <h2 className="text-xs font-mono uppercase tracking-[0.3em] opacity-40">Archive Stream</h2>
          </div>
          
          <div className="space-y-4">
            {[
              { type: 'DREAM', text: 'A silver thread connecting the stars...', time: '2m ago' },
              { type: 'READING', text: 'The outcome is hidden in the silence.', time: '15m ago' },
              { type: 'SYNC', text: 'Three white birds in a perfect triangle.', time: '1h ago' },
              { type: 'RITUAL', text: 'Light a candle for the forgotten.', time: '3h ago' },
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-4 border border-archive-line bg-white/50 text-xs space-y-2"
              >
                <div className="flex justify-between items-center opacity-40 font-mono uppercase text-[8px]">
                  <span>{item.type}</span>
                  <span>{item.time}</span>
                </div>
                <p className="italic font-serif line-clamp-2">"{item.text}"</p>
              </motion.div>
            ))}
            <div className="pt-4 text-center">
              <p className="text-[8px] font-mono uppercase opacity-20 tracking-widest">End of Live Stream</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
