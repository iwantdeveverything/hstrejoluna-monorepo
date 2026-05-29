import React from 'react';

/**
 * Extracts plain text from a Sanity Portable Text block array.
 * Handles null/undefined gracefully — returns empty string.
 */
interface PortableTextBlock {
  _type?: string;
  children?: { text?: string }[];
}

export const blockToPlainText = (blocks: unknown): string => {
  if (!blocks || !Array.isArray(blocks)) {
    return typeof blocks === 'string' ? String(blocks) : '';
  }
  return blocks
    .filter((b: unknown): b is PortableTextBlock => 
      typeof b === 'object' && 
      b !== null && 
      '_type' in b && 
      (b as Record<string, unknown>)._type === 'block' && 
      'children' in b
    )
    .map((b: PortableTextBlock) => b.children?.map((c) => c.text || '').join('') || '')
    .join('\n');
};

export const DEFAULT_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://hstrejoluna.com";

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function extractTextFromReactNode(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(extractTextFromReactNode).join("");
  }
  if (React.isValidElement(node)) {
    const props = node.props as { children?: React.ReactNode };
    return extractTextFromReactNode(props.children);
  }
  return "";
}
