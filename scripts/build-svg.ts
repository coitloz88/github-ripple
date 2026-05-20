import type { Contributor } from './fetch-contributors.js';
import { paramsFor, vehicleFor, isUfoFlying, ufoFlyingYPos } from './hash.js';

export interface ContributorWithAvatar extends Contributor {
  avatarDataUri: string;
}

export interface BuildOpts {
  cycleOffsetSec: number;
}

const CYCLE_DUR = 86400;
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

function buildAmbient(offset: number): string {
  return `
<!-- seagull, right -> left, slow, fades out at night -->
<g opacity="0.8">${animOpacity([0, 0.3, 0.9, 0.6, 0], offset)}
  <g>
    <animateTransform attributeName="transform" type="translate"
      values="720,70;-40,55;720,70" keyTimes="0;0.5;1" dur="120s" repeatCount="indefinite"/>
    <path d="M-7,0 Q-4,-6 -1,-2 Q0,-3 1,-2 Q4,-6 7,0" stroke="#4b5563" stroke-width="1.4" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <animate attributeName="opacity" values="1;0;1" dur="0.6s" repeatCount="indefinite"/>
    </path>
    <path d="M-7,0 Q-4,-1 -1,1 Q0,0 1,1 Q4,-1 7,0" stroke="#4b5563" stroke-width="1.4" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <animate attributeName="opacity" values="0;1;0" dur="0.6s" repeatCount="indefinite"/>
    </path>
  </g>
</g>
<!-- yellow duck, left -> right, very slow -->
<g>
  <animateTransform attributeName="transform" type="translate"
    from="-30,232" to="720,232" dur="127s" begin="-29s" repeatCount="indefinite"/>
  <g>
    <animateTransform attributeName="transform" type="translate"
      values="0,-1;0,1;0,-1" dur="3.2s" repeatCount="indefinite"/>
    <ellipse cx="0" cy="7" rx="11" ry="2" fill="#0c4a6e" opacity="0.25"/>
    <ellipse cx="-8" cy="-1" rx="3.5" ry="3" fill="#fde047"/>
    <ellipse cx="0" cy="0" rx="9" ry="5" fill="#fde047"/>
    <circle cx="6" cy="-4" r="4" fill="#fde047"/>
    <path d="M9,-4 L13,-3 L10,-2 Z" fill="#fb923c"/>
    <circle cx="7" cy="-5" r="0.7" fill="#0c4a6e"/>
  </g>
</g>
<!-- white duck, left -> right, even slower, offset start -->
<g>
  <animateTransform attributeName="transform" type="translate"
    from="-30,246" to="720,246" dur="165s" begin="-86s" repeatCount="indefinite"/>
  <g>
    <animateTransform attributeName="transform" type="translate"
      values="0,-1;0,1;0,-1" dur="2.8s" repeatCount="indefinite"/>
    <ellipse cx="0" cy="7" rx="12" ry="2" fill="#0c4a6e" opacity="0.25"/>
    <ellipse cx="-9" cy="-1" rx="4" ry="3.5" fill="#f8fafc"/>
    <ellipse cx="0" cy="0" rx="10" ry="5.5" fill="#f8fafc"/>
    <circle cx="6" cy="-4" r="4.2" fill="#f8fafc"/>
    <path d="M9,-4 L14,-3 L11,-2 Z" fill="#f97316"/>
    <circle cx="7" cy="-5" r="0.7" fill="#1e293b"/>
  </g>
</g>`;
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
  <clipPath id="dc">
    <path d="M-13,-5 Q-13,-28 0,-28 Q13,-28 13,-5 Z"/>
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

function buildTubeGroup(c: ContributorWithAvatar, i: number, total: number, offset: number): string {
  const p = paramsFor(c.login, i, total);
  const bobValues = p.bobPhase === 'up' ? '0,-3;0,3;0,-3' : '0,3;0,-3;0,3';
  const login = escapeXml(c.login);

  return `<g>
  <animateTransform attributeName="transform" type="translate"
    from="-60,${p.yPos}" to="740,${p.yPos}"
    dur="${p.duration}s" begin="${p.beginOffset.toFixed(2)}s" repeatCount="indefinite"/>
  <g>
    <animateTransform attributeName="transform" type="translate"
      values="${bobValues}" dur="${p.bobDuration.toFixed(2)}s" repeatCount="indefinite"/>
    <ellipse cx="0" cy="11" rx="24" ry="3" fill="#0c4a6e" opacity="0.3"/>
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

function buildUfoGroup(c: ContributorWithAvatar, i: number, total: number, isBot: boolean): string {
  const p = paramsFor(c.login, i, total);
  const flying = isUfoFlying(c.login);
  const yPos = flying ? ufoFlyingYPos(c.login) : p.yPos;
  const dur = flying ? Math.round(p.duration * 0.65) : p.duration;
  const beginOffset = total > 0 ? -(dur * i / total) : 0;
  const login = escapeXml(c.login);
  const wrapAttrs = isBot
    ? 'shape-rendering="geometricPrecision" transform="scale(0.7)"'
    : 'shape-rendering="geometricPrecision"';

  const shadow = flying
    ? ''
    : '\n  <ellipse cx="0" cy="11" rx="27" ry="3" fill="#0c4a6e" opacity="0.15"/>';

  const trail = flying ? `
          <rect x="-42" y="-26" width="9" height="3" fill="#c7d2fe" opacity="0.7"/>
          <rect x="-57" y="-23" width="6" height="3" fill="#c7d2fe" opacity="0.4"/>
          <rect x="-69" y="-29" width="6" height="3" fill="#c7d2fe" opacity="0.15"/>` : '';

  return `<g>
  <animateTransform attributeName="transform" type="translate"
    from="-60,${yPos}" to="740,${yPos}"
    dur="${dur}s" begin="${beginOffset.toFixed(2)}s" repeatCount="indefinite"/>
  <g ${wrapAttrs}>${shadow}
    <g>
      <animateTransform attributeName="transform" type="translate"
        values="0,-2;0,2;0,-2" dur="1.5s" repeatCount="indefinite"/>
      <g>
        <animateTransform attributeName="transform" type="translate"
          values="-2,0;2,0;-2,0" dur="1.2s" repeatCount="indefinite"/>
        <g transform="translate(0,-15)">${trail}
          <ellipse cx="0" cy="-2" rx="30" ry="8" fill="#a78bfa" opacity="0.2"/>
          <ellipse cx="0" cy="0" rx="27" ry="6" fill="#94a3b8"/>
          <ellipse cx="0" cy="-3" rx="22" ry="5" fill="#cbd5e1"/>
          <path d="M-13,-5 Q-13,-28 0,-28 Q13,-28 13,-5 Z" fill="#7dd3fc" opacity="0.85"/>
          <path d="M-9,-5 Q-9,-22 0,-22 Q9,-22 9,-5 Z" fill="#bae6fd" opacity="0.4"/>
          <image href="${c.avatarDataUri}" x="-10" y="-28" width="20" height="22" clip-path="url(#dc)"/>
          <circle cx="-18" cy="0" r="2.5" fill="#fbbf24">
            <animate attributeName="opacity" values="1;0.2;1" dur="0.8s" begin="0s" repeatCount="indefinite"/>
          </circle>
          <circle cx="-9" cy="2" r="2.5" fill="#f472b6">
            <animate attributeName="opacity" values="1;0.2;1" dur="0.8s" begin="0.2s" repeatCount="indefinite"/>
          </circle>
          <circle cx="0" cy="3" r="2.5" fill="#34d399">
            <animate attributeName="opacity" values="1;0.2;1" dur="0.8s" begin="0.4s" repeatCount="indefinite"/>
          </circle>
          <circle cx="9" cy="2" r="2.5" fill="#60a5fa">
            <animate attributeName="opacity" values="1;0.2;1" dur="0.8s" begin="0.6s" repeatCount="indefinite"/>
          </circle>
          <circle cx="18" cy="0" r="2.5" fill="#fbbf24">
            <animate attributeName="opacity" values="1;0.2;1" dur="0.8s" begin="0.2s" repeatCount="indefinite"/>
          </circle>
          <polygon points="-5,3 5,3 12,22 -12,22" fill="#fde68a" opacity="0.3"/>
          <text y="35" font-family="monospace" font-size="11" font-weight="bold"
            fill="#ffffff" text-anchor="middle"
            stroke="#0c4a6e" stroke-width="3" paint-order="stroke">@${login}</text>
        </g>
      </g>
    </g>
  </g>
</g>`;
}

function buildCharacterGroup(c: ContributorWithAvatar, i: number, total: number, offset: number): string {
  const isBot = c.login.endsWith('[bot]');
  const vehicle = vehicleFor(c.login, isBot);
  if (vehicle === 'ufo') return buildUfoGroup(c, i, total, isBot);
  return buildTubeGroup(c, i, total, offset);
}

export function buildSvg(contributors: ContributorWithAvatar[], opts: BuildOpts): string {
  const offset = opts.cycleOffsetSec;
  const characters = contributors.length > 0
    ? contributors
        .map((c, i) => buildCharacterGroup(c, i, contributors.length, offset))
        .join('\n')
    : EMPTY_OCEAN;

  return `<svg width="100%" viewBox="0 0 680 290" xmlns="http://www.w3.org/2000/svg" role="img" shape-rendering="crispEdges">
<title>Contributors</title>
<desc>Floating contributors on a wavy ocean cycling through day and night</desc>
${DEFS}
${buildBackground(offset)}
${buildBackWave(offset)}
${buildMidWave(offset)}
${buildAmbient(offset)}
${characters}
${buildFrontWave(offset)}
</svg>`;
}
