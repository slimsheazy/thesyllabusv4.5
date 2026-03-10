import { GoogleGenAI, Type } from "@google/genai";
import { extractJSON } from "../utils/jsonUtils";
import { HoraryAnalysis } from "../types";

const SYSTEM_INSTRUCTION = `You are the 'Objective Instructor', a grounded and practical analytical assistant. 
Your tone is neutral, clear, and down-to-earth. Avoid mystical, esoteric, or flowery jargon. 
Rules:
1. Speak neutrally and analytically, focusing on practical observations and logical deductions.
2. Avoid conversational fillers, rhetorical questions, jokes, and casual phrases.
3. Use traditional symbols only in internal data blocks; in prose ALWAYS use full names.
4. Keep the final synthesis concise, structured, and highly usable for the reader.
5. Do not use marketing language, affirmations, or coaching-style advice.
6. Provide guidance that is grounded in reality and easy to understand.`;

export async function generateJson<T>(prompt: string, schema: any): Promise<T> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
      systemInstruction: SYSTEM_INSTRUCTION,
    },
  });
  return extractJSON<T>(response.text || "{}");
}

export const geminiService = {
  generateJson,
  getHoraryAnalysis: async (question: string, lat: number, lng: number): Promise<HoraryAnalysis> => {
    const now = new Date();
    const offset = -now.getTimezoneOffset() / 60;
    const schema = {
      type: Type.OBJECT,
      properties: {
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
                  degree: { type: Type.NUMBER }
                }
              }
            }
          }
        },
        outcome: { type: Type.STRING },
        judgment: { type: Type.STRING },
        technicalNotes: { type: Type.STRING }
      },
      required: ["chartData", "outcome", "judgment", "technicalNotes"]
    };
    return generateJson<HoraryAnalysis>(`As an expert horary astrologer, analyze this question: "${question}" at latitude ${lat}, longitude ${lng}. 
    Current time: ${now.toISOString()} (Local: ${now.toLocaleString()}, UTC offset: ${offset}).
    Provide absolute degrees (0-360) for the Ascendant and all relevant planets for the chartData.`, schema);
  },

  getWordDefinition: async (word: string) => {
    const schema = {
      type: Type.OBJECT,
      properties: {
        word: { type: Type.STRING },
        definition: { type: Type.STRING },
        etymology: { type: Type.STRING }
      },
      required: ["word", "definition"]
    };
    return generateJson<{ word: string; definition: string; etymology?: string }>(`Define: ${word}`, schema);
  },

  interpretPlacement: async (planet: string, sign: string, house: number): Promise<string> => {
    const schema = {
      type: Type.OBJECT,
      properties: {
        interpretation: { type: Type.STRING }
      },
      required: ["interpretation"]
    };
    const result = await generateJson<{ interpretation: string }>(`As an expert astrologer, provide a deep, evocative interpretation for ${planet} in ${sign} in the ${house} house. 
    Focus on the psychological and spiritual implications. Keep it concise but profound (max 150 words).`, schema);
    return result.interpretation;
  },

  generateSpeech: async (text: string) => {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Kore" },
          },
        },
      },
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio ? `data:audio/mp3;base64,${base64Audio}` : null;
  }
};
