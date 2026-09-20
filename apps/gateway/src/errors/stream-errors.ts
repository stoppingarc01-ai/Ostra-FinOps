export interface GatewayErrorPayload {
  error: {
    message: string;
    type: string;
    param: string | null;
    code: string;
  };
}

export class StreamError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly errorType: string;

  constructor(message: string, code: string, statusCode = 500, errorType = 'stream_error') {
    super(message);
    this.name = 'StreamError';
    this.code = code;
    this.statusCode = statusCode;
    this.errorType = errorType;
  }

  public toOpenAiPayload(): GatewayErrorPayload {
    return {
      error: {
        message: this.message,
        type: this.errorType,
        param: null,
        code: this.code,
      },
    };
  }
}

export function createStreamInterruptedError(): StreamError {
  return new StreamError(
    'Upstream stream interrupted mid-generation. Response terminated to prevent corruption.',
    'OSTRAOPS_STREAM_INTERRUPTED',
    502,
    'stream_interrupted_error'
  );
}

export function createFailoverExhaustedError(attempts: number): StreamError {
  return new StreamError(
    `All upstream failover attempts exhausted (${attempts} attempts failed).`,
    'OSTRAOPS_FAILOVER_EXHAUSTED',
    503,
    'failover_exhausted_error'
  );
}

export function createClientAbortedError(): StreamError {
  return new StreamError(
    'Client connection closed before response completed.',
    'OSTRAOPS_CLIENT_ABORTED',
    499,
    'client_closed_request'
  );
}
