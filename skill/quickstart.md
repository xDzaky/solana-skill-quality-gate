# Quickstart

Get value from the scanner in 60 seconds.

## Install (3 commands)

```bash
git clone https://github.com/xDzaky/solana-skill-quality-gate
cd solana-skill-quality-gate
npm test   # verify everything works
```

## Run Your First Audit

```bash
node scripts/skillqa.mjs audit ./path-to-your-skill
```

## Interpret the Score

| Score | Rating | Action |
|-------|--------|--------|
| 80–100 | Excellent | ✅ Submit your PR |
| 60–79 | Good | Fix warnings, then submit |
| 40–59 | Fair | Fix must-fix items first |
| 20–39 | Poor | Major rework needed |
| 0–19 | Failing | Start over or rethink |

**Rule**: Score ≥ 80 with zero policy caps → **submit**. Otherwise → **fix first**.

## 3 Most Common Findings

**1. "SKILL.md exceeds recommended line limit"**
→ Split into a router SKILL.md + focused .md files. Keep SKILL.md under 80 lines.

**2. "No Solana-specific content detected"**
→ Add real Solana references: `@solana/web3.js`, Anchor, Jupiter, Helius, Metaplex — not just the word "Solana".

**3. "No LICENSE file found"**
→ Add a `LICENSE` file (MIT recommended for kit compatibility).

## Next Steps

- [What Makes a Good Skill](./what-makes-a-good-solana-skill.md) — full DO/DON'T guide
- [Safety Patterns](./safety-patterns.md) — anti-patterns to avoid
- [Solana Ecosystem Signals](./solana-ecosystem-signals.md) — proving real Solana fit
