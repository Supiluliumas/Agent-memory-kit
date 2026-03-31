#!/bin/sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname "$0")" && pwd)

mkdir -p "$HOME/.codex" "$HOME/.claude" "$HOME/.agent-memory" "$HOME/.agent-memory/projects"

cp "$ROOT_DIR/templates/codex/AGENTS.md" "$HOME/.codex/AGENTS.md"
cp "$ROOT_DIR/templates/codex/hooks.json" "$HOME/.codex/hooks.json"
cp "$ROOT_DIR/templates/claude/CLAUDE.md" "$HOME/.claude/CLAUDE.md"
cp "$ROOT_DIR/templates/claude/settings.json" "$HOME/.claude/settings.json"

cp "$ROOT_DIR/templates/agent-memory/README.md" "$HOME/.agent-memory/README.md"
cp "$ROOT_DIR/templates/agent-memory/log-activity.js" "$HOME/.agent-memory/log-activity.js"
cp "$ROOT_DIR/templates/agent-memory/log-activity.sh" "$HOME/.agent-memory/log-activity.sh"
cp "$ROOT_DIR/templates/agent-memory/project-context.js" "$HOME/.agent-memory/project-context.js"
cp "$ROOT_DIR/templates/agent-memory/project-context.sh" "$HOME/.agent-memory/project-context.sh"
cp "$ROOT_DIR/templates/agent-memory/summarize-project.js" "$HOME/.agent-memory/summarize-project.js"
cp "$ROOT_DIR/templates/agent-memory/summarize-project.sh" "$HOME/.agent-memory/summarize-project.sh"

chmod +x \
  "$HOME/.agent-memory/log-activity.js" \
  "$HOME/.agent-memory/log-activity.sh" \
  "$HOME/.agent-memory/project-context.js" \
  "$HOME/.agent-memory/project-context.sh" \
  "$HOME/.agent-memory/summarize-project.js" \
  "$HOME/.agent-memory/summarize-project.sh"

touch "$HOME/.agent-memory/activity.md"

if [ ! -f "$HOME/.agent-memory/projects/README.md" ]; then
  cp "$ROOT_DIR/templates/agent-memory/projects-README.md" "$HOME/.agent-memory/projects/README.md"
fi

echo "Installed Agent Memory Kit."
echo "Try: ~/.agent-memory/project-context.sh"
