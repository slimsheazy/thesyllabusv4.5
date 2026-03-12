import { GoogleGenAI, Type, GenerateContentParameters } from "@google/genai";
import { extractJSON } from "../utils/jsonUtils";
import { HoraryAnalysis } from "../types";

const SYSTEM_INSTRUCTION = `You are a direct and practical analytical assistant. 
Your tone is neutral, clear, and objective. Avoid all mystical, esoteric, poetic, or flowery language. 
Rules:
1. Speak neutrally and analytically, focusing on practical observations.
2. Avoid conversational fillers, rhetorical questions, and flowery metaphors.
3. Keep all responses concise, structured, and highly usable.
4. Do not use marketing language or coaching-style advice.
5. Provide guidance that is grounded in reality and easy to understand.`;

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
        interpretation: { type: Type.OBJECT, properties: { text: { type: Type.STRING } } }
      },
      required: ["interpretation"]
    };
    const result = await generateJson<{ interpretation: { text: string } }>(`Provide a clear, practical interpretation for ${planet} in ${sign} in the ${house} house. 
    Focus on personality traits and life themes. Keep it direct and easy to understand (max 100 words).`, schema);
    return result.interpretation.text;
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
    const prompt = `You are a practical guide. 
    A user named ${userIdentity || 'a seeker'} has created a sigil for the intent: "${intent}".
    
    Provide a clear explanation of the sigil's meaning and a set of practical, grounded instructions for use.
    The instructions MUST be simple and easy to perform, such as:
    - Focused meditation for 5 minutes.
    - Carrying the sigil in a wallet.
    - Placing the sigil on a workspace.
    
    Avoid any extreme or impractical suggestions.
    Keep the tone professional and direct.
    Keep it around 60 words.`;

    return generateText(prompt);
  },
  generateProphecy: async (inputs: { adjective: string; celestialBody: string; verb: string; emotion: string; object: string }, userIdentity?: string): Promise<string> => {
    const prompt = `Create a short, direct narrative for ${userIdentity || 'a seeker'} using these words:
    - Adjective: ${inputs.adjective}
    - Celestial Body: ${inputs.celestialBody}
    - Verb: ${inputs.verb}
    - Emotion: ${inputs.emotion}
    - Object: ${inputs.object}
    
    The narrative should be clear and insightful. 
    Avoid overly flowery or cryptic language.
    Keep it between 50 and 70 words.`;

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
    const prompt = `Explain the meaning of the number ${value} for the word "${name}" using the ${cipher} cipher.
    
    Provide a direct, practical interpretation. 
    Explain what the number represents and how it relates to the word.
    
    Keep the tone professional and grounded.
    Keep it around 50 words.`;

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
    const prompt = `Help a user find their lost "${item}".
    
    DATA:
    - Astrology: ${astroData.significatorName} in ${astroData.significatorHouse} (${astroData.houseMeaning})
    - Numerology: ${num}
    
    TASK:
    1. Provide a direct, practical description of where the item might be (approx 50 words).
    2. Provide a list of 5 specific search checklist items.
    
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
    const prompt = `Provide a clear, practical insight for the emotional state: ${fullPath} (${tertiaryEmotion}).
    
    Format the response as a single direct paragraph (40-50 words).
    Keep the tone grounded and helpful.`;

    const response = await generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text || "Your resonance is noted in the archive.";
  },
  interpretDream: async (dreamText: string, profile: any): Promise<string> => {
    const prompt = `Analyze this dream: "${dreamText}" for a user born on ${profile.birthday || 'an unknown date'}.
    
    Provide a clear, practical interpretation. 
    Focus on the symbols and what they might mean for the user's daily life.
    
    Keep the tone professional and direct.
    Keep it between 60 and 80 words.`;

    const response = await generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text || "The dream is a silent mirror.";
  },
  interpretLenormand: async (cards: string[]): Promise<string> => {
    const schema = {
      type: Type.OBJECT,
      properties: {
        reading: { type: Type.STRING }
      },
      required: ["reading"]
    };
    const prompt = `Interpret these three Lenormand cards as a cohesive sentence: ${cards.join(', ')}.
    
    Lenormand reading rules:
    - Card 1 is the subject.
    - Card 2 describes Card 1.
    - Card 3 describes the combination of 1 and 2, or shows the outcome.
    
    Style: Direct and practical. No mystical fluff.
    Format: One sentence only. Mention the card names in parentheses where appropriate.`;
    
    const result = await generateJson<{ reading: string }>(prompt, schema);
    return result.reading;
  },
  interpretTarot: async (question: string, spread: string, cards: { name: string; isReversed: boolean; position: string; description: string }[]): Promise<{ synthesis: string; cardInterpretations: string[] }> => {
    const schema = {
      type: Type.OBJECT,
      properties: {
        synthesis: { type: Type.STRING },
        cardInterpretations: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING } 
        }
      },
      required: ["synthesis", "cardInterpretations"]
    };

    const cardList = cards.map((c, i) => 
      `${i + 1}. ${c.name} (${c.isReversed ? 'Reversed' : 'Upright'}) at position "${c.position}" (${c.description})`
    ).join('\n');

    const prompt = `You are a master analytical tarot reader for "The Syllabus" archive. 
    Inquiry: "${question}"
    Spread: ${spread}
    
    Cards:
    ${cardList}
    
    Task:
    1. Provide a specific interpretation for EACH card in its specific position. Connect the card's archetype to the user's inquiry and the position's meaning.
    2. Provide a cohesive synthesis (narrative) that ties the entire spread together.
    
    Style:
    - Direct, practical, and grounded.
    - No flowery or mystical fluff.
    - Resonant and psychologically insightful.
    - Professional and objective.
    
    Constraints:
    - Synthesis: Max 120 words.
    - Each card interpretation: Max 40 words.`;

    return generateJson<{ synthesis: string; cardInterpretations: string[] }>(prompt, schema, "gemini-3.1-pro-preview");
  }
};
