import type { ModelSpec } from '../registry/types';

export type StreamingState =
  | 'PRE_RESPONSE'
  | 'MID_STREAM'
  | 'COMPLETED'
  | 'ABORTED'
  | 'ERROR';

export interface RequestIdentity {
  requestId: string;
  organizationId: string;
  virtualKeyId: string;
}

export interface UpstreamDispatchResult {
  statusCode: number;
  headers: Record<string, string>;
  isStream: boolean;
  stream?: AsyncIterable<Buffer | string>;
  body?: string;
}

export type UpstreamDispatcher = (
  targetModel: ModelSpec,
  payload: Record<string, unknown>,
  signal: AbortSignal
) => Promise<UpstreamDispatchResult>;

export interface PipelineOptions {
  identity: RequestIdentity;
  initialModel: ModelSpec;
  payload: Record<string, unknown>;
  isStreaming: boolean;
  clientSignal: AbortSignal;
  upstreamDispatcher: UpstreamDispatcher;
  maxFailoverAttempts?: number;
  onChunk?: (chunk: Buffer | string) => void;
  onResponseCompleted?: (result: { statusCode: number; headers: Record<string, string>; body?: string }) => void;
}

export interface PipelineResult {
  finalState: StreamingState;
  routedModelId: string;
  failoverAttempts: number;
  outputClamped: boolean;
  error?: Error;
}
