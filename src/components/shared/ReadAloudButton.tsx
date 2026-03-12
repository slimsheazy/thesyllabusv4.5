import React, { useState, useRef } from 'react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { geminiService } from '../../services/geminiService';
import { useHaptics } from '../../hooks/useHaptics';

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
        // For AudioContext, we don't use audioRef.current as HTMLAudioElement
        // but we can store the source node if we want to stop it.
        // However, for simplicity, I'll just use a flag.
      }
      window.dispatchEvent(new CustomEvent('stop-archive-speech'));
      setIsSpeaking(false);
      return;
    }

    setIsLoading(true);
    try {
      const base64Audio = await geminiService.generateSpeech(text);
      if (base64Audio) {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const binaryString = window.atob(base64Audio);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        // PCM 16-bit is 2 bytes per sample
        const pcmData = new Int16Array(bytes.buffer);
        const audioBuffer = audioContext.createBuffer(1, pcmData.length, 24000);
        const channelData = audioBuffer.getChannelData(0);

        for (let i = 0; i < pcmData.length; i++) {
          channelData[i] = pcmData[i] / 32768.0;
        }

        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        
        const stopHandler = () => {
          source.stop();
          setIsSpeaking(false);
        };
        
        window.addEventListener('stop-archive-speech', stopHandler, { once: true });
        
        source.onended = () => {
          setIsSpeaking(false);
          window.removeEventListener('stop-archive-speech', stopHandler);
        };

        source.start();
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
