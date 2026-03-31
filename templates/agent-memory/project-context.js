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

const handoffCandidates = [
  "docs/session-handoff.md",
  "SESSION.md",
  "MEMORY.md",
  "NOTES.md",
  "TODO.md",
  "AGENTS.md",
  "CLAUDE.md",
];

const foundFiles = handoffCandidates.filter((relativePath) =>
  fs.existsSync(path.join(projectRoot, relativePath))
);

let summaryText = "(no project summary yet)";
if (fs.existsSync(projectSummaryPath)) {
  summaryText = fs.readFileSync(projectSummaryPath, "utf8").trimEnd();
}

let memoryTail = "(no project memory yet)";
if (fs.existsSync(projectLogPath)) {
  const content = fs.readFileSync(projectLogPath, "utf8").trimEnd();
  if (content) {
    const lines = content.split("\n");
    memoryTail = lines.slice(-20).join("\n");
  }
}

const output = [
  `project root: ${projectRoot}`,
  `project memory: ${projectLogPath}`,
  `project summary: ${projectSummaryPath}`,
  `project notes: ${projectNotesPath}`,
  `git repo: ${inGitRepo ? "yes" : "no"}`,
  "",
  "candidate context files:",
  foundFiles.length ? foundFiles.join("\n") : "(none found)",
  "",
  "project summary:",
  summaryText,
  "",
  "recent project memory:",
  memoryTail,
];

console.log(output.join("\n"));
