# solana-skill-quality-gate

[![Test](https://github.com/xDzaky/solana-skill-quality-gate/actions/workflows/test.yml/badge.svg)](https://github.com/xDzaky/solana-skill-quality-gate/actions/workflows/test.yml)

A quality and trust gate for [Solana AI Kit](https://github.com/solanabr/solana-ai-kit) skills — audit before you install, audit before you submit.

**Builders**: before installing a community skill, check if it's safe and well-structured. Before submitting your own, catch blockers early.
**Maintainers**: batch-review hundreds of submissions in seconds with deterministic scoring.

---

## Use It Before You Install

Before trusting a community skill with your agent's context window:

```bash
# Clone the community skill you want to use
git clone https://github.com/someone/cool-solana-skill

# Audit it before installing
node scripts/skillqa.mjs audit ./cool-solana-skill

# Score ≥ 80 and no policy caps → safe to install
# Score < 40 or policy caps → inspect manually before trusting
```

## Use It Before You Submit

```bash
# Audit your own skill before opening a PR
node scripts/skillqa.mjs audit ./my-skill

# Fix blockers, then submit with confidence
```

See [quickstart](./skill/quickstart.md) for the full 60-second workflow.

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

- [Quickstart](./skill/quickstart.md) — get value in 60 seconds
- [What Makes a Good Solana Skill](./skill/what-makes-a-good-solana-skill.md) — structure, DO/DON'T examples
- [Safety Patterns](./skill/safety-patterns.md) — anti-patterns to avoid with safe alternatives
- [Solana Ecosystem Signals](./skill/solana-ecosystem-signals.md) — how to prove real Solana fit
- [Quality Gates](./skill/quality-gates.md) — scoring rubric details

---

## How Builders Use This Skill in Claude Code

This skill is designed to be loaded by Claude Code / Codex as part of the Solana AI Kit. Once installed, builders can invoke it naturally:

```
You: "I found a community skill for Jupiter swaps. Is it safe to install?"

Agent: [runs skillqa audit on the skill]
        Score: 72/100 (Good)
        ⚠️ No LICENSE file
        ⚠️ install.sh makes network calls
        Verdict: FIX FIRST — inspect install.sh before trusting.

You: "Audit my own skill before I submit the PR."

Agent: [runs skillqa audit on your skill]
        Score: 91/100 (Excellent)
        ✅ No safety findings
        Verdict: READY — submit your PR.
```

This skill also includes an agent persona and a slash command for structured integration.

### `/review-skill <path>`

Run the quality gate and get a go/no-go verdict:

```
/review-skill ./my-solana-skill
```

Output: score breakdown, top 3 fixes, and a verdict (READY / FIX FIRST / DO NOT SUBMIT).

See [`commands/review-skill.md`](./commands/review-skill.md) for details.

### Reviewer Agent

The [`agents/skill-reviewer-agent.md`](./agents/skill-reviewer-agent.md) activates when you say:
- "review this skill"
- "check if my skill is submission-ready"
- "audit my skill"

It runs the scanner, interprets findings, and outputs a PR-ready checklist.

### CLAUDE.md Integration

Add this to your project's `CLAUDE.md` to auto-trigger the skill reviewer:

```markdown
## Skill Quality Gate

When working in a Solana AI Kit skill directory (contains skill/SKILL.md),
automatically run the quality gate before suggesting a PR:

  node /path/to/solana-skill-quality-gate/scripts/skillqa.mjs audit .

If score < 80 or policy caps are present, list fixes before proceeding.
```

---

## Safety Model

- **Read-only** — never modifies audited skills
- **No network calls** — works entirely offline
- **No secret collection** — never asks for private keys or seed phrases
- **No script execution** — does not run install.sh or audited code
- **Zero npm dependencies** — single readable .mjs file
- **Transparent** — all rules in `scripts/rules.json`

---

## Recommended GitHub Topics

Add these topics in your repo settings for discoverability:

```
solana  solana-ai-kit  ai-skills  claude-code  skill-bounty
quality-gate  security-scanner  static-analysis  sarif
developer-tools  supply-chain  agent-skills
```

---

## Judge Checklist

- [ ] `npm test` passes (50 tests)
- [ ] `npm run gate` passes (self-audit ≥ 90)
- [ ] Builder pre-submit workflow exists ("Use It Before You Submit")
- [ ] [Quickstart](./skill/quickstart.md) exists (60-second onboarding)
- [ ] [Community scan report](./examples/community-scan-report.md) shows 5 archetypes
- [ ] [Adoption guide](./examples/adoption-guide.md) with GitHub Actions snippet
- [ ] [CHANGELOG.md](./CHANGELOG.md) shows iteration history
- [ ] SKILL.md routes to focused docs (no broken links)
- [ ] `/review-skill` command exists
- [ ] Skill reviewer agent exists
- [ ] Agent workflow documented in README
- [ ] Package metadata complete (homepage, repository, keywords)
- [ ] Batch review works: `skillqa batch ... --json`
- [ ] SARIF output works: `skillqa report ... --sarif`
- [ ] Test count consistent across README, SUBMISSION.md, CI (50)
- [ ] Zero npm dependencies
- [ ] No network calls, no secrets, no script execution

See [SUBMISSION.md](./SUBMISSION.md) for the full bounty submission.

---

## Project Structure

```
solana-skill-quality-gate/
├── skill/                         # Skill docs (progressive disclosure)
│   ├── SKILL.md                  # Router entry point
│   ├── quickstart.md             # 60-second onboarding
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
│   ├── adoption-guide.md         # Builder + maintainer workflow
│   ├── community-scan-report.md  # 5 archetype scan
│   └── ...
├── install.sh / install-custom.sh
├── SUBMISSION.md                 # Bounty submission
├── CHANGELOG.md                  # Iteration history
├── .github/workflows/test.yml    # CI (Node 18/20/22)
├── LICENSE                       # MIT
└── README.md
```

---

## Links

- [Solana AI Kit](https://github.com/solanabr/solana-ai-kit)
- [Reference Skill](https://github.com/solanabr/solana-game-skill)
- [Skill Bounty](https://github.com/solanabr/skill-bounty)
- [Community Scan Report](./examples/community-scan-report.md)
- [Adoption Guide](./examples/adoption-guide.md)
- [CHANGELOG](./CHANGELOG.md)
- [SUBMISSION.md](./SUBMISSION.md)

---

## Bounty Submission Links

| Item | Link |
|------|------|
| **Repo** | https://github.com/xDzaky/solana-skill-quality-gate |
| **PR to solanabr/skill-bounty** | https://github.com/solanabr/skill-bounty/pull/89 |
| **CI Run** | https://github.com/xDzaky/solana-skill-quality-gate/actions |
| **Example Report** | [audit-report-self.md](./examples/audit-report-self.md) |
| **SARIF Example** | [bad-skill.sarif](./examples/bad-skill.sarif) |
| **Batch Report** | [batch-review.md](./examples/batch-review.md) |

## License

MIT
