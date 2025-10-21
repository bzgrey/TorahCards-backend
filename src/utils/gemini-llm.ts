/**
 * LLM Integration Module
 * @description This module provides an interface to interact with the Gemini LLM API.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

export class GeminiLLM {
  constructor() {
  }

  async executeLLM(prompt: string): Promise<string> {
    try {
      // Initialize Gemini AI
      const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
      const GEMINI_MODEL = Deno.env.get("GEMINI_MODEL");
      if (GEMINI_API_KEY === undefined) {
        throw new Error("Missing GEMINI_API_KEY");
      }
      if (GEMINI_MODEL === undefined) throw new Error("Missing GEMINI_MODEL");
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: GEMINI_MODEL,
        generationConfig: {
          maxOutputTokens: 6000,
        },
      });
      // Execute the LLM
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      return text;
    } catch (error) {
      console.error("❌ Error calling Gemini API:", (error as Error).message);
      throw error;
    }
  }
}
