# What Makes a Good Solana AI Kit Skill

## SKILL.md Frontmatter

```yaml
---
name: lowercase-hyphen-name    # Required. Pattern: ^[a-z0-9][a-z0-9-]*[a-z0-9]$
description: >                 # Required. Under 1024 chars.
  One clear sentence about what this skill does for Solana builders.
---
```

## Progressive Disclosure

Your SKILL.md should be a **router**, not a manual.

✅ **DO**: Keep SKILL.md under 80 lines. Route to focused files.

```markdown
## Details
See [staking.md](./staking.md) for staking workflows.
See [safety.md](./safety.md) for security boundaries.
```

❌ **DON'T**: Put everything inline in SKILL.md.

```markdown
## Everything About Staking, Swapping, NFTs, Governance...
(300 lines of instructions in one file)
```

## File Limits

| File | Max Lines | Max Bytes |
|------|-----------|-----------|
| SKILL.md | 200 | 8,192 |
| Focused .md files | 80 | — |
| Inline instruction blocks | 50 | — |

## Solana-Specific Content

✅ **DO**: Reference real Solana programs and protocols.

```markdown
Uses @solana/web3.js to query token accounts. Integrates with
Jupiter for swap routing and Helius DAS API for NFT verification.
```

❌ **DON'T**: List generic crypto features.

```markdown
Supports Bitcoin, Ethereum, Solana, Polygon, Avalanche,
Cosmos, Cardano, Near, Algorand... (keyword stuffing)
```

## Boundary Definitions

Good skills define what they do NOT do:

```markdown
## Scope
- This skill handles SPL token transfers only
- It does NOT sign transactions or manage private keys
- For DeFi swaps, use the jupiter-swap skill instead
```

## Checklist

- [ ] SKILL.md has valid YAML frontmatter (name + description)
- [ ] Name follows `lowercase-hyphen` format
- [ ] SKILL.md routes to 2+ focused .md files
- [ ] Files reference real Solana programs/protocols
- [ ] Safety section defines what the skill does NOT do
- [ ] README.md explains the problem being solved
- [ ] LICENSE file exists
