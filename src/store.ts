import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';
import { 
  BirthChartAnalysis, 
  HoraryAnalysis, 
  TransitNotification, 
  SynchronicityEntry,
  AkashicEntry,
  UserLocation,
  UnlockedTerm,
  Dream,
  QuoteEntry,
  MoodLog
} from './types';

// Custom storage object that implements StateStorage interface for IndexedDB
const idbStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await get(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
  },
};

interface SyllabusState {
  calculationsRun: number;
  lastAccess: string;
  isEclipseMode: boolean;
  isCalibrated: boolean;
  userLocation: UserLocation | null;
  userIdentity: string | null;
  userBirthday: string | null;
  userBirthTime: string;
  userBirthTimezone: string; // IANA Timezone string (e.g., "UTC", "America/New_York")
  unlockedTerms: Record<string, UnlockedTerm>;
  dreams: Dream[];
  quotes: QuoteEntry[];
  moodLogs: MoodLog[];
  transitNotifications: (TransitNotification & { id: string; date: string; isRead: boolean })[];
  lastTransitCheck: string | null;
  
  // AI Caches
  birthChartCache: Record<string, BirthChartAnalysis>;
  interpretationCache: Record<string, string>;
  horaryHistory: (HoraryAnalysis & { id: string; date: string; question: string; location: string })[];
  synchronicityHistory: (SynchronicityEntry & { id: string; date: string })[];
  akashicHistory: AkashicEntry[];
  
  // Pagination / Selective Loading
  visibleDreamsCount: number;
  pinnedTools: string[]; // Array of tool pages (IDs)
  
  setCalibrated: (calibrated: boolean) => void;
  recordCalculation: () => void;
  updateLastAccess: () => void;
  toggleEclipseMode: () => void;
  togglePinnedTool: (toolPage: string) => void;
  setUserLocation: (location: UserLocation | null) => void;
  setUserIdentity: (identity: string | null) => void;
  setUserBirthday: (birthday: string | null) => void;
  setUserBirthTime: (time: string) => void;
  setUserBirthTimezone: (timezone: string) => void;
  unlockTerm: (word: string, definition: string, etymology: string) => void;
  addDream: (text: string) => void;
  removeDream: (id: string) => void;
  addQuote: (text: string, author: string) => void;
  removeQuote: (id: string) => void;
  addMoodLog: (mood: string, insight: string) => void;
  removeMoodLog: (id: string) => void;
  addTransitNotifications: (notifications: TransitNotification[]) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  setLastTransitCheck: (date: string) => void;
  
  // AI Actions
  setBirthChartCache: (key: string, analysis: BirthChartAnalysis) => void;
  setInterpretationCache: (key: string, interpretation: string) => void;
  addHoraryEntry: (entry: HoraryAnalysis & { question: string; location: string }) => void;
  removeHoraryEntry: (id: string) => void;
  addSynchronicityEntry: (event: string, interpretation: string) => void;
  removeSynchronicityEntry: (id: string) => void;
  addAkashicEntry: (query: string, insight: string) => void;
  updateAkashicEntry: (id: string, updates: Partial<Omit<AkashicEntry, 'id' | 'date'>>) => void;
  removeAkashicEntry: (id: string) => void;
  
  // Pagination Actions
  loadMoreDreams: () => void;
  resetVisibleDreams: () => void;
  resetAllData: () => void;
}

