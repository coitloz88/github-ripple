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
  { main: '#f472b6', highlight: '#fbcfe8' },
  { main: '#facc15', highlight: '#fef08a' },
  { main: '#84cc16', highlight: '#bef264' },
  { main: '#fb923c', highlight: '#fed7aa' },
  { main: '#60a5fa', highlight: '#bfdbfe' },
  { main: '#c084fc', highlight: '#e9d5ff' },
];

export function paramsFor(login: string, index: number, total: number): CharParams {
  const h = hashStr(login);
  const palette = TUBE_PALETTE[h % TUBE_PALETTE.length];
  const yPos = 195 + ((h >> 4) % 26);
  const duration = 18 + ((h >> 8) % 11);
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
