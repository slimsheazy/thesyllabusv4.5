import { GoogleGenAI, Type, GenerateContentParameters } from "@google/genai";
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

let aiInstance: GoogleGenAI | null = null;

export function getGeminiAI() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in the environment.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export async function generateContent(params: GenerateContentParameters) {
  const ai = getGeminiAI();
  return ai.models.generateContent(params);
}

export async function generateText(prompt: string, model: string = "gemini-3-flash-preview", systemInstruction: string = SYSTEM_INSTRUCTION): Promise<string> {
  const response = await generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction,
    },
  });
  return response.text || "";
}

export async function generateJson<T>(prompt: string, schema: any, model: string = "gemini-3-flash-preview", systemInstruction: string = SYSTEM_INSTRUCTION): Promise<T> {
  const response = await generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
      systemInstruction,
    },
  });
  return extractJSON<T>(response.text || "{}");
}

export const geminiService = {
  generateContent,
  generateText,
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
    const response = await generateContent({
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
  },
  decodeSigil: async (intent: string, userIdentity?: string): Promise<string> => {
    const prompt = `You are a master of practical sigil magic. 
    A seeker named ${userIdentity || 'a mysterious soul'} has created a geometric sigil for the intent: "${intent}".
    
    Provide a clear "decoding" of the sigil's symbolic structure and a set of practical, grounded instructions for activation.
    The instructions MUST be "normal" and easy to perform, such as:
    - Focused meditation for 5 minutes while holding the image.
    - Carrying the sigil in a wallet or pocket.
    - Placing the sigil under a pillow or on a workspace.
    - Drawing the sigil slowly on a piece of paper.
    
    Avoid any "crazy", extreme, or impractical suggestions.
    Use the "Archive/Syllabus" aesthetic: serif, italic, professional and grounded.
    Keep it around 70 words.`;

    return generateText(prompt);
  },
  generateProphecy: async (inputs: { adjective: string; celestialBody: string; verb: string; emotion: string; object: string }, userIdentity?: string): Promise<string> => {
    const prompt = `You are a cosmic storyteller. 
    Create a short, poetic, and profound prophecy for ${userIdentity || 'a seeker'} using the following words as inspiration:
    - Adjective: ${inputs.adjective}
    - Celestial Body: ${inputs.celestialBody}
    - Verb: ${inputs.verb}
    - Emotion: ${inputs.emotion}
    - Object: ${inputs.object}
    
    The prophecy should feel like it was found in an ancient archive. 
    Use the "Archive/Syllabus" aesthetic: serif, italic, slightly cryptic but deeply resonant.
    Keep it between 50 and 80 words.`;

    return generateText(prompt);
  },
  queryAkashicRecords: async (query: string, profile: any, initials: string): Promise<string> => {
    const prompt = `You are a helpful, chill guide to the Akashic Records. A seeker is asking a question.
    
    Subject Identity:
    - Name: ${profile.name} (Initials: ${initials})
    - Birth: ${profile.birthday}
    - Location: ${profile.location.name}
    - Inquiry: "${query}"
    
    Task:
    Check the "cosmic files" for them. Give them a straight-up, accessible insight about their question.
    
    Tone:
    Chill, conversational, and grounded. Avoid overly repetitive mystical jargon. Talk like a wise friend who happens to have access to the universe's library.
    
    Requirements:
    1. Keep it personal. Mention their initials "${initials}".
    2. Include a small, oddly specific detail related to their birth date (${profile.birthday}) or location (${profile.location.name}) to show you're really looking at their file.
    3. Be practical. What does this mean for them right now?
    
    Format:
    Just the insight. No "Record Opened" headers or repetitive intros.
    Keep it between 80 and 150 words.`;

    return generateText(prompt);
  },
  interpretGematria: async (name: string, value: number, cipher: string): Promise<string> => {
    const prompt = `You are a master of numerology and gematria. 
    The name or word "${name}" has been calculated to have a reduced value of ${value} using the ${cipher} cipher.
    
    Provide a short, profound interpretation of this numerical resonance. 
    Explain what the number ${value} represents in this context and how it influences the vibration of "${name}".
    
    Use the "Archive/Syllabus" aesthetic: serif, italic, professional and grounded.
    Keep it around 60 words.`;

    return generateText(prompt);
  },
  interpretSabianSymbol: async (symbol: { degree: number; sign: string; symbol: string }): Promise<string> => {
    const prompt = `You are an expert in Sabian Symbols and esoteric astrology. 
    Interpret the following Sabian Symbol: "${symbol.degree}° ${symbol.sign}: ${symbol.symbol}".
    
    Provide a direct, practical, and objective interpretation of the archetype represented by this degree.
    Do not refer to the reader or any specific person (avoid "you", "your", "the seeker").
    Use clear, insightful language. Avoid overly flowery or cryptic prose.
    Keep it around 80 words.`;

    return generateText(prompt);
  },
  findLostItem: async (item: string, astroData: any, num: number): Promise<{ interpretation: string; checklist: string[] }> => {
    const prompt = `You are an expert in Horary Astrology and Lost Item Numerology.
    A seeker has lost their "${item}".
    
    ASTROLOGICAL DATA:
    - Significator: ${astroData.significatorName}
    - House: ${astroData.significatorHouse} (${astroData.houseMeaning})
    - Sign: ${astroData.significatorSign} (${astroData.signMeaning})
    
    NUMEROLOGICAL DATA:
    - Lost Item Number: ${num} (A traditional number from 1-81 used in divination for lost objects).
    
    TASK:
    1. Synthesize these two systems into a cohesive, practical, and slightly cryptic "Archive/Syllabus" style reading.
    2. Provide a single paragraph (approx 60 words) describing the location.
    3. Provide a list of 5 specific, interactive search checklist items based on the combined data.
    
    Format your response as JSON:
    {
      "interpretation": "...",
      "checklist": ["...", "...", "...", "...", "..."]
    }`;

    const response = await generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    try {
      return JSON.parse(response.text || "{}");
    } catch (e) {
      return {
        interpretation: "The archive is hazy. Look where you last felt peace.",
        checklist: ["Check under the bed", "Look in the kitchen", "Search the car", "Ask a friend", "Retrace your steps"]
      };
    }
  },
  getEmotionalInsight: async (fullPath: string, tertiaryEmotion: string): Promise<string> => {
    const prompt = `You are an emotional alchemist. A seeker has identified their current resonance as: ${fullPath}.
    
    Provide a deep, poetic, and resonant insight for this specific emotional state. 
    Acknowledge the nuance of the tertiary emotion (${tertiaryEmotion}).
    
    Format the response as a single poetic paragraph (40-60 words).
    Use the "Archive/Syllabus" aesthetic: serif, italic, profoundly insightful.`;

    const response = await generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text || "Your resonance is noted in the archive.";
  },
  interpretDream: async (dreamText: string, profile: any): Promise<string> => {
    const prompt = `You are an expert in Jungian dream analysis and esoteric symbolism.
    The dreamer is ${profile.isMe ? 'the seeker' : 'someone else'} born on ${profile.birthday || 'an unknown date'}.
    They had the following dream: "${dreamText}"
    
    Provide a deep, poetic, and insightful interpretation of this dream. 
    Focus on the symbols, the emotional resonance, and what the subconscious might be trying to communicate.
    
    Use the "Archive/Syllabus" aesthetic: serif, italic, slightly cryptic but profoundly resonant.
    Keep it between 60 and 90 words.`;

    const response = await generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text || "The dream is a silent mirror.";
  }
};
