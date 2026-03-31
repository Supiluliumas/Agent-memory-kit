# Personal Codex Instructions

These preferences apply across repositories unless a project-level `AGENTS.md`
provides more specific guidance.

## Defaults

- Start by reading the local project instructions if the repository has `AGENTS.md`, `docs/session-handoff.md`, or similar handoff files.
- At the start of a new session or when resuming work, run `~/.agent-memory/project-context.sh` from the current repository to inspect per-project memory.
- Prefer safe, incremental edits over broad rewrites.
- Check for uncommitted changes before editing and do not revert user work unless explicitly requested.
- Use local scripts for repeatable workflows whenever the repository provides them.

## Continuity

- Treat repository handoff files as the main durable project memory.
- Use `~/.agent-memory/projects/*.md` as per-project breadcrumbs and resume context.
- Prefer concise operational notes over long diaries.

## Git

- Summarize git state before risky changes.
- Prefer non-interactive git commands.
- Keep GitHub-related automation behind local scripts when available.
