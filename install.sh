#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────
# install.sh — Transparent installer for solana-skill-quality-gate
# ──────────────────────────────────────────────────────────────────────
#
# SAFETY GUARANTEES:
#   • No network requests  — everything is local copy only
#   • No binary downloads  — pure text files (scripts, markdown, JSON)
#   • No secrets touched   — does not read or write credentials
#   • No sudo required     — installs to user-writable directories
#   • Fully idempotent     — safe to run multiple times
#
# Usage:
#   chmod +x install.sh
#   ./install.sh
#
# ──────────────────────────────────────────────────────────────────────

set -euo pipefail

# ╔══════════════════════════════════════════════════════════════════╗
# ║         solana-skill-quality-gate  •  installer                 ║
# ╠══════════════════════════════════════════════════════════════════╣
# ║  Quality, safety, and merge-readiness gate for                  ║
# ║  Solana AI Kit skills                                           ║
# ╚══════════════════════════════════════════════════════════════════╝

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ── Colors ──────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# ── Header ──────────────────────────────────────────────────────────
print_header() {
  echo ""
  echo -e "${CYAN}╔══════════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${CYAN}║${BOLD}         solana-skill-quality-gate  •  installer                 ${CYAN}║${NC}"
  echo -e "${CYAN}╠══════════════════════════════════════════════════════════════════╣${NC}"
  echo -e "${CYAN}║${NC}  Quality, safety, and merge-readiness gate for                  ${CYAN}║${NC}"
  echo -e "${CYAN}║${NC}  Solana AI Kit skills                                           ${CYAN}║${NC}"
  echo -e "${CYAN}╚══════════════════════════════════════════════════════════════════╝${NC}"
  echo ""
}

# ── Logging helpers ─────────────────────────────────────────────────
info()    { echo -e "${GREEN}[✓]${NC} $1"; }
warn()    { echo -e "${YELLOW}[!]${NC} $1"; }
error()   { echo -e "${RED}[✗]${NC} $1"; }
step()    { echo -e "${CYAN}[→]${NC} $1"; }

# ── Detect target skills directory ──────────────────────────────────
detect_skills_dir() {
  local claude_dir="$HOME/.claude/skills"
  local gemini_dir="$HOME/.gemini/skills"

  if [[ -d "$claude_dir" ]]; then
    echo "$claude_dir"
    return 0
  fi

  if [[ -d "$gemini_dir" ]]; then
    echo "$gemini_dir"
    return 0
  fi

  # Neither exists — try to create Claude first, then Gemini
  if [[ -d "$HOME/.claude" ]]; then
    mkdir -p "$claude_dir"
    echo "$claude_dir"
    return 0
  fi

  if [[ -d "$HOME/.gemini" ]]; then
    mkdir -p "$gemini_dir"
    echo "$gemini_dir"
    return 0
  fi

  # Default to Claude skills directory
  mkdir -p "$claude_dir"
  echo "$claude_dir"
  return 0
}

# ── Copy directory if it exists ─────────────────────────────────────
copy_dir() {
  local src="$1"
  local dest="$2"
  local label="$3"

  if [[ -d "$src" ]]; then
    mkdir -p "$dest"
    cp -r "$src"/. "$dest"/
    info "Copied ${label} → ${dest}"
  else
    warn "Skipped ${label} (not found: ${src})"
  fi
}

# ── Copy file if it exists ──────────────────────────────────────────
copy_file() {
  local src="$1"
  local dest="$2"
  local label="$3"

  if [[ -f "$src" ]]; then
    mkdir -p "$(dirname "$dest")"
    cp "$src" "$dest"
    info "Copied ${label} → ${dest}"
  else
    warn "Skipped ${label} (not found: ${src})"
  fi
}

# ── Main ────────────────────────────────────────────────────────────
main() {
  print_header

  step "Detecting skills directory..."
  local skills_dir
  skills_dir="$(detect_skills_dir)"
  info "Target: ${skills_dir}"

  local install_dir="${skills_dir}/solana-skill-quality-gate"
  step "Installing to: ${install_dir}"
  echo ""

  # Create install directory
  mkdir -p "$install_dir"

  # Copy core directories
  step "Copying project files..."
  copy_dir  "$SCRIPT_DIR/skill"     "$install_dir/skill"     "skill/"
  copy_dir  "$SCRIPT_DIR/commands"  "$install_dir/commands"  "commands/"
  copy_dir  "$SCRIPT_DIR/agents"    "$install_dir/agents"    "agents/"
  copy_dir  "$SCRIPT_DIR/scripts"   "$install_dir/scripts"   "scripts/"

  # Copy essential root files
  copy_file "$SCRIPT_DIR/package.json"  "$install_dir/package.json"  "package.json"
  copy_file "$SCRIPT_DIR/LICENSE"       "$install_dir/LICENSE"       "LICENSE"
  copy_file "$SCRIPT_DIR/README.md"     "$install_dir/README.md"     "README.md"

  echo ""
  echo -e "${CYAN}──────────────────────────────────────────────────────────────────${NC}"
  info "${BOLD}Installation complete!${NC}"
  echo ""
  echo -e "  Installed to: ${GREEN}${install_dir}${NC}"
  echo ""
  echo -e "  ${BOLD}Quick start:${NC}"
  echo -e "    cd ${install_dir}"
  echo -e "    node scripts/skillqa.mjs audit <path-to-skill>"
  echo ""
  echo -e "${CYAN}──────────────────────────────────────────────────────────────────${NC}"
}

main "$@"
