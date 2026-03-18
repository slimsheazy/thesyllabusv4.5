import React, { useState, useRef } from 'react';
import { geminiService } from '../../services/geminiService';
import { useHaptics } from '../../hooks/useHaptics';
import { playBase64Audio } from '../../utils/audioUtils';

interface ReadAloudButtonProps {
  text: string;
  className?: string;
}

export const ReadAloudButton: React.FC<ReadAloudButtonProps> = ({ text, className }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { triggerClick } = useHaptics();
  const stopSpeechRef = useRef<(() => void) | null>(null);

  const toggleSpeech = async () => {
    triggerClick();
    if (isSpeaking) {
      if (stopSpeechRef.current) {
        stopSpeechRef.current();
        stopSpeechRef.current = null;
      }
      setIsSpeaking(false);
      return;
    }

    setIsLoading(true);
    try {
      const base64Audio = await geminiService.generateSpeech(text);
      if (base64Audio) {
        const stop = await playBase64Audio(base64Audio, () => {
          setIsSpeaking(false);
          stopSpeechRef.current = null;
        });
        stopSpeechRef.current = stop;
        setIsSpeaking(true);
      }
    } catch (error) {
      console.error("Speech generation failed:", error);
      setIsSpeaking(false);
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
        <span className="text-[10px] animate-pulse">...</span>
      ) : isSpeaking ? (
        <span className="text-[10px] font-bold">MUTE</span>
      ) : (
        <span className="text-[10px] font-bold opacity-40 group-hover:opacity-100">READ</span>
      )}
    </button>
  );
};
