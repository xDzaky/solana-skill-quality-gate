#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# install-custom.sh — Custom installer for solana-skill-quality-gate
#
# SAFETY:
#   - No network calls (no curl, wget, fetch)
#   - No sudo or privilege escalation
#   - No secret access (no private keys, seed phrases, API keys)
#   - No binary downloads
#   - No eval or opaque execution
#   - Idempotent: safe to run multiple times
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

SKILL_NAME="solana-skill-quality-gate"
VERSION="2.0.0"

# Defaults
TARGET=""
DRY_RUN=false
YES=false
MODE="user"  # user or project

print_header() {
  echo ""
  echo "╔══════════════════════════════════════════════════════════════╗"
  echo "║  solana-skill-quality-gate — Custom Installer v${VERSION}      ║"
  echo "╚══════════════════════════════════════════════════════════════╝"
  echo ""
}

print_usage() {
  echo "Usage: bash install-custom.sh [options]"
  echo ""
  echo "Options:"
  echo "  --user          Install to ~/.claude/skills/${SKILL_NAME} (default)"
  echo "  --project       Install to ./.claude/skills/${SKILL_NAME}"
  echo "  --target <dir>  Install to custom directory"
  echo "  --dry-run       Show what would be copied without copying"
  echo "  -y, --yes       Skip confirmation prompt"
  echo "  --help          Show this help"
  echo ""
  echo "Safety: No network calls, no sudo, no secrets, no binary downloads."
  echo ""
}

# Parse arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    --user)
      MODE="user"
      shift
      ;;
    --project)
      MODE="project"
      shift
      ;;
    --target)
      TARGET="$2"
      MODE="custom"
      shift 2
      ;;
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    -y|--yes)
      YES=true
      shift
      ;;
    --help|-h)
      print_header
      print_usage
      exit 0
      ;;
    *)
      echo "❌ Unknown option: $1"
      print_usage
      exit 1
      ;;
  esac
done

# Determine install directory
if [[ "$MODE" == "custom" ]]; then
  INSTALL_DIR="$TARGET"
elif [[ "$MODE" == "project" ]]; then
  INSTALL_DIR="./.claude/skills/${SKILL_NAME}"
else
  # User mode: prefer ~/.claude/skills, fall back to ~/.gemini/skills
  if [[ -d "${HOME}/.claude" ]]; then
    INSTALL_DIR="${HOME}/.claude/skills/${SKILL_NAME}"
  elif [[ -d "${HOME}/.gemini" ]]; then
    INSTALL_DIR="${HOME}/.gemini/skills/${SKILL_NAME}"
  else
    INSTALL_DIR="${HOME}/.claude/skills/${SKILL_NAME}"
  fi
fi

print_header

echo "  Mode:      ${MODE}"
echo "  Target:    ${INSTALL_DIR}"
echo "  Dry run:   ${DRY_RUN}"
echo ""

# Files to copy
COPY_ITEMS=(
  "skill/"
  "commands/"
  "agents/"
  "scripts/skillqa.mjs"
  "scripts/rules.json"
)

echo "  Files to install:"
for item in "${COPY_ITEMS[@]}"; do
  if [[ -e "$item" ]]; then
    echo "    ✅ ${item}"
  else
    echo "    ⚠️  ${item} (not found, skipping)"
  fi
done
echo ""

if [[ "$DRY_RUN" == true ]]; then
  echo "  🔍 Dry run — no files were copied."
  echo ""
  exit 0
fi

# Confirmation
if [[ "$YES" != true ]]; then
  read -rp "  Install to ${INSTALL_DIR}? [y/N] " confirm
  if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
    echo "  ❌ Installation cancelled."
    exit 0
  fi
fi

# Install
mkdir -p "${INSTALL_DIR}"

for item in "${COPY_ITEMS[@]}"; do
  if [[ -e "$item" ]]; then
    if [[ -d "$item" ]]; then
      mkdir -p "${INSTALL_DIR}/${item}"
      cp -r "${item}"* "${INSTALL_DIR}/${item}" 2>/dev/null || true
    else
      local_dir=$(dirname "${INSTALL_DIR}/${item}")
      mkdir -p "$local_dir"
      cp "$item" "${INSTALL_DIR}/${item}"
    fi
  fi
done

echo ""
echo "  ✅ Installed to: ${INSTALL_DIR}"
echo ""
echo "  Usage:"
echo "    node ${INSTALL_DIR}/scripts/skillqa.mjs audit <path-to-skill>"
echo "    node ${INSTALL_DIR}/scripts/skillqa.mjs score <path-to-skill> --json"
echo ""
echo "  No network calls. No secrets. Read-only by default."
echo ""
