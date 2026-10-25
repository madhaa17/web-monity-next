/** Colors offered in the category color picker; also the fallback for categories without one. */
export const CATEGORY_PALETTE = [
  "#EF4444",
  "#F97316",
  "#EAB308",
  "#22C55E",
  "#14B8A6",
  "#0EA5E9",
  "#6366F1",
  "#A855F7",
  "#EC4899",
  "#64748B",
] as const;

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** The category's own color, or a stable palette color derived from its uuid/name. */
export function categoryColor(category: { color?: string | null; uuid?: string; name?: string }): string {
  if (category.color) return category.color;
  return CATEGORY_PALETTE[hash(category.uuid ?? category.name ?? "") % CATEGORY_PALETTE.length];
}
