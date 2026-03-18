let sharedAudioContext: AudioContext | null = null;

function getAudioContext(sampleRate: number): AudioContext {
  if (!sharedAudioContext) {
    sharedAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate });
  } else if (sharedAudioContext.sampleRate !== sampleRate) {
    // If sample rate differs, we might need a new one or just accept the current one.
    // For this app, 24000 is the standard for TTS.
    console.warn(`AudioContext sample rate mismatch: expected ${sampleRate}, got ${sharedAudioContext.sampleRate}`);
  }
  return sharedAudioContext;
}

/**
 * Decodes base64 PCM 16-bit 24kHz mono audio and plays it using AudioContext.
 * Returns a function to stop the playback.
 */
export async function playBase64Audio(
  base64Audio: string, 
  onEnded?: () => void,
  sampleRate: number = 24000
): Promise<() => void> {
  const audioContext = getAudioContext(sampleRate);
  
  // Ensure audio context is resumed (browsers often start it in suspended state)
  if (audioContext.state === 'suspended') {
    await audioContext.resume();
  }

  const binaryString = window.atob(base64Audio);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // PCM 16-bit is 2 bytes per sample. 
  // We need to ensure the buffer length is a multiple of 2.
  const bufferToUse = bytes.length % 2 === 0 ? bytes.buffer : bytes.buffer.slice(0, bytes.length - 1);
  const pcmData = new Int16Array(bufferToUse);
  
  const audioBuffer = audioContext.createBuffer(1, pcmData.length, sampleRate);
  const channelData = audioBuffer.getChannelData(0);

  for (let i = 0; i < pcmData.length; i++) {
    // Convert 16-bit signed integer to float range [-1.0, 1.0]
    channelData[i] = pcmData[i] / 32768.0;
  }

  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioContext.destination);
  
  let isStopped = false;
  const stop = () => {
    if (!isStopped) {
      try {
        source.stop();
      } catch (e) {
        // Ignore if already stopped
      }
      isStopped = true;
    }
  };

  source.onended = () => {
    if (!isStopped) {
      isStopped = true;
      if (onEnded) onEnded();
    }
  };

  source.start();
  
  return stop;
}
