export interface ToolItem {
  name: string;
  page: string;
  desc: string;
}

export interface ToolCategory {
  label: string;
  color: string;
  icon: string;
  items: ToolItem[];
}

export const TOOL_CATEGORIES: ToolCategory[] = [
  {
    label: "Divination & Insight",
    color: "var(--color-archive-accent)",
    icon: "Moon",
    items: [
      { name: "Horary", page: "HORARY", desc: "Specific answers based on the moment of inquiry." },
      { name: "Tarot Reading", page: "TAROT", desc: "Traditional card layouts for clarity and guidance." },
      { name: "Glyphic", page: "GLYPHIC", desc: "Visual and conceptual insights from language." },
      { name: "Lenormand Spinner", page: "LENORMAND", desc: "A practical 3-card system for quick answers." },
      { name: "Tea Leaf Reading", page: "TEA_LEAF", desc: "Reading patterns and symbols in tea leaves." },
      { name: "Sabian Symbols", page: "SABIAN", desc: "Symbolic meanings for each degree of the zodiac." },
      { name: "Synchronicity Decoder", page: "SYNCHRONICITY", desc: "Analyze coincidences for practical insights." },
      { name: "Song Oracle", page: "SONG_ORACLE", desc: "A musical pull based on current energetic frequency." },
      { name: "I Ching", page: "I_CHING", desc: "Consult the ancient Book of Changes using the coin method." },
      { name: "Color Oracle", page: "COLOR", desc: "Identify your current energetic resonance through color." },
      { name: "Pendulum", page: "PENDULUM", desc: "Access direct answers from your subconscious mind." },
      { name: "Scrying", page: "CRYSTAL", desc: "Visualize insights and patterns in the crystal sphere." },
    ]
  },
  {
    label: "Self-Discovery & Records",
    color: "var(--color-archive-ink)",
    icon: "Compass",
    items: [
      { name: "The Birth Map", page: "BIRTH_CHART", desc: "Analysis of your astrological chart at birth." },
      { name: "Life Path Reader", page: "NUMEROLOGY", desc: "Insights from your birth date and name numbers." },
      { name: "Biorhythms", page: "BIORHYTHM", desc: "Track your physical, emotional, and intellectual cycles." },
      { name: "Dream Journal", page: "DREAM_JOURNAL", desc: "Record and analyze recurring themes in your dreams." },
      { name: "Mood Tracker", page: "MOOD", desc: "Log and analyze your emotional patterns." },
      { name: "Human Design", page: "HUMAN_DESIGN", desc: "Decode your unique energetic blueprint and genetic strategy." },
      { name: "Death Clock", page: "DEATH_CLOCK", desc: "Calculate biological age and projected longevity using the Gompertz-Makeham formula." },
      { name: "The Hall of Records", page: "AKASHIC", desc: "A database for storing and retrieving insights." },
      { name: "The Book of Life", page: "BOOK_OF_LIFE", desc: "Your personal collection of saved records." },
    ]
  },
  {
    label: "Practical & Creative",
    color: "#6366f1",
    icon: "Sun",
    items: [
      { name: "Daily Rituals", page: "RITUAL", desc: "Simple habits for focus and clarity." },
      { name: "Lost Item Finder", page: "LOST_ITEM", desc: "Techniques to help locate misplaced objects." },
      { name: "Create a Sigil", page: "SIGIL", desc: "Design symbols to represent your goals." },
      { name: "Crash Simulator", page: "CRASH_SIMULATOR", desc: "A worst-case scenario planner using FMEA to prioritize contingency plans." },
      { name: "Name to Number", page: "GEMATRIA", desc: "Calculate numerical values of words." },
      { name: "Check Your Home", page: "FLYING_STAR", desc: "Analyze the energy flow in your living space." },
      { name: "Cosmic Prophecy", page: "MAD_LIBS", desc: "Generate short narratives based on your inputs." },
    ]
  },
  {
    label: "Core Systems",
    color: "var(--color-archive-ink)",
    icon: "Link",
    items: [
      { name: "Website Archive", page: "WEBSITE_ARCHIVE", desc: "A collective repository of digital artifacts and discussion." },
      { name: "Shared Insights", page: "SHARED_INSIGHTS", desc: "A real-time collection of observations from the collective archive." },
      { name: "Master Archive", page: "MASTER_ARCHIVE", desc: "The central index of all your records." },
      { name: "Lexicon", page: "LEXICON", desc: "A dictionary of terms you've discovered." },
      { name: "The Librarian", page: "ORACLE_VIEW", desc: "Ask questions and get direct answers." },
      { name: "The Starboard", page: "STARBOARD", desc: "Your collection of favorited insights and luminous records." },
      { name: "Syllabus Explorer", page: "EXPLORER", desc: "Browse and manage your stored data." },
    ]
  }
];

export const ALL_TOOLS = TOOL_CATEGORIES.flatMap(cat => cat.items);
