const UNITS = ['B', 'KB', 'MB', 'GB'] as const;
const STEP = 1024;

export function formatBytes(bytes: number): string {
  const exponent = Math.min(
    Math.floor(Math.log(Math.max(bytes, 1)) / Math.log(STEP)),
    UNITS.length - 1,
  );
  const value = bytes / STEP ** exponent;
  return exponent === 0
    ? `${bytes} ${UNITS[0]}`
    : `${value.toFixed(1)} ${UNITS[exponent]}`;
}
