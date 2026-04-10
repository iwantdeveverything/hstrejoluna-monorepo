/**
 * Extracts plain text from a Sanity Portable Text block array.
 * Handles null/undefined gracefully — returns empty string.
 */
export const blockToPlainText = (blocks: unknown): string => {
  if (!blocks || !Array.isArray(blocks)) {
    return typeof blocks === 'string' ? String(blocks) : '';
  }
  return blocks
    .filter((b: any) => b._type === 'block' && b.children)
    .map((b: any) => b.children.map((c: any) => c.text).join(''))
    .join('\n');
};
