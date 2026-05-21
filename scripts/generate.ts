import { Command } from 'commander';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { fetchContributors } from './fetch-contributors.js';
import { fetchAvatarBase64 } from './fetch-avatars.js';
import { buildSvg } from './build-svg.js';

const program = new Command();
program
  .requiredOption('--owner <owner>', 'repository owner')
  .requiredOption('--repo <repo>', 'repository name')
  .option('--output <path>', 'output path', 'ripple.svg')
  .option('--token <token>', 'GitHub token (env: GITHUB_TOKEN)')
  .option('--max <n>', 'max contributors', '20')
  .option('--exclude-bots', 'exclude [bot] accounts', false)
  .option('--no-exclude-bots', 'include [bot] accounts')
  .option('--pins <list>', 'comma-separated synthetic contributors (e.g. "claude=https://github.com/anthropics.png,jules")', '');
program.parse();
const opts = program.opts();

const cycleOffsetSec = 0;

const token = opts.token ?? process.env.GITHUB_TOKEN ?? process.env.TOKEN;

interface Pin {
  login: string;
  avatarUrl: string;
}

function parsePin(spec: string): Pin {
  const idx = spec.indexOf('=');
  if (idx > 0) {
    return { login: spec.slice(0, idx).trim(), avatarUrl: spec.slice(idx + 1).trim() };
  }
  const login = spec.trim();
  return { login, avatarUrl: `https://github.com/${encodeURIComponent(login)}.png` };
}

const pins: Pin[] = (opts.pins as string)
  .split(',')
  .map(s => s.trim())
  .filter(Boolean)
  .map(parsePin);

const max = parseInt(opts.max, 10);
const realContribLimit = Math.max(0, max - pins.length);

const contributors = await fetchContributors({
  owner: opts.owner,
  repo: opts.repo,
  token,
  max: realContribLimit,
  excludeBots: !!opts.excludeBots,
});

const pinLogins = new Set(pins.map(p => p.login));
const merged = [
  ...pins.map(p => ({ login: p.login, avatarUrl: p.avatarUrl, contributions: 0 })),
  ...contributors.filter(c => !pinLogins.has(c.login)),
].slice(0, max);

const withAvatars = await Promise.all(
  merged.map(async c => ({
    ...c,
    avatarDataUri: await fetchAvatarBase64(c.avatarUrl),
  }))
);

const svg = buildSvg(withAvatars, { cycleOffsetSec });

console.log(`🌊 generating SVG for ${withAvatars.length} contributors`);

const outDir = dirname(opts.output);
if (outDir && outDir !== '.' && !existsSync(outDir)) {
  mkdirSync(outDir, { recursive: true });
}

if (existsSync(opts.output)) {
  const existing = readFileSync(opts.output);
  const existingHash = createHash('sha256').update(existing).digest('hex');
  const newHash = createHash('sha256').update(svg).digest('hex');
  if (existingHash === newHash) {
    console.log(`✅ ${withAvatars.length} contributors — output unchanged`);
    process.exit(0);
  }
}

writeFileSync(opts.output, svg);
console.log(`✅ ${withAvatars.length} contributors → ${opts.output}`);
