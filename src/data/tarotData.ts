export interface TarotCard {
  name: string;
  arcana: 'major' | 'minor';
  suit?: 'cups' | 'pentacles' | 'swords' | 'wands';
  value: string;
  uprightMeaning: string;
  reversedMeaning: string;
  image: string;
}

export const TAROT_CARDS: TarotCard[] = [
  // Major Arcana
  { name: "The Fool", arcana: "major", value: "0", uprightMeaning: "New beginnings, optimism, trust in life.", reversedMeaning: "Recklessness, risk-taking, inconsideration.", image: "https://picsum.photos/seed/tarot0/300/500" },
  { name: "The Magician", arcana: "major", value: "1", uprightMeaning: "Action, power, manifestation.", reversedMeaning: "Manipulation, poor planning, untapped talents.", image: "https://picsum.photos/seed/tarot1/300/500" },
  { name: "The High Priestess", arcana: "major", value: "2", uprightMeaning: "Inaction, intuition, mystery.", reversedMeaning: "Secrets, disconnected from intuition, withdrawal.", image: "https://picsum.photos/seed/tarot2/300/500" },
  { name: "The Empress", arcana: "major", value: "3", uprightMeaning: "Abundance, nurturing, fertility.", reversedMeaning: "Dependence, creative block, smothering.", image: "https://picsum.photos/seed/tarot3/300/500" },
  { name: "The Emperor", arcana: "major", value: "4", uprightMeaning: "Structure, authority, regulation.", reversedMeaning: "Tyranny, rigidity, coldness.", image: "https://picsum.photos/seed/tarot4/300/500" },
  { name: "The Hierophant", arcana: "major", value: "5", uprightMeaning: "Tradition, conformity, morality.", reversedMeaning: "Rebellion, subversiveness, new approaches.", image: "https://picsum.photos/seed/tarot5/300/500" },
  { name: "The Lovers", arcana: "major", value: "6", uprightMeaning: "Partnership, union, choice.", reversedMeaning: "Disharmony, imbalance, misalignment.", image: "https://picsum.photos/seed/tarot6/300/500" },
  { name: "The Chariot", arcana: "major", value: "7", uprightMeaning: "Direction, control, willpower.", reversedMeaning: "Lack of control, aggression, self-discipline.", image: "https://picsum.photos/seed/tarot7/300/500" },
  { name: "Strength", arcana: "major", value: "8", uprightMeaning: "Inner strength, bravery, compassion.", reversedMeaning: "Self-doubt, weakness, insecurity.", image: "https://picsum.photos/seed/tarot8/300/500" },
  { name: "The Hermit", arcana: "major", value: "9", uprightMeaning: "Contemplation, search for truth, inner guidance.", reversedMeaning: "Loneliness, isolation, lost your way.", image: "https://picsum.photos/seed/tarot9/300/500" },
  { name: "Wheel of Fortune", arcana: "major", value: "10", uprightMeaning: "Change, cycles, inevitable fate.", reversedMeaning: "Bad luck, resistance to change, breaking cycles.", image: "https://picsum.photos/seed/tarot10/300/500" },
  { name: "Justice", arcana: "major", value: "11", uprightMeaning: "Cause and effect, clarity, truth.", reversedMeaning: "Dishonesty, unaccountability, unfairness.", image: "https://picsum.photos/seed/tarot11/300/500" },
  { name: "The Hanged Man", arcana: "major", value: "12", uprightMeaning: "Sacrifice, release, martyrdom.", reversedMeaning: "Stalling, needless sacrifice, fear of change.", image: "https://picsum.photos/seed/tarot12/300/500" },
  { name: "Death", arcana: "major", value: "13", uprightMeaning: "End of cycle, beginnings, change.", reversedMeaning: "Resistance to change, unable to move on.", image: "https://picsum.photos/seed/tarot13/300/500" },
  { name: "Temperance", arcana: "major", value: "14", uprightMeaning: "Middle path, patience, finding meaning.", reversedMeaning: "Imbalance, excess, lack of long-term vision.", image: "https://picsum.photos/seed/tarot14/300/500" },
  { name: "The Devil", arcana: "major", value: "15", uprightMeaning: "Addiction, materialism, playfulness.", reversedMeaning: "Detachment, breaking free, reclaiming power.", image: "https://picsum.photos/seed/tarot15/300/500" },
  { name: "The Tower", arcana: "major", value: "16", uprightMeaning: "Sudden change, release, revelation.", reversedMeaning: "Avoiding disaster, fear of change, delaying the inevitable.", image: "https://picsum.photos/seed/tarot16/300/500" },
  { name: "The Star", arcana: "major", value: "17", uprightMeaning: "Hope, serenity, inspiration.", reversedMeaning: "Lack of faith, despair, discouragement.", image: "https://picsum.photos/seed/tarot17/300/500" },
  { name: "The Moon", arcana: "major", value: "18", uprightMeaning: "Illusion, fear, anxiety.", reversedMeaning: "Release of fear, repressed emotion, confusion.", image: "https://picsum.photos/seed/tarot18/300/500" },
  { name: "The Sun", arcana: "major", value: "19", uprightMeaning: "Positivity, fun, warmth.", reversedMeaning: "Inner child, feeling down, overly optimistic.", image: "https://picsum.photos/seed/tarot19/300/500" },
  { name: "Judgement", arcana: "major", value: "20", uprightMeaning: "Reflection, reckoning, awakening.", reversedMeaning: "Self-doubt, refusal of self-examination, haste.", image: "https://picsum.photos/seed/tarot20/300/500" },
  { name: "The World", arcana: "major", value: "21", uprightMeaning: "Completion, integration, accomplishment.", reversedMeaning: "Lack of completion, lack of closure.", image: "https://picsum.photos/seed/tarot21/300/500" },

  // Wands
  { name: "Ace of Wands", arcana: "minor", suit: "wands", value: "1", uprightMeaning: "Inspiration, creative spark, new initiative.", reversedMeaning: "Lack of direction, distractions, delays.", image: "https://picsum.photos/seed/tarot-w1/300/500" },
  { name: "Two of Wands", arcana: "minor", suit: "wands", value: "2", uprightMeaning: "Planning, making decisions, discovery.", reversedMeaning: "Fear of unknown, lack of planning.", image: "https://picsum.photos/seed/tarot-w2/300/500" },
  { name: "Three of Wands", arcana: "minor", suit: "wands", value: "3", uprightMeaning: "Expansion, foresight, overseas opportunities.", reversedMeaning: "Playing it safe, lack of foresight, delays.", image: "https://picsum.photos/seed/tarot-w3/300/500" },
  { name: "Four of Wands", arcana: "minor", suit: "wands", value: "4", uprightMeaning: "Celebration, harmony, homecoming.", reversedMeaning: "Lack of support, instability, transition.", image: "https://picsum.photos/seed/tarot-w4/300/500" },
  { name: "Five of Wands", arcana: "minor", suit: "wands", value: "5", uprightMeaning: "Competition, conflict, tension.", reversedMeaning: "Avoiding conflict, diversity, agreement.", image: "https://picsum.photos/seed/tarot-w5/300/500" },
  { name: "Six of Wands", arcana: "minor", suit: "wands", value: "6", uprightMeaning: "Victory, success, public recognition.", reversedMeaning: "Self-doubt, fall from grace, lack of recognition.", image: "https://picsum.photos/seed/tarot-w6/300/500" },
  { name: "Seven of Wands", arcana: "minor", suit: "wands", value: "7", uprightMeaning: "Defensiveness, perseverance, maintaining control.", reversedMeaning: "Giving up, overwhelmed, over-protective.", image: "https://picsum.photos/seed/tarot-w7/300/500" },
  { name: "Eight of Wands", arcana: "minor", suit: "wands", value: "8", uprightMeaning: "Speed, action, air travel.", reversedMeaning: "Delays, frustration, resisting change.", image: "https://picsum.photos/seed/tarot-w8/300/500" },
  { name: "Nine of Wands", arcana: "minor", suit: "wands", value: "9", uprightMeaning: "Resilience, grit, last stand.", reversedMeaning: "Exhaustion, fatigue, defensive.", image: "https://picsum.photos/seed/tarot-w9/300/500" },
  { name: "Ten of Wands", arcana: "minor", suit: "wands", value: "10", uprightMeaning: "Burden, responsibility, hard work.", reversedMeaning: "Doing it all, carrying too much, collapse.", image: "https://picsum.photos/seed/tarot-w10/300/500" },
  { name: "Page of Wands", arcana: "minor", suit: "wands", value: "11", uprightMeaning: "Exploration, excitement, freedom.", reversedMeaning: "Lack of direction, procrastination, setbacks.", image: "https://picsum.photos/seed/tarot-wp/300/500" },
  { name: "Knight of Wands", arcana: "minor", suit: "wands", value: "12", uprightMeaning: "Action, adventure, fearlessness.", reversedMeaning: "Anger, impulsiveness, recklessness.", image: "https://picsum.photos/seed/tarot-wk/300/500" },
  { name: "Queen of Wands", arcana: "minor", suit: "wands", value: "13", uprightMeaning: "Confidence, independence, social butterfly.", reversedMeaning: "Self-centeredness, jealousy, insecurity.", image: "https://picsum.photos/seed/tarot-wq/300/500" },
  { name: "King of Wands", arcana: "minor", suit: "wands", value: "14", uprightMeaning: "Natural-born leader, vision, entrepreneur.", reversedMeaning: "Impulsiveness, haste, ruthlessness.", image: "https://picsum.photos/seed/tarot-wkg/300/500" },

  // Cups
  { name: "Ace of Cups", arcana: "minor", suit: "cups", value: "1", uprightMeaning: "Love, new feelings, spirituality.", reversedMeaning: "Self-love, intuition, repressed emotions.", image: "https://picsum.photos/seed/tarot-c1/300/500" },
  { name: "Two of Cups", arcana: "minor", suit: "cups", value: "2", uprightMeaning: "Unified love, partnership, attraction.", reversedMeaning: "Self-love, disharmony, distrust.", image: "https://picsum.photos/seed/tarot-c2/300/500" },
  { name: "Three of Cups", arcana: "minor", suit: "cups", value: "3", uprightMeaning: "Celebration, friendship, creativity.", reversedMeaning: "Independence, alone time, gossip.", image: "https://picsum.photos/seed/tarot-c3/300/500" },
  { name: "Four of Cups", arcana: "minor", suit: "cups", value: "4", uprightMeaning: "Meditation, contemplation, apathy.", reversedMeaning: "Retreat, withdrawal, checking in.", image: "https://picsum.photos/seed/tarot-c4/300/500" },
  { name: "Five of Cups", arcana: "minor", suit: "cups", value: "5", uprightMeaning: "Loss, regret, disappointment.", reversedMeaning: "Acceptance, moving on, finding peace.", image: "https://picsum.photos/seed/tarot-c5/300/500" },
  { name: "Six of Cups", arcana: "minor", suit: "cups", value: "6", uprightMeaning: "Revisiting the past, childhood memories, innocence.", reversedMeaning: "Moving forward, leaving home, independence.", image: "https://picsum.photos/seed/tarot-c6/300/500" },
  { name: "Seven of Cups", arcana: "minor", suit: "cups", value: "7", uprightMeaning: "Opportunities, choices, wishful thinking.", reversedMeaning: "Alignment, personal values, overwhelmed by choices.", image: "https://picsum.photos/seed/tarot-c7/300/500" },
  { name: "Eight of Cups", arcana: "minor", suit: "cups", value: "8", uprightMeaning: "Disappointment, abandonment, withdrawal.", reversedMeaning: "Trying one more time, indecision, aimless drifting.", image: "https://picsum.photos/seed/tarot-c8/300/500" },
  { name: "Nine of Cups", arcana: "minor", suit: "cups", value: "9", uprightMeaning: "Contentment, satisfaction, gratitude.", reversedMeaning: "Inner happiness, materialism, dissatisfaction.", image: "https://picsum.photos/seed/tarot-c9/300/500" },
  { name: "Ten of Cups", arcana: "minor", suit: "cups", value: "10", uprightMeaning: "Divine love, blissful relationships, harmony.", reversedMeaning: "Disconnected, struggling relationships, disharmony.", image: "https://picsum.photos/seed/tarot-c10/300/500" },
  { name: "Page of Cups", arcana: "minor", suit: "cups", value: "11", uprightMeaning: "Creative opportunities, intuitive messages, curiosity.", reversedMeaning: "New ideas, doubting intuition, creative blocks.", image: "https://picsum.photos/seed/tarot-cp/300/500" },
  { name: "Knight of Cups", arcana: "minor", suit: "cups", value: "12", uprightMeaning: "Creativity, romance, charm, imagination.", reversedMeaning: "Overactive imagination, unrealistic, moody.", image: "https://picsum.photos/seed/tarot-ck/300/500" },
  { name: "Queen of Cups", arcana: "minor", suit: "cups", value: "13", uprightMeaning: "Compassionate, caring, emotionally stable.", reversedMeaning: "Inner feelings, self-care, co-dependency.", image: "https://picsum.photos/seed/tarot-cq/300/500" },
  { name: "King of Cups", arcana: "minor", suit: "cups", value: "14", uprightMeaning: "Emotionally balanced, compassionate, diplomatic.", reversedMeaning: "Self-compassion, inner feelings, moodiness.", image: "https://picsum.photos/seed/tarot-ckg/300/500" },

  // Swords
  { name: "Ace of Swords", arcana: "minor", suit: "swords", value: "1", uprightMeaning: "Breakthrough, clarity, sharp mind.", reversedMeaning: "Confusion, chaos, lack of clarity.", image: "https://picsum.photos/seed/tarot-s1/300/500" },
  { name: "Two of Swords", arcana: "minor", suit: "swords", value: "2", uprightMeaning: "Difficult choices, indecision, stalemate.", reversedMeaning: "Indecision, confusion, information overload.", image: "https://picsum.photos/seed/tarot-s2/300/500" },
  { name: "Three of Swords", arcana: "minor", suit: "swords", value: "3", uprightMeaning: "Heartbreak, emotional pain, sorrow.", reversedMeaning: "Negative self-talk, releasing pain, optimism.", image: "https://picsum.photos/seed/tarot-s3/300/500" },
  { name: "Four of Swords", arcana: "minor", suit: "swords", value: "4", uprightMeaning: "Rest, relaxation, meditation.", reversedMeaning: "Exhaustion, burnout, deep rest.", image: "https://picsum.photos/seed/tarot-s4/300/500" },
  { name: "Five of Swords", arcana: "minor", suit: "swords", value: "5", uprightMeaning: "Conflict, disagreement, competition.", reversedMeaning: "Reconciliation, making amends, past resentment.", image: "https://picsum.photos/seed/tarot-s5/300/500" },
  { name: "Six of Swords", arcana: "minor", suit: "swords", value: "6", uprightMeaning: "Transition, change, rite of passage.", reversedMeaning: "Personal transition, resistance to change, unfinished business.", image: "https://picsum.photos/seed/tarot-s6/300/500" },
  { name: "Seven of Swords", arcana: "minor", suit: "swords", value: "7", uprightMeaning: "Betrayal, deception, getting away with something.", reversedMeaning: "Imposter syndrome, self-deceit, keeping secrets.", image: "https://picsum.photos/seed/tarot-s7/300/500" },
  { name: "Eight of Swords", arcana: "minor", suit: "swords", value: "8", uprightMeaning: "Negative thoughts, self-imposed restriction, imprisonment.", reversedMeaning: "Self-acceptance, new perspective, freedom.", image: "https://picsum.photos/seed/tarot-s8/300/500" },
  { name: "Nine of Swords", arcana: "minor", suit: "swords", value: "9", uprightMeaning: "Anxiety, worry, fear, depression.", reversedMeaning: "Inner turmoil, deep-seated fears, secrets.", image: "https://picsum.photos/seed/tarot-s9/300/500" },
  { name: "Ten of Swords", arcana: "minor", suit: "swords", value: "10", uprightMeaning: "Painful endings, deep wounds, betrayal.", reversedMeaning: "Recovery, regeneration, resisting an inevitable end.", image: "https://picsum.photos/seed/tarot-s10/300/500" },
  { name: "Page of Swords", arcana: "minor", suit: "swords", value: "11", uprightMeaning: "New ideas, curiosity, thirst for knowledge.", reversedMeaning: "Self-expression, all talk and no action, haphazard action.", image: "https://picsum.photos/seed/tarot-sp/300/500" },
  { name: "Knight of Swords", arcana: "minor", suit: "swords", value: "12", uprightMeaning: "Ambitious, action-oriented, driven to succeed.", reversedMeaning: "Restless, unfocused, impulsive.", image: "https://picsum.photos/seed/tarot-sk/300/500" },
  { name: "Queen of Swords", arcana: "minor", suit: "swords", value: "13", uprightMeaning: "Independent, unbiased judgement, clear boundaries.", reversedMeaning: "Overly-emotional, cold-hearted, cruel.", image: "https://picsum.photos/seed/tarot-sq/300/500" },
  { name: "King of Swords", arcana: "minor", suit: "swords", value: "14", uprightMeaning: "Mental clarity, intellectual power, authority.", reversedMeaning: "Quiet power, inner truth, misuse of power.", image: "https://picsum.photos/seed/tarot-skg/300/500" },

  // Pentacles
  { name: "Ace of Pentacles", arcana: "minor", suit: "pentacles", value: "1", uprightMeaning: "A new financial or career opportunity, manifestation, abundance.", reversedMeaning: "Lost opportunity, lack of planning and foresight.", image: "https://picsum.photos/seed/tarot-p1/300/500" },
  { name: "Two of Pentacles", arcana: "minor", suit: "pentacles", value: "2", uprightMeaning: "Multiple priorities, time management, prioritization.", reversedMeaning: "Over-committed, disorganized, reprioritizing.", image: "https://picsum.photos/seed/tarot-p2/300/500" },
  { name: "Three of Pentacles", arcana: "minor", suit: "pentacles", value: "3", uprightMeaning: "Teamwork, collaboration, learning, implementation.", reversedMeaning: "Disharmony, misalignment, working alone.", image: "https://picsum.photos/seed/tarot-p3/300/500" },
  { name: "Four of Pentacles", arcana: "minor", suit: "pentacles", value: "4", uprightMeaning: "Saving money, security, conservatism, scarcity mindset.", reversedMeaning: "Over-spending, greed, self-protection.", image: "https://picsum.photos/seed/tarot-p4/300/500" },
  { name: "Five of Pentacles", arcana: "minor", suit: "pentacles", value: "5", uprightMeaning: "Financial loss, poverty, isolation, worry.", reversedMeaning: "Recovery from financial loss, spiritual poverty.", image: "https://picsum.photos/seed/tarot-p5/300/500" },
  { name: "Six of Pentacles", arcana: "minor", suit: "pentacles", value: "6", uprightMeaning: "Giving, receiving, sharing wealth, generosity.", reversedMeaning: "Self-care, unpaid debts, one-sidedness.", image: "https://picsum.photos/seed/tarot-p6/300/500" },
  { name: "Seven of Pentacles", arcana: "minor", suit: "pentacles", value: "7", uprightMeaning: "Long-term view, sustainable results, perseverance, investment.", reversedMeaning: "Lack of long-term vision, limited success or reward.", image: "https://picsum.photos/seed/tarot-p7/300/500" },
  { name: "Eight of Pentacles", arcana: "minor", suit: "pentacles", value: "8", uprightMeaning: "Apprenticeship, repetitive tasks, mastery, skill development.", reversedMeaning: "Self-perfection, perfectionism, misdirected activity.", image: "https://picsum.photos/seed/tarot-p8/300/500" },
  { name: "Nine of Pentacles", arcana: "minor", suit: "pentacles", value: "9", uprightMeaning: "Abundance, luxury, self-sufficiency, financial independence.", reversedMeaning: "Self-worth, over-investment in work, hustling.", image: "https://picsum.photos/seed/tarot-p9/300/500" },
  { name: "Ten of Pentacles", arcana: "minor", suit: "pentacles", value: "10", uprightMeaning: "Wealth, financial security, family, long-term success.", reversedMeaning: "The dark side of wealth, financial failure or loss.", image: "https://picsum.photos/seed/tarot-p10/300/500" },
  { name: "Page of Pentacles", arcana: "minor", suit: "pentacles", value: "11", uprightMeaning: "Manifestation, financial opportunity, skill development.", reversedMeaning: "Lack of progress, procrastination, learn from failure.", image: "https://picsum.photos/seed/tarot-pp/300/500" },
  { name: "Knight of Pentacles", arcana: "minor", suit: "pentacles", value: "12", uprightMeaning: "Hard work, productivity, routine, conservatism.", reversedMeaning: "Self-discipline, boredom, feeling stuck, perfectionism.", image: "https://picsum.photos/seed/tarot-pk/300/500" },
  { name: "Queen of Pentacles", arcana: "minor", suit: "pentacles", value: "13", uprightMeaning: "Nurturing, practical, providing financially, a working parent.", reversedMeaning: "Financial independence, self-care, work-life balance.", image: "https://picsum.photos/seed/tarot-pq/300/500" },
  { name: "King of Pentacles", arcana: "minor", suit: "pentacles", value: "14", uprightMeaning: "Wealth, business, leadership, security, discipline, abundance.", reversedMeaning: "Financially inept, obsessed with wealth and status, stubborn.", image: "https://picsum.photos/seed/tarot-pkg/300/500" },
];
