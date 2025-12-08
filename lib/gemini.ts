import { GoogleGenAI, Type, Modality } from "@google/genai";
import { WordData, SentenceData } from "../types";

// Initialize Gemini Client (Server-Side Only)
// process.env.API_KEY is available here.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeWordServer(query: string): Promise<WordData> {
  const prompt = `
    You are an expert trilingual dictionary assistant for a native Chinese speaker learning Japanese and English.
    Analyze the following input: "${query}". 
    Input language could be Japanese, English, or Chinese.
    
    Identify the core vocabulary word intended by the user.
    Provide a trilingual dictionary entry (Japanese, English, Chinese).
    
    IMPORTANT for Native Chinese User:
    - Ensure the Chinese definitions are precise, natural, and helpful for understanding nuances.
    - If the Japanese Kanji has a different meaning or nuance in Chinese, clarify it in the definition.
    
    For the Japanese Definition:
    1. Provide a standard text version.
    2. Provide a version with Furigana using HTML <ruby> tags (e.g., <ruby>日本<rt>にほん</rt></ruby>).
    
    For Example Sentences:
    1. If the example is in Japanese, provide a standard 'text' version AND a 'text_furigana' version with HTML <ruby> tags.

    For Inflections/Conjugations:
    1. If the word is a Japanese Verb or Adjective, list common forms (Polite/Masu, Te-form, Past, Negative, Potential, Passive, Causative, Volitional, etc.).
    2. If the word is an English Verb, list forms (Present, Past, Past Participle, Gerund/Present Participle, 3rd Person Singular).
    3. If the word is an English Noun with irregular plural, list it.
    4. If Chinese, leave empty unless there are specific variants.
    
    Include pronunciations, example sentences, inflections, etymology, synonyms, and antonyms.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          inputWord: { type: Type.STRING },
          coreWord: {
            type: Type.OBJECT,
            properties: {
              jp: { type: Type.STRING },
              en: { type: Type.STRING },
              zh: { type: Type.STRING },
            },
            required: ["jp", "en", "zh"],
          },
          pronunciation: {
            type: Type.OBJECT,
            properties: {
              jp: { type: Type.STRING, description: "Hiragana and Romaji" },
              en: { type: Type.STRING, description: "IPA format" },
              zh: { type: Type.STRING, description: "Pinyin" },
            },
          },
          definitions: {
            type: Type.OBJECT,
            properties: {
              jp: { type: Type.STRING },
              jp_furigana: { type: Type.STRING, description: "Japanese definition containing HTML <ruby> tags for Kanji readings" },
              en: { type: Type.STRING },
              zh: { type: Type.STRING },
            },
          },
          examples: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                text_furigana: { type: Type.STRING, description: "Japanese sentence with HTML <ruby> tags. Optional, only for JP examples." },
                translation: { type: Type.STRING, description: "Chinese translation" },
                lang: { type: Type.STRING, enum: ["jp", "en"] },
              },
              required: ["text", "translation", "lang"]
            },
          },
          inflections: {
            type: Type.ARRAY,
            description: "List of conjugations or inflections (especially for JP/EN verbs/adjectives)",
            items: {
              type: Type.OBJECT,
              properties: {
                partOfSpeech: { type: Type.STRING, description: "e.g., 'Verb (Godan)', 'Adjective (I-adj)', 'Noun'" },
                forms: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      label: { type: Type.STRING, description: "e.g., 'Te-form', 'Past Tense'" },
                      value: { type: Type.STRING, description: "The conjugated word" }
                    }
                  }
                }
              }
            }
          },
          etymology: { type: Type.STRING },
          related: {
            type: Type.OBJECT,
            properties: {
              synonyms: { type: Type.ARRAY, items: { type: Type.STRING } },
              antonyms: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["synonyms", "antonyms"],
          },
        },
        required: ["coreWord", "pronunciation", "definitions", "examples", "etymology", "related"],
      },
    },
  });

  if (!response.text) throw new Error("No text response from Gemini");
  return JSON.parse(response.text) as WordData;
}

export async function analyzeSentenceServer(sentence: string): Promise<SentenceData> {
  const prompt = `
    You are an expert language tutor for a native Chinese speaker.
    Analyze the following sentence deeply: "${sentence}".
    The sentence could be in Japanese, English, or Chinese.
    
    1. Break down the sentence word by word (or by grammatical unit).
    2. For each broken-down word, provide the meaning in Japanese, English, and Chinese.
    3. Provide a detailed grammar analysis explaining the structure, tense, and nuances.
    4. Provide the grammar analysis in THREE languages: Japanese, English, and Chinese.
    
    IMPORTANT for Grammar Analysis:
    - The Chinese analysis should be detailed and explain concepts that might be difficult for Chinese speakers (e.g., Japanese particles, English tenses) using clear Chinese terminology.
    
    5. Translate the full sentence into Japanese, English, and Chinese.
    
    For ANY Japanese text output (translations, grammar analysis, etc.):
    Provide a version that uses HTML <ruby> tags for Furigana readings where appropriate (e.g. <ruby>私<rt>わたし</rt></ruby>は...).
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          original: { type: Type.STRING },
          breakdown: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                word: { type: Type.STRING },
                reading: { type: Type.STRING, description: "Reading if applicable (e.g. Kana for Kanji)" },
                partOfSpeech: { type: Type.STRING },
                meaning: { 
                  type: Type.OBJECT,
                  description: "Meaning in JP, EN, and ZH",
                  properties: {
                    jp: { type: Type.STRING },
                    en: { type: Type.STRING },
                    zh: { type: Type.STRING },
                  },
                  required: ["jp", "en", "zh"]
                },
              }
            }
          },
          grammarAnalysis: {
            type: Type.OBJECT,
            description: "Detailed explanation of grammar and structure in three languages",
            properties: {
              jp: { type: Type.STRING, description: "Japanese explanation" },
              en: { type: Type.STRING, description: "English explanation" },
              zh: { type: Type.STRING, description: "Chinese explanation (Detailed for native speakers)" }
            },
            required: ["jp", "en", "zh"]
          },
          translations: {
            type: Type.OBJECT,
            properties: {
              jp: { type: Type.STRING, description: "Plain Japanese translation" },
              jp_furigana: { type: Type.STRING, description: "Japanese translation with HTML <ruby> tags" },
              en: { type: Type.STRING },
              zh: { type: Type.STRING },
            },
            required: ["jp", "jp_furigana", "en", "zh"]
          }
        },
        required: ["original", "breakdown", "grammarAnalysis", "translations"]
      }
    }
  });

  if (!response.text) throw new Error("No text response from Gemini");
  return JSON.parse(response.text) as SentenceData;
}

