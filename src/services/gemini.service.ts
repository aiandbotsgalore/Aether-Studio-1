import { Injectable, signal } from '@angular/core';
import { GoogleGenAI, GenerateContentResponse, Type } from '@google/genai';

export interface SunoPrompt {
  style: string;
  lyrics: string;
}

export interface GenerationOptions {
  blueprint: boolean;
  suno: boolean;
  imageFrames: boolean;
}

@Injectable({ providedIn: 'root' })
export class GeminiService {
  private readonly ai: GoogleGenAI;

  readonly blueprintResult = signal<string>('');
  readonly sunoResult = signal<SunoPrompt | null>(null);
  readonly imageFramesResult = signal<string>('');
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  constructor() {
    if (!process.env.API_KEY) {
      throw new Error("API_KEY environment variable not set");
    }
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async generate(scriptText: string, options: GenerationOptions, theme: string): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);
    this.blueprintResult.set('');
    this.sunoResult.set(null);
    this.imageFramesResult.set('');

    try {
      const promises = [];
      if (options.blueprint) {
        promises.push(this.generateBlueprint(scriptText, theme));
      }
      if (options.suno) {
        promises.push(this.generateSunoPrompt(scriptText, theme));
      }
      if (options.imageFrames) {
        promises.push(this.generateImageFrames(scriptText, theme));
      }
      await Promise.all(promises);
    } catch (e) {
      console.error('[ERROR] Error generating content:', e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      this.error.set(`Failed to generate content. Details: ${errorMessage}`);
    } finally {
      this.isLoading.set(false);
    }
  }

  private async generateBlueprint(scriptText: string, theme: string): Promise<void> {
    const model = 'gemini-2.5-flash';
    const systemInstruction = `You are Aether, a master cinematic strategist. Your task is to transform a raw script into a detailed, timestamped cinematic blueprint. The user's chosen theme is "${theme}".

**CRITICAL INSTRUCTIONS:**
1.  **Adopt the Persona:** Begin with a short, in-character paragraph as Aether, acknowledging the user's script and theme.
2.  **Structure:** Format the output in Markdown. Use headings for scenes and bullet points for details.
3.  **Detailed Breakdown:** For each scene, provide:
    *   **Timestamp:** A logical time range (e.g., 00:00 - 00:25).
    *   **Intent:** The psychological goal of the scene.
    *   **Execution:** A shot-by-shot description of camera movements, character actions, and framing. Use bold for camera directions (e.g., **OPEN**, **PULL BACK**, **PUSH IN**).
    *   **Sound Design:** Detailed audio cues, music, and ambient sounds.
    *   **Concept Prompt:** A single, rich Midjourney prompt that captures the essence of the scene.
    *   **Strategic Context:** Explain *why* these choices serve the story's emotional arc.

Analyze the user's script and produce this blueprint.`;
    
    const response = await this.ai.models.generateContent({
      model,
      contents: scriptText,
      config: { systemInstruction }
    });
    this.blueprintResult.set(response.text);
  }

  private async generateSunoPrompt(scriptText: string, theme: string): Promise<void> {
    const model = 'gemini-2.5-flash';
    const systemInstruction = `You are an expert audio producer creating prompts for Suno v5. The user's script needs a score, and the theme is "${theme}". Generate a JSON object with two keys: "style" and "lyrics".

**INSTRUCTIONS:**
1.  **Style Prompt:** Write a detailed style prompt. Describe the genre, mood, instrumentation, and sonic texture, all inspired by the "${theme}" theme. Mention specific frequencies or production techniques.
2.  **Lyrics Prompt:** Convert the script into lyrics suitable for a spoken-word performance.
    *   Use tags like [Spoken Word], [Verse], [Outro].
    *   Add specific sound design cues in parentheses, e.g., (Sound: sub drop 50Hz) or (Sound: metallic drone swells).
    *   Ensure the lyrics capture the core narrative and emotion.
3.  **JSON Output:** The final output MUST be a single, valid JSON object.`;

    const response = await this.ai.models.generateContent({
      model,
      contents: scriptText,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            style: { type: Type.STRING },
            lyrics: { type: Type.STRING }
          }
        }
      }
    });
    
    this.sunoResult.set(JSON.parse(response.text));
  }

  private async generateImageFrames(scriptText: string, theme: string): Promise<void> {
    const model = 'gemini-2.5-flash';
    const systemInstruction = `You are an expert cinematographer and concept artist AI. Your task is to read the following script and generate a series of detailed, sequential Midjourney prompts to visualize every key shot.

The user's theme is: "${theme}". Infuse all prompts with this theme.

**CRITICAL INSTRUCTIONS:**
1.  **Sequential Breakdown:** Analyze the script chronologically. Identify every distinct camera action, character expression, or significant visual moment. Each of these is a separate shot.
2.  **Generate a Prompt for EVERY Shot:** Do not summarize. Create a unique, detailed Midjourney v6 prompt for each individual shot you identify.
3.  **Rich Prompt Detail:** Each prompt must be a rich, descriptive paragraph including:
    *   **Shot Type:** (e.g., extreme close-up, medium shot, wide shot, dutch angle, dolly-zoom).
    *   **Subject & Action:** Describe the character's specific action and emotional expression.
    *   **Cinematic Lighting:** (e.g., chiaroscuro, high-contrast, volumetric lighting, film noir, soft-light).
    *   **Environment & Mood:** Describe the background, weather, and overall atmosphere, reflecting the theme.
    *   **Style:** (e.g., cinematic, photorealistic, gritty, hyper-detailed, film grain).
    *   **Parameters:** End with "--ar 16:9 --style raw".
4.  **Formatting:** Present the output as a numbered list. Each item must represent a single shot. Start with "Shot 1:", "Shot 2:", etc.

**Example Format:**
Shot 1: A TIGHT CLOSE-UP on the speaker's eyes.
Midjourney Prompt: Cinematic extreme close-up of a weary but intensely focused man's eyes, looking directly into the lens. The background is soft-focused, with moody rain streaks on glass reflecting blurred city lights. High-contrast film noir lighting casts deep shadows. Photorealistic, hyper-detailed, capturing the profound weight of his secrets. --ar 16:9 --style raw

Now, analyze the following script and generate the prompts.`;

    const response = await this.ai.models.generateContent({
      model,
      contents: scriptText,
      config: { systemInstruction }
    });
    this.imageFramesResult.set(response.text);
  }
}
