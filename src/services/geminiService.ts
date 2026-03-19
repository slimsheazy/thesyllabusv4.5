import { GoogleGenAI, Type, GenerateContentParameters, Modality } from "@google/genai";
import { extractJSON } from "../utils/jsonUtils";
import { HoraryAnalysis, QuantumTimelineResult, PhotoScryerResult, SynastryResult, BiorhythmInterpretation, DeckRecommendation, StichomancyResult } from "../types";

const SYSTEM_INSTRUCTION = `You are a technical analyst for the Archive.
Your tone is professional, objective, and clear.
Rules:
1. Provide grounded, pattern-based observations.
2. Use precise, accessible language.
3. Focus on real-world utility and psychological clarity.
4. Keep all responses concise, structured, and highly usable.
5. Avoid generic marketing jargon or "life coach" platitudes.
6. When interpreting symbols, be specific and avoid vague generalities.
7. Output strictly in clean, semantic text. Use standard line breaks (\n) for spacing and avoid excessive nested bullet points.`;

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

export async function generateText(prompt: string, model: string = "gemini-3-flash-preview", systemInstruction: string = SYSTEM_INSTRUCTION, tools?: any[]): Promise<string> {
  const response = await generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction,
      tools,
    },
  });
  const text = response.text || "";
  // Global Parsing: Intercept and clean output. Strip "Thinking" syntax / triple backticks.
  return text.replace(/```(?:markdown|json|html|text)?\n?([\s\S]*?)\n?```/g, '$1').trim();
}

export async function generateJson<T>(prompt: string, schema: any, model: string = "gemini-3-flash-preview", systemInstruction: string = SYSTEM_INSTRUCTION, tools?: any[]): Promise<T> {
  const response = await generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
      systemInstruction,
      tools,
    },
  });
  return extractJSON<T>(response.text || "{}");
}

export async function generateJsonWithContents<T>(contents: any, schema: any, model: string = "gemini-3-flash-preview", systemInstruction: string = SYSTEM_INSTRUCTION, tools?: any[]): Promise<T> {
  const response = await generateContent({
    model,
    contents,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
      systemInstruction,
      tools,
    },
  });
  return extractJSON<T>(response.text || "{}");
}

