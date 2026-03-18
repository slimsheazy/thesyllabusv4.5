import React from 'react';

export const PlanetGlyph = ({ name, className }: { name: string, className?: string }) => {
  // SVG paths for planetary glyphs
  const glyphs: Record<string, string> = {
    'Sun': 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 4a6 6 0 1 1 0 12 6 6 0 0 1 0-12z',
    'Moon': 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 2a8 8 0 1 1 0 16 8 8 0 0 1 0-16z',
    'Mercury': 'M12 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0 8v8m-4-4h8M12 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
    'Venus': 'M12 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 10v8m-4-2h8',
    'Mars': 'M12 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 10l5-5m-5 5l-5-5',
    'Jupiter': 'M12 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 10v8m-4-2h8',
    'Saturn': 'M12 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 10v8m-4-2h8',
    'Uranus': 'M12 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 10v8m-4-2h8',
    'Neptune': 'M12 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 10v8m-4-2h8',
    'Pluto': 'M12 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 10v8m-4-2h8',
  };

  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d={glyphs[name] || glyphs['Sun']} />
    </svg>
  );
};

export const ZodiacGlyph = ({ name, className }: { name: string, className?: string }) => {
  // SVG paths for zodiac glyphs
  const glyphs: Record<string, string> = {
    'Aries': 'M12 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 10v8m-4-2h8',
    'Taurus': 'M12 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 10v8m-4-2h8',
    'Gemini': 'M12 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 10v8m-4-2h8',
    'Cancer': 'M12 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 10v8m-4-2h8',
    'Leo': 'M12 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 10v8m-4-2h8',
    'Virgo': 'M12 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 10v8m-4-2h8',
    'Libra': 'M12 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 10v8m-4-2h8',
    'Scorpio': 'M12 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 10v8m-4-2h8',
    'Sagittarius': 'M12 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 10v8m-4-2h8',
    'Capricorn': 'M12 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 10v8m-4-2h8',
    'Aquarius': 'M12 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 10v8m-4-2h8',
    'Pisces': 'M12 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 10v8m-4-2h8',
  };

  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d={glyphs[name] || glyphs['Aries']} />
    </svg>
  );
};
