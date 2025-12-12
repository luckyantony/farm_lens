import { GoogleGenAI, Modality, Type, Schema } from "@google/genai";
import { AnalysisResult, Language } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Using Gemini 3 Pro Preview for complex reasoning and vision analysis
const ANALYSIS_MODEL = 'gemini-3-pro-preview';
// Using Gemini 2.5 Flash TTS for narration
const TTS_MODEL = 'gemini-2.5-flash-preview-tts';

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    isValidPlant: { 
      type: Type.BOOLEAN,
      description: "True if the image contains a plant or crop, false otherwise."
    },
    isBlurry: { 
      type: Type.BOOLEAN,
      description: "True if the image is too blurry for accurate diagnosis."
    },
    issue: { 
      type: Type.STRING,
      description: "Name of the detected issue (disease, pest, deficiency) or 'Healthy Plant'."
    },
    explanation: { 
      type: Type.STRING,
      description: "Detailed explanation of the symptoms/condition. If healthy, explain why it looks good."
    },
    remedies: { 
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of remedies for issues, OR maintenance tips if healthy."
    },
    prevention: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "List of prevention tips or best practices."
    },
    forecast: { 
      type: Type.STRING,
      description: "Growth forecast, e.g., 'Harvest boost in 4 weeks if followed'."
    },
    impactStats: { 
      type: Type.STRING,
      description: "Brief SDG 2 impact statement or economic benefit of treating this."
    },
    disclaimer: { 
      type: Type.STRING,
      description: "Standard AI disclaimer."
    },
  },
  required: ["isValidPlant", "isBlurry", "issue", "explanation", "remedies", "prevention", "forecast", "impactStats", "disclaimer"],
};

export const analyzePlantImage = async (
  imageBase64: string,
  userNotes: string,
  language: Language
): Promise<AnalysisResult> => {
  
  const prompt = `
    You are FarmLens, an expert AI plant pathologist and sustainable agriculture advisor.
    
    Task: Analyze the provided image of a plant/crop.
    
    Context from user: "${userNotes}"
    Output Language: ${language}
    
    Instructions:
    1. First, verify if the image contains a plant or crop. If not, set 'isValidPlant' to false.
    2. Check image quality. If too blurry to diagnose, set 'isBlurry' to true.
    3. If valid and clear:
       - Identify the issue (disease, pest, deficiency).
       - IMPORTANT: If the plant looks healthy, set 'issue' to 'Healthy Plant' and provide 'Maintenance Tips' in the 'remedies' array instead of cures.
       - Provide a detailed explanation of the condition.
       - List step-by-step sustainable, eco-friendly remedies (e.g., organic sprays, mulch, manual removal).
       - List prevention tips (e.g., crop rotation, spacing).
       - Provide a growth forecast.
       - Include specific impact stats related to SDG 2 (Zero Hunger) or crop yield protection.
  `;

  try {
    const response = await ai.models.generateContent({
      model: ANALYSIS_MODEL,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: imageBase64
            }
          },
          {
            text: prompt
          }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: analysisSchema,
        thinkingConfig: { thinkingBudget: 2048 } 
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};

export const generateAudio = async (text: string, language: Language): Promise<ArrayBuffer> => {
  try {
    // Select a voice based on language
    const voiceName = language === Language.SWAHILI ? 'Puck' : 'Kore'; 

    const response = await ai.models.generateContent({
      model: TTS_MODEL,
      contents: {
        parts: [{ text: text }]
      },
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
    if (!base64Audio) throw new Error("No audio generated");

    // Decode base64 to ArrayBuffer
    const binaryString = atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  } catch (error) {
    console.error("TTS generation failed:", error);
    throw error;
  }
};
