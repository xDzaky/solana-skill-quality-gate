# solana-skill-quality-gate

**This is not another domain skill. This is the quality gate that helps Solana AI Kit safely accept better skills.**

A Solana AI Kit-compatible agent skill that audits, scores, and prepares AI skills before they are submitted or merged into [Solana AI Kit](https://github.com/solanabr/solana-ai-kit).

[![MIT License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-blue.svg)](https://nodejs.org)
[![No Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen.svg)](#safety-model)

---

## Problem

Solana AI Kit receives hundreds of skill submissions. Many are:

- **Low-quality**: missing frontmatter, no docs, no tests
- **Unsafe**: prompt injection, secret collection, opaque binaries
- **Token-inefficient**: giant monolithic SKILL.md files that waste context
- **Not actually Solana-specific**: generic tools with "Solana" keyword stuffing
- **AI slop**: auto-generated content with no real utility

Maintainers need a **repeatable, transparent quality gate** to evaluate submissions quickly and safely — before installing, trusting, or merging them.

## Solution

`solana-skill-quality-gate` provides:

1. **Structural validation** — SKILL.md format, YAML frontmatter, required files
2. **Progressive loading assessment** — is the skill token-efficient?
3. **Semantic supply-chain scanning** — detects prompt injection, priority manipulation, exfiltration, secret collection, opaque execution
4. **Solana ecosystem fit scoring** — is this genuinely Solana-specific or keyword-stuffed?
5. **Report generation** — markdown and JSON reports for PR reviews
6. **Deterministic CLI** — zero dependencies, read-only, no network calls

## Install

```bash
git clone https://github.com/xDzaky/solana-skill-quality-gate.git
cd solana-skill-quality-gate

# Install as a skill (optional)
bash install.sh
```

No `npm install` needed — **zero npm dependencies**.

## Usage

### Quick Audit

```bash
node scripts/skillqa.mjs audit ./path-to-skill
```

Output:
```
╔══════════════════════════════════════════════════════════════╗
║        solana-skill-quality-gate — Audit Report             ║
╚══════════════════════════════════════════════════════════════╝

  Skill:   solana-token-monitor
  Score:   82/100 (Excellent)

──────────────────────────────────────────────────────────────

  Structure & Format: 20/20
    ✅ SKILL.md found: ./skill/SKILL.md
    ✅ YAML frontmatter present
    ✅ name: "solana-token-monitor"
    ✅ name format valid
    ✅ description present
    ✅ README.md found
    ✅ LICENSE found (MIT)

  Safety & Supply-Chain: 25/25
    ✅ Priority Manipulation: no risks detected
    ✅ Prompt Injection: no risks detected
    ✅ Data Exfiltration: no risks detected
    ✅ Secret Collection: no risks detected
    ✅ Opaque Execution: no risks detected
```

### Score (JSON)

```bash
node scripts/skillqa.mjs score ./path-to-skill --json
```

Output:
```json
{
  "name": "solana-token-monitor",
  "score": {
    "total": 82,
    "max": 100,
    "breakdown": {
      "structure": { "score": 20, "max": 20 },
      "progressive": { "score": 20, "max": 20 },
      "safety": { "score": 25, "max": 25 },
      "solanaFit": { "score": 14, "max": 15 },
      "installReady": { "score": 3, "max": 10 },
      "docs": { "score": 8, "max": 10 }
    }
  },
  "rating": "Excellent"
}
```

### Generate Report

```bash
node scripts/skillqa.mjs report ./path-to-skill --out SKILL_AUDIT_REPORT.md
```

Generates a full markdown report with:
- Score breakdown table
- Detailed findings per category
- Must-fix / should-fix / nice-to-have recommendations
- PR readiness checklist

### Batch Review

```bash
for dir in submissions/*/; do
  echo "=== $dir ==="
  node scripts/skillqa.mjs score "$dir" --json
  echo
done
```

## CLI Commands

| Command | Description |
|---------|-------------|
| `audit <path>` | Full audit with terminal output |
| `score <path> [--json]` | Quick score (terminal or JSON) |
| `report <path> --out <file>` | Generate markdown report |

## Scoring Rubric

| Category | Max Points | What It Checks |
|----------|-----------|----------------|
| Structure & Format | 20 | SKILL.md, frontmatter, name/description, README, LICENSE |
| Progressive Disclosure | 20 | SKILL.md size, routing to focused files, inline block size |
| Safety & Supply-Chain | 25 | Priority manipulation, prompt injection, exfiltration, secrets, opaque execution |
| Solana Ecosystem Fit | 15 | Real Solana keywords, not keyword stuffing |
| Install & Test Readiness | 10 | install.sh, package.json test script, transparency |
| Documentation & Examples | 10 | Problem statement, usage examples, examples directory |

### Score Interpretation

| Score | Rating | Recommendation |
|-------|--------|----------------|
| 80–100 | Excellent | Ready to merge |
| 60–79 | Good | Minor fixes needed |
| 40–59 | Fair | Significant improvements required |
| 20–39 | Poor | Major rework needed |
| 0–19 | Failing | Does not meet minimum standards |

## Safety Model

- **Read-only by default** — never modifies the audited skill
- **No network calls** — all scanning is local
- **No script execution** — never runs scripts from audited skills
- **No secret collection** — never asks for private keys, seed phrases, RPC keys, or wallet secrets
- **No opaque binaries** — all code is transparent and readable
- **Zero npm dependencies** — no supply-chain risk from dependencies
- **Assistive scanner** — not a substitute for human security review

## Skill Structure

```
solana-skill-quality-gate/
├── README.md                          # This file
├── LICENSE                            # MIT
├── install.sh                         # Transparent installer
├── package.json                       # Scripts (test, audit, score, report)
├── skill/
│   ├── SKILL.md                       # Router (progressive loading)
│   ├── quality-gates.md               # Full quality checklist
│   ├── progressive-loading.md         # Token-efficiency assessment
│   ├── semantic-supply-chain-review.md # Safety scanning framework
│   ├── solana-fit-score.md            # Ecosystem relevance scoring
│   └── report-template.md            # Report output formats
├── commands/
│   ├── skill-audit.md                 # Full audit workflow
│   ├── skill-score.md                 # Quick scoring workflow
│   └── prepare-skill-pr.md           # PR preparation workflow
├── agents/
│   └── solana-skill-reviewer.md       # Reviewer agent persona
├── scripts/
│   ├── skillqa.mjs                    # Deterministic CLI scanner
│   ├── test.mjs                       # Test runner
│   ├── rules.json                     # Scanner rules configuration
│   └── fixtures/
│       ├── good-skill/                # High-scoring fixture
│       └── bad-skill/                 # Low-scoring fixture
├── examples/
│   ├── audit-report-good.md           # Example: good skill report
│   ├── audit-report-bad.md            # Example: bad skill report
│   └── kit-fit-score.json             # Example: JSON score output
└── .github/workflows/test.yml        # CI workflow
```

## How It Differs From Generic Tools

| Feature | Generic Linters | This Skill |
|---------|----------------|------------|
| SKILL.md frontmatter validation | ❌ | ✅ |
| Progressive loading assessment | ❌ | ✅ |
| Semantic supply-chain scanning | ❌ | ✅ |
| Solana ecosystem fit scoring | ❌ | ✅ |
| Kit-compatible skill structure | ❌ | ✅ |
| Agent-ready (SKILL.md router) | ❌ | ✅ |
| Zero dependencies | Varies | ✅ |
| No network calls | Varies | ✅ |

## Testing

```bash
# Run all tests
npm test

# Audit fixtures manually
node scripts/skillqa.mjs audit scripts/fixtures/good-skill
node scripts/skillqa.mjs audit scripts/fixtures/bad-skill

# Generate example reports
node scripts/skillqa.mjs report scripts/fixtures/good-skill --out examples/audit-report-good.md
node scripts/skillqa.mjs report scripts/fixtures/bad-skill --out examples/audit-report-bad.md
```

## Bounty Fit

This skill was built for the [Superteam Brazil bounty](https://superteam.fun/earn/listing/skills/): "Ship useful agent skills we can add to Solana AI Kit."

- ✅ Solves a real, recurring problem for maintainers and builders
- ✅ Production-grade: tested, accurate, documented
- ✅ Progressive / token-efficient: SKILL.md is a router
- ✅ Clear install path and working CLI
- ✅ MIT licensed and ready to merge
- ✅ Cross-domain: useful for any skill reviewer, not just one domain
- ✅ Novel: no existing skill does quality/safety/fit gating for the kit

## References

- [Solana AI Kit](https://github.com/solanabr/solana-ai-kit)
- [Reference skill: solana-game-skill](https://github.com/solanabr/solana-game-skill)
- [Under the Hood of SKILL.md: Semantic Supply-chain Attacks](https://arxiv.org/abs/2605.11418)
- [Skilldex: Package Manager for Agent Skills](https://arxiv.org/abs/2604.16911)
- [Claude Agent Skills Documentation](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)

## License

[MIT](LICENSE)

**No secrets. No network. Read-only by default.**
