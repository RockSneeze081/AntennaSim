/** Simple blue (low) -> red (high) sequential scale for the gain-lobe surface. */
export function gainToColorHsl(t: number): string {
  const clamped = Math.max(0, Math.min(1, t));
  const hue = 240 - 240 * clamped; // 240=blue -> 0=red
  return `hsl(${hue}, 85%, 55%)`;
}
