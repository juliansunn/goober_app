import { createDeepSeek, deepseek } from "@ai-sdk/deepseek";
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { OpenAI } from "openai";

export type OpenAIModelId = "gpt-4o" | "gpt-4o-mini";
export type GoogleModelId =
  | "gemini-2.0-flash"
  | "gemini-1.5-flash"
  | "gemini-1.5-flash-001";
export type DeepSeekModelId = "deepseek-chat";

export type ModelProvider = "openai" | "google" | "deepseek";
export type ModelId = OpenAIModelId | GoogleModelId | DeepSeekModelId;

export interface OpenAIModel {
  model: typeof openai;
  modelId: OpenAIModelId;
}

export interface GoogleModel {
  model: typeof google;
  modelId: GoogleModelId;
}

export interface DeepSeekModel {
  model: typeof deepseek;
  modelId: DeepSeekModelId;
}

export type SDKModel = OpenAIModel | GoogleModel | DeepSeekModel;

interface ModelConfig {
  id: ModelId;
  name: string;
  description: string;
  maxTokens: number;
}

interface ProviderConfig {
  provider: ModelProvider;
  apiKey?: string;
  baseUrl?: string;
  models: ModelConfig[];
}

export const providers: ProviderConfig[] = [
  {
    provider: "openai",
    apiKey: process.env.OPENAI_API_KEY,
    models: [
      {
        id: "gpt-4o",
        name: "GPT-4o",
        description: "Best for complex planning and strategy",
        maxTokens: 8192,
      },
      {
        id: "gpt-4o-mini",
        name: "GPT-4o Mini",
        description: "Fast and efficient for simpler tasks",
        maxTokens: 4096,
      },
    ],
  },
  {
    provider: "google",
    apiKey: process.env.GOOGLE_API_KEY,
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/",
    models: [
      {
        id: "gemini-2.0-flash",
        name: "Gemini 2.0 Flash",
        description: "Google's fast and versatile model",
        maxTokens: 8192,
      },
      {
        id: "gemini-1.5-flash",
        name: "Gemini 1.5 Flash",
        description: "Google's fast and versatile model",
        maxTokens: 8192,
      },
    ],
  },
  {
    provider: "deepseek",
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseUrl: "https://api.deepseek.com",
    models: [
      {
        id: "deepseek-chat",
        name: "DeepSeek Chat",
        description: "DeepSeek's conversational model",
        maxTokens: 8192,
      },
    ],
  },
];

export function getProviderForModel(modelId: ModelId): ProviderConfig {
  const provider = providers.find((p) =>
    p.models.some((m) => m.id === modelId)
  );
  if (!provider) {
    throw new Error(`No provider found for model ${modelId}`);
  }
  return provider;
}

export function createClient(modelId: ModelId) {
  const provider = getProviderForModel(modelId);
  return new OpenAI({
    apiKey: provider.apiKey,
    ...(provider.baseUrl && { baseURL: provider.baseUrl }),
  });
}

export function createSDKClient(model: SDKModel) {
  return model.model(model.modelId, {});
}

// Helper function to get model config
export function getModelConfig(modelId: ModelId): ModelConfig {
  const provider = getProviderForModel(modelId);
  const model = provider.models.find((m) => m.id === modelId);
  if (!model) {
    throw new Error(`Model ${modelId} not found`);
  }
  return model;
}

// Helper function to get all available models
export function getAllModels(): ModelConfig[] {
  return providers.flatMap((provider) => provider.models);
}

export const gemini20flashSDKModel: SDKModel = {
  model: google,
  modelId: "gemini-2.0-flash",
};

export const gemeni15flash001SDKModel: SDKModel = {
  model: google,
  modelId: "gemini-1.5-flash-001",
};

export const openAIGPT40MiniSDKModel: SDKModel = {
  model: openai,
  modelId: "gpt-4o-mini",
};

export const openAIGPT40SDKModel: SDKModel = {
  model: openai,
  modelId: "gpt-4o",
};

const customDeepseek = createDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY,
});

export const deepseekChatSDKModel: SDKModel = {
  model: customDeepseek,
  modelId: "deepseek-chat",
};
