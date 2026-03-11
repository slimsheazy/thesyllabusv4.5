import { useMemo } from 'react';
import { useSyllabusStore } from '../store';

export const useSeekerLevel = () => {
  const { calculationsRun } = useSyllabusStore();

  const level = useMemo(() => {
    if (calculationsRun >= 25) return "Expert Seeker";
    if (calculationsRun >= 15) return "Deep Diver";
    if (calculationsRun >= 10) return "Regular Visitor";
    if (calculationsRun >= 5) return "Curious Student";
    return "Newcomer";
  }, [calculationsRun]);

  const resonance = useMemo(() => {
    return Math.floor(calculationsRun * 1.5);
  }, [calculationsRun]);

  const progress = useMemo(() => {
    return Math.min((calculationsRun / 50) * 100, 100);
  }, [calculationsRun]);

  return { level, resonance, progress, calculationsRun };
};