export const geminiService = {
  generateContent,
  generateText,
  generateJson,
  getElectionalAnalysis: async (intent: string, lat: number, lng: number, currentIso: string): Promise<{ isoDate: string; selectedDate: string; chartData: { ascendant: number; planets: { name: string; degree: number }[] } }> => {
    const schema = {
      type: Type.OBJECT,
      properties: {
        isoDate: { type: Type.STRING },
        selectedDate: { type: Type.STRING },
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
          },
          required: ["ascendant", "planets"]
        }
      },
      required: ["isoDate", "selectedDate", "chartData"]
    };
    const prompt = `As an expert electional astrologer, find the optimal time for the following intent: "${intent}".
    Location: Lat ${lat}, Lng ${lng}.
    Current time: ${currentIso}.
    
    CRITICAL PROTOCOL:
    1. Find an auspicious time in the future.
    2. Calculate the chart for that time.
    3. Return the date in ISO format and a human-readable format.
    4. Provide the Ascendant and planetary positions.`;
    return generateJson(prompt, schema, "gemini-3.1-pro-preview");
  },
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
    
    CRITICAL HORARY PROTOCOL:
    1. Use the REGIOMONTANUS HOUSE SYSTEM (standard for Horary).
    2. Calculate the Ascendant and House Cusps precisely for the given coordinates and time.
    3. Identify the significators for the Querent (Lord of 1st) and the Quesited (Lord of the relevant house).
    4. Analyze the Moon's condition and its next aspects.
    5. Provide absolute degrees (0-360) for the Ascendant and all relevant planets for the chartData.`, schema);
  },

  getQuantumTimelineScan: async (data: { intent: string; signature: string }): Promise<QuantumTimelineResult> => {
    const schema = {
      type: Type.OBJECT,
      properties: {
        currentReality: {
          type: Type.OBJECT,
          properties: {
            stateLabel: { type: Type.STRING },
            entropyLevel: { type: Type.STRING },
            frequencyMarker: { type: Type.STRING },
            realityFragments: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["stateLabel", "entropyLevel", "frequencyMarker", "realityFragments"]
        },
        desiredReality: {
          type: Type.OBJECT,
          properties: {
            stateLabel: { type: Type.STRING },
            entropyLevel: { type: Type.STRING },
            frequencyMarker: { type: Type.STRING },
            realityFragments: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["stateLabel", "entropyLevel", "frequencyMarker", "realityFragments"]
        },
        quantumJump: {
          type: Type.OBJECT,
          properties: {
            behavioralDelta: { type: Type.STRING },
            bridgeAction: { type: Type.STRING },
            shiftFrequency: { type: Type.STRING }
          },
          required: ["behavioralDelta", "bridgeAction", "shiftFrequency"]
        }
      },
      required: ["currentReality", "desiredReality", "quantumJump"]
    };

    const prompt = `As a quantum timeline analyst, analyze the following intent and signature:
    Intent: "${data.intent}"
    Signature: "${data.signature}"
    
    TASK:
    1. Define the current reality state and the desired reality state.
    2. Identify the differences (reality fragments).
    3. Define the quantum jump (behavioral delta, bridge action, shift frequency).
    
    Style: Technical, analytical, high-density.`;

    return generateJson<QuantumTimelineResult>(prompt, schema);
  },

  getPhotoScryingReading: async (imageData: string, mimeType: string, focus: string): Promise<PhotoScryerResult> => {
    const schema = {
      type: Type.OBJECT,
      properties: {
        primaryObservation: { type: Type.STRING },
        artifactsDetected: { type: Type.ARRAY, items: { type: Type.STRING } },
        spatialVibe: { type: Type.STRING }
      },
      required: ["primaryObservation", "artifactsDetected", "spatialVibe"]
    };

    const prompt = `Perform a "photo scrying" reading on the provided image with a focus on: "${focus}".
    Analyze the image for hidden patterns, artifacts, and the overall spatial vibe.
    
    Style: Mystical, insightful, slightly cryptic.`;

    const imagePart = {
      inlineData: {
        mimeType,
        data: imageData.split(',')[1],
      },
    };

    return generateJsonWithContents<PhotoScryerResult>({ contents: { parts: [imagePart, { text: prompt }] } }, schema);
  },

  getFriendshipMatrix: async (subjects: string[]): Promise<SynastryResult> => {
    const schema = {
      type: Type.OBJECT,
      properties: {
        compatibilityScore: { type: Type.NUMBER },
        analysis: { type: Type.STRING },
        vibrationalMatch: { type: Type.STRING },
        groupDynamic: { type: Type.STRING },
        leaderArchetype: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            role: { type: Type.STRING }
          },
          required: ["name", "role"]
        },
        frictionPoints: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["compatibilityScore", "analysis", "vibrationalMatch"]
    };

    const prompt = `Analyze the friendship/group synastry for the following subjects: ${subjects.join(', ')}.
    Provide a compatibility score (0-100), a deep analysis of their bond, and a vibrational match description.
    If there are more than 2 subjects, include a group dynamic analysis, leader archetype, and friction points.
    
    Style: Insightful, analytical, slightly esoteric.`;

    return generateJson<SynastryResult>(prompt, schema);
  },

  getBiorhythmInterpretation: async (data: { physical: number; emotional: number; intellectual: number }): Promise<BiorhythmInterpretation> => {
    const schema = {
      type: Type.OBJECT,
      properties: {
        brief: { type: Type.STRING },
        suggestion: { type: Type.STRING }
      },
      required: ["brief", "suggestion"]
    };

    const prompt = `Analyze these biorhythm levels: Physical: ${data.physical}%, Emotional: ${data.emotional}%, Intellectual: ${data.intellectual}%.
    Provide a brief heuristic observation and a tactical protocol suggestion.
    
    Style: Technical, grounded, direct.`;

    return generateJson<BiorhythmInterpretation>(prompt, schema);
  },

  getDeckRecommendation: async (profile: string, scores: Record<string, number>): Promise<DeckRecommendation> => {
    const schema = {
      type: Type.OBJECT,
      properties: {
        deckName: { type: Type.STRING },
        creator: { type: Type.STRING },
        description: { type: Type.STRING },
        whyMatch: { type: Type.STRING },
        keyThemes: { type: Type.ARRAY, items: { type: Type.STRING } },
        estimatedPrice: { type: Type.STRING },
        whereToFind: { type: Type.STRING },
        acquisitionLink: { type: Type.STRING }
      },
      required: ["deckName", "creator", "description", "whyMatch", "keyThemes", "estimatedPrice", "whereToFind", "acquisitionLink"]
    };

    const prompt = `Recommend a tarot or oracle deck based on this profile: ${profile}.
    Scores: ${JSON.stringify(scores)}.
    
    Style: Insightful, analytical, slightly esoteric.`;

    return generateJson<DeckRecommendation>(prompt, schema);
  },

  generateDeckSample: async (description: string, profile: string, index: number): Promise<string | null> => {
    const ai = getGeminiAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: {
        parts: [
          {
            text: `Generate a sample tarot card image for a deck described as: ${description}. The profile is: ${profile}. This is sample card ${index}.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "3:4",
          imageSize: "1K"
        },
      },
    });
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  },

  getStichomancyPassage: async (shelf: string, title: string, author: string): Promise<StichomancyResult> => {
    const schema = {
      type: Type.OBJECT,
      properties: {
        quote: { type: Type.STRING },
        divinatoryMeaning: { type: Type.STRING },
        sourceInsight: { type: Type.STRING },
        bookInfo: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            author: { type: Type.STRING },
            year: { type: Type.STRING }
          },
          required: ["title", "author"]
        }
      },
      required: ["quote", "divinatoryMeaning", "sourceInsight", "bookInfo"]
    };

    const prompt = `Perform stichomancy on the book "${title}" by ${author} from the "${shelf}" shelf.
    Select a random, poignant passage (quote), provide a divinatory meaning for it, and offer a brief source insight.
    
    Style: Insightful, analytical, slightly esoteric.`;

    return generateJson<StichomancyResult>(prompt, schema);
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
    const prompt = `You are the Archive's Technical Analyst. 
    Subject: ${userIdentity || 'unidentified seeker'}
    Intent Vector: "${intent}"
    
    Task: Provide a high-density esoteric analysis of the symbolic resonance. 
    Include specific technical protocols for activation.
    
    Style: 
    Professional, direct, and high-density. 
    Use esoteric terminology (e.g., "vibrational frequency," "morphic resonance," "quantum entanglement") in a precise, non-flowery manner.
    Avoid generic spiritual advice.
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
    
    Style: Create a short, evocative narrative for ${userIdentity || 'a seeker'} using these words.
    The tone should be that of a "Cosmic Prophecy"-timeless and slightly cryptic, yet grounded in a core truth.
    Keep it between 50 and 70 words.`;

    return generateText(prompt);
  },
  queryAkashicRecords: async (query: string, profile: any, initials: string): Promise<string> => {
    const prompt = `Accessing Central Data Repository: Hall of Records.
    
    Subject Metadata:
    - Identifier: ${profile.name} (${initials})
    - Temporal Origin: ${profile.birthday}
    - Spatial Coordinate: ${profile.location.name}
    - Inquiry Vector: "${query}"
    
    Task:
    Retrieve high-density esoteric data for this inquiry. Provide a direct, professional analysis of the subject's thematic trajectory and karmic load.
    
    Style: 
    The tone is "The Archive Technical Lead"-direct, analytical, and professional. 
    Strip away all "flowery" or "mystical" filler. 
    Use precise esoteric terminology and "deep cut" occult references where appropriate.
    It should feel like a classified technical briefing on a soul's trajectory.
    
    Requirements:
    1. Reference the soul-signature "${initials}".
    2. Correlate temporal origin (${profile.birthday}) with specific esoteric coordinates.
    3. Define the "Karmic Vector"-the primary thematic force currently in play.
    
    Format:
    Direct data output. No headers.
    Keep it between 100 and 180 words.`;

    return generateText(prompt, "gemini-3.1-pro-preview");
  },
  interpretGematria: async (name: string, value: number, cipher: string): Promise<string> => {
    const prompt = `Explain the meaning of the number ${value} for the word "${name}" using the ${cipher} cipher.
    
    Style: Provide a direct, pattern-based interpretation of this number's vibration.
    Explain what the frequency represents and how it resonates with the word.
    Keep it around 50 words.`;

    return generateText(prompt);
  },
  interpretSabianSymbol: async (symbol: { degree: number; sign: string; symbol: string }): Promise<string> => {
    const prompt = `Interpret the following Sabian Symbol: "${symbol.degree}deg ${symbol.sign}: ${symbol.symbol}".
    
    Style: Provide a clear, plain-spoken, and digestible interpretation of the archetype represented by this degree.
    Avoid dense or overly academic language. Focus on the core psychological or practical essence.
    The tone should be that of the "Librarian"-insightful but accessible.
    Do not refer to the reader or any specific person.
    Keep it around 60-80 words.`;

    return generateText(prompt);
  },
  findLostItem: async (item: string, numerologyData: { itemNumber: number; timeNumber: number; totalNumber: number }): Promise<{ interpretation: string; checklist: string[] }> => {
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
    - Numerology: Item value: ${numerologyData.itemNumber}, Time value: ${numerologyData.timeNumber}, Total numerological resonance: ${numerologyData.totalNumber}.
    
    TASK:
    1. Provide a direct, practical synthesis that uses the numerological resonance to pinpoint the location.
    2. Provide a list of 5 specific, practical search checklist items based on this synthesis.
    
    Style: Very practical, plain-spoken, and grounded. Like a sensible person next door giving straightforward advice. No mystical fluff.
    
    Format: Return a JSON object with 'interpretation' (approx 60-80 words) and 'checklist' (array of 5 strings).`;

    return generateJson<{ interpretation: string; checklist: string[] }>(prompt, schema);
  },
  decodeSynchronicity: async (event: string, context: any): Promise<string> => {
    const prompt = `You are an expert in pattern recognition and symbolic analysis.
    A user has noticed a meaningful coincidence and wants to understand its significance using the mechanism: ${context.mechanism}.
    
    COINCIDENCE: "${event}"
    
    CONTEXT:
    - Current Time: ${context.currentTime}
    - Location: ${context.location || 'Unknown'}
    - User Birthday: ${context.userBirthday || 'Unknown'}
    
    TASK:
    1. Analyze the meaning of this coincidence through the lens of ${context.mechanism}.
    2. Explain the significance or potential message in a clear, practical way.
    3. Provide a concrete "alignment action" to apply this insight.
    
    Style: The tone should be professional, analytical, and insightful. 
    Avoid overly mystical or flowery language. Focus on clarity and practical application.
    Approx 100-150 words.`;

    return generateText(prompt);
  },
  getEmotionalInsight: async (fullPath: string, tertiaryEmotion: string): Promise<string> => {
    const prompt = `Provide a clear, practical insight for the emotional state: ${fullPath} (${tertiaryEmotion}).
    
    Style: Provide a clear, insightful resonance for the emotional state.
    Format the response as a single direct paragraph (40-50 words).`;

    const response = await generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text || "Your resonance is noted in the archive.";
  },
  interpretDream: async (dreamText: string, profile: any): Promise<string> => {
    const prompt = `Analyze this dream: "${dreamText}" for a user born on ${profile.birthday || 'an unknown date'}.
    
    Style: Provide a psychological and symbolic interpretation. 
    The tone should be that of the Archive-objective, slightly formal, and evocative.
    Format:
    Just the interpretation. No intros or outros.
    Keep it between 60 and 80 words.`;

    const response = await generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text || "The dream is a silent mirror.";
  },
  interpretLenormand: async (cards: string[]): Promise<{ practical: string; psychological: string; spiritual: string }> => {
    const schema = {
      type: Type.OBJECT,
      properties: {
        practical: { type: Type.STRING, description: "A direct, real-world interpretation." },
        psychological: { type: Type.STRING, description: "An interpretation focused on mindset and emotions." },
        spiritual: { type: Type.STRING, description: "A higher-level, symbolic or karmic interpretation." }
      },
      required: ["practical", "psychological", "spiritual"]
    };
    const prompt = `Interpret these three Lenormand cards: ${cards.join(', ')}.
    
    Provide a simple, direct interpretation for:
    1. Practical: Real-world advice.
    2. Psychological: Internal state.
    3. Spiritual: Deeper meaning.

    Keep it very brief and clear.`;
    
    return generateJson<{ practical: string; psychological: string; spiritual: string }>(prompt, schema);
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
    1. Provide a specific, insightful interpretation for EACH card in its specific position. Connect the card's archetype directly to the user's inquiry and the position's meaning.
    2. Provide a cohesive, deeply synthesized narrative that ties the entire spread together. This synthesis must not just list the cards, but weave them into a unified story that answers the inquiry with clarity and depth.
    
    Style:
    - The tone should be that of the Master Librarian-analytical, formal, and profoundly insightful.
    - Connect the card's archetype to the user's inquiry with symbolic precision.
    - Focus on real-world patterns, psychological clarity, and actionable wisdom.
    
    Constraints:
    - Synthesis: 150-200 words. Focus on the "thread" that connects all cards.
    - Each card interpretation: 30-50 words.`;

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

    const prompt = `Generate a 'Glyphic Card' insight for the inquiry: "${query}".
    
    Rules for the word:
    1. Must be a real, specific English word.
    2. Must NOT be mystical or esoteric (avoid 'oracle', 'spirit', 'destiny').
    3. Must NOT be a direct correlation to the inquiry (avoid bias).
    4. Should be an intellectual, technical, or philosophical concept.
    
    Rules for the reading:
    1. Must be a concise, practical, yet philosophical mantra or quote.
    2. Use a repetitive or rhythmic structure if appropriate (e.g., "It matters what...").
    3. Max 50 words.
    
    Style: The tone should be that of the Archive-timeless, evocative, and deeply insightful.`;

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
  getTeaLeafReading: async (profile: any): Promise<{ vision: string; interpretation: string; pattern_type: string }> => {
    const schema = {
      type: Type.OBJECT,
      properties: {
        vision: { type: Type.STRING, description: "A short, vivid description of the pattern in the tea leaves." },
        interpretation: { type: Type.STRING, description: "A practical, grounded interpretation of the pattern (max 80 words)." },
        pattern_type: { type: Type.STRING, description: "The core geometric or symbolic pattern (e.g., 'circle', 'cross', 'bird', 'mountain', 'heart')." }
      },
      required: ["vision", "interpretation", "pattern_type"]
    };

    const prompt = `You are a master of Tasseography. 
    The seeker is ${profile.isMe ? 'the user' : 'someone else'} born on ${profile.birthday || 'an unknown date'}.
    
    Task:
    1. Describe a specific, evocative pattern formed by tea leaves in a cup.
    2. Provide a practical, grounded, and insightful interpretation of this pattern.
    3. Identify the core 'pattern_type' for visualization.
    
    Style: The tone should be that of the Librarian-formal, evocative, and insightful. 
    Provide a grounded but symbolic interpretation of the pattern.`;

    return generateJson<{ vision: string; interpretation: string; pattern_type: string }>(prompt, schema);
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
  },
  getHumanDesignAnalysis: async (profile: any): Promise<{
    type: string;
    strategy: string;
    authority: string;
    profile: string;
    definition: string;
    incarnationCross: string;
    summary: string;
    centers: { name: string; status: 'Defined' | 'Undefined'; description: string }[];
    gates: number[];
  }> => {
    const schema = {
      type: Type.OBJECT,
      properties: {
        type: { type: Type.STRING },
        strategy: { type: Type.STRING },
        authority: { type: Type.STRING },
        profile: { type: Type.STRING },
        definition: { type: Type.STRING },
        incarnationCross: { type: Type.STRING },
        summary: { type: Type.STRING },
        centers: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              status: { type: Type.STRING, enum: ['Defined', 'Undefined'] },
              description: { type: Type.STRING }
            },
            required: ["name", "status", "description"]
          }
        },
        gates: {
          type: Type.ARRAY,
          items: { type: Type.INTEGER },
          description: "List of all active gates (1-64) in the design."
        }
      },
      required: ["type", "strategy", "authority", "profile", "definition", "incarnationCross", "summary", "centers", "gates"]
    };

    const prompt = `Calculate and analyze the Human Design chart for:
    - Name: ${profile.name}
    - Birth Date: ${profile.birthday}
    - Birth Time: ${profile.birthTime}
    - Birth Location: ${profile.location.name}
    
    CRITICAL CALCULATION PROTOCOL (MUST FOLLOW STANDARD HUMAN DESIGN CHARTS):
    1. Calculate the exact planetary positions for both the Personality (Black) and Design (Red) charts.
    2. The Design chart is calculated for the moment exactly 88 degrees of solar arc (approx. 88 days) before birth.
    3. Map these 26 positions (13 Personality, 13 Design) to the 64 Gates of the I Ching based on the standard Human Design ephemeris.
    4. Determine the 9 Centers' status (Defined/Undefined) based on the presence of active channels (both gates of a channel must be activated).
    5. Identify the Type, Strategy, Authority, and Profile based on the resulting BodyGraph.
    
    Provide a comprehensive analysis including:
    1. Type (Manifestor, Generator, Manifesting Generator, Projector, Reflector)
    2. Strategy
    3. Authority
    4. Profile (e.g., 1/3, 4/6)
    5. Definition (Single, Split, etc.)
    6. Incarnation Cross
    7. A practical, grounded summary of their design.
    8. Analysis of the 9 Centers (Head, Ajna, Throat, G, Heart, Sacral, Spleen, Solar Plexus, Root). Each center description MUST explain its function and what it means to be Defined vs Undefined.
    9. A full list of active gates (1-64).
    
    Style: The tone should be that of the Librarian-analytical, formal, and profoundly insightful. Focus on practical application of the strategy and authority.`;

    return generateJson(prompt, schema, "gemini-3.1-pro-preview");
  },

  getIChingReading: async (hexagram: number[], changingLines: number[], question: string): Promise<{
    hexagramName: string;
    hexagramNumber: number;
    judgment: string;
    image: string;
    changingLinesInterpretation: string[];
    transformedHexagramName?: string;
    transformedHexagramNumber?: number;
    synthesis: string;
  }> => {
    const schema = {
      type: Type.OBJECT,
      properties: {
        hexagramName: { type: Type.STRING },
        hexagramNumber: { type: Type.INTEGER },
        judgment: { type: Type.STRING },
        image: { type: Type.STRING },
        changingLinesInterpretation: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING } 
        },
        transformedHexagramName: { type: Type.STRING },
        transformedHexagramNumber: { type: Type.INTEGER },
        synthesis: { type: Type.STRING }
      },
      required: ["hexagramName", "hexagramNumber", "judgment", "image", "changingLinesInterpretation", "synthesis"]
    };

    const prompt = `You are a master of the I Ching (Book of Changes).
    A seeker has cast a hexagram for the question: "${question}".
    
    CAST DATA:
    - Hexagram Lines (bottom to top): ${hexagram.join(', ')}
    - Changing Lines (indices 1-6): ${changingLines.join(', ')}
    
    TASK:
    1. Identify the primary hexagram (1-64).
    2. Provide the traditional Judgment and Image.
    3. Interpret each changing line specifically in the context of the inquiry.
    4. If there are changing lines, identify the transformed hexagram and its core meaning.
    5. Provide a final, high-density synthesis that ties everything together into actionable wisdom.
    
    Style: The tone should be that of the Librarian-formal, evocative, and deeply insightful. 
    Avoid generic fluff. Use precise, grounded language.
    
    Format: Return a JSON object.`;

    return generateJson(prompt, schema, "gemini-3.1-pro-preview");
  },

  getSongOracle: async (context: string, history: string[] = []): Promise<{
    song_title: string;
    artist: string;
    spotify_id: string;
    focus_lyric: string;
    vibe_color: string;
    verification_query: string;
  }> => {
    const schema = {
      type: Type.OBJECT,
      properties: {
        song_title: { type: Type.STRING },
        artist: { type: Type.STRING },
        spotify_id: { type: Type.STRING, description: "A valid 22-character Spotify track ID. MUST be accurate." },
        focus_lyric: { type: Type.STRING },
        vibe_color: { type: Type.STRING, description: "A hex color code representing the song's vibe." },
        verification_query: { type: Type.STRING, description: "The exact search query used to find this Spotify ID." }
      },
      required: ["song_title", "artist", "spotify_id", "focus_lyric", "vibe_color", "verification_query"]
    };

    const prompt = `Perform a "Song Pull" based on the current energetic frequency: "${context}".
    
    HISTORY (STRICTLY FORBIDDEN TO REPEAT):
    ${history.join(', ')}

    TASK:
    1. Selection: Choose an evocative, high-resonance track that fits this frequency. 
       CRITICAL: You MUST select from a wide variety of genres (e.g., ambient, jazz, electronic, folk, classical, post-rock, experimental, world music, synthwave, shoegaze, neo-soul) and eras (1950s-2020s). 
       DO NOT repeat genres, artists, or songs from the HISTORY provided above.
       PRIORITIZE: Deep cuts, indie gems, and culturally diverse tracks over mainstream hits.
    2. Verification: You MUST use Google Search to find the EXACT 22-character Spotify track ID for the specific song and artist you chose.
       CRITICAL: The Spotify ID returned MUST correspond to the 'song_title' and 'artist' fields. 
       DO NOT return an ID for a different song. 
       DO NOT return a playlist ID or an album ID. It MUST be a track ID.
       The Spotify ID is a 22-character alphanumeric string (e.g., 4cOdOD6kSfwuY0Yp7df3bd).
    3. Accuracy: If you cannot find the exact ID, select a different song that you CAN find the ID for. 
       NEVER hallucinate an ID.
    
    Format: Return ONLY the specified JSON structure.`;

    return generateJson(prompt, schema, "gemini-3.1-pro-preview", SYSTEM_INSTRUCTION, [{ googleSearch: {} }]);
  }
};
