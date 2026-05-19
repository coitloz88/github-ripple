# 🌊 github-ripple

Turn your repo's contributors into pixel-art characters drifting on tubes across a wavy ocean — rendered as an animated SVG in your README.

## Contributors

![ripple](assets/ripple.svg)

---

## Usage

Add this workflow to your repo at `.github/workflows/ripple.yml`:

```yaml
name: Ripple
on:
  schedule:
    - cron: '0 0 * * *'
  workflow_dispatch:
  push:
    branches: [main]

permissions:
  contents: write

jobs:
  splash:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: coitloz88/github-ripple@v1
        with:
          output-path: assets/ripple.svg
      - uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: '🌊 ripple update'
          file_pattern: 'assets/ripple.svg'
```

Then embed in your `README.md`:

```markdown
![ripple](assets/ripple.svg)
```

> **Settings → Actions → General → Workflow permissions** must be set to **Read and write permissions** so the action can commit the generated SVG.

## Inputs

| Input | Default | Description |
| --- | --- | --- |
| `output-path` | `assets/ripple.svg` | Where to write the generated SVG (relative to repo root) |
| `max-contributors` | `20` | Max contributors shown, sorted by contribution count |
| `exclude-bots` | `true` | Skip accounts whose login ends with `[bot]` |
| `pins` | `''` | Comma-separated synthetic contributors. Format: `login` or `login=avatar-url`. E.g. `claude=https://github.com/anthropics.png,jules` |
| `timezone` | `UTC` | IANA timezone (e.g. `Asia/Seoul`) used to set the starting phase of the day/night cycle |
| `token` | `${{ github.token }}` | GitHub token used for the API call |

The scene cycles through night → dawn → day → sunset → night every 120 seconds. At generation time, the action computes the current hour-of-day in the given `timezone` and bakes a matching `begin` offset into every SMIL animation. So when a viewer loads the README, the cycle starts at whatever phase corresponds to your local time *at that moment of generation*, then keeps cycling on its own.

Note: GitHub renders SVGs via `<img>`, which has no access to the viewer's clock. The cycle is a fixed 120s loop — it's not live local time, just a continuously-changing scene that started at the right phase.

Pinned contributors are always rendered (even if no commits in the repo) and dedupe against real contributors by login. Use this to add mascots, AI assistants you collaborate with, or any persona you want floating in your ocean.

## Run locally

```bash
pnpm install
export GITHUB_TOKEN=ghp_yourtoken
pnpm tsx scripts/generate.ts --owner=<owner> --repo=<repo> --output=test-output/test.svg
```

Open the resulting SVG in a browser to preview the animation.

## How it works

- Three wave layers scroll horizontally at different speeds (parallax)
- Each contributor gets a tube + pixelated 16×16 avatar + `@login` label
- Position, color, speed, and bob phase are hashed deterministically from the login, so the same person always looks the same
- Avatars are downsampled to 16×16 with nearest-neighbor and rendered at 32×32 with `image-rendering: pixelated` for the chunky pixel look
- All info is always visible — SVGs embedded in READMEs via `<img>` don't get hover/click

## License

MIT
