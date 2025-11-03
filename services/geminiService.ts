
import { GoogleGenAI } from "@google/genai";

// Assume API_KEY is set in the environment variables
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    // In a real app, you might want to handle this more gracefully.
    // For this context, we assume it's always available.
    console.warn("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const callGemini = async (userPrompt: string, systemInstruction: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ parts: [{ text: userPrompt }] }],
            config: {
                systemInstruction: systemInstruction,
            },
        });
        
        const text = response.text;
        if (text) {
             // Clean up markdown code blocks that the model might return
            return text.replace(/```json/g, '').replace(/```/g, '').trim();
        } else {
             throw new Error("Received an empty response from the API.");
        }

    } catch (error) {
        console.error("Gemini API call failed:", error);
        if (error instanceof Error) {
            throw new Error(`Gemini API Error: ${error.message}`);
        }
        throw new Error("An unknown error occurred while calling the Gemini API.");
    }
};

export const generateJson = async (prompt: string): Promise<string> => {
    const systemInstruction = "You are a JSON generation expert. Based on the user's description, create a valid JSON object or array. Respond ONLY with the raw JSON code. Do not include '```json' or any explanatory text, just the raw JSON.";
    return callGemini(prompt, systemInstruction);
};

export const fixJson = async (brokenJson: string): Promise<string> => {
    const systemInstruction = "The following JSON is invalid or broken. Analyze it, fix any syntax errors (like missing commas, quotes, or brackets), and return the corrected, valid JSON. Respond ONLY with the corrected JSON code block. Do not include '```json' or any explanatory text.";
    return callGemini(brokenJson, systemInstruction);
};

export const explainJson = async (json: string): Promise<string> => {
    const systemInstruction = "You are a JSON data analyst. Briefly explain what the following JSON data represents in one or two sentences. Respond in Vietnamese.";
    return callGemini(json, systemInstruction);
};
