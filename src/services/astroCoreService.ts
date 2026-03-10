import * as Astronomy from 'astronomy-engine';

export const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

export const getSign = (longitude: number) => {
  const index = Math.floor(longitude / 30) % 12;
  return ZODIAC_SIGNS[index];
};

const cache = {
  planets: new Map<string, any>(),
  cusps: new Map<string, any>()
};

export const getPlanetaryPositions = async (date: Date, lat: number, lng: number) => {
  // Cache key: Date rounded to minute + Lat/Lng rounded to 2 decimals
  const key = `${Math.floor(date.getTime() / 60000)}-${lat.toFixed(2)}-${lng.toFixed(2)}`;
  if (cache.planets.has(key)) return cache.planets.get(key);

  // Use a small delay to allow UI to breathe before heavy calculation
  await new Promise(resolve => setTimeout(resolve, 0));

  const bodies = [
    Astronomy.Body.Sun,
    Astronomy.Body.Moon,
    Astronomy.Body.Mercury,
    Astronomy.Body.Venus,
    Astronomy.Body.Mars,
    Astronomy.Body.Jupiter,
    Astronomy.Body.Saturn,
  ];

  const result = bodies.map(body => {
    const vector = Astronomy.GeoVector(body, date, true);
    const ecliptic = Astronomy.Ecliptic(vector);
    return {
      name: body as string,
      longitude: ecliptic.elon,
      sign: getSign(ecliptic.elon),
      latitude: ecliptic.elat,
      distance: vector.Length(),
    };
  });

  cache.planets.set(key, result);
  if (cache.planets.size > 50) cache.planets.delete(cache.planets.keys().next().value);
  
  return result;
};

export const getHouseCusps = async (date: Date, lat: number, lng: number) => {
  const key = `${Math.floor(date.getTime() / 60000)}-${lat.toFixed(2)}-${lng.toFixed(2)}`;
  if (cache.cusps.has(key)) return cache.cusps.get(key);

  await new Promise(resolve => setTimeout(resolve, 0));

  const observer = new Astronomy.Observer(lat, lng, 0);
  const siderealTime = Astronomy.SiderealTime(date);
  
  const ascendant = (siderealTime * 15 + lng + 90) % 360; 
  const result = Array.from({ length: 12 }, (_, i) => (ascendant + i * 30) % 360);

  cache.cusps.set(key, result);
  if (cache.cusps.size > 50) cache.cusps.delete(cache.cusps.keys().next().value);

  return result;
};

export const getRuler = (sign: string) => {
  const rulers: Record<string, string> = {
    "Aries": "Mars",
    "Taurus": "Venus",
    "Gemini": "Mercury",
    "Cancer": "Moon",
    "Leo": "Sun",
    "Virgo": "Mercury",
    "Libra": "Venus",
    "Scorpio": "Mars",
    "Sagittarius": "Jupiter",
    "Capricorn": "Saturn",
    "Aquarius": "Saturn",
    "Pisces": "Jupiter"
  };
  return rulers[sign];
};

export const createUTCDate = (dateStr: string, timeStr: string, offset: number) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  
  // Create date in UTC by adjusting for the offset
  // JS Date.UTC takes (year, monthIndex, day, hours, minutes)
  // We subtract the offset to get back to UTC
  const utcTimestamp = Date.UTC(year, month - 1, day, hours, minutes) - (offset * 60 * 60 * 1000);
  return new Date(utcTimestamp);
};
