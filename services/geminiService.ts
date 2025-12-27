
import { GoogleGenAI, Type } from "@google/genai";
import { LocationData, AIInsight } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getGeoInsights = async (location: LocationData): Promise<AIInsight> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide a short, welcoming summary and one interesting geographical fun fact about the region near these coordinates: Latitude ${location.latitude}, Longitude ${location.longitude}. Keep the tone professional but friendly for a project landing page.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "A brief welcoming summary of the region." },
            funFact: { type: Type.STRING, description: "An interesting fact about this part of the world." }
          },
          required: ["summary", "funFact"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response text");
    return JSON.parse(text) as AIInsight;
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return {
      summary: "You are successfully checked in at your current coordinates.",
      funFact: "Did you know that every point on Earth has a unique story to tell through its coordinates?"
    };
  }
};
