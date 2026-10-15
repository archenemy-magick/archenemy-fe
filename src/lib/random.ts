/**
 * Fair random integers for game utilities. Uses the browser's cryptographic
 * generator and rejection sampling, so every face is exactly equally likely
 * (a plain `% n` or Math.random() can be very slightly biased).
 */
export type RandomInt = (maxExclusive: number) => number;

export const randomInt: RandomInt = (maxExclusive) => {
  if (!Number.isInteger(maxExclusive) || maxExclusive < 1) {
    throw new Error(`randomInt needs a positive integer, got ${maxExclusive}`);
  }
  const range = 2 ** 32;
  // Largest multiple of maxExclusive below 2^32; values above it are redrawn.
  const limit = range - (range % maxExclusive);
  const buffer = new Uint32Array(1);
  for (;;) {
    crypto.getRandomValues(buffer);
    if (buffer[0] < limit) return buffer[0] % maxExclusive;
  }
};
