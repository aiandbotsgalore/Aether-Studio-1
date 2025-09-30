import { Injectable } from '@angular/core';
import { GoogleGenAI } from '@google/genai';

@Injectable({ providedIn: 'root' })
export class GuidanceService {
  private readonly ai: GoogleGenAI;

  constructor() {
    if (!process.env.API_KEY) {
      throw new Error("API_KEY environment variable not set");
    }
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async getGuidance(scriptText: string): Promise<string> {
    const model = 'gemini-2.5-flash';
    const systemInstruction = `You are an encouraging but sharp script doctor AI. Your user is writing a script. Analyze their text and provide ONE short, actionable piece of feedback (2-3 sentences max) to improve its cinematic potential. Focus on a single concept, such as:
- Adding more sensory details (what do we see, hear, smell?).
- Improving pacing or rhythm.
- Strengthening the visual storytelling.
- Clarifying a character's intent.
Do not be generic. Be specific to their text. Your tone is that of a creative partner.`;

    const response = await this.ai.models.generateContent({
      model,
      contents: scriptText,
      config: {
        systemInstruction,
        temperature: 0.8,
        maxOutputTokens: 100,
        thinkingConfig: { thinkingBudget: 50 },
      }
    });

    return response.text.trim();
  }
}
