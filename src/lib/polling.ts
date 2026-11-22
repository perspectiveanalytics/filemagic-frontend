const MAX_POLL_TIMEOUT = 60 * 60 * 1000;

/** Include the server's queue wait and processing budget when available. */
export function jobPollingTimeout(timeoutSeconds: unknown, fallbackMs: number): number {
  if (typeof timeoutSeconds !== 'number' || !Number.isFinite(timeoutSeconds) || timeoutSeconds <= 0) {
    return fallbackMs;
  }
  return Math.min(Math.ceil(timeoutSeconds * 1000), MAX_POLL_TIMEOUT);
}
