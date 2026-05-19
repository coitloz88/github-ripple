import type { Contributor } from './fetch-contributors.js';
import { paramsFor } from './hash.js';

export interface ContributorWithAvatar extends Contributor {
  avatarDataUri: string;
}

export interface BuildOpts {
  cycleOffsetSec: number;
}

const CYCLE_DUR = 120;
const KEY_TIMES = '0;0.25;0.5;0.75;1';

// keyframes: night → dawn → day → sunset → night
const PALETTE = {
  sky:   ['#0b1538', '#fbcfe8', '#bae6fd', '#fdba74', '#0b1538'],
  ocean: ['#061235', '#4338ca', '#0c4a6e', '#7c2d12', '#061235'],
  back:  ['#1e3a8a', '#6366f1', '#0ea5e9', '#f97316', '#1e3a8a'],
  mid:   ['#1e293b', '#4f46e5', '#0369a1', '#c2410c', '#1e293b'],
  front: ['#0f172a', '#3730a3', '#075985', '#9a3412', '#0f172a'],
  tube:  ['#1e3a8a', '#6366f1', '#38bdf8', '#fb923c', '#1e3a8a'],
} as const;

const STARS: ReadonlyArray<readonly [number, number, number]> = [
  [40, 22, 1.2], [78, 38, 0.9], [120, 18, 1.4], [180, 45, 0.8], [225, 28, 1.1],
  [280, 60, 1.0], [320, 35, 1.3], [410, 22, 0.9], [455, 50, 1.1], [510, 35, 1.2],
  [555, 18, 0.8], [625, 35, 1.0], [665, 25, 1.3],
  [200, 90, 0.9], [350, 110, 1.0], [475, 90, 1.2], [580, 110, 0.8],
];

function animFill(values: readonly string[], offset: number): string {
  return `<animate attributeName="fill" values="${values.join(';')}" keyTimes="${KEY_TIMES}" dur="${CYCLE_DUR}s" begin="${(-offset).toFixed(1)}s" repeatCount="indefinite"/>`;
}

function animOpacity(values: readonly number[], offset: number): string {
  return `<animate attributeName="opacity" values="${values.join(';')}" keyTimes="${KEY_TIMES}" dur="${CYCLE_DUR}s" begin="${(-offset).toFixed(1)}s" repeatCount="indefinite"/>`;
}

function buildBackground(offset: number): string {
  const stars = STARS.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#ffffff"/>`).join('');
  return `<rect width="680" height="180" fill="#bae6fd">${animFill(PALETTE.sky, offset)}</rect>
<g opacity="0">${animOpacity([0, 0.4, 1, 0.7, 0], offset)}
  <circle cx="600" cy="55" r="22" fill="#fde68a"/>
  <circle cx="600" cy="55" r="13" fill="#fef3c7"/>
</g>
<g opacity="1">${animOpacity([1, 0.3, 0, 0.2, 1], offset)}
  <circle cx="90" cy="50" r="18" fill="#e2e8f0"/>
  <circle cx="84" cy="44" r="4" fill="#cbd5e1"/>
  <circle cx="96" cy="55" r="3" fill="#cbd5e1"/>
  <circle cx="98" cy="46" r="2" fill="#cbd5e1"/>
</g>
<g opacity="0">${animOpacity([1, 0, 0, 0, 1], offset)}${stars}</g>
<g fill="#ffffff" opacity="0.5">${animOpacity([0.15, 0.7, 1, 0.9, 0.15], offset)}
  <ellipse cx="200" cy="48" rx="20" ry="8"/>
  <ellipse cx="225" cy="42" rx="18" ry="11"/>
  <ellipse cx="250" cy="50" rx="22" ry="9"/>
</g>
<g fill="#ffffff" opacity="0.5">${animOpacity([0.1, 0.6, 0.9, 0.8, 0.1], offset)}
  <ellipse cx="430" cy="35" rx="16" ry="6"/>
  <ellipse cx="447" cy="32" rx="13" ry="8"/>
  <ellipse cx="462" cy="36" rx="14" ry="6"/>
</g>
<rect y="180" width="680" height="110" fill="#0c4a6e">${animFill(PALETTE.ocean, offset)}</rect>`;
}

