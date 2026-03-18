import { Charm, House } from "../../../types"

export const ALL_CHARMS: Charm[] = [
  { name: 'Star', description: 'Guidance, hope, and celestial alignment.', rarity: 'common' },
  { name: 'Moon', description: 'Intuition, mystery, and the subconscious.', rarity: 'common' },
  { name: 'Sun', description: 'Vitality, clarity, and outward expression.', rarity: 'common' },
  { name: 'Heart', description: 'Emotional connections and matters of the soul.', rarity: 'common' },
  { name: 'Bolt', description: 'Sudden insights and transformative energy.', rarity: 'rare' },
  { name: 'Anchor', description: 'Stability, grounding, and security.', rarity: 'common' },
  { name: 'Cloud', description: 'Confusion, hidden truths, or fleeting thoughts.', rarity: 'common' },
  { name: 'Flame', description: 'Passion, creativity, and purification.', rarity: 'common' },
  { name: 'Water', description: 'Flow, healing, and emotional depth.', rarity: 'common' },
  { name: 'Wind', description: 'Communication, change, and mental agility.', rarity: 'common' },
  { name: 'Leaf', description: 'Growth, nature, and cyclical changes.', rarity: 'common' },
  { name: 'Crystal', description: 'Focus, manifestation, and spiritual clarity.', rarity: 'rare' },
];

export const HOUSES: House[] = [
  { number: 1, name: 'Self', keyword: 'Identity' },
  { number: 2, name: 'Value', keyword: 'Possessions' },
  { number: 3, name: 'Mind', keyword: 'Communication' },
  { number: 4, name: 'Home', keyword: 'Roots' },
  { number: 5, name: 'Joy', keyword: 'Creativity' },
  { number: 6, name: 'Health', keyword: 'Service' },
  { number: 7, name: 'Other', keyword: 'Partnership' },
  { number: 8, name: 'Change', keyword: 'Transformation' },
  { number: 9, name: 'Spirit', keyword: 'Philosophy' },
  { number: 10, name: 'World', keyword: 'Career' },
  { number: 11, name: 'Hope', keyword: 'Community' },
  { number: 12, name: 'Soul', keyword: 'Solitude' },
];
