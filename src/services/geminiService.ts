import { GoogleGenAI, Type, GenerateContentParameters, Modality } from "@google/genai";
import { extractJSON } from "../utils/jsonUtils";
import { HoraryAnalysis } from "../types";

const SYSTEM_INSTRUCTION = `You are a practical, plain-spoken, and grounded analytical assistant. 
Your tone is like a sensible person next door giving straightforward, objective advice. 
Rules:
1. Avoid all mystical, esoteric, poetic, or flowery language. 
2. Speak clearly and practically, focusing on real-world observations.
3. Avoid conversational fillers and flowery metaphors.
4. Keep all responses concise, structured, and highly usable.
5. Do not use marketing language or coaching-style jargon.
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
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Kore" },
          },
        },
      },
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
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
    
    Style: Very practical, plain-spoken, and grounded. Like a sensible person next door. No mystical or flowery language.
    Keep it between 50 and 70 words.`;

    return generateText(prompt);
  },
  queryAkashicRecords: async (query: string, profile: any, initials: string): Promise<string> => {
    const prompt = `A seeker is asking a question to the Akashic Records.
    
    Subject Identity:
    - Name: ${profile.name} (Initials: ${initials})
    - Birth: ${profile.birthday}
    - Location: ${profile.location.name}
    - Inquiry: "${query}"
    
    Task:
    Check the "cosmic files" for them. Give them a straight-up, accessible insight about their question.
    
    Style: Very practical, plain-spoken, and grounded. Like a sensible person next door giving straightforward advice. No mystical, esoteric, or flowery language.
    
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
    
    Style: Very practical, plain-spoken, and grounded. Like a sensible person next door. No mystical or flowery language.
    Explain what the number represents and how it relates to the word in a direct way.
    
    Keep it around 50 words.`;

    return generateText(prompt);
  },
  interpretSabianSymbol: async (symbol: { degree: number; sign: string; symbol: string }): Promise<string> => {
    const prompt = `Interpret the following Sabian Symbol: "${symbol.degree}° ${symbol.sign}: ${symbol.symbol}".
    
    Style: Very practical, plain-spoken, and grounded. Like a sensible person next door. No mystical or flowery language.
    Provide a direct, practical, and objective interpretation of the archetype represented by this degree.
    Do not refer to the reader or any specific person (avoid "you", "your", "the seeker").
    
    Keep it around 80 words.`;

    return generateText(prompt);
  },
  findLostItem: async (item: string, astroData: any, num: number): Promise<{ interpretation: string; checklist: string[] }> => {
    const schema = {
      type: Type.OBJECT,
      properties: {
        interpretation: { type: Type.STRING },
        checklist: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING } 
        }
      },
      required: ["interpretation", "checklist"]
    };

    const prompt = `Help a user find their lost "${item}".
    
    DATA:
    - Astrology: Significator ${astroData.significatorName} in the ${astroData.significatorHouse} House (${astroData.houseMeaning}). Sign: ${astroData.significatorSign} (${astroData.signMeaning}).
    - Numerology: Lost Item Vibration Number ${num}.
    
    TASK:
    1. Provide a direct, practical synthesis that combines BOTH the astrological significators and the numerological vibration to pinpoint the location.
    2. Provide a list of 5 specific, practical search checklist items based on this synthesis.
    
    Style: Very practical, plain-spoken, and grounded. Like a sensible person next door giving straightforward advice. No mystical fluff.
    
    Format: Return a JSON object with 'interpretation' (approx 60-80 words) and 'checklist' (array of 5 strings).`;

    return generateJson<{ interpretation: string; checklist: string[] }>(prompt, schema);
  },
  decodeSynchronicity: async (event: string, context: any): Promise<string> => {
    const prompt = `You are an expert in Jungian synchronicity, esoteric symbolism, and pattern recognition.
    A seeker has noticed a meaningful coincidence and wants to intuit its significance using the mechanism: ${context.mechanism}.
    
    COINCIDENCE: "${event}"
    
    CONTEXT:
    - Current Time: ${context.currentTime}
    - Location: ${context.location || 'Unknown'}
    - User Birthday: ${context.userBirthday || 'Unknown'}
    
    TASK:
    1. Decode the esoteric meaning of this synchronicity specifically through the lens of ${context.mechanism}.
    2. Explain the "resonance" or message the universe might be trying to convey.
    3. Provide a practical "alignment action" to honor this pattern.
    
    Style: Very practical, plain-spoken, and grounded. Like a sensible person next door giving deep advice. No mystical fluff. Approx 100-150 words.`;

    return generateText(prompt);
  },
  getEmotionalInsight: async (fullPath: string, tertiaryEmotion: string): Promise<string> => {
    const prompt = `Provide a clear, practical insight for the emotional state: ${fullPath} (${tertiaryEmotion}).
    
    Style: Very practical, plain-spoken, and grounded. Like a sensible person next door. No mystical or flowery language.
    Format the response as a single direct paragraph (40-50 words).`;

    const response = await generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text || "Your resonance is noted in the archive.";
  },
  interpretDream: async (dreamText: string, profile: any): Promise<string> => {
    const prompt = `Analyze this dream: "${dreamText}" for a user born on ${profile.birthday || 'an unknown date'}.
    
    Style: Very practical, plain-spoken, and grounded. Like a sensible person next door giving straightforward advice. No mystical, esoteric, or flowery language. Focus on real-world psychological clarity.
    
    Format:
    Just the interpretation. No intros or outros.
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
    
    Style: Very practical, plain-spoken, and grounded. Like a sensible person next door. No mystical fluff.
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
    - Very practical, plain-spoken, and grounded.
    - Like a sensible person next door giving straightforward advice.
    - No mystical, esoteric, or flowery language.
    - Focus on real-world actions and psychological clarity.
    
    Constraints:
    - Synthesis: Max 120 words.
    - Each card interpretation: Max 40 words.`;

    return generateJson<{ synthesis: string; cardInterpretations: string[] }>(prompt, schema, "gemini-3.1-pro-preview");
  },
  generateGlyphic: async (query: string): Promise<{ word: string; definition: string; reading: string; imageUrl: string }> => {
    // Step 1: Generate the word and reading
    const schema = {
      type: Type.OBJECT,
      properties: {
        word: { type: Type.STRING, description: "A cool, non-mystical English word (e.g., 'entropy', 'resonance', 'catalyst', 'infrastructure')." },
        definition: { type: Type.STRING },
        reading: { type: Type.STRING, description: "A concise, practical insight (max 50 words). No mystical fluff." },
        imagePrompt: { type: Type.STRING, description: "A detailed prompt for image generation based on the word, using a cool, modern art style (e.g., brutalist, vaporwave, technical blueprint, high-contrast photography)." }
      },
      required: ["word", "definition", "reading", "imagePrompt"]
    };

    const prompt = `Generate an 'Oracle Card' insight for the inquiry: "${query}".
    
    Rules for the word:
    1. Must be a real, specific English word.
    2. Must NOT be mystical or esoteric (avoid 'oracle', 'spirit', 'destiny').
    3. Must NOT be a direct correlation to the inquiry (avoid bias).
    4. Should be an intellectual, technical, or philosophical concept.
    
    Rules for the reading:
    1. Must be a concise, practical, yet philosophical mantra or quote.
    2. Use a repetitive or rhythmic structure if appropriate (e.g., "It matters what...").
    3. Max 50 words.
    
    Style: Very practical, plain-spoken, and grounded. Like a sensible person next door giving deep advice.`;

    const data = await generateJson<{ word: string; definition: string; reading: string; imagePrompt: string }>(prompt, schema);

    // Step 2: Generate the image
    const imageResponse = await generateContent({
      model: "gemini-2.5-flash-image",
      contents: [{ parts: [{ text: data.imagePrompt }] }],
    });

    let imageUrl = "";
    for (const part of imageResponse.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        imageUrl = `data:image/png;base64,${part.inlineData.data}`;
        break;
      }
    }

    return {
      word: data.word,
      definition: data.definition,
      reading: data.reading,
      imageUrl
    };
  },
  getTeaLeafReading: async (profile: any): Promise<{ vision: string; interpretation: string }> => {
    const schema = {
      type: Type.OBJECT,
      properties: {
        vision: { type: Type.STRING, description: "A short, vivid description of the pattern in the tea leaves." },
        interpretation: { type: Type.STRING, description: "A practical, grounded interpretation of the pattern (max 80 words)." }
      },
      required: ["vision", "interpretation"]
    };

    const prompt = `You are a master of Tasseography. 
    The seeker is ${profile.isMe ? 'the user' : 'someone else'} born on ${profile.birthday || 'an unknown date'}.
    
    Task:
    1. Describe a specific, evocative pattern formed by tea leaves in a cup.
    2. Provide a practical, grounded, and insightful interpretation of this pattern.
    
    Style: Very practical, plain-spoken, and grounded. Like a sensible person next door giving straightforward advice. No mystical fluff.`;

    return generateJson<{ vision: string; interpretation: string }>(prompt, schema);
  },
  getDeathClockSuggestions: async (data: {
    age: number;
    bioAge: number;
    deathDate: string;
    stress: number;
    sleep: number;
    nutrition: number;
    genetics: number;
    environment: number;
  }): Promise<string[]> => {
    const schema = {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    };

    const prompt = `You are a longevity and wellness expert. A user has calculated their longevity using the Gompertz-Makeham formula.
    
    USER DATA:
    - Chronological Age: ${data.age}
    - Calculated Biological Age: ${data.bioAge}
    - Projected Death Date: ${data.deathDate}
    - Systemic Stress (1-10): ${data.stress}
    - Sleep (hours): ${data.sleep}
    - Nutrition (1-10): ${data.nutrition}
    - Genetics (1-10): ${data.genetics}
    - Environment (1-10): ${data.environment}
    
    TASK:
    Provide 5 practical, reasonable, and grounded suggestions on how to extend their projected lifespan. 
    Focus on the areas where they have the most room for improvement based on the data.
    Avoid mystical or flowery language. Be direct and sensible.
    
    Format: Return a JSON array of 5 strings.`;

    return generateJson<string[]>(prompt, schema);
  },
  getCrashSimulation: async (goal: string): Promise<{
    failureModes: {
      mode: string;
      effect: string;
      severity: number;
      occurrence: number;
      detection: number;
      prevention: string;
    }[]
  }> => {
    const schema = {
      type: Type.OBJECT,
      properties: {
        failureModes: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              mode: { type: Type.STRING, description: "The potential failure mode or catastrophe." },
              effect: { type: Type.STRING, description: "The impact of this failure." },
              severity: { type: Type.NUMBER, description: "Severity score (1-10)." },
              occurrence: { type: Type.NUMBER, description: "Probability of occurrence (1-10)." },
              detection: { type: Type.NUMBER, description: "Difficulty of detection (1-10, where 10 is hardest to detect)." },
              prevention: { type: Type.STRING, description: "A practical contingency or prevention plan." }
            },
            required: ["mode", "effect", "severity", "occurrence", "detection", "prevention"]
          }
        }
      },
      required: ["failureModes"]
    };

    const prompt = `You are an expert in FMEA (Failure Mode and Effects Analysis). 
    A user is planning a goal: "${goal}".
    
    TASK:
    Generate 6 potential "catastrophes" or failure modes for this goal.
    For each, provide:
    1. The failure mode (what goes wrong).
    2. The effect (why it matters).
    3. Severity (1-10): How bad is it?
    4. Occurrence (1-10): How likely is it?
    5. Detection (1-10): How hard is it to see coming? (10 = invisible until it's too late).
    6. A practical prevention or contingency plan.
    
    Style: Practical, engineering-minded, and grounded. No mystical language.`;

    return generateJson(prompt, schema);
  }
};