export async function generateImageServer(word: string): Promise<string | null> {
  // 1. Try gemini-2.5-flash-image
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `A clear, high-quality, photorealistic or artistic illustration representing the concept of: "${word}". The image should be wide and suitable for a header.` }],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const mimeType = part.inlineData.mimeType || 'image/png';
        return `data:${mimeType};base64,${part.inlineData.data}`;
      }
    }
  } catch (e: any) {
    console.warn("gemini-2.5-flash-image failed, trying fallback:", e);
  }

  // 2. Fallback to Imagen 4
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: `A clear, high-quality, photorealistic or artistic illustration representing the concept of: "${word}".`,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '16:9',
      },
    });

    const base64Image = response.generatedImages?.[0]?.image?.imageBytes;
    if (base64Image) {
        return `data:image/jpeg;base64,${base64Image}`;
    }
  } catch (e) {
    console.warn("Imagen generation failed, trying search:", e);
  }

  // 3. Fallback to Search
  return searchImageServer(word);
}

async function searchImageServer(word: string): Promise<string | null> {
  try {
    const prompt = `
      Find a direct image URL representing the word: "${word}".
      Preferably from Wikimedia Commons or other public domain sources.
      The URL MUST point directly to an image file (ending in .jpg, .png, .jpeg).
      Return ONLY the URL string. Do not add any markdown, explanation, or JSON formatting.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text?.trim();
    if (text) {
      const urlMatch = text.match(/https?:\/\/[^\s)"]+/);
      if (urlMatch) {
        let url = urlMatch[0];
        if (url.endsWith('.')) url = url.slice(0, -1);
        return url;
      }
    }
    return null;
  } catch (e) {
    console.error("Image search fallback failed", e);
    return null;
  }
}

export async function generateSpeechServer(text: string, lang: 'jp' | 'en' | 'zh'): Promise<string | null> {
  // Strip HTML tags
  const cleanText = text.replace(/<[^>]*>?/gm, '');
  const voiceName = lang === 'jp' ? 'Kore' : lang === 'en' ? 'Fenrir' : 'Puck';
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: cleanText }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;

  } catch (e) {
    console.error("TTS failed", e);
    return null;
  }
}