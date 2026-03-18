import { 
  Star, 
  Moon, 
  Sun, 
  Heart, 
  Zap, 
  Anchor, 
  Cloud, 
  Flame, 
  Droplets, 
  Wind, 
  Leaf, 
  Gem 
} from 'lucide-react';

export const getCharmIcon = (name: string) => {
  const icons: Record<string, any> = {
    'Star': Star,
    'Moon': Moon,
    'Sun': Sun,
    'Heart': Heart,
    'Bolt': Zap,
    'Anchor': Anchor,
    'Cloud': Cloud,
    'Flame': Flame,
    'Water': Droplets,
    'Wind': Wind,
    'Leaf': Leaf,
    'Crystal': Gem,
  };

  return icons[name] || Star;
};
