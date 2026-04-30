export function formatRelative(iso: string): string {
  const target = new Date(iso).getTime();
  if (Number.isNaN(target)) return iso;

  const now = Date.now();
  const diffMs = now - target;
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return "ora";

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} minuti fa`;

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} ore fa`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} giorni fa`;

  return new Date(iso).toISOString().slice(0, 10);
}