export const useSyllabusStore = create<SyllabusState>()(
  persist(
    (set, get) => ({
      calculationsRun: 0,
      lastAccess: new Date().toISOString(),
      isEclipseMode: false,
      isCalibrated: false,
      userLocation: null,
      userIdentity: null,
      userBirthday: null,
      userBirthTime: "12:00",
      userBirthTimezone: "UTC",
      unlockedTerms: {},
      dreams: [],
      quotes: [],
      moodLogs: [],
      transitNotifications: [],
      lastTransitCheck: null,
      birthChartCache: {},
      interpretationCache: {},
      horaryHistory: [],
      synchronicityHistory: [],
      akashicHistory: [],
      visibleDreamsCount: 10,
      pinnedTools: [],

      resetAllData: () => set({
        calculationsRun: 0,
        isCalibrated: false,
        userLocation: null,
        userIdentity: null,
        userBirthday: null,
        userBirthTime: "12:00",
        userBirthTimezone: "UTC",
        unlockedTerms: {},
        dreams: [],
        quotes: [],
        moodLogs: [],
        transitNotifications: [],
        lastTransitCheck: null,
        birthChartCache: {},
        interpretationCache: {},
        horaryHistory: [],
        synchronicityHistory: [],
        akashicHistory: [],
        pinnedTools: []
      }),

      setCalibrated: (calibrated) => set({ isCalibrated: calibrated }),
      recordCalculation: () => set((state) => ({ calculationsRun: state.calculationsRun + 1 })),
      updateLastAccess: () => set({ lastAccess: new Date().toISOString() }),
      toggleEclipseMode: () => set((state) => ({ isEclipseMode: !state.isEclipseMode })),
      
      togglePinnedTool: (toolPage) => set((state) => ({
        pinnedTools: state.pinnedTools.includes(toolPage)
          ? state.pinnedTools.filter(p => p !== toolPage)
          : [...state.pinnedTools, toolPage]
      })),

      setUserLocation: (location) => set({ userLocation: location }),
      
      setUserIdentity: (identity) => set({ userIdentity: identity }),
      
      setUserBirthday: (birthday) => set({ userBirthday: birthday }),
      
      setUserBirthTime: (time) => set({ userBirthTime: time }),
      setUserBirthTimezone: (timezone) => set({ userBirthTimezone: timezone }),
      
      unlockTerm: (word, definition, etymology) => set((state) => {
        if (state.unlockedTerms[word]) return state;
        return {
          unlockedTerms: {
            ...state.unlockedTerms,
            [word]: {
              definition,
              etymology,
              discoveredAt: new Date().toISOString()
            }
          }
        };
      }),

      addDream: (text) => set((state) => ({
        dreams: [
          { text, date: new Date().toLocaleDateString(), id: crypto.randomUUID() },
          ...state.dreams
        ]
      })),

      removeDream: (id) => set((state) => ({
        dreams: state.dreams.filter(d => d.id !== id)
      })),

      addQuote: (text, author) => set((state) => ({
        quotes: [
          { text, author, id: crypto.randomUUID() },
          ...state.quotes
        ]
      })),

      removeQuote: (id) => set((state) => ({
        quotes: state.quotes.filter(q => q.id !== id)
      })),

      addMoodLog: (mood, insight) => set((state) => ({
        moodLogs: [
          { mood, insight, date: new Date().toISOString(), id: crypto.randomUUID() },
          ...state.moodLogs
        ]
      })),

      removeMoodLog: (id) => set((state) => ({
        moodLogs: state.moodLogs.filter(m => m.id !== id)
      })),

      addTransitNotifications: (notifications) => set((state) => ({
        transitNotifications: [
          ...notifications.map(n => ({
            ...n,
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            isRead: false
          })),
          ...state.transitNotifications
        ].slice(0, 20)
      })),

      markNotificationRead: (id) => set((state) => ({
        transitNotifications: state.transitNotifications.map(n => 
          n.id === id ? { ...n, isRead: true } : n
        )
      })),

      clearNotifications: () => set({ transitNotifications: [] }),
      
      setLastTransitCheck: (date) => set({ lastTransitCheck: date }),

      setBirthChartCache: (key, analysis) => set((state) => ({
        birthChartCache: { ...state.birthChartCache, [key]: analysis }
      })),

      setInterpretationCache: (key, interpretation) => set((state) => ({
        interpretationCache: { ...state.interpretationCache, [key]: interpretation }
      })),

      addHoraryEntry: (entry) => set((state) => ({
        horaryHistory: [
          { ...entry, id: crypto.randomUUID(), date: new Date().toISOString() },
          ...state.horaryHistory
        ]
      })),

      removeHoraryEntry: (id) => set((state) => ({
        horaryHistory: state.horaryHistory.filter(h => h.id !== id)
      })),

      addSynchronicityEntry: (event, interpretation) => set((state) => ({
        synchronicityHistory: [
          { id: crypto.randomUUID(), event, interpretation, date: new Date().toISOString() },
          ...state.synchronicityHistory
        ]
      })),

      removeSynchronicityEntry: (id) => set((state) => ({
        synchronicityHistory: state.synchronicityHistory.filter(s => s.id !== id)
      })),

      addAkashicEntry: (query, insight) => set((state) => ({
        akashicHistory: [
          { id: crypto.randomUUID(), query, insight, date: new Date().toISOString() },
          ...state.akashicHistory
        ]
      })),

      updateAkashicEntry: (id, updates) => set((state) => ({
        akashicHistory: state.akashicHistory.map(a => 
          a.id === id ? { ...a, ...updates } : a
        )
      })),

      removeAkashicEntry: (id) => set((state) => ({
        akashicHistory: state.akashicHistory.filter(a => a.id !== id)
      })),

      loadMoreDreams: () => set((state) => ({ visibleDreamsCount: state.visibleDreamsCount + 10 })),
      resetVisibleDreams: () => set({ visibleDreamsCount: 10 }),
    }),
    {
      name: 'the-syllabus-state',
      storage: createJSONStorage(() => idbStorage),
    }
  )
);
