export interface ToolItem {
  name: string;
  page: string;
  desc: string;
}

export interface ToolCategory {
  label: string;
  color: string;
  symbol: string;
  items: ToolItem[];
}

export const TOOL_CATEGORIES: ToolCategory[] = [
  {
    label: "Divination & Insight",
    color: "var(--color-archive-accent)",
    symbol: "☽",
    items: [
      { name: "Horary", page: "HORARY", desc: "Specific answers based on the moment of inquiry." },
      { name: "Tarot Reading", page: "TAROT", desc: "Traditional card layouts for clarity and guidance." },
      { name: "The Oracle", page: "ORACLE", desc: "A tool for psychological reflection and insight." },
      { name: "Lenormand Spinner", page: "LENORMAND", desc: "A practical 3-card system for quick answers." },
      { name: "Tea Leaf Reading", page: "TEA_LEAF", desc: "Reading patterns and symbols in tea leaves." },
      { name: "Sabian Symbols", page: "SABIAN", desc: "Symbolic meanings for each degree of the zodiac." },
      { name: "Synchronicity Decoder", page: "SYNCHRONICITY", desc: "Analyze coincidences for practical insights." },
    ]
  },
  {
    label: "Self-Discovery & Records",
    color: "var(--color-archive-ink)",
    symbol: "☊",
    items: [
      { name: "The Birth Map", page: "BIRTH_CHART", desc: "Analysis of your astrological chart at birth." },
      { name: "Life Path Reader", page: "NUMEROLOGY", desc: "Insights from your birth date and name numbers." },
      { name: "Dream Journal", page: "DREAM_JOURNAL", desc: "Record and analyze recurring themes in your dreams." },
      { name: "Emotional Resonance", page: "MOOD", desc: "Track and visualize your emotional patterns." },
      { name: "The Hall of Records", page: "AKASHIC", desc: "A database for storing and retrieving insights." },
      { name: "The Book of Life", page: "BOOK_OF_LIFE", desc: "Your personal collection of saved records." },
    ]
  },
  {
    label: "Practical & Creative",
    color: "#6366f1",
    symbol: "☉",
    items: [
      { name: "Daily Rituals", page: "RITUAL", desc: "Simple habits for focus and clarity." },
      { name: "Lost Item Finder", page: "LOST_ITEM", desc: "Techniques to help locate misplaced objects." },
      { name: "Create a Sigil", page: "SIGIL", desc: "Design symbols to represent your goals." },
      { name: "Name to Number", page: "GEMATRIA", desc: "Calculate numerical values of words." },
      { name: "Check Your Home", page: "FLYING_STAR", desc: "Analyze the energy flow in your living space." },
      { name: "Cosmic Prophecy", page: "MAD_LIBS", desc: "Generate short narratives based on your inputs." },
    ]
  },
  {
    label: "Core Systems",
    color: "var(--color-archive-ink)",
    symbol: "☌",
    items: [
      { name: "Master Archive", page: "MASTER_ARCHIVE", desc: "The central index of all your records." },
      { name: "Lexicon", page: "LEXICON", desc: "A dictionary of terms you've discovered." },
      { name: "The Librarian", page: "ORACLE_VIEW", desc: "Ask questions and get direct answers." },
      { name: "Syllabus Explorer", page: "EXPLORER", desc: "Browse and manage your stored data." },
    ]
  }
];

export const ALL_TOOLS = TOOL_CATEGORIES.flatMap(cat => cat.items);
