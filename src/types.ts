export interface ArchivedSite {
  id: string;
  url: string;
  title: string;
  description: string;
  userId: string;
  userName: string;
  captureDate: string;
  size: string;
  status: 'complete' | 'pending' | 'failed';
  tags: string[];
  thumbnail?: string;
}

export interface Comment {
  id: string;
  archiveId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  text: string;
  createdAt: string;
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
  date?: string;
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
  interpretation: string;
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
  aspects: Aspect[];
  chartData: BirthChartData;
  metadata: {
    verifiedUtcOffset: number;
    isDstActive: boolean;
    calculationNotes: string;
  };
  lunarPhase?: string;
  retrogrades?: string[];
  voidOfCourse?: boolean;
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

export interface HumanDesignCenter {
  name: string;
  status: 'Defined' | 'Undefined';
  description: string;
}

export interface HumanDesignAnalysis {
  type: string;
  strategy: string;
  authority: string;
  profile: string;
  definition: string;
  incarnationCross: string;
  summary: string;
  centers: HumanDesignCenter[];
  gates: number[];
}

export interface StarboardEntry {
  id: string;
  type: string;
  title: string;
  content: string;
  date: string;
  starredAt: string;
  metadata?: any;
}

export interface Charm {
  name: string;
  description: string;
  rarity: 'common' | 'rare';
  icon?: string;
}

export interface House {
  number: number;
  name: string;
  keyword: string;
  contextKeyword?: string;
}

export interface QuantumTimelineResult {
  currentReality: {
    stateLabel: string;
    entropyLevel: string;
    frequencyMarker: string;
    realityFragments: string[];
  };
  desiredReality: {
    stateLabel: string;
    entropyLevel: string;
    frequencyMarker: string;
    realityFragments: string[];
  };
  quantumJump: {
    behavioralDelta: string;
    bridgeAction: string;
    shiftFrequency: string;
  };
}

export interface ToolProps {
  onBack: () => void;
}

export interface PhotoScryerResult {
  primaryObservation: string;
  artifactsDetected: string[];
  spatialVibe: string;
}

export interface SynastryResult {
  compatibilityScore: number;
  analysis: string;
  vibrationalMatch: string;
  groupDynamic?: string;
  leaderArchetype?: {
    name: string;
    role: string;
  };
  frictionPoints?: string[];
}

export interface BiorhythmInterpretation {
  brief: string;
  suggestion: string;
}

export interface DeckRecommendation {
  deckName: string;
  creator: string;
  description: string;
  whyMatch: string;
  keyThemes: string[];
  estimatedPrice: string;
  whereToFind: string;
  acquisitionLink: string;
}

export interface StichomancyResult {
  quote: string;
  divinatoryMeaning: string;
  sourceInsight: string;
  bookInfo: {
    title: string;
    author: string;
    year?: string;
  };
}
