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
      { name: "Tarot Reading", page: "TAROT", desc: "Structured card systems for situational reflection." },
      { name: "The Oracle", page: "ORACLE", desc: "A linguistic mirror reflecting profound psychological concepts." },
      { name: "Lenormand Spinner", page: "LENORMAND", desc: "A 3-reel slot machine for practical, punchy readings." },
      { name: "Tea Leaf Reading", page: "TEA_LEAF", desc: "Interpretive patterns found in the dregs of the cup." },
      { name: "Sabian Symbols", page: "SABIAN", desc: "360 symbolic descriptions for each zodiac degree." },
      { name: "Synchronicity Decoder", page: "SYNCHRONICITY", desc: "Translate meaningful coincidences into actionable wisdom." },
    ]
  },
  {
    label: "Self-Discovery & Records",
    color: "var(--color-archive-ink)",
    symbol: "☊",
    items: [
      { name: "The Birth Map", page: "BIRTH_CHART", desc: "Your unique cosmic blueprint from the moment of birth." },
      { name: "Life Path Reader", page: "NUMEROLOGY", desc: "Numerical analysis of your birth date and name." },
      { name: "Dream Journal", page: "DREAM_JOURNAL", desc: "Record and review nocturnal visions for recurring themes." },
      { name: "Emotional Resonance", page: "MOOD", desc: "Track and visualize your emotional state over time." },
      { name: "The Hall of Records", page: "AKASHIC", desc: "A conceptual repository of universal information." },
      { name: "The Book of Life", page: "BOOK_OF_LIFE", desc: "Your personal chronicle of saved Akashic insights." },
    ]
  },
  {
    label: "Practical & Creative",
    color: "#6366f1",
    symbol: "☉",
    items: [
      { name: "Daily Rituals", page: "RITUAL", desc: "Practical habits to maintain focus and clarity." },
      { name: "Lost Item Finder", page: "LOST_ITEM", desc: "Horary techniques to help locate misplaced objects." },
      { name: "Create a Sigil", page: "SIGIL", desc: "Craft personal symbols to represent specific goals." },
      { name: "Name to Number", page: "GEMATRIA", desc: "Calculate numerical values of words to find themes." },
      { name: "Check Your Home", page: "FLYING_STAR", desc: "Feng Shui analysis of energy movement in your space." },
      { name: "Cosmic Prophecy", page: "MAD_LIBS", desc: "Creative narratives based on your inputs." },
    ]
  },
  {
    label: "Core Systems",
    color: "var(--color-archive-ink)",
    symbol: "☌",
    items: [
      { name: "Master Archive", page: "MASTER_ARCHIVE", desc: "The central index of all recorded resonances." },
      { name: "Lexicon", page: "LEXICON", desc: "Your discovered vocabulary and esoteric terms." },
      { name: "The Librarian", page: "ORACLE_VIEW", desc: "Consult the archive's wisdom through dialogue." },
      { name: "Syllabus Explorer", page: "EXPLORER", desc: "Browse and explore the various records." },
    ]
  }
];

export const ALL_TOOLS = TOOL_CATEGORIES.flatMap(cat => cat.items);
