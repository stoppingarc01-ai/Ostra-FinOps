/**
 * Production-grade token estimator and usage extractor for OpenAI and Anthropic formats.
 * Replaces naive `length / 4` with structure-aware BPE approximation accounting for:
 * - Message framing overhead (<|im_start|>{role}\n{content}<|im_end|>)
 * - Tool calling schemas & function arguments
 * - Code & JSON density (~3.0 chars/token vs 4.0 for English prose)
 */

export function estimateTextTokens(text: string): number {
  if (!text || typeof text !== 'string') return 0;
  const len = text.length;
  if (len === 0) return 0;

  // Code, JSON, and indentation have higher token density (~3.0 - 3.2 chars/token)
  // Check if content is dense JSON or code (contains braces, indentation, or operators)
  const isCodeOrJson = /[{}[\]:;,=><_\n\t]/.test(text);
  const charsPerToken = isCodeOrJson ? 3.2 : 3.8;

  // Count word boundaries and whitespace chunks
  const words = text.trim().split(/\s+/).length;
  const charEstimate = Math.ceil(len / charsPerToken);

  // Return realistic token approximation
  return Math.max(1, Math.round((charEstimate + words) / 2));
}

export function estimateMessageTokens(messages: any[] | undefined, tools?: any[]): number {
  if (!messages || !Array.isArray(messages)) return 0;

  let totalTokens = 3; // Priming assistant response (<|im_start|>assistant<|im_sep|>)

  for (const msg of messages) {
    if (!msg || typeof msg !== 'object') continue;

    // Per-message framing overhead: <|im_start|> + role + content + <|im_end|> = 4 tokens
    totalTokens += 4;

    // 1. Role token
    if (msg.role) {
      totalTokens += Math.max(1, Math.ceil(String(msg.role).length / 3));
    }

    // 2. Content tokens
    if (typeof msg.content === 'string') {
      totalTokens += estimateTextTokens(msg.content);
    } else if (Array.isArray(msg.content)) {
      for (const part of msg.content) {
        if (!part) continue;
        if (part.type === 'text' && typeof part.text === 'string') {
          totalTokens += estimateTextTokens(part.text);
        } else if (part.type === 'image_url' || part.type === 'image') {
          // Standard low-res image token cost
          totalTokens += 85;
        } else if (part.type === 'tool_use' || part.type === 'tool_result') {
          totalTokens += estimateTextTokens(JSON.stringify(part));
        }
      }
    }

    // 3. Tool calls in message (assistant calling tools)
    if (Array.isArray(msg.tool_calls)) {
      for (const tc of msg.tool_calls) {
        totalTokens += 8; // Tool call wrapper
        if (tc.function?.name) totalTokens += estimateTextTokens(tc.function.name);
        if (tc.function?.arguments) totalTokens += estimateTextTokens(tc.function.arguments);
      }
    }

    // 4. Function call legacy format
    if (msg.function_call) {
      totalTokens += estimateTextTokens(JSON.stringify(msg.function_call));
    }
  }

  // 5. Tools schemas overhead
  if (Array.isArray(tools) && tools.length > 0) {
    totalTokens += 10; // Tool definitions header
    for (const tool of tools) {
      const toolStr = JSON.stringify(tool);
      // Function definition schema tokens
      totalTokens += Math.max(12, Math.ceil(toolStr.length / 3.4));
    }
  }

  return totalTokens;
}

export interface StreamingDeltaExtraction {
  textDelta: string;
  inputTokens?: number;
  outputTokens?: number;
  routedModel?: string;
}

/**
 * Extracts text delta (including tool calls and partial json) and ground-truth usage
 * from an incoming Server-Sent Event (SSE) data chunk.
 */
export function extractStreamingChunk(
  dataObj: any,
  provider: 'openai' | 'anthropic'
): StreamingDeltaExtraction {
  let textDelta = '';
  let inputTokens: number | undefined = undefined;
  let outputTokens: number | undefined = undefined;
  let routedModel: string | undefined = undefined;

  if (!dataObj || typeof dataObj !== 'object') {
    return { textDelta };
  }

  if (dataObj.model) {
    routedModel = String(dataObj.model);
  }

  if (provider === 'openai') {
    // 1. Ground truth usage frame (from stream_options: { include_usage: true })
    if (dataObj.usage) {
      if (typeof dataObj.usage.prompt_tokens === 'number') {
        inputTokens = dataObj.usage.prompt_tokens;
      }
      if (typeof dataObj.usage.completion_tokens === 'number') {
        outputTokens = dataObj.usage.completion_tokens;
      }
    }

    // 2. Choice delta
    const choice = dataObj.choices?.[0];
    if (choice?.delta) {
      // Standard content delta
      if (typeof choice.delta.content === 'string') {
        textDelta += choice.delta.content;
      }

      // Tool call delta (CRITICAL: autonomous agents stream tool arguments here!)
      if (Array.isArray(choice.delta.tool_calls)) {
        for (const tc of choice.delta.tool_calls) {
          if (tc.function?.name) {
            textDelta += ` ${tc.function.name} `;
          }
          if (tc.function?.arguments) {
            textDelta += tc.function.arguments;
          }
        }
      }

      // Refusal / reasoning content (o1 / o3 / DeepSeek reasoner)
      if (typeof choice.delta.reasoning_content === 'string') {
        textDelta += choice.delta.reasoning_content;
      }
    }
  } else {
    // Anthropic Format
    if (dataObj.type === 'message_start' && dataObj.message) {
      if (dataObj.message.model) routedModel = dataObj.message.model;
      if (typeof dataObj.message.usage?.input_tokens === 'number') {
        inputTokens = dataObj.message.usage.input_tokens;
      }
    }

    if (dataObj.type === 'message_delta') {
      if (typeof dataObj.usage?.output_tokens === 'number') {
        outputTokens = dataObj.usage.output_tokens;
      }
    }

    if (dataObj.type === 'content_block_delta' && dataObj.delta) {
      if (dataObj.delta.type === 'text_delta' && typeof dataObj.delta.text === 'string') {
        textDelta += dataObj.delta.text;
      } else if (dataObj.delta.type === 'input_json_delta' && typeof dataObj.delta.partial_json === 'string') {
        // Tool arguments partial JSON chunk
        textDelta += dataObj.delta.partial_json;
      } else if (typeof dataObj.delta.thinking === 'string') {
        // Claude 3.7 extended thinking tokens
        textDelta += dataObj.delta.thinking;
      }
    }
  }

  return {
    textDelta,
    inputTokens,
    outputTokens,
    routedModel,
  };
}
