import { 
  Body, 
  GeoVector,
  Ecliptic,
} from 'astronomy-engine';
import { PlanetPosition, Aspect } from '../types';

export const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

export const getSign = (longitude: number) => {
  const normalized = ((longitude % 360) + 360) % 360;
  const index = Math.floor(normalized / 30);
  return ZODIAC_SIGNS[index];
};

export const getPlanetPosition = (body: Body, date: Date): PlanetPosition => {
  const vector = GeoVector(body, date, true);
  const ecliptic = Ecliptic(vector);
  const longitude = ecliptic.elon;

  return {
    name: body.toString(),
    longitude,
    sign: getSign(longitude),
    degree: longitude % 30
  };
};

export const BODIES = [
  Body.Sun, Body.Moon, Body.Mercury, Body.Venus, Body.Mars, 
  Body.Jupiter, Body.Saturn, Body.Uranus, Body.Neptune, Body.Pluto
];

export const getAllPlanetPositions = (date: Date): PlanetPosition[] => {
  return BODIES.map(body => getPlanetPosition(body, date));
};

const ASPECTS_CONFIG = [
  { name: 'Conjunction', angle: 0, orb: 8 },
  { name: 'Sextile', angle: 60, orb: 6 },
  { name: 'Square', angle: 90, orb: 8 },
  { name: 'Trine', angle: 120, orb: 8 },
  { name: 'Opposition', angle: 180, orb: 8 },
] as const;

export const findAspects = (planets1: PlanetPosition[], planets2: PlanetPosition[]): Aspect[] => {
  const foundAspects: Aspect[] = [];

  for (const p1 of planets1) {
    for (const p2 of planets2) {
      const diff = Math.abs(p1.longitude - p2.longitude);
      const angle = Math.min(diff, 360 - diff);

      for (const aspect of ASPECTS_CONFIG) {
        const orb = Math.abs(angle - aspect.angle);
        if (orb <= aspect.orb) {
          foundAspects.push({
            planet1: p1.name,
            planet2: p2.name,
            type: aspect.name as any, // Cast to Aspect['type']
            angle: aspect.angle,
            orb
          });
        }
      }
    }
  }

  return foundAspects;
};
