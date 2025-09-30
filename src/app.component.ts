// Fix: Replaced placeholder text with a complete, functional Angular component.
import { Component, ChangeDetectionStrategy, signal, inject, computed } from '@angular/core';
import { GeminiService, GenerationOptions } from './services/gemini.service';
import { GuidanceService } from './services/guidance.service';
import { UtilityService } from './services/utility.service';

@Component({
  selector: 'app-root',
  template: `
    <main class="bg-gray-900 min-h-screen text-gray-200 font-sans p-4 sm:p-6 lg:p-8">
      <div class="max-w-7xl mx-auto">
        
        <header class="text-center mb-8">
          <h1 class="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            Cinematic Script AI Toolkit
          </h1>
          <p class="mt-2 text-lg text-gray-400">Transform your script into a cinematic masterpiece.</p>
        </header>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">

          <!-- Left Column: Inputs -->
          <div class="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 flex flex-col">
            <h2 class="text-2xl font-bold mb-4 text-white">Your Vision</h2>

            <div class="mb-6">
              <label for="script" class="block text-sm font-medium text-gray-300 mb-2">Script / Scene Text</label>
              <textarea id="script"
                        [value]="scriptText()"
                        (input)="onScriptInput($event)"
                        rows="12"
                        class="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200"
                        placeholder="Paste your script here..."></textarea>
            </div>

            <div class="mb-6">
                <label for="theme" class="block text-sm font-medium text-gray-300 mb-2">Cinematic Theme</label>
                <input id="theme"
                       type="text"
                       [value]="theme()"
                       (input)="onThemeInput($event)"
                       class="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200"
                       placeholder="e.g., Cyberpunk Noir, Cosmic Horror, Whimsical Fantasy">
            </div>

            <div class="mb-6">
              <h3 class="text-lg font-semibold mb-3 text-white">Generation Tools</h3>
              <div class="space-y-3">
                <div class="flex items-center">
                  <input id="blueprint" type="checkbox" [checked]="options().blueprint" (change)="onOptionChange('blueprint', $event)" class="h-4 w-4 rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500">
                  <label for="blueprint" class="ml-3 block text-sm font-medium text-gray-300">Cinematic Blueprint</label>
                </div>
                 <div class="flex items-center">
                  <input id="suno" type="checkbox" [checked]="options().suno" (change)="onOptionChange('suno', $event)" class="h-4 w-4 rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500">
                  <label for="suno" class="ml-3 block text-sm font-medium text-gray-300">Suno Audio Prompt</label>
                </div>
                 <div class="flex items-center">
                  <input id="imageFrames" type="checkbox" [checked]="options().imageFrames" (change)="onOptionChange('imageFrames', $event)" class="h-4 w-4 rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500">
                  <label for="imageFrames" class="ml-3 block text-sm font-medium text-gray-300">Image Storyboard Prompts</label>
                </div>
              </div>
            </div>

            <div class="mt-auto flex flex-col sm:flex-row gap-4">
              <button (click)="generate()"
                      [disabled]="!isFormValid() || geminiService.isLoading()"
                      class="w-full sm:w-auto flex-grow px-6 py-3 text-base font-semibold text-white rounded-lg transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                      [class]="isFormValid() && !geminiService.isLoading() ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' : 'bg-gray-600'">
                @if (geminiService.isLoading()) {
                  <span class="flex items-center justify-center">
                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </span>
                } @else {
                  <span>Generate</span>
                }
              </button>
              <button (click)="getGuidance()"
                      [disabled]="!scriptText() || guidanceIsLoading()"
                      class="w-full sm:w-auto px-6 py-3 text-base font-semibold bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                @if (guidanceIsLoading()) {
                  <span class="flex items-center justify-center">
                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Getting Feedback...
                  </span>
                } @else {
                  <span>Get Quick Feedback</span>
                }
              </button>
            </div>
            
            @if (guidance()) {
              <div class="mt-6 p-4 bg-gray-700/50 border border-purple-500/30 rounded-lg">
                <p class="text-sm text-purple-300 font-semibold mb-1">Aether's Advice:</p>
                <p class="text-gray-300 italic">{{ guidance() }}</p>
              </div>
            }
          </div>

          <!-- Right Column: Outputs -->
          <div class="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 min-h-[500px] flex flex-col">
            <h2 class="text-2xl font-bold mb-4 text-white">Generated Assets</h2>
            
            @if (geminiService.isLoading()) {
              <div class="flex-grow flex flex-col items-center justify-center text-center">
                 <svg class="animate-spin h-12 w-12 text-purple-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p class="text-lg font-semibold text-gray-300">Aether is strategizing...</p>
                <p class="text-sm text-gray-400">This can take a moment.</p>
              </div>
            } @else if (geminiService.error()) {
              <div class="flex-grow flex items-center justify-center p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
                <p class="text-red-400 text-center">{{ geminiService.error() }}</p>
              </div>
            } @else {
              <div class="flex-grow space-y-6 overflow-y-auto">
                @if (!geminiService.blueprintResult() && !geminiService.sunoResult() && !geminiService.imageFramesResult()) {
                  <div class="flex-grow flex items-center justify-center">
                    <p class="text-gray-500">Your generated assets will appear here.</p>
                  </div>
                }

                @if (geminiService.blueprintResult(); as blueprint) {
                  <div class="bg-gray-900/50 border border-gray-700 rounded-lg">
                    <div class="flex justify-between items-center p-3 border-b border-gray-700">
                      <h3 class="text-lg font-semibold text-gray-200">Cinematic Blueprint</h3>
                      <div class="flex items-center space-x-2">
                        <button (click)="utilityService.copyToClipboard(blueprint)" title="Copy" class="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" /><path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" /></svg></button>
                        <button (click)="utilityService.downloadAsFile(blueprint, 'blueprint.md')" title="Download" class="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" /></svg></button>
                      </div>
                    </div>
                    <pre class="p-4 max-h-96 overflow-y-auto whitespace-pre-wrap font-mono text-sm">{{ blueprint }}</pre>
                  </div>
                }

                @if (geminiService.sunoResult(); as suno) {
                  <div class="bg-gray-900/50 border border-gray-700 rounded-lg">
                    <div class="flex justify-between items-center p-3 border-b border-gray-700">
                      <h3 class="text-lg font-semibold text-gray-200">Suno Audio Prompt</h3>
                      <div class="flex items-center space-x-2">
                         <button (click)="utilityService.copyToClipboard(sunoJson())" title="Copy JSON" class="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" /><path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" /></svg></button>
                        <button (click)="utilityService.downloadAsFile(sunoJson(), 'suno_prompt.json')" title="Download JSON" class="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" /></svg></button>
                      </div>
                    </div>
                    <div class="p-4 max-h-96 overflow-y-auto font-mono text-sm space-y-4">
                      <div>
                        <p class="text-purple-400 font-semibold text-xs uppercase mb-1">Style:</p>
                        <pre class="whitespace-pre-wrap">{{ suno.style }}</pre>
                      </div>
                      <div>
                        <p class="text-purple-400 font-semibold text-xs uppercase mb-1">Lyrics:</p>
                        <pre class="whitespace-pre-wrap">{{ suno.lyrics }}</pre>
                      </div>
                    </div>
                  </div>
                }

                @if (geminiService.imageFramesResult(); as frames) {
                  <div class="bg-gray-900/50 border border-gray-700 rounded-lg">
                    <div class="flex justify-between items-center p-3 border-b border-gray-700">
                      <h3 class="text-lg font-semibold text-gray-200">Image Storyboard Prompts</h3>
                      <div class="flex items-center space-x-2">
                         <button (click)="utilityService.copyToClipboard(frames)" title="Copy" class="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" /><path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" /></svg></button>
                        <button (click)="utilityService.downloadAsFile(frames, 'image_frames.txt')" title="Download" class="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" /></svg></button>
                      </div>
                    </div>
                    <pre class="p-4 max-h-96 overflow-y-auto whitespace-pre-wrap font-mono text-sm">{{ frames }}</pre>
                  </div>
                }
              </div>
            }
          </div>

        </div>
      </div>
    </main>
  `,
  styles: [`
    :host { 
      display: block; 
    }
    
    .space-y-6.overflow-y-auto::-webkit-scrollbar {
        width: 8px;
    }

    .space-y-6.overflow-y-auto::-webkit-scrollbar-track {
        background: transparent;
    }

    .space-y-6.overflow-y-auto::-webkit-scrollbar-thumb {
        background-color: #4a5568;
        border-radius: 4px;
    }
    
    .space-y-6.overflow-y-auto::-webkit-scrollbar-thumb:hover {
        background-color: #718096;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  readonly geminiService = inject(GeminiService);
  readonly guidanceService = inject(GuidanceService);
  readonly utilityService = inject(UtilityService);

  readonly scriptText = signal<string>('');
  readonly theme = signal<string>('');
  readonly options = signal<GenerationOptions>({
    blueprint: true,
    suno: true,
    imageFrames: true,
  });

  readonly guidance = signal<string>('');
  readonly guidanceIsLoading = signal<boolean>(false);
  
  readonly isFormValid = computed(() => {
    const opts = this.options();
    const hasOption = opts.blueprint || opts.suno || opts.imageFrames;
    return this.scriptText().trim().length > 10 && this.theme().trim().length > 3 && hasOption;
  });

  readonly sunoJson = computed(() => {
    const sunoData = this.geminiService.sunoResult();
    return sunoData ? JSON.stringify(sunoData, null, 2) : '';
  });

  onScriptInput(event: Event): void {
    this.scriptText.set((event.target as HTMLTextAreaElement).value);
  }

  onThemeInput(event: Event): void {
    this.theme.set((event.target as HTMLInputElement).value);
  }

  onOptionChange(option: keyof GenerationOptions, event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.options.update(current => ({ ...current, [option]: isChecked }));
  }

  generate(): void {
    if (!this.isFormValid()) return;
    this.guidance.set('');
    this.geminiService.generate(this.scriptText(), this.options(), this.theme());
  }
  
  async getGuidance(): Promise<void> {
    if (!this.scriptText()) return;
    this.guidanceIsLoading.set(true);
    this.guidance.set('');
    try {
      const feedback = await this.guidanceService.getGuidance(this.scriptText());
      this.guidance.set(feedback);
    } catch (e) {
      console.error('[ERROR] Failed to get guidance:', e);
      this.guidance.set('Sorry, I was unable to get feedback right now.');
    } finally {
      this.guidanceIsLoading.set(false);
    }
  }
}
