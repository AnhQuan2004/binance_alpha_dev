export const volumeLadderData = Array.from({ length: 20 }, (_, i) => {
  const point = i + 1;
  const volume = Math.pow(2, point - 1) * 2;
  return { point, volume };
});

export function getPointFromVolume(volume: number): number | null {
  if (volume <= 0) return null;
  // Formula inversion: point = log2(volume / 2) + 1
  const point = Math.floor(Math.log2(volume / 2) + 1);
  return Math.max(1, point); // Return at least point 1
}
