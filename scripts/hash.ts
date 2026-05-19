function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export interface CharParams {
  tubeColor: string;
  tubeHighlight: string;
  yPos: number;
  duration: number;
  beginOffset: number;
  bobDuration: number;
  bobPhase: 'up' | 'down';
}

const TUBE_PALETTE = [
  { main: '#f472b6', highlight: '#fbcfe8' }, // pink
  { main: '#facc15', highlight: '#fef08a' }, // yellow
  { main: '#84cc16', highlight: '#bef264' }, // lime
  { main: '#fb923c', highlight: '#fed7aa' }, // orange
  { main: '#60a5fa', highlight: '#bfdbfe' }, // blue
  { main: '#c084fc', highlight: '#e9d5ff' }, // purple
  { main: '#ef4444', highlight: '#fecaca' }, // red
  { main: '#14b8a6', highlight: '#99f6e4' }, // teal
  { main: '#22d3ee', highlight: '#a5f3fc' }, // cyan
  { main: '#a78bfa', highlight: '#ddd6fe' }, // violet
  { main: '#10b981', highlight: '#a7f3d0' }, // emerald
  { main: '#fb7185', highlight: '#fecdd3' }, // rose
];

export function paramsFor(login: string, index: number, total: number): CharParams {
  const h = hashStr(login);
  const palette = TUBE_PALETTE[h % TUBE_PALETTE.length];
  const yPos = 195 + ((h >> 4) % 26);
  const duration = 30 + ((h >> 8) % 21);
  const bobDuration = 2.2 + (((h >> 12) % 9) / 10);
  const beginOffset = total > 0 ? -(duration * index / total) : 0;
  const bobPhase = ((h >> 16) % 2) === 0 ? 'up' : 'down';
  return {
    tubeColor: palette.main,
    tubeHighlight: palette.highlight,
    yPos,
    duration,
    beginOffset,
    bobDuration,
    bobPhase,
  };
}
