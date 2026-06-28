# Changelog

All notable changes to this project are documented here.

## [3.0.0] — 2026-06-28

### Round 5: Final Polish & Discoverability

- Added `skill/quickstart.md` — 60-second builder onboarding
- Added `examples/adoption-guide.md` — builder + maintainer workflow examples
- Added `CHANGELOG.md` — project iteration history
- Added Agent Integration / Claude Code Workflow section to README
- Updated `package.json` with homepage, repository, expanded keywords
- Updated Judge Checklist with all new files
- Fixed broken `quick-audit.md` link → `quickstart.md`

## [3.0.0] — 2026-06-28

### Round 3–4: Builder-First Reframe & Rich Skill Docs

- Reframed pitch: builder-first "Use It Before You Submit" + maintainer accelerator
- Created `skill/what-makes-a-good-solana-skill.md` — DO/DON'T guide
- Created `skill/safety-patterns.md` — 6 anti-patterns with safe alternatives
- Created `skill/solana-ecosystem-signals.md` — real Solana vs generic crypto
- Created `examples/community-scan-report.md` — 5 archetype scan with findings
- Created `agents/skill-reviewer-agent.md` — reviewer agent persona
- Created `commands/review-skill.md` — `/review-skill` with go/no-go verdict
- Updated SUBMISSION.md with builder value table and stronger novelty
- Fixed test count consistency (50 across all docs)
- Fixed layout docs (both `skill/SKILL.md` and root `SKILL.md` supported)

## [3.0.0] — 2026-06-28

### Round 2: Hardened Self-Audit, Batch, SARIF, Evidence

- Hardened `isSelfAudit()` — strict path identity check prevents bypass
- Added `batch` command — score multiple skills, sorted results
- Added SARIF 2.1.0 output — GitHub Code Scanning compatible
- Added evidence-based Solana fit — 5 structural signals beyond keywords
- Added `solanaEvidence` JSON field to score output
- Fixed Solana AI Kit link to `solanabr/solana-ai-kit`
- Created SUBMISSION.md with judge-facing pitch
- Test suite: 35 → 50 tests
- Version: 2.0.0 → 3.0.0

## [2.0.0] — 2026-06-28

### Round 1: Policy Caps, Strict Mode, Benchmarks

- Added policy caps — critical findings auto-cap total score
- Added `--strict` mode — exit non-zero on safety or structural failures
- Added `--fail-under N` — CI gate with configurable threshold
- Added negation-aware safety scanning — "does not collect" is not flagged
- Added 5 benchmark fixtures (excellent, missing-license, giant, keyword-stuffing, dangerous)
- Created `install.sh` and `install-custom.sh`
- Test suite: 18 → 35 tests
- Self-audit: 100/100

## [1.0.0] — 2026-06-28

### Initial Release

- CLI scanner: `audit`, `score`, `report` commands
- 6-category scoring (100 points): structure, progressive, safety, Solana fit, install, docs
- Safety detection: prompt injection, secret collection, opaque execution, exfiltration, priority manipulation
- Markdown report generation with PR checklist
- Good/bad test fixtures
- 18 tests
- Zero npm dependencies
