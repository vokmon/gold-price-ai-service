// supabase-edge/supabase/functions/gold-price/ai/google-ai.service.ts

import {
  GoogleGenerativeAI,
  GenerativeModel,
  HarmCategory,
  HarmBlockThreshold,
  GenerationConfig,
  SafetySetting,
} from "https://esm.sh/@google/generative-ai";

export interface GoogleAIConfig {
  modelName?: string;
  maxOutputTokens?: number;
  temperature?: number;
  topP?: number;
  topK?: number;
  customApiKey?: string;
}

export class GoogleAIService {
  private static instance: GoogleAIService;
  private googleAI: GoogleGenerativeAI;
  private model: GenerativeModel | null = null;
  private modelName: string;
  private generationConfig: GenerationConfig;
  private safetySettings: SafetySetting[];

  private constructor(config?: GoogleAIConfig) {
    const apiKey = config?.customApiKey || Deno.env.get("GOOGLE_API_KEY");
    if (!apiKey) {
      throw new Error("GOOGLE_API_KEY is not set in environment variables");
    }

    this.googleAI = new GoogleGenerativeAI(apiKey);
    this.modelName =
      config?.modelName ||
      Deno.env.get("GOOGLE_AI_MODEL") ||
      "gemini-2.0-flash";

    this.generationConfig = {
      maxOutputTokens: config?.maxOutputTokens || 8192,
      temperature: config?.temperature ?? 1.0,
      topP: config?.topP ?? 0.95,
      topK: config?.topK,
    };

    this.safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
    ];
  }

  /**
   * Get the singleton instance of GoogleAIService
   */
  public static getInstance(config?: GoogleAIConfig): GoogleAIService {
    if (!GoogleAIService.instance) {
      GoogleAIService.instance = new GoogleAIService(config);
    }
    return GoogleAIService.instance;
  }

  /**
   * Create a new instance with different configurations
   */
  public static createInstance(config?: GoogleAIConfig): GoogleAIService {
    return new GoogleAIService(config);
  }

  /**
   * Update configuration
   */
  public updateConfig(config: Partial<GoogleAIConfig>): void {
    if (config.modelName) {
      this.modelName = config.modelName;
      this.model = null; // Reset model to force recreation with new name
    }

    if (
      config.maxOutputTokens !== undefined ||
      config.temperature !== undefined ||
      config.topP !== undefined ||
      config.topK !== undefined
    ) {
      this.generationConfig = {
        ...this.generationConfig,
        maxOutputTokens:
          config.maxOutputTokens ?? this.generationConfig.maxOutputTokens,
        temperature: config.temperature ?? this.generationConfig.temperature,
        topP: config.topP ?? this.generationConfig.topP,
        topK: config.topK ?? this.generationConfig.topK,
      };

      this.model = null; // Reset model to force recreation with new config
    }

    if (config.customApiKey) {
      this.googleAI = new GoogleGenerativeAI(config.customApiKey);
      this.model = null; // Reset model to force recreation with new API key
    }
  }

  /**
   * Get the generative model instance
   */
  private getModel(): GenerativeModel {
    if (!this.model) {
      this.model = this.googleAI.getGenerativeModel({
        model: this.modelName,
        generationConfig: this.generationConfig,
        safetySettings: this.safetySettings,
      });
    }
    return this.model;
  }

  /**
   * Generate content using a template and context
   */
  public async generateFromTemplate(
    promptTemplate: string,
    context: Record<string, unknown>
  ): Promise<any> {
    // Fill the template with context values
    let filledPrompt = promptTemplate;
    for (const [key, value] of Object.entries(context)) {
      filledPrompt = filledPrompt.replace(
        new RegExp(`{${key}}`, "g"),
        String(value)
      );
    }

    return this.generate(filledPrompt);
  }

  /**
   * Generate content from a direct prompt
   */
  public async generate(prompt: string): Promise<any> {
    try {
      const model = this.getModel();
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      try {
        // Extract JSON content even if wrapped in markdown code blocks
        let jsonText = text;

        // Check if the content is wrapped in markdown code blocks
        const jsonCodeBlockRegex = /```(?:json)?\s*\n([\s\S]*?)\n```/;
        const match = text.match(jsonCodeBlockRegex);

        if (match && match[1]) {
          jsonText = match[1];
        }

        // Check if the content is valid JSON
        jsonText = jsonText.trim();
        if (jsonText.startsWith("{") && jsonText.endsWith("}")) {
          return JSON.parse(jsonText);
        }
        return text;
      } catch (error) {
        console.error("Error parsing JSON response:", error);
        return text;
      }
    } catch (error) {
      console.error("Error generating content:", error);
      throw error;
    }
  }
}
