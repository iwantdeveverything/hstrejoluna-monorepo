/**
 * Minimal class-name composer for the @hstrejoluna/ui primitives.
 *
 * Contract:
 * - Filters falsy inputs (undefined, null, false, "").
 * - Splits each input on whitespace and deduplicates exact tokens
 *   so the rendered class list contains caller classes alongside
 *   internal classes with NO duplication (LiquidGlass spec S1.4).
 *
 * Note: this is a deliberately small helper. The primitives in this package
 * drive most styling via `data-*` attributes (see ADR-7), so we do not need
 * the full power of `clsx + tailwind-merge` here. If the package later
 * grows class-driven variants with caller overrides, swap this for those
 * libraries — the public signature accepts the same shape of arguments.
 */
export type ClassValue = string | false | null | undefined;

export const cn = (...values: ClassValue[]): string => {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    if (!value) continue;
    for (const token of value.split(/\s+/)) {
      if (!token) continue;
      if (seen.has(token)) continue;
      seen.add(token);
      result.push(token);
    }
  }

  return result.join(" ");
};
