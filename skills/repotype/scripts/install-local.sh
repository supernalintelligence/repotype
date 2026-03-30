#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
CODEX_HOME_DIR="${CODEX_HOME:-$HOME/.codex}"
TARGET_DIR="$CODEX_HOME_DIR/skills/repotype"

mkdir -p "$CODEX_HOME_DIR/skills"
ln -sfn "$SKILL_DIR" "$TARGET_DIR"

echo "Installed repotype skill"
echo "  source: $SKILL_DIR"
echo "  target: $TARGET_DIR"
