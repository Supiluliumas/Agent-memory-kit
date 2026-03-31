# Agent Memory

This directory stores user-level agent preferences and memory artifacts that are
useful across repositories.

- `activity.md` stores a global append-only log.
- `projects/` stores per-project memory, summary, and notes files.
- `log-activity.sh` is the shared hook entrypoint.
- `project-context.sh` prints the current project's memory and summary.
- `summarize-project.sh` refreshes a per-project summary snapshot.
