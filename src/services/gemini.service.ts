import { Injectable, signal } from '@angular/core';
import { GoogleGenAI, GenerateContentResponse, Type } from '@google/genai';
import { BLUEPRINT_SYSTEM_INSTRUCTION, IMAGE_FRAMES_SYSTEM_INSTRUCTION, SUNO_SYSTEM_INSTRUCTION } from './prompts';

/**
 * Defines the structure for a Suno AI audio prompt, including style and lyrics.
 */
export interface SunoPrompt {
  /** A detailed description of the musical style, genre, mood, and instrumentation. */
  style: string;
  /** The lyrics for the song, potentially with structural and sound design cues. */
  lyrics: string;
}

/**
 * Defines the user-configurable options for content generation.
 */
export interface GenerationOptions {
  /** Whether to generate the cinematic blueprint. */
  blueprint: boolean;
  /** Whether to generate the Suno audio prompt. */
  suno: boolean;
  /** Whether to generate the image storyboard prompts. */
  imageFrames: boolean;
}

/**
 * A service for interacting with the Google Gemini API to generate various
 * cinematic assets based on a user's script. It manages the state for
 * API calls, results, and errors.
 */
@Injectable({ providedIn: 'root' })
export class GeminiService {
  private readonly ai: GoogleGenAI;

  /** Signal holding the generated cinematic blueprint as a markdown string. */
  readonly blueprintResult = signal<string>('');
  /** Signal holding the generated Suno audio prompt. */
  readonly sunoResult = signal<SunoPrompt | null>(null);
  /** Signal holding the generated image storyboard prompts as a single string. */
  readonly imageFramesResult = signal<string>('');
  /** Signal indicating whether a generation process is currently in progress. */
  readonly isLoading = signal<boolean>(false);
  /** Signal holding any error message that occurred during generation. */
  readonly error = signal<string | null>(null);

  /**
   * Initializes the GeminiService.
   * @throws {Error} If the API_KEY environment variable is not set.
   */
  constructor() {
    if (!process.env.API_KEY) {
      throw new Error("API_KEY environment variable not set");
    }
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  /**
   * Orchestrates the generation of cinematic assets based on user inputs.
   * It resets the state, then concurrently calls the generation functions
   * for the selected options (blueprint, suno, image frames).
   * @param scriptText The user-provided script to be analyzed.
   * @param options The selected generation tools.
   * @param theme The cinematic theme to guide the generation.
   */
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

  /**
   * Generates a detailed cinematic blueprint from the script.
   * @param scriptText The user's script.
   * @param theme The desired cinematic theme.
   * @private
   */
  private async generateBlueprint(scriptText: string, theme: string): Promise<void> {
    const model = 'gemini-2.5-flash';
    
    const response = await this.ai.models.generateContent({
      model,
      contents: scriptText,
      config: { systemInstruction: BLUEPRINT_SYSTEM_INSTRUCTION(theme) }
    });
    this.blueprintResult.set(response.text);
  }

  /**
   * Generates a structured JSON prompt for the Suno AI music generator.
   * @param scriptText The user's script.
   * @param theme The desired cinematic theme.
   * @private
   */
  private async generateSunoPrompt(scriptText: string, theme: string): Promise<void> {
    const model = 'gemini-2.5-flash';

    const response = await this.ai.models.generateContent({
      model,
      contents: scriptText,
      config: {
        systemInstruction: SUNO_SYSTEM_INSTRUCTION(theme),
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
    
    try {
      this.sunoResult.set(JSON.parse(response.text));
    } catch (e) {
      console.error('[ERROR] Failed to parse Suno JSON response:', response.text, e);
      // Re-throw the error to be caught by the main generate method's catch block
      throw new Error('The AI returned an invalid format for the Suno prompt.');
    }
  }

  /**
   * Generates a sequence of detailed Midjourney prompts for creating a storyboard.
   * @param scriptText The user's script.
   * @param theme The desired cinematic theme.
   * @private
   */
  private async generateImageFrames(scriptText: string, theme: string): Promise<void> {
    const model = 'gemini-2.5-flash';

    const response = await this.ai.models.generateContent({
      model,
      contents: scriptText,
      config: { systemInstruction: IMAGE_FRAMES_SYSTEM_INSTRUCTION(theme) }
    });
    this.imageFramesResult.set(response.text);
  }
}
