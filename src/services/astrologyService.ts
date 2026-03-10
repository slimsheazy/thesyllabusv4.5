import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { DateTime } from "luxon";
import { extractJSON } from "../utils/jsonUtils";
import { calculateLifePath } from "../utils/numerologyUtils";
import { getAllPlanetPositions, findAspects } from "../utils/astronomy";
import { BirthChartAnalysis, HoraryAnswer, TransitNotification } from "../types";

export interface BirthData {
  date: string;
  time: string;
  location: string;
  timezone: string;
  lat?: number;
  lng?: number;
}

export const analyzeBirthChart = async (data: BirthData): Promise<BirthChartAnalysis> => {
  const dt = DateTime.fromISO(`${data.date}T${data.time}`, { zone: data.timezone });
  const providedOffset = dt.isValid ? dt.offset / 60 : "Unknown";
  const now = new Date().toISOString();
  
  // Calculate real positions using astronomy-engine for the prompt context
  const birthDate = dt.toJSDate();
  const realPositions = getAllPlanetPositions(birthDate);
  const positionsString = realPositions.map(p => `${p.name}: ${p.sign} ${p.degree.toFixed(2)}°`).join(', ');

  const prompt = `Analyze the birth chart for the following subject:
  Birth Date: ${data.date}
  Birth Time: ${data.time} (Local Time)
  Birth Location: ${data.location}
  User-Provided Timezone/Zone: ${data.timezone} (Calculated Offset: ${providedOffset})
  Current Reference Time: ${now}
  
  ASTRONOMICAL DATA (Calculated):
  ${positionsString}

  CRITICAL ACCURACY PROTOCOL:
  1. GEOLOCATION: Identify the exact coordinates (lat/lng) for "${data.location}".
  2. HISTORICAL CHRONOLOGY: Research the specific time zone and Daylight Saving Time (DST) rules for "${data.location}" on the date ${data.date}. 
  3. UTC SYNCHRONIZATION: Convert ${data.time} local time to absolute UTC.
  4. LUNAR PRECISION: Verify the Moon sign based on the calculated position (${realPositions.find(p => p.name === 'Moon')?.sign}).
  5. ASCENDANT CALCULATION: Determine the Rising Sign based on the precise local sidereal time.
  6. ZODIAC SYSTEM: Use the TROPICAL ZODIAC and PLACIDUS HOUSE SYSTEM.

  Return the analysis in this JSON format:
  {
    "sunSign": "string",
    "moonSign": "string",
    "risingSign": "string",
    "summary": "string (Markdown, analytical and grounded tone)",
    "traits": ["string", "string", ...],
    "chartData": {
      "ascendant": number (0-360),
      "planets": [
        { "name": "string", "degree": number (0-360), "sign": "string" }
      ]
    },
    "metadata": {
      "verifiedUtcOffset": number,
      "isDstActive": boolean,
      "calculationNotes": "Brief explanation of the UTC conversion used"
    }
  }`;

  const maxRetries = 2;
  let attempt = 0;

  const schema = {
    type: Type.OBJECT,
    properties: {
      sunSign: { type: Type.STRING },
      moonSign: { type: Type.STRING },
      risingSign: { type: Type.STRING },
      summary: { type: Type.STRING, description: "Markdown, analytical and grounded tone" },
      traits: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING } 
      },
      chartData: {
        type: Type.OBJECT,
        properties: {
          ascendant: { type: Type.NUMBER },
          planets: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                degree: { type: Type.NUMBER },
                sign: { type: Type.STRING }
              },
              required: ["name", "degree", "sign"]
            }
          }
        },
        required: ["ascendant", "planets"]
      },
      metadata: {
        type: Type.OBJECT,
        properties: {
          verifiedUtcOffset: { type: Type.NUMBER },
          isDstActive: { type: Type.BOOLEAN },
          calculationNotes: { type: Type.STRING }
        },
        required: ["verifiedUtcOffset", "isDstActive", "calculationNotes"]
      }
    },
    required: ["sunSign", "moonSign", "risingSign", "summary", "traits", "chartData", "metadata"]
  };

  while (attempt <= maxRetries) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Gemini request timed out")), 120000);
      });

      const response = await Promise.race([
        ai.models.generateContent({
          model: "gemini-3.1-pro-preview",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: schema
          }
        }),
        timeoutPromise
      ]) as GenerateContentResponse;

      if (!response || !response.text) {
        throw new Error("Empty response from Gemini");
      }

      const result = extractJSON<BirthChartAnalysis>(response.text);
      
      // Post-processing to ensure no "Unknown" values
      if (result.sunSign === "Unknown") result.sunSign = "Calculating...";
      if (result.moonSign === "Unknown") result.moonSign = "Calculating...";
      if (result.risingSign === "Unknown") result.risingSign = "Calculating...";
      
      // Ensure lifePath is correct using manual calculation
      result.lifePath = calculateLifePath(data.date);
      
      return result;
    } catch (error) {
      attempt++;
      console.error(`Gemini birth chart analysis attempt ${attempt} failed`, error);
      
      if (attempt > maxRetries) {
        // Fallback with manual life path even if Gemini fails
        return {
          sunSign: "Calculating...",
          moonSign: "Calculating...",
          risingSign: "Calculating...",
          lifePath: calculateLifePath(data.date),
          summary: "The archive is currently experiencing high resonance interference. Please try re-calibrating in a moment.",
          traits: [],
          chartData: {
            ascendant: 0,
            planets: []
          },
          metadata: {
            verifiedUtcOffset: 0,
            isDstActive: false,
            calculationNotes: "Fallback due to error"
          }
        };
      }
      // Wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }

  throw new Error("Unexpected end of analyzeBirthChart");
};

