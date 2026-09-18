import { getModelSpec } from '../registry/catalog';
import type { ExtractedTokenUsage, CostCalculationResult } from './types';

// Conservative fallback rates if model is not registered ($15/1M in, $60/1M out)
const DEFAULT_FALLBACK_INPUT_RATE = 15.0;
const DEFAULT_FALLBACK_OUTPUT_RATE = 60.0;

// Standard prompt cache read discount: 50% off standard input rate
const CACHE_READ_DISCOUNT_FACTOR = 0.5;

/**
 * Calculates exact sub-cent dollar costs for a completed model execution.
 * Pulls rates dynamically from MODEL_CATALOG, computing input, output, and cache read costs.
 */
export function calculateModelCost(
  modelId: string,
  usage: ExtractedTokenUsage
): CostCalculationResult {
  const spec = getModelSpec(modelId);

  const inputRate = spec ? spec.inputCostPerMillion : DEFAULT_FALLBACK_INPUT_RATE;
  const outputRate = spec ? spec.outputCostPerMillion : DEFAULT_FALLBACK_OUTPUT_RATE;
  const cacheRate = inputRate * CACHE_READ_DISCOUNT_FACTOR;

  // Compute raw floating point dollar amounts
  const rawInputCost = (usage.inputTokens / 1_000_000) * inputRate;
  const rawOutputCost = (usage.outputTokens / 1_000_000) * outputRate;
  const rawCacheCost = (usage.cacheReadTokens / 1_000_000) * cacheRate;
  const rawTotalCost = rawInputCost + rawOutputCost + rawCacheCost;

  // Round with 6 decimal places (micro-dollar precision matching numeric(12, 6) in DB)
  return {
    inputCostUsd: Number(rawInputCost.toFixed(6)),
    outputCostUsd: Number(rawOutputCost.toFixed(6)),
    cacheReadCostUsd: Number(rawCacheCost.toFixed(6)),
    totalCostUsd: Number(rawTotalCost.toFixed(6)),
  };
}
