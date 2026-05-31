/**
 * Generates a 6-digit verification code based on swap request ID and current time.
 * The code changes every 10 seconds.
 */
export function generate6DigitCode(swapId: string, timestampMs: number): string {
  const timeBlock = Math.floor(timestampMs / 10000); // 10-second intervals
  const str = `${swapId}-${timeBlock}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Convert to 32-bit integer
  }
  const code = Math.abs(hash) % 1000000;
  return code.toString().padStart(6, '0');
}

/**
 * Verifies a 6-digit verification code against the current, previous, or next time blocks.
 * This handles network delays and clock skew (±10 seconds).
 */
export function verify6DigitCode(swapId: string, enteredCode: string): boolean {
  if (!enteredCode || enteredCode.length !== 6) return false;
  const now = Date.now();
  
  const codeCurrent = generate6DigitCode(swapId, now);
  const codePrev = generate6DigitCode(swapId, now - 10000);
  const codeNext = generate6DigitCode(swapId, now + 10000);
  
  return enteredCode === codeCurrent || enteredCode === codePrev || enteredCode === codeNext;
}
