import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, Disc, Music, Volume2, ExternalLink, Loader2 } from 'lucide-react';
import { geminiService } from '../../services/geminiService';
import { ToolLayout } from '../shared/ToolLayout';
import { ResultSection } from '../shared/ResultSection';
import { useHaptics } from '../../hooks/useHaptics';
import { ReadAloudButton } from '../shared/ReadAloudButton';

interface SongOracleData {
  song_title: string;
  artist: string;
  spotify_id: string;
  focus_lyric: string;
  vibe_color: string;
}

interface SongOracleToolProps {
  onBack: () => void;
}

export const SongOracleTool: React.FC<SongOracleToolProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(false);
  const [song, setSong] = useState<SongOracleData | null>(null);
  const [frequency, setFrequency] = useState<string>("Equilibrium");
  const [history, setHistory] = useState<string[]>([]);
  const { triggerClick, triggerSuccess } = useHaptics();

  useEffect(() => {
    fetchFrequency();
  }, []);

  const fetchFrequency = async () => {
    try {
      const res = await fetch('/api/frequency');
      const data = await res.json();
      setFrequency(data.frequency || "Equilibrium");
    } catch (error) {
      console.error("Failed to fetch frequency:", error);
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
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-px bg-archive-line opacity-20" />
              <span className="text-[10px] font-mono uppercase tracking-[0.4em] opacity-40">System Resonance</span>
              <div className="w-12 h-px bg-archive-line opacity-20" />
            </div>
            <h2 className="text-4xl font-serif italic text-archive-ink tracking-tight">{frequency}</h2>
          </div>

          {/* Main Action - Refined Interaction */}
          <div className="relative">
            <motion.button
              onClick={handleSongPull}
              disabled={loading}
              className="relative group flex flex-col items-center gap-6"
            >
              <div className="relative w-40 h-40 flex items-center justify-center">
                {/* Outer Ring */}
                <div className="absolute inset-0 border border-archive-line rounded-full group-hover:scale-110 group-hover:border-archive-accent-quaternary transition-all duration-700 opacity-20" />
                
                {/* Spinning Record/Disc */}
                <motion.div
                  animate={loading ? { rotate: 360 } : { rotate: 0 }}
                  transition={loading ? { repeat: Infinity, duration: 2, ease: "linear" } : { duration: 0.5 }}
                  className="relative w-32 h-32 rounded-full border-2 border-archive-ink flex items-center justify-center bg-archive-ink shadow-2xl group-hover:shadow-archive-accent-quaternary/20 transition-all"
                >
                  <div className="absolute inset-2 border border-white/10 rounded-full" />
                  <div className="absolute inset-4 border border-white/5 rounded-full" />
                  <div className="w-8 h-8 rounded-full bg-archive-bg flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-archive-ink" />
                  </div>
                  
                  {loading ? (
                    <Loader2 className="absolute text-archive-bg/20 animate-spin w-10 h-10" />
                  ) : (
                    <Disc className="absolute text-archive-bg/20 group-hover:text-archive-accent-quaternary/40 transition-colors w-10 h-10" />
                  )}
                </motion.div>

                {/* Stylus/Needle */}
                <motion.div 
                  className="absolute -top-4 -right-4 w-16 h-16 pointer-events-none"
                  animate={loading ? { rotate: 15 } : { rotate: 0 }}
                >
                  <div className="w-1 h-12 bg-archive-accent-quaternary origin-top transform rotate-45 rounded-full shadow-sm" />
                </motion.div>
              </div>

              <div className="flex flex-col items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-archive-ink opacity-60 group-hover:opacity-100 transition-opacity">
                  {loading ? "Tuning..." : "Drop the Needle"}
                </span>
                <div className="w-1 h-1 bg-archive-accent-quaternary rounded-full group-hover:scale-150 transition-transform" />
              </div>
            </motion.button>
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
                  id={`song-oracle-${song.spotify_id}`}
                  type="SONG_ORACLE"
                  title="Song Oracle Pull"
                  content={`Song: ${song.song_title} by ${song.artist}. Focus Lyric: "${song.focus_lyric}"`}
                  exportName={`song-oracle-${song.song_title.replace(/\s+/g, '-')}`}
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
                      background: `radial-gradient(circle at 50% 50%, ${song.vibe_color}10 0%, transparent 70%), white`,
                      borderColor: `${song.vibe_color}30`
                    }}
                  >
                    {/* Atmospheric Background Element */}
                    <div 
                      className="absolute inset-0 opacity-[0.03] pointer-events-none blur-[120px]"
                      style={{ backgroundColor: song.vibe_color }}
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
                        <div className="mt-6 flex justify-center">
                          <ReadAloudButton text={song.focus_lyric} className="!p-2 !h-auto !w-auto !bg-archive-bg !border-archive-line !text-archive-ink hover:!bg-archive-ink hover:!text-archive-bg transition-all shadow-sm" />
                        </div>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-px bg-archive-line opacity-20" />
                      </div>

                      <div className="pt-4">
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
