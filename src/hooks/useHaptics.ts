import useSound from 'use-sound';

const SOUNDS = {
  click: 'https://assets.mixkit.co/active_storage/sfx/2562/2562-preview.mp3',
  rustle: 'https://assets.mixkit.co/active_storage/sfx/1103/1103-preview.mp3',
  success: 'https://assets.mixkit.co/active_storage/sfx/443/443-preview.mp3',
  tick: 'https://assets.mixkit.co/active_storage/sfx/2561/2561-preview.mp3'
};

export const useHaptics = () => {
  const [playClick] = useSound(SOUNDS.click, { volume: 0.15 });
  const [playRustle] = useSound(SOUNDS.rustle, { volume: 0.1 });
  const [playSuccess] = useSound(SOUNDS.success, { volume: 0.15 });
  const [playTick] = useSound(SOUNDS.tick, { volume: 0.05 });
  const [playWarning] = useSound('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3', { volume: 0.2 });

  const vibrate = (pattern: number | number[] = 10) => {
    if (typeof window !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

  const triggerClick = () => {
    playClick();
    vibrate(5);
  };

  const triggerRustle = () => {
    playRustle();
    vibrate(10);
  };

  const triggerSuccess = () => {
    playSuccess();
    vibrate([10, 50, 10]);
  };

  const triggerTick = () => {
    playTick();
    vibrate(2);
  };

  const triggerWarning = () => {
    playWarning();
    vibrate([50, 100, 50]);
  };

  return {
    triggerClick,
    triggerRustle,
    triggerSuccess,
    triggerTick,
    triggerWarning,
    vibrate
  };
};
