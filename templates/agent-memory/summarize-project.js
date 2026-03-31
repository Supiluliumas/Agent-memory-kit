#!/usr/bin/env node

const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");
const { execSync } = require("child_process");

const cwd = process.cwd();
const homeDir = os.homedir();
const projectsDir = path.join(homeDir, ".agent-memory", "projects");

function run(command) {
  try {
    return execSync(command, {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch (_error) {
    return "";
  }
}

function firstExisting(projectRoot, candidates) {
  return candidates.find((relativePath) => fs.existsSync(path.join(projectRoot, relativePath))) || "";
}

const timestamp = new Date().toISOString();
const inGitRepo = run("git rev-parse --is-inside-work-tree") === "true";
const projectRoot = inGitRepo ? run("git rev-parse --show-toplevel") || cwd : cwd;
const projectName = path.basename(projectRoot) || "workspace";
const projectHash = crypto
  .createHash("sha1")
  .update(projectRoot)
  .digest("hex")
  .slice(0, 8);
const projectSlug = `${projectName}-${projectHash}`;
const projectLogPath = path.join(projectsDir, `${projectSlug}.md`);
const projectSummaryPath = path.join(projectsDir, `${projectSlug}.summary.md`);
const projectNotesPath = path.join(projectsDir, `${projectSlug}.notes.md`);
const branch = inGitRepo ? run("git branch --show-current") || "unknown" : "n/a";
const commit = inGitRepo
  ? run("git log -1 --pretty=format:%h%x20%s") || "unknown"
  : "n/a";
const remote = inGitRepo ? run("git remote get-url origin") || "unknown" : "n/a";
const status = inGitRepo ? run("git status --short") : "";
const recentCommits = inGitRepo ? run("git log -5 --oneline") : "";

const handoffCandidates = [
  "docs/session-handoff.md",
  "SESSION.md",
  "MEMORY.md",
  "NOTES.md",
  "TODO.md",
  "AGENTS.md",
  "CLAUDE.md",
  "README.md",
];

const foundFiles = handoffCandidates.filter((relativePath) =>
  fs.existsSync(path.join(projectRoot, relativePath))
);

const primaryContext = firstExisting(projectRoot, handoffCandidates);

let recentMemory = "(no project memory yet)";
let lastEvent = "unknown";
if (fs.existsSync(projectLogPath)) {
  const content = fs.readFileSync(projectLogPath, "utf8").trimEnd();
  if (content) {
    const lines = content.split("\n");
    recentMemory = lines
      .slice(-30)
      .filter((line) => line !== "```text" && line !== "```")
      .join("\n");
    const lastHeading = [...lines].reverse().find((line) => line.startsWith("## "));
    if (lastHeading) {
      lastEvent = lastHeading.replace(/^##\s+/, "");
    }
  }
}

if (!fs.existsSync(projectNotesPath)) {
  const notesTemplate = [
    `# Project Notes: ${projectName}`,
    "",
    `- project root: \`${projectRoot}\``,
    `- project slug: \`${projectSlug}\``,
    "",
    "## Important Decisions",
    "",
    "-",
    "",
    "## Current Goal",
    "",
    "-",
    "",
    "## Next Steps",
    "",
    "-",
    "",
    "## Risks Or Gotchas",
    "",
    "-",
    "",
  ];
  fs.writeFileSync(projectNotesPath, `${notesTemplate.join("\n")}\n`, "utf8");
}

let manualNotes = "(no manual notes yet)";
if (fs.existsSync(projectNotesPath)) {
  manualNotes = fs.readFileSync(projectNotesPath, "utf8").trimEnd() || manualNotes;
}

const statusLines = status ? status.split("\n") : [];
const changedCount = statusLines.filter(Boolean).length;

const summary = [
  `# Project Summary: ${projectName}`,
  "",
  `- updated: \`${timestamp}\``,
  `- project root: \`${projectRoot}\``,
  `- project slug: \`${projectSlug}\``,
  `- project memory: \`${projectLogPath}\``,
  `- project notes: \`${projectNotesPath}\``,
  `- primary context file: \`${primaryContext || "none"}\``,
  `- branch: \`${branch}\``,
  `- last commit: \`${commit}\``,
  `- origin: \`${remote}\``,
  `- worktree changes: ${changedCount}`,
  `- last memory event: \`${lastEvent}\``,
  "",
  "## Resume Checklist",
  "",
  `1. Open \`${projectSummaryPath}\` and \`${projectNotesPath}\`.`,
  `2. Read \`${primaryContext || "README.md or project docs"}\` if it exists.`,
  "3. Review the recent worktree state and continue from the latest memory event.",
  "",
  "## Manual Notes",
  "",
  manualNotes,
  "",
  "## Context Files",
  "",
  foundFiles.length ? foundFiles.map((file) => `- \`${file}\``).join("\n") : "- none found",
  "",
  "## Recent Commits",
  "",
  "```text",
  recentCommits || "(no git history available)",
  "```",
  "",
  "## Current Worktree",
  "",
  "```text",
  status || "(clean worktree or not a git repo)",
  "```",
  "",
  "## Recent Project Memory",
  "",
  "```text",
  recentMemory,
  "```",
  "",
];

fs.mkdirSync(projectsDir, { recursive: true });
fs.writeFileSync(projectSummaryPath, `${summary.join("\n")}\n`, "utf8");
