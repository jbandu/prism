/**
 * Multi-AI Provider Support
 * Unified interface for Claude (Anthropic), Grok (X.AI), and Gemini (Google)
 */

import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

export type AIProvider = 'claude' | 'grok' | 'gemini';

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  content: string;
  model: string;
  provider: AIProvider;
  tokens_used?: number;
  cost_estimate?: number;
}

export interface AIConfig {
  provider: AIProvider;
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

// Initialize clients
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const gemini = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

// Default models for each provider
const DEFAULT_MODELS = {
  claude: 'claude-sonnet-4-20250514',
  grok: 'grok-2-1212', // Grok 2
  gemini: 'gemini-2.0-flash-exp', // Gemini 2.0 Flash
};

// Cost per 1M tokens (input/output)
const COSTS = {
  claude: { input: 3.0, output: 15.0 }, // Claude Sonnet 4
  grok: { input: 2.0, output: 10.0 }, // Grok 2 (estimated)
  gemini: { input: 0.0, output: 0.0 }, // Gemini 2.0 Flash (free tier)
};

/**
 * Send a prompt to the configured AI provider
 */
export async function callAI(
  prompt: string,
  config: AIConfig = { provider: 'claude' }
): Promise<AIResponse> {
  const provider = config.provider || 'claude';
  const model = config.model || DEFAULT_MODELS[provider];
  const temperature = config.temperature ?? 0;
  const maxTokens = config.max_tokens || 4096;

  switch (provider) {
    case 'claude':
      return await callClaude(prompt, model, temperature, maxTokens);

    case 'grok':
      return await callGrok(prompt, model, temperature, maxTokens);

    case 'gemini':
      return await callGemini(prompt, model, temperature, maxTokens);

    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
}

/**
 * Call Claude (Anthropic)
 */
async function callClaude(
  prompt: string,
  model: string,
  temperature: number,
  maxTokens: number
): Promise<AIResponse> {
  const message = await anthropic.messages.create({
    model,
    max_tokens: maxTokens,
    temperature,
    messages: [{ role: 'user', content: prompt }],
  });

  const content = message.content[0].type === 'text' ? message.content[0].text : '';

  const inputTokens = message.usage.input_tokens;
  const outputTokens = message.usage.output_tokens;
  const cost =
    (inputTokens / 1_000_000) * COSTS.claude.input +
    (outputTokens / 1_000_000) * COSTS.claude.output;

  return {
    content,
    model,
    provider: 'claude',
    tokens_used: inputTokens + outputTokens,
    cost_estimate: cost,
  };
}

/**
 * Call Grok (X.AI)
 * Using OpenAI-compatible API
 */
async function callGrok(
  prompt: string,
  model: string,
  temperature: number,
  maxTokens: number
): Promise<AIResponse> {
  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GROK_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    throw new Error(`Grok API error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;

  const tokensUsed = data.usage?.total_tokens || 0;
  const cost = (tokensUsed / 1_000_000) * ((COSTS.grok.input + COSTS.grok.output) / 2);

  return {
    content,
    model,
    provider: 'grok',
    tokens_used: tokensUsed,
    cost_estimate: cost,
  };
}

/**
 * Call Gemini (Google)
 */
async function callGemini(
  prompt: string,
  model: string,
  temperature: number,
  maxTokens: number
): Promise<AIResponse> {
  if (!gemini) {
    throw new Error('Gemini API key not configured');
  }

  const genAI = gemini.getGenerativeModel({
    model,
    generationConfig: {
      temperature,
      maxOutputTokens: maxTokens,
    },
  });

  const result = await genAI.generateContent(prompt);
  const response = await result.response;
  const content = response.text();

  const tokensUsed = response.usageMetadata?.totalTokenCount || 0;

  return {
    content,
    model,
    provider: 'gemini',
    tokens_used: tokensUsed,
    cost_estimate: 0, // Free tier
  };
}

/**
 * Compare multiple providers for the same prompt
 * Useful for testing or getting consensus
 */
export async function callMultipleProviders(
  prompt: string,
  providers: AIProvider[] = ['claude', 'grok', 'gemini']
): Promise<AIResponse[]> {
  const promises = providers.map(provider =>
    callAI(prompt, { provider }).catch(error => ({
      content: `Error: ${error.message}`,
      model: 'error',
      provider,
      tokens_used: 0,
      cost_estimate: 0,
    }))
  );

  return await Promise.all(promises);
}

/**
 * Get recommended provider based on task type
 */
export function getRecommendedProvider(taskType: string): AIProvider {
  // Cost-sensitive tasks -> Gemini (free)
  if (taskType === 'bulk_analysis' || taskType === 'simple_extraction') {
    return 'gemini';
  }

  // High-quality analysis -> Claude
  if (taskType === 'complex_analysis' || taskType === 'recommendations') {
    return 'claude';
  }

  // Real-time, conversational -> Grok
  if (taskType === 'chat' || taskType === 'quick_response') {
    return 'grok';
  }

  // Default to Claude
  return 'claude';
}

/**
 * Estimate cost for a task
 */
export function estimateTaskCost(
  provider: AIProvider,
  estimatedTokens: number
): number {
  const costs = COSTS[provider];
  const avgCost = (costs.input + costs.output) / 2;
  return (estimatedTokens / 1_000_000) * avgCost;
}
