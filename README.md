# solana-skill-quality-gate

[![Test](https://github.com/xDzaky/solana-skill-quality-gate/actions/workflows/test.yml/badge.svg)](https://github.com/xDzaky/solana-skill-quality-gate/actions/workflows/test.yml)

A pre-submit quality gate for Solana skill builders — and a review accelerator for [Solana AI Kit](https://github.com/solanabr/solana-ai-kit) maintainers.

**Builders**: audit your own skill before opening a PR. Catch safety issues, structural problems, and quality gaps early.
**Maintainers**: batch-review 247+ submissions in seconds with deterministic scoring.

---

## Use It Before You Submit

```bash
# 1. Build your skill
# 2. Audit it
node scripts/skillqa.mjs audit ./my-skill

# 3. Fix blockers, then submit with confidence
```

The scanner checks structure, progressive disclosure, safety, Solana fit, install readiness, and docs — giving you a score out of 100 with a PR-ready checklist.

---

## Verify in 60 Seconds

```bash
git clone https://github.com/xDzaky/solana-skill-quality-gate
cd solana-skill-quality-gate
npm test                                                # 50 tests
npm run gate                                            # self-audit ≥ 90
node scripts/skillqa.mjs batch scripts/fixtures/benchmark-samples --json
```

---

## Judge Demo Path

```bash
npm test                                                                        # 50 tests pass
npm run gate                                                                    # self-audit 100/100
node scripts/skillqa.mjs audit scripts/fixtures/good-skill                      # 95/100 Excellent
node scripts/skillqa.mjs audit scripts/fixtures/bad-skill --strict              # exit 2 (safety)
node scripts/skillqa.mjs batch scripts/fixtures/benchmark-samples --markdown    # 5 skills, sorted
node scripts/skillqa.mjs report scripts/fixtures/bad-skill --sarif --out bad.sarif  # SARIF 2.1.0
```

---

## What It Does

| Feature | Description |
|---------|-------------|
| **SKILL.md validation** | Checks YAML frontmatter, name convention, description |
| **Progressive disclosure** | Verifies router pattern, line limits, focused file routing |
| **Safety scanning** | Negation-aware detection of prompt injection, secret collection, exfiltration, priority manipulation, opaque execution |
| **Solana fit scoring** | Keyword density + [evidence-based structural signals](./skill/solana-ecosystem-signals.md) |
| **Policy caps** | Critical findings cap total score (prompt injection → max 39) |
| **Batch review** | Score multiple skills in one command with sorted results |
| **SARIF output** | GitHub Code Scanning compatible SARIF 2.1.0 |
| **Strict CI mode** | `--strict` exits non-zero on safety or structural failures |
| **Fail-under gate** | `--fail-under N` exits non-zero if score < threshold |
| **Report generation** | Markdown reports with raw/final scores, applied caps, PR checklist |
| **Self-audit** | Scanner passes its own audit at 100/100 |

---

## Usage

### Quick Audit

```bash
node scripts/skillqa.mjs audit <path>                   # Terminal output
node scripts/skillqa.mjs score <path> --json             # JSON score
node scripts/skillqa.mjs report <path> --out report.md   # Markdown report
```

### Batch Review

```bash
node scripts/skillqa.mjs batch ./submissions --json --out batch.json
node scripts/skillqa.mjs batch ./submissions --markdown --out batch.md
node scripts/skillqa.mjs batch ./submissions --fail-under 80
```

### SARIF for GitHub Code Scanning

```bash
node scripts/skillqa.mjs report <path> --sarif --out skill.sarif
```

### CI Gate

```bash
node scripts/skillqa.mjs score <path> --json --fail-under 85   # exit 1 if below
node scripts/skillqa.mjs audit <path> --strict                  # exit 2 on safety
```

### Exit Codes

| Code | Meaning |
|------|---------|
| `0` | Pass |
| `1` | Score below `--fail-under` threshold |
| `2` | Critical safety failure (`--strict`) |
| `3` | Invalid structure / missing SKILL.md (`--strict`) |

---

## Scoring (100 points)

| Category | Max | What It Checks |
|----------|-----|----------------|
| Structure & Format | 20 | SKILL.md, frontmatter, name, description, LICENSE |
| Progressive Disclosure | 20 | File size, routing, inline blocks |
| Safety & Supply-Chain | 25 | Prompt injection, secrets, exfiltration, opaque exec |
| Solana Ecosystem Fit | 15 | Keyword depth + 5 evidence signals |
| Install & Test Ready | 10 | install.sh, tests, CI workflow |
| Documentation | 10 | README, examples, content quality |

### Policy Caps

| Finding | Max Score |
|---------|-----------|
| Prompt injection | 39 |
| Secret collection | 39 |
| Opaque execution | 29 |
| Priority manipulation | 49 |
| Suspicious install | 39 |
| Missing SKILL.md | 49 |
| No Solana content | 59 |

---

## Skill Documentation

The `skill/` folder includes rich guides for builders:

- [What Makes a Good Solana Skill](./skill/what-makes-a-good-solana-skill.md) — structure, DO/DON'T examples
- [Safety Patterns](./skill/safety-patterns.md) — anti-patterns to avoid with safe alternatives
- [Solana Ecosystem Signals](./skill/solana-ecosystem-signals.md) — how to prove real Solana fit
- [Quality Gates](./skill/quality-gates.md) — scoring rubric details

---

## Agent & Command Integration

- **Agent**: [`agents/skill-reviewer-agent.md`](./agents/skill-reviewer-agent.md) — activates on "review this skill"
- **Command**: [`commands/review-skill.md`](./commands/review-skill.md) — `/review-skill <path>` gives go/no-go verdict

---

## Safety Model

- **Read-only** — never modifies audited skills
- **No network calls** — works entirely offline
- **No secret collection** — never asks for private keys or seed phrases
- **No script execution** — does not run install.sh or audited code
- **Zero npm dependencies** — single readable .mjs file
- **Transparent** — all rules in `scripts/rules.json`

---

## Judge Checklist

- [ ] `npm test` passes (50 tests)
- [ ] `npm run gate` passes (self-audit ≥ 90)
- [ ] Builder pre-submit workflow exists ("Use It Before You Submit")
- [ ] [Community scan report](./examples/community-scan-report.md) shows 5 archetypes
- [ ] SKILL.md routes to focused docs (safety, ecosystem, quality)
- [ ] `/review-skill` command exists
- [ ] Skill reviewer agent exists
- [ ] Batch review works: `skillqa batch ... --json`
- [ ] SARIF output works: `skillqa report ... --sarif`
- [ ] Test count consistent across README, SUBMISSION.md, CI
- [ ] Zero npm dependencies
- [ ] No network calls, no secrets, no script execution

See [SUBMISSION.md](./SUBMISSION.md) for the full bounty submission.

---

## Project Structure

```
solana-skill-quality-gate/
├── skill/                         # Skill docs (progressive disclosure)
│   ├── SKILL.md                  # Router entry point
│   ├── what-makes-a-good-solana-skill.md
│   ├── safety-patterns.md
│   ├── solana-ecosystem-signals.md
│   ├── quality-gates.md
│   └── ...
├── commands/
│   ├── skill-audit.md            # /skill-audit command
│   └── review-skill.md           # /review-skill command
├── agents/
│   ├── skill-quality-reviewer.json
│   └── skill-reviewer-agent.md   # Reviewer agent persona
├── scripts/
│   ├── skillqa.mjs               # CLI scanner (zero deps)
│   ├── rules.json                # Detection rules
│   ├── test.mjs                  # 50 tests
│   └── fixtures/                 # Test fixtures
├── examples/                     # Reports, SARIF, batch, community scan
├── install.sh / install-custom.sh
├── SUBMISSION.md                 # Bounty submission
├── .github/workflows/test.yml    # CI (Node 18/20/22)
├── LICENSE                       # MIT
└── README.md
```

---

## Links

- [Solana AI Kit](https://github.com/solanabr/solana-ai-kit)
- [Skill Bounty](https://github.com/solanabr/skill-bounty)
- [Community Scan Report](./examples/community-scan-report.md)
- [SUBMISSION.md](./SUBMISSION.md)

## License

MIT
