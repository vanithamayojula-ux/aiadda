import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface AITool {
  id?: number;
  name: string;
  category: string;
  description: string;
  url: string;
  tags: string;
  created_at?: string;
}

export async function suggestAIDetails(name: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide details for an AI tool named "${name}". Return a JSON object with category, description, and suggested tags.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            description: { type: Type.STRING },
            tags: { type: Type.STRING, description: "Comma separated tags" },
          },
          required: ["category", "description", "tags"],
        },
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error suggesting AI details:", error);
    return null;
  }
}