export const getHoraryAnswer = async (question: string, location: string): Promise<HoraryAnswer> => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const now = new Date();
  const offset = -now.getTimezoneOffset() / 60;
  const prompt = `As an expert horary astrologer, answer the following question: "${question}". 
  The question was asked at ${now.toISOString()} (Local time: ${now.toLocaleString()}, UTC offset: ${offset}) in ${location}. 
  Analyze the current planetary positions and provide a clear 'Yes' or 'No' answer with a detailed, practical explanation.
  Avoid mystical jargon. Focus on logical deductions and clear advice.
  Format the response as a JSON object with fields: answer (string), explanation (string), and keyPlanets (array of objects with name and role).`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json"
    }
  });

  return extractJSON<HoraryAnswer>(response.text);
};

export const getTransitNotifications = async (data: BirthData): Promise<TransitNotification[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const dt = DateTime.fromISO(`${data.date}T${data.time}`, { zone: data.timezone });
  const birthDate = dt.toJSDate();
  const now = new Date();
  
  // 1. Calculate Natal Positions
  const natalPositions = getAllPlanetPositions(birthDate);
  
  // 2. Calculate Current Positions
  const currentPositions = getAllPlanetPositions(now);
  
  // 3. Find Aspects
  const aspects = findAspects(currentPositions, natalPositions);
  
  // 4. Filter for significant aspects (low orb)
  const significantAspects = aspects
    .filter(a => a.orb < 3) // Only aspects within 3 degrees
    .sort((a, b) => a.orb - b.orb)
    .slice(0, 5);

  if (significantAspects.length === 0) {
    // If no exact aspects, just look for general transits (planets in signs)
    const currentSigns = currentPositions.map(p => `${p.name} in ${p.sign}`).join(', ');
    const prompt = `As an expert analyst, identify significant planetary transits for someone with the following birth data:
    Born: ${data.date} at ${data.time} in ${data.location}.
    Current Time: ${now.toISOString()}.
    Current Planetary Positions: ${currentSigns}.
    
    Provide 1-2 short, practical, and grounded notifications (max 120 characters each).
    MANDATORY: Start each message with the specific astrological event.
    Format the response as a JSON object with a field "notifications" which is an array of objects with "message" (string) and "type" (one of "info", "warning", "success").`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return extractJSON<{ notifications: TransitNotification[] }>(response.text).notifications || [];
  }

  // 5. Interpret exact aspects
  const aspectsString = significantAspects.map(a => `Transit ${a.planet1} ${a.type} Natal ${a.planet2} (Orb: ${a.orb.toFixed(2)}°)`).join('\n');
  
  const prompt = `As an expert analyst, interpret these EXACT planetary aspects occurring right now for a subject:
  Subject Birth: ${data.date} at ${data.time} in ${data.location}.
  Current Time: ${now.toISOString()}.
  
  EXACT ASPECTS (Calculated):
  ${aspectsString}
  
  Task:
  Provide 1-3 short, practical, and grounded notifications (max 120 characters each) based on these specific aspects.
  MANDATORY: Start each message with the specific aspect (e.g., "Transit Mars Conjunction Natal Sun: ").
  Focus on clear, usable observations. Avoid mystical jargon.
  
  Format the response as a JSON object with a field "notifications" which is an array of objects with "message" (string) and "type" (one of "info", "warning", "success").`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json"
    }
  });

  try {
    const json = extractJSON<{ notifications: TransitNotification[] }>(response.text);
    return json.notifications || [];
  } catch (e) {
    console.error("Failed to parse transit notifications", e);
    return [];
  }
};
