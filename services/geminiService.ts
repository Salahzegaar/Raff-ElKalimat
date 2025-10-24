import { GoogleGenAI } from "@google/genai";
import { GenerateContentResponse } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getGroundedBookInfo = async (title: string, author: string): Promise<GenerateContentResponse> => {
  const prompt = `Find recent reviews, news, and awards for the book "${title}" by ${author}. Summarize the key information found on the web.`;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{googleSearch: {}}],
      },
    });
    return response;
  } catch (error) {
    console.error("Failed to fetch grounded book info from Gemini:", error);
    throw error;
  }
};

export const generateBookSummary = async (title: string, author: string): Promise<GenerateContentResponse> => {
  const prompt = `Provide a concise summary of the book "${title}" by ${author}. Focus on the main plot points, key characters, and major themes. The summary should be engaging and about 150-200 words long. Do not include any preamble like "Here is a summary".`;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response;
  } catch (error) {
    console.error("Failed to fetch book summary from Gemini:", error);
    throw error;
  }
};

export const getBookReviews = async (title: string, author: string): Promise<GenerateContentResponse> => {
  const prompt = `Find and briefly summarize up to 3 user reviews for the book "${title}" by ${author}. Present them as distinct summaries, separated by a newline. If no significant reviews are found, simply state that.`;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{googleSearch: {}}],
      },
    });
    return response;
  } catch (error) {
    console.error("Failed to fetch book reviews from Gemini:", error);
    throw error;
  }
};