function buildBackWave(offset: number): string {
  return `<g>
  <animateTransform attributeName="transform" type="translate" values="0,0;-340,0" dur="18s" repeatCount="indefinite"/>
  <path d="M0,185 Q85,178 170,185 T340,185 T510,185 T680,185 T850,185 T1020,185 T1190,185 T1360,185 L1360,215 L0,215 Z" fill="#0ea5e9">${animFill(PALETTE.back, offset)}</path>
</g>`;
}

function buildMidWave(offset: number): string {
  return `<g>
  <animateTransform attributeName="transform" type="translate" values="0,0;-272,0" dur="11s" repeatCount="indefinite"/>
  <path d="M0,225 Q68,215 136,225 T272,225 T408,225 T544,225 T680,225 T816,225 T952,225 T1088,225 T1224,225 T1360,225 L1360,250 L0,250 Z" fill="#0369a1">${animFill(PALETTE.mid, offset)}</path>
</g>`;
}

function buildFrontWave(offset: number): string {
  return `<g>
  <animateTransform attributeName="transform" type="translate" values="0,0;-204,0" dur="7s" repeatCount="indefinite"/>
  <path d="M0,253 Q51,247 102,253 T204,253 T306,253 T408,253 T510,253 T612,253 T714,253 T816,253 T918,253 T1020,253 T1122,253 T1224,253 T1326,253 L1326,290 L0,290 Z" fill="#075985">${animFill(PALETTE.front, offset)}</path>
</g>`;
}

const DEFS = `<defs>
  <clipPath id="ac">
    <circle cx="0" cy="-14" r="15"/>
  </clipPath>
</defs>`;

const EMPTY_OCEAN = `<text x="340" y="140" font-family="monospace" font-size="12" fill="#ffffff" text-anchor="middle" stroke="#0c4a6e" stroke-width="3" paint-order="stroke">no contributors yet</text>`;

function escapeXml(s: string): string {
  return s.replace(/[<>&'"]/g, c => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case "'": return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

function buildCharacterGroup(c: ContributorWithAvatar, i: number, total: number, offset: number): string {
  const p = paramsFor(c.login, i, total);
  const bobValues = p.bobPhase === 'up'
    ? '0,-3;0,3;0,-3'
    : '0,3;0,-3;0,3';
  const login = escapeXml(c.login);

  return `<g>
  <animateTransform attributeName="transform" type="translate"
    from="-60,${p.yPos}" to="740,${p.yPos}"
    dur="${p.duration}s" begin="${p.beginOffset.toFixed(2)}s" repeatCount="indefinite"/>
  <g>
    <animateTransform attributeName="transform" type="translate"
      values="${bobValues}" dur="${p.bobDuration.toFixed(2)}s" repeatCount="indefinite"/>
    <ellipse cx="0" cy="14" rx="24" ry="3" fill="#0c4a6e" opacity="0.3"/>
    <ellipse cx="0" cy="2" rx="24" ry="8" fill="${p.tubeColor}"/>
    <rect x="-3" y="-5" width="6" height="3" fill="${p.tubeHighlight}"/>
    <rect x="-20" y="-1" width="3" height="4" fill="${p.tubeHighlight}"/>
    <ellipse cx="0" cy="2" rx="12" ry="4" fill="#38bdf8">${animFill(PALETTE.tube, offset)}</ellipse>
    <circle cx="0" cy="-14" r="16" fill="#ffffff"/>
    <image href="${c.avatarDataUri}" x="-15" y="-29" width="30" height="30" clip-path="url(#ac)"/>
    <circle cx="0" cy="-14" r="15.5" fill="none" stroke="#0c4a6e" stroke-width="1.5"/>
    <text y="22" font-family="monospace" font-size="11" font-weight="bold"
      fill="#ffffff" text-anchor="middle"
      stroke="#0c4a6e" stroke-width="3" paint-order="stroke">@${login}</text>
  </g>
</g>`;
}

export function buildSvg(contributors: ContributorWithAvatar[], opts: BuildOpts): string {
  const offset = opts.cycleOffsetSec;
  const characters = contributors.length > 0
    ? contributors
        .map((c, i) => buildCharacterGroup(c, i, contributors.length, offset))
        .join('\n')
    : EMPTY_OCEAN;

  return `<svg width="100%" viewBox="0 0 680 290" xmlns="http://www.w3.org/2000/svg" role="img">
<title>Contributors</title>
<desc>Floating contributors on a wavy ocean cycling through day and night</desc>
${DEFS}
${buildBackground(offset)}
${buildBackWave(offset)}
${buildMidWave(offset)}
${characters}
${buildFrontWave(offset)}
</svg>`;
}
