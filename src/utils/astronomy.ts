import { 
  Body, 
  GeoVector,
  Ecliptic,
  MoonPhase,
  SearchRiseSet,
  Observer,
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

export const getMoonPhase = (date: Date) => {
  const phase = MoonPhase(date);
  let name = "";
  if (phase < 45) name = "New Moon";
  else if (phase < 90) name = "Waxing Crescent";
  else if (phase < 135) name = "First Quarter";
  else if (phase < 180) name = "Waxing Gibbous";
  else if (phase < 225) name = "Full Moon";
  else if (phase < 270) name = "Waning Gibbous";
  else if (phase < 315) name = "Last Quarter";
  else name = "Waning Crescent";
  
  return { phase, name };
};

const CHALDEAN_ORDER = ['Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon'];
const DAY_RULERS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn']; // Sun=0 (Sunday)

export const getPlanetaryHour = (date: Date, lat: number, lng: number) => {
  const observer = new Observer(lat, lng, 0);
  const sunrise = SearchRiseSet(Body.Sun, observer, 1, date, 1);
  const sunset = SearchRiseSet(Body.Sun, observer, -1, date, 1);
  
  if (!sunrise || !sunset) return null;

  const dayLength = sunset.date.getTime() - sunrise.date.getTime();
  const hourLength = dayLength / 12;
  const isDay = date >= sunrise.date && date <= sunset.date;
  
  const dayOfWeek = date.getDay(); // 0-6
  const dayRuler = DAY_RULERS[dayOfWeek];
  const startIndex = CHALDEAN_ORDER.indexOf(dayRuler);
  
  let currentHour = 0;
  if (isDay) {
    currentHour = Math.floor((date.getTime() - sunrise.date.getTime()) / hourLength);
  } else {
    // Simplified night hour calculation
    const nightLength = 24 * 60 * 60 * 1000 - dayLength;
    const nightHourLength = nightLength / 12;
    const timeSinceSunset = date.getTime() - sunset.date.getTime();
    currentHour = Math.floor(timeSinceSunset / nightHourLength) + 12;
  }

  const ruler = CHALDEAN_ORDER[(startIndex + currentHour) % 7];
  return { ruler, hour: (currentHour % 12) + 1, isDay };
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
