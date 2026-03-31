# Personal Claude Instructions

These preferences apply across repositories unless a project-level `CLAUDE.md`
or imported `AGENTS.md` provides more specific guidance.

## Defaults

- Read project instructions first when a repository includes `CLAUDE.md`, `AGENTS.md`, or a handoff document.
- At the start of a new session or when resuming work, run `~/.agent-memory/project-context.sh` from the current repository to inspect per-project memory.
- Prefer minimal-risk edits and respect work already in progress.
- Use auto memory for learned preferences and recurring debugging knowledge, not for large project specifications.
- Prefer local repository scripts for git and GitHub workflows.

## Continuity

- Use project handoff files as the primary durable context.
- Use `~/.agent-memory/projects/*.md` as per-project breadcrumbs and resume context.
- Treat hook logs and auto memory as supporting context.
- Keep notes concise and actionable.
