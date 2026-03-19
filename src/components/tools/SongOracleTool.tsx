import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, Disc, Music, Volume2, ExternalLink, Loader2 } from 'lucide-react';
import { geminiService } from '../../services/geminiService';
import { ToolLayout } from '../shared/ToolLayout';
import { ResultSection } from '../shared/ResultSection';
import { useHaptics } from '../../hooks/useHaptics';

interface SongOracleData {
  song_title: string;
  artist: string;
  spotify_id: string;
  focus_lyric: string;
  vibe_color: string;
  verification_query: string;
}

interface SongOracleToolProps {
  onBack: () => void;
}

export const SongOracleTool: React.FC<SongOracleToolProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(false);
  const [song, setSong] = useState<SongOracleData | null>(null);
  const [frequency, setFrequency] = useState<string>("Equilibrium");
  const [history, setHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem('song_oracle_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [isNeedleDropped, setIsNeedleDropped] = useState(false);
  const { triggerClick, triggerSuccess } = useHaptics();

  useEffect(() => {
    localStorage.setItem('song_oracle_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    fetchFrequency();
  }, []);

  useEffect(() => {
    if (loading) {
      // Sequence: Drop needle, then start spinning
      const timer = setTimeout(() => setIsNeedleDropped(true), 500);
      return () => clearTimeout(timer);
    } else {
      setIsNeedleDropped(false);
    }
  }, [loading]);

  const fetchFrequency = async () => {
    try {
      const res = await fetch('/api/frequency');
      const data = await res.json();
      setFrequency(data.frequency || "Equilibrium");
    } catch (error) {
      console.error("Failed to fetch frequency:", error);
    }
  };

  const refreshFrequency = async () => {
    const frequencies = [
      "Harmonic Resonance", "Solar Flare", "Deep Sea Echo", 
      "Lunar Cycle", "Stellar Wind", "Quantum Drift", 
      "Atmospheric Pressure", "Magnetic North", "Equilibrium",
      "Ethereal Flow", "Primal Pulse", "Celestial Alignment"
    ];
    const newFreq = frequencies[Math.floor(Math.random() * frequencies.length)];
    
    try {
      await fetch('/api/frequency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frequency: newFreq })
      });
      setFrequency(newFreq);
      triggerClick();
    } catch (error) {
      console.error("Failed to update frequency:", error);
    }
  };

  const handleSongPull = async () => {
    if (loading) return;
    triggerClick();
    setLoading(true);
    try {
      // Pass history to avoid repeats in the prompt context
      const result = await geminiService.getSongOracle(frequency, history);
      
      setSong(result);
      setHistory(prev => [...prev.slice(-10), result.song_title]); // Keep last 10 songs in history
      triggerSuccess();
    } catch (error) {
      console.error("Song Oracle failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout
      title="Song Oracle"
      subtitle="A musical pull based on current energetic frequency"
      onBack={onBack}
      tooltipTitle="The Song Oracle"
      tooltipContent="Access the Archive's musical resonance. A single track is selected to match the current energetic frequency of the system."
    >
      <div className="w-full max-w-4xl mx-auto py-12 px-4">
        <div className="flex flex-col items-center gap-16">
          
          {/* Frequency Display */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-px bg-archive-line opacity-20" />
              <button 
                onClick={refreshFrequency}
                className="group flex items-center gap-2 px-3 py-1 rounded-full border border-archive-line/10 hover:border-archive-line/30 transition-all"
              >
                <RotateCcw className="w-3 h-3 opacity-40 group-hover:rotate-180 transition-transform duration-500" />
                <span className="text-[10px] font-mono uppercase tracking-[0.4em] opacity-40">System Resonance</span>
              </button>
              <div className="w-12 h-px bg-archive-line opacity-20" />
            </div>
            <h2 className="text-4xl font-serif italic text-archive-ink tracking-tight">{frequency}</h2>
          </div>

          {/* Main Action - Record Player Transformation */}
          <div className="relative">
            <motion.div
              className="relative p-12 bg-[#1a1a1a] rounded-2xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] border border-white/5 overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #222 0%, #111 100%)',
              }}
            >
              {/* Plinth Texture Overlay */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ filter: 'url(#pvc-noise)' }} />
              <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ filter: 'url(#dust-filter)' }} />
              
              {/* Decorative Screws/Details */}
              <div className="absolute top-4 left-4 w-3 h-3 rounded-full bg-gradient-to-br from-[#444] to-[#111] shadow-xl border border-white/5 flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-white/10" />
              </div>
              <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-gradient-to-br from-[#444] to-[#111] shadow-xl border border-white/5 flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-white/10" />
              </div>
              <div className="absolute bottom-4 left-4 w-3 h-3 rounded-full bg-gradient-to-br from-[#444] to-[#111] shadow-xl border border-white/5 flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-white/10" />
              </div>
              <div className="absolute bottom-4 right-4 w-3 h-3 rounded-full bg-gradient-to-br from-[#444] to-[#111] shadow-xl border border-white/5 flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-white/10" />
              </div>

              {/* Branding / Model Plate */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/40 rounded border border-white/5">
                <span className="text-[8px] font-mono uppercase tracking-[0.3em] text-white/20">ORACLE-MKII // ARCHIVE SERIES</span>
              </div>

              <div className="relative flex items-center gap-12">
                {/* Platter & Record */}
                <div className="relative">
                  {/* Platter Shadow */}
                  <div className="absolute inset-[-8px] rounded-full bg-black/40 blur-md" />
                  
                  {/* Platter (The metal part under the record) */}
                  <div 
                    className="absolute inset-[-4px] rounded-full border border-white/10"
                    style={{
                      background: 'conic-gradient(from 0deg, #333, #444, #333, #222, #333)',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.5)'
                    }}
                  />

                  <motion.button
                    onClick={handleSongPull}
                    disabled={loading}
                    className="relative group block"
                  >
                    <div className="relative w-64 h-64 flex items-center justify-center">
                      {/* Spinning Record/Disc */}
                      <motion.div
                        animate={(loading && isNeedleDropped) ? { rotate: 360 } : { rotate: 0 }}
                        transition={(loading && isNeedleDropped) ? { repeat: Infinity, duration: 1.8, ease: "linear" } : { duration: 1.2, ease: "circOut" }}
                        className="relative w-60 h-60 rounded-full flex items-center justify-center shadow-2xl transition-all"
                        style={{
                          background: `
                            repeating-radial-gradient(circle at center, #111 0px, #111 0.5px, #1a1a1a 1px),
                            radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.4) 100%)
                          `,
                          boxShadow: 'inset 0 0 60px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.1)'
                        }}
                      >
                        {/* Track Variation Grooves */}
                        <div className="absolute inset-0 rounded-full opacity-20" style={{
                          background: 'repeating-radial-gradient(circle at center, transparent 0px, transparent 10px, rgba(255,255,255,0.05) 10.5px, transparent 11px)'
                        }} />
                        {/* SVG Filters */}
                        <svg className="absolute inset-0 w-full h-full rounded-full pointer-events-none">
                          <defs>
                            <filter id="pvc-noise">
                              <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" result="noise"/>
                              <feColorMatrix in="noise" type="saturate" values="0" result="desaturated"/>
                              <feComponentTransfer in="desaturated" result="transferred">
                                <feFuncA type="linear" slope="0.08"/>
                              </feComponentTransfer>
                              <feComposite in="transferred" in2="SourceAlpha" operator="in"/>
                            </filter>
                            <filter id="paper-texture">
                              <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch" result="noise"/>
                              <feDiffuseLighting in="noise" lightingColor="#f5f5f0" surfaceScale="1.5" result="diffuse">
                                <feDistantLight azimuth="45" elevation="55"/>
                              </feDiffuseLighting>
                              <feComposite in="diffuse" in2="SourceAlpha" operator="in"/>
                            </filter>
                            <filter id="dust-filter">
                              <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" result="noise"/>
                              <feColorMatrix in="noise" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.05 0" result="colored"/>
                              <feComposite in="colored" in2="SourceAlpha" operator="in"/>
                            </filter>
                            <radialGradient id="groove-gradient" cx="50%" cy="50%" r="50%">
                              <stop offset="0%" stopColor="#111" />
                              <stop offset="100%" stopColor="#1a1a1a" />
                            </radialGradient>
                          </defs>
                          <circle cx="50%" cy="50%" r="50%" filter="url(#pvc-noise)" opacity="1"/>
                          <circle cx="50%" cy="50%" r="50%" filter="url(#dust-filter)" opacity="0.3"/>
                          {/* Label Background with Paper Texture */}
                          <circle cx="50%" cy="50%" r="40" fill="#E4E3E0" filter="url(#paper-texture)" />
                          {/* Rim Light */}
                          <circle cx="50%" cy="50%" r="49.5%" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
                        </svg>

                        {/* Reflections */}
                        <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                          {/* Primary Sharp 'V' Reflection - rotates 2s slower than record */}
                          <motion.div 
                            className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent mix-blend-soft-light"
                            animate={(loading && isNeedleDropped) ? { rotate: 360 } : { rotate: 0 }}
                            transition={(loading && isNeedleDropped) ? { repeat: Infinity, duration: 3.8, ease: "linear" } : { duration: 1.2 }}
                            style={{ clipPath: 'polygon(50% 50%, 40% 0%, 60% 0%)' }}
                          />
                          {/* Secondary Soft Reflection */}
                          <motion.div 
                            className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent mix-blend-soft-light"
                            animate={(loading && isNeedleDropped) ? { rotate: -360 } : { rotate: 0 }}
                            transition={(loading && isNeedleDropped) ? { repeat: Infinity, duration: 8, ease: "linear" } : { duration: 1.2 }}
                            style={{ clipPath: 'polygon(50% 50%, 30% 100%, 70% 100%)' }}
                          />
                          {/* Static Ambient Highlight */}
                          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-white/5 mix-blend-overlay" />
                        </div>

                        {/* Rim Light / Edge Highlight */}
                        <div className="absolute inset-0 rounded-full border border-white/10 shadow-[inset_0_0_2px_rgba(255,255,255,0.2)]" />

                        {/* Center Label */}
                        <div 
                          className="w-20 h-20 rounded-full flex flex-col items-center justify-center shadow-inner relative overflow-hidden"
                          style={{
                            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.4), 0 0 5px rgba(0,0,0,0.2)'
                          }}
                        >
                          <div className="absolute inset-0 opacity-15 bg-archive-accent-quaternary mix-blend-multiply" />
                          <div className="relative z-10 flex flex-col items-center">
                            <div className="w-5 h-5 rounded-full bg-archive-ink/90 mb-1 shadow-inner flex items-center justify-center">
                              <div className="w-1 h-1 rounded-full bg-white/20" />
                            </div>
                            <span className="text-[7px] font-mono uppercase tracking-tighter text-archive-ink/60 font-bold">The Syllabus</span>
                            <span className="text-[5px] font-mono uppercase tracking-[0.2em] text-archive-ink/40">Archive Master</span>
                          </div>
                        </div>
                        
                        {loading && !isNeedleDropped && (
                          <Loader2 className="absolute text-archive-bg/10 animate-spin w-12 h-12" />
                        )}
                      </motion.div>
                    </div>
                  </motion.button>
                </div>

                {/* Tone Arm & Controls Section */}
                <div className="flex flex-col justify-between h-64 py-4">
                  {/* Tone Arm Assembly */}
                  <div className="relative w-32 h-32">
                    {/* Tone Arm Base */}
                    <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-[#222] border border-white/10 shadow-xl flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#333] to-[#111] border border-white/5 shadow-inner" />
                      <div className="absolute w-4 h-4 rounded-full bg-[#444] shadow-lg" />
                    </div>

                    {/* Tone Arm */}
                    <motion.div 
                      className="absolute top-8 right-8 w-48 h-4 pointer-events-none origin-right z-20"
                      initial={{ rotate: -35 }}
                      animate={loading ? { rotate: 0 } : { rotate: -35 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 35, 
                        damping: 15,
                        delay: loading ? 0 : 0.5
                      }}
                    >
                      {/* Main Arm Tube with realistic metallic gradient */}
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-full h-2.5 bg-gradient-to-b from-[#999] via-[#eee] to-[#777] rounded-full shadow-lg border-t border-white/20" />
                      
                      {/* Headshell & Cartridge */}
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center">
                        <div className="w-12 h-7 bg-[#111] rounded-sm border border-white/10 shadow-xl relative transform -rotate-12 flex items-center justify-center">
                          {/* Stylus / Needle */}
                          <div className="absolute -bottom-2 left-3 w-0.5 h-3 bg-gradient-to-b from-[#888] to-transparent transform rotate-15" />
                          <div className="w-8 h-4 bg-[#222] rounded-sm border border-white/5 shadow-inner" />
                          <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-600/60 shadow-[0_0_5px_rgba(220,38,38,0.5)]" />
                        </div>
                      </div>

                      {/* Counterweight with realistic texture */}
                      <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-10 h-8 bg-gradient-to-br from-[#444] to-[#222] rounded-sm border border-white/10 shadow-xl flex items-center justify-center">
                        <div className="w-full h-px bg-white/5" />
                      </div>
                    </motion.div>
                  </div>

                  {/* Controls */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="space-y-1">
                        <div className="text-[8px] font-mono uppercase opacity-30">Speed</div>
                        <div className="flex gap-1">
                          {['33', '45'].map(s => (
                            <div key={s} className={`w-6 h-4 rounded-sm border border-white/10 flex items-center justify-center text-[8px] font-mono ${s === '33' ? 'bg-archive-accent-quaternary text-archive-ink' : 'bg-black/40 text-white/20'}`}>
                              {s}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="w-px h-8 bg-white/10" />
                      <div className="space-y-1">
                        <div className="text-[8px] font-mono uppercase opacity-30">Power</div>
                        <div className={`w-4 h-4 rounded-full border border-white/10 shadow-inner ${loading ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-red-500/20'}`} />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40">
                        {loading ? "System Engaged" : "Ready for Signal"}
                      </span>
                      <div className="h-1 w-full bg-black/40 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-archive-accent-quaternary"
                          initial={{ width: 0 }}
                          animate={loading ? { width: '100%' } : { width: 0 }}
                          transition={{ duration: 2 }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Result Display */}
          <AnimatePresence mode="wait">
            {song && !loading && (
              <motion.div
                key={song.spotify_id}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                className="w-full space-y-10"
              >
                <ResultSection
                  id="song-oracle-result"
                  type="SONG_ORACLE"
                  title="Song Oracle Pull"
                  content={`Song: ${song.song_title} by ${song.artist}. Focus Lyric: "${song.focus_lyric}"`}
                  exportName={`song-oracle-${song.song_title.replace(/\s+/g, '-')}`}
                  hideReadButton={true}
                  metadata={{
                    song_title: song.song_title,
                    artist: song.artist,
                    spotify_id: song.spotify_id,
                    focus_lyric: song.focus_lyric,
                    vibe_color: song.vibe_color,
                    frequency: frequency
                  }}
                >
                  <div 
                    className="archive-card p-12 relative overflow-hidden min-h-[450px] flex flex-col justify-center items-center text-center border-2"
                    style={{ 
                      background: `radial-gradient(circle at 50% 50%, ${song.vibe_color}10 0%, transparent 70%), var(--color-archive-bg)`,
                      borderColor: `${song.vibe_color}30`
                    }}
                  >
                    {/* Atmospheric Background Element */}
                    <div 
                      className="absolute inset-0 opacity-[0.03] pointer-events-none blur-[120px]"
                      style={{ backgroundColor: song.vibe_color }}
                      data-html2canvas-ignore
                    />

                    <div className="relative z-10 space-y-8 max-w-2xl">
                      <div className="space-y-4">
                        <div className="flex items-center justify-center gap-2 opacity-30">
                          <Music className="w-3 h-3" />
                          <span className="text-[9px] font-mono uppercase tracking-[0.5em]">Resonance Found</span>
                          <Music className="w-3 h-3" />
                        </div>
                        
                        <h3 className="text-5xl md:text-7xl font-serif italic text-archive-ink leading-[1.1] tracking-tight">
                          {song.song_title}
                        </h3>
                        <p className="text-lg font-mono uppercase tracking-[0.3em] text-archive-accent-quaternary font-bold">
                          {song.artist}
                        </p>
                      </div>

                      <div className="py-10 relative">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-px bg-archive-line opacity-20" />
                        <p className="text-2xl md:text-4xl font-serif italic text-archive-ink leading-relaxed opacity-90 px-4">
                          "{song.focus_lyric}"
                        </p>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-px bg-archive-line opacity-20" />
                      </div>

                      <div className="pt-4 flex flex-col items-center gap-4">
                        <a
                          href={`https://open.spotify.com/track/${song.spotify_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-3 px-8 py-4 bg-archive-ink text-archive-bg rounded-full text-[11px] font-mono uppercase tracking-[0.2em] hover:bg-archive-accent-quaternary hover:text-archive-ink transition-all shadow-xl"
                        >
                          <Volume2 className="w-4 h-4" />
                          Open in Spotify
                          <ExternalLink className="opacity-50 w-3 h-3" />
                        </a>
                        
                        <button
                          onClick={handleSongPull}
                          className="text-[9px] font-mono uppercase tracking-[0.2em] opacity-40 hover:opacity-100 transition-opacity flex items-center gap-2"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Wrong song? Pull again
                        </button>
                      </div>
                    </div>
                  </div>
                </ResultSection>

                {/* Spotify Embed - Fixed and Refined */}
                <div className="flex justify-center">
                  <div className="w-full max-w-lg p-1 bg-archive-ink rounded-[14px] shadow-2xl overflow-hidden">
                    <iframe
                      src={`https://open.spotify.com/embed/track/${song.spotify_id}?utm_source=generator&theme=0`}
                      width="100%"
                      height="152"
                      frameBorder="0"
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                      className="rounded-[12px]"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty State */}
          {!song && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.2 }}
              className="flex flex-col items-center gap-6 py-20"
            >
              <div className="relative">
                <Music className="w-16 h-16" />
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="absolute inset-0 bg-archive-accent-quaternary blur-2xl rounded-full -z-10"
                />
              </div>
              <p className="font-serif italic text-2xl tracking-wide">The Archive is waiting for a signal...</p>
            </motion.div>
          )}

        </div>
      </div>
    </ToolLayout>
  );
};
