export interface ArchivedSite {
  id: string;
  url: string;
  title: string;
  captureDate: string;
  size: string;
  status: 'complete' | 'pending' | 'failed';
  tags: string[];
  thumbnail?: string;
}

export interface ArchiveStats {
  totalCaptures: number;
  totalSize: string;
  lastUpdated: string;
}

export interface UserLocation {
  lat: number;
  lng: number;
  name?: string;
}

export interface UnlockedTerm {
  definition: string;
  etymology: string;
  discoveredAt: string;
}

export interface Dream {
  text: string;
  date: string;
  id: string;
}

export interface QuoteEntry {
  text: string;
  author: string;
  id: string;
}

export interface MoodLog {
  mood: string;
  insight: string;
  date: string;
  id: string;
}

export interface SynchronicityEntry {
  id: string;
  event: string;
  interpretation: string;
  date: string;
}

export interface AkashicEntry {
  id: string;
  query: string;
  insight: string;
  date: string;
  reflection?: string;
  resonance?: number; // 1-5
}

export interface PlanetPosition {
  name: string;
  longitude: number;
  sign: string;
  degree: number;
}

export interface Aspect {
  planet1: string;
  planet2: string;
  type: 'Conjunction' | 'Sextile' | 'Square' | 'Trine' | 'Opposition';
  angle: number;
  orb: number;
}

export interface BirthChartPlanet {
  name: string;
  degree: number; // Absolute degree 0-360
  sign: string;
  symbol?: string;
}

export interface BirthChartData {
  ascendant: number;
  planets: BirthChartPlanet[];
}

export interface BirthChartAnalysis {
  sunSign: string;
  moonSign: string;
  risingSign: string;
  lifePath: number;
  summary: string;
  traits: string[];
  chartData: BirthChartData;
  metadata: {
    verifiedUtcOffset: number;
    isDstActive: boolean;
    calculationNotes: string;
  };
}

export interface HoraryAnalysis {
  outcome: string;
  judgment: string;
  technicalNotes: string;
  chartData: BirthChartData;
}

export interface HoraryKeyPlanet {
  name: string;
  role: string;
}

export interface HoraryAnswer {
  answer: string;
  explanation: string;
  keyPlanets: HoraryKeyPlanet[];
}

export interface TransitNotification {
  message: string;
  type: 'info' | 'warning' | 'success';
}
