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
    label: "Need some help?",
    color: "var(--color-archive-accent)",
    symbol: "☽",
    items: [
      { name: "Horary", page: "HORARY", desc: "A method of answering specific questions based on the moment they are asked." },
      { name: "Life Path Reader", page: "NUMEROLOGY", desc: "A numerical analysis of your birth date and name to identify patterns and tendencies." },
      { name: "Name to Number (Gematria)", page: "GEMATRIA", desc: "A system for calculating the numerical value of names and words to find common themes." },
      { name: "Sabian Symbols", page: "SABIAN", desc: "A set of 360 symbolic descriptions for each degree of the zodiac." },
      { name: "Tarot Reading", page: "TAROT", desc: "A structured system of cards used to reflect on current situations and potential outcomes." },
      { name: "The Hall of Records", page: "AKASHIC", desc: "A conceptual repository of information and experiences." },
      { name: "The Book of Life", page: "BOOK_OF_LIFE", desc: "Your personal chronicle of saved Akashic insights and reflections." },
      { name: "Lost Item Finder", page: "LOST_ITEM", desc: "A practical application of horary techniques to help locate misplaced objects." },
      { name: "Create a Sigil", page: "SIGIL", desc: "The creation of a personal symbol to represent a specific goal or focus." },
      { name: "Cosmic Mad Libs", page: "MAD_LIBS", desc: "A creative exercise to generate narratives based on your inputs." },
      { name: "Shared Insights", page: "SHARED_INSIGHTS", desc: "A collection of observations and insights." },
      { name: "Dream Journal", page: "DREAM_JOURNAL", desc: "A place to record and review your dreams for recurring themes." },
      { name: "Emotional Resonance", page: "MOOD", desc: "A tool to track and visualize your emotional state over time." },
      { name: "Daily Rituals", page: "RITUAL", desc: "Practical daily habits to maintain focus and clarity." },
      { name: "Color Oracle", page: "COLOR", desc: "An exploration of how different colors relate to your current state." },
      { name: "Tea Leaf Reading", page: "TEA_LEAF", desc: "An interpretive practice based on patterns found in tea leaves." },
      { name: "The Crystal Ball", page: "CRYSTAL", desc: "A focus exercise using a reflective surface to stimulate insight." },
      { name: "The Pendulum", page: "PENDULUM", desc: "A tool used to access subtle responses from the subconscious." },
      { name: "Synchronicity Decoder", page: "SYNCHRONICITY", desc: "Translate meaningful coincidences and repeating patterns into actionable wisdom." },
      { name: "The Oracle", page: "ORACLE", desc: "A linguistic mirror that selects a profound concept to reflect your current situation." },
      { name: "The Lenormand Spinner", page: "LENORMAND", desc: "A 3-reel slot machine for practical, punchy Lenormand readings." },
      { name: "The Master Syllabus", page: "MASTER_ARCHIVE", desc: "The central index of all available tools." },
    ]
  },
  {
    label: "The Big View",
    color: "var(--color-archive-ink)",
    symbol: "☉",
    items: [
      { name: "The Birth Map", page: "BIRTH_CHART", desc: "A map of the sky at the exact moment of your birth, revealing your unique cosmic blueprint." },
      { name: "Check Your Home's Vibe", page: "FLYING_STAR", desc: "A classical Feng Shui system that tracks the movement of energy (Qi) through time and space to harmonize a building's environment." },
      { name: "Natural Cycle Tracker", page: "BIORHYTHM", desc: "A theory that our lives are influenced by rhythmic biological cycles (physical, emotional, and intellectual) that start at birth." },
      { name: "Syllabus Explorer", page: "EXPLORER", desc: "A tool to browse and explore the various records within the Syllabus." },
    ]
  }
];

export const ALL_TOOLS = TOOL_CATEGORIES.flatMap(cat => cat.items);
