#!/usr/bin/env bash
set -euo pipefail

echo "Installing solana-token-monitor..."

# Copy skill files to the appropriate location
SKILL_DIR="${HOME}/.claude/skills/solana-token-monitor"
mkdir -p "${SKILL_DIR}"
cp -r skill/* "${SKILL_DIR}/"

echo "✓ Skill installed to ${SKILL_DIR}"
echo "Done."
