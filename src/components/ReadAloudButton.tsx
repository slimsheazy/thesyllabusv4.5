import React, { useState, useRef } from 'react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { useHaptics } from '../hooks/useHaptics';

interface ReadAloudButtonProps {
  text: string;
  className?: string;
}

export const ReadAloudButton: React.FC<ReadAloudButtonProps> = ({ text, className }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { triggerClick, triggerTick } = useHaptics();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggleSpeech = async () => {
    triggerClick();
    if (isSpeaking) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsSpeaking(false);
      return;
    }

    setIsLoading(true);
    try {
      const audioUrl = await geminiService.generateSpeech(text);
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        audio.onended = () => setIsSpeaking(false);
        audio.play();
        setIsSpeaking(true);
      }
    } catch (error) {
      console.error("Speech generation failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={toggleSpeech}
      disabled={isLoading}
      className={`p-2 border border-archive-line rounded-full hover:bg-archive-ink hover:text-archive-bg transition-colors group ${className}`}
      title={isSpeaking ? "Stop Reading" : "Read Aloud"}
    >
      {isLoading ? (
        <Loader2 size={14} className="animate-spin opacity-40" />
      ) : isSpeaking ? (
        <VolumeX size={14} />
      ) : (
        <Volume2 size={14} className="opacity-40 group-hover:opacity-100" />
      )}
    </button>
  );
};
