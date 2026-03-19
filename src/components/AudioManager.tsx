export const audioManager: {
  playRustle: () => void;
  playPenScratch: (volume?: number) => void;
} = {
  playRustle: () => console.log('Rustle played'),
  playPenScratch: (volume?: number) => console.log('Pen scratch played', volume),
};
