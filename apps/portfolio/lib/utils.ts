interface SanityBlock {
  _type: string;
  children?: Array<{
    text: string;
  }>;
}

/**
 * Type guard to verify if an unknown object is a SanityBlock.
 */
function isSanityBlock(block: unknown): block is SanityBlock {
  return (
    typeof block === 'object' &&
    block !== null &&
    '_type' in block &&
    typeof (block as Record<string, unknown>)._type === 'string'
  );
}

/**
 * Extracts plain text from a Sanity Portable Text block array.
 * Handles null/undefined gracefully — returns empty string.
 */
export const blockToPlainText = (blocks: unknown): string => {
  if (!blocks || !Array.isArray(blocks)) {
    return typeof blocks === 'string' ? blocks : '';
  }

  return blocks
    .filter(isSanityBlock)
    .filter((b) => b._type === 'block' && b.children)
    .map((b) => (b.children ?? []).map((c) => c.text).join(''))
    .join('\n');
};

/**
 * Deterministic LCG pseudo-random string generator.
 * Used for consistent background stream generation between server and client.
 */
export const generateDeterministicStream = (seedBase: number, length: number): string => {
  let seed = seedBase * 9301 + 49297;
  const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
  let str = '';
  for (let j = 0; j < length; j++) {
    seed = (seed * 9301 + 49297) % 233280;
    str += chars[seed % chars.length];
  }
  return str;
};
