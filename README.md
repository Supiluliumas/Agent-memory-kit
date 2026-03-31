# Agent Memory Kit

Universal cross-project memory scaffolding for Codex and Claude Code.

This kit installs:

- global Codex instructions in `~/.codex/AGENTS.md`
- global Codex hooks in `~/.codex/hooks.json`
- global Claude instructions in `~/.claude/CLAUDE.md`
- global Claude hooks in `~/.claude/settings.json`
- a shared memory runtime in `~/.agent-memory/`

## What It Does

- keeps a global activity log across repositories
- creates a separate memory file for each project
- creates a separate summary snapshot for each project
- creates a separate manual notes file for each project
- gives both Codex and Claude a common resume command:
  - `~/.agent-memory/project-context.sh`

## Important Limitation

This does not restore the full original chat history verbatim.
It provides durable project memory, project summaries, and manual notes so a new
session can resume work with much less repeated explanation.

## Install

```sh
./install.sh
```

## After Install

From any project directory:

```sh
~/.agent-memory/project-context.sh
```

This prints:

- detected project root
- per-project memory path
- per-project summary path
- per-project notes path
- candidate handoff files found in the repo
- current summary snapshot
- recent project memory

## Files

- `install.sh`
- `templates/codex/AGENTS.md`
- `templates/codex/hooks.json`
- `templates/claude/CLAUDE.md`
- `templates/claude/settings.json`
- `templates/agent-memory/README.md`
- `templates/agent-memory/log-activity.js`
- `templates/agent-memory/log-activity.sh`
- `templates/agent-memory/project-context.js`
- `templates/agent-memory/project-context.sh`
- `templates/agent-memory/summarize-project.js`
- `templates/agent-memory/summarize-project.sh`

## Sharing

You can copy this repo, fork it, or send the GitHub URL to friends.
