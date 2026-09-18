import type { ExtractedTokenUsage } from './types';

// Standard character-to-token ratio for English/code when tokenizer metadata is unavailable
const CHARS_PER_TOKEN_HEURISTIC = 3.8;

/**
 * Stateful Token Accumulator that inspects stream chunks in real-time, capturing
 * native usage blocks across OpenAI, Anthropic, and Gemini wire protocols while
 * maintaining character accumulation for fallback estimation if streams are severed.
 */
export class StreamTokenAccumulator {
  private inputTokens: number | null = null;
  private outputTokens: number | null = null;
  private cacheReadTokens = 0;
  private accumulatedOutputChars = 0;
  private promptChars = 0;

  constructor(initialPromptTextOrBytes?: string | number) {
    if (typeof initialPromptTextOrBytes === 'string') {
      this.promptChars = initialPromptTextOrBytes.length;
    } else if (typeof initialPromptTextOrBytes === 'number') {
      this.promptChars = initialPromptTextOrBytes;
    }
  }

  /**
   * Ingests a raw SSE or JSON chunk emitted from upstream.
   */
  public ingestChunk(rawChunk: string | Buffer): void {
    const chunkStr = typeof rawChunk === 'string' ? rawChunk : rawChunk.toString('utf8');

    // Accumulate output length for fallback estimation
    this.accumulatedOutputChars += chunkStr.length;

    // Fast-path inspection for usage blocks
    const lines = chunkStr.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;

      const dataStr = trimmed.slice(5).trim();
      if (dataStr === '[DONE]' || dataStr.length === 0) continue;

      try {
        const parsed = JSON.parse(dataStr);

        // 1. OpenAI format: terminal chunk contains "usage"
        if (parsed.usage && typeof parsed.usage === 'object') {
          if (typeof parsed.usage.prompt_tokens === 'number') {
            this.inputTokens = parsed.usage.prompt_tokens;
          }
          if (typeof parsed.usage.completion_tokens === 'number') {
            this.outputTokens = parsed.usage.completion_tokens;
          }
          if (parsed.usage.prompt_tokens_details?.cached_tokens) {
            this.cacheReadTokens = parsed.usage.prompt_tokens_details.cached_tokens;
          }
        }

        // 2. Anthropic format: message_start (input) and message_delta (output)
        if (parsed.type === 'message_start' && parsed.message?.usage) {
          const u = parsed.message.usage;
          if (typeof u.input_tokens === 'number') {
            this.inputTokens = u.input_tokens;
          }
          if (typeof u.cache_read_input_tokens === 'number') {
            this.cacheReadTokens = u.cache_read_input_tokens;
          }
        } else if (parsed.type === 'message_delta' && parsed.usage) {
          if (typeof parsed.usage.output_tokens === 'number') {
            this.outputTokens = parsed.usage.output_tokens;
          }
        }
      } catch {
        // Skip unparseable JSON or partial SSE line buffer
      }
    }
  }

  /**
   * Finalizes the token extraction. If terminal usage was absent or the stream was aborted,
   * falls back to exact character-to-token heuristics.
   */
  public finalize(fallbackPromptChars?: number): ExtractedTokenUsage {
    let finalInput = this.inputTokens;
    let finalOutput = this.outputTokens;
    let isEstimated = false;

    // Fallback prompt tokens if omitted
    if (finalInput === null) {
      isEstimated = true;
      const effectivePromptChars = fallbackPromptChars ?? this.promptChars;
      finalInput = Math.max(1, Math.ceil(effectivePromptChars / CHARS_PER_TOKEN_HEURISTIC));
    }

    // Fallback completion tokens if stream severed or usage missing
    if (finalOutput === null) {
      isEstimated = true;
      finalOutput = Math.max(1, Math.ceil(this.accumulatedOutputChars / CHARS_PER_TOKEN_HEURISTIC));
    }

    return {
      inputTokens: finalInput,
      outputTokens: finalOutput,
      cacheReadTokens: this.cacheReadTokens,
      isEstimated,
    };
  }
}

/**
 * Extracts token usage from a non-streaming JSON completion response.
 */
export function extractUsageFromNonStreamingJson(
  responseJson: Record<string, unknown>,
  fallbackPromptChars?: number
): ExtractedTokenUsage {
  const usage = responseJson.usage as Record<string, unknown> | undefined;

  if (usage) {
    const input = typeof usage.prompt_tokens === 'number' ? usage.prompt_tokens : (usage.input_tokens as number);
    const output = typeof usage.completion_tokens === 'number' ? usage.completion_tokens : (usage.output_tokens as number);
    const cache = typeof usage.cache_read_input_tokens === 'number' ? usage.cache_read_input_tokens : 0;

    if (input !== undefined && output !== undefined) {
      return {
        inputTokens: input,
        outputTokens: output,
        cacheReadTokens: cache,
        isEstimated: false,
      };
    }
  }

  // Fallback heuristic if provider returned no usage object
  const bodyChars = JSON.stringify(responseJson).length;
  return {
    inputTokens: Math.max(1, Math.ceil((fallbackPromptChars || 1000) / CHARS_PER_TOKEN_HEURISTIC)),
    outputTokens: Math.max(1, Math.ceil(bodyChars / CHARS_PER_TOKEN_HEURISTIC)),
    cacheReadTokens: 0,
    isEstimated: true,
  };
}
