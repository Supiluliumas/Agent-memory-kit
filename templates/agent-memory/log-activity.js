#!/usr/bin/env node

const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");
const { execSync } = require("child_process");

const actor = process.argv[2] || "agent";
const event = process.argv[3] || "manual";
const cwd = process.cwd();
const homeDir = os.homedir();
const logPath = path.join(homeDir, ".agent-memory", "activity.md");
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
const branch = inGitRepo ? run("git branch --show-current") || "unknown" : "n/a";
const commit = inGitRepo
  ? run("git log -1 --pretty=format:%h%x20%s") || "unknown"
  : "n/a";
const status = inGitRepo ? run("git status --short") : "";
const remote = inGitRepo ? run("git remote get-url origin") || "unknown" : "n/a";

const lines = [
  `## ${timestamp} | ${actor} | ${event}`,
  "",
  `- cwd: \`${cwd}\``,
  `- project root: \`${projectRoot}\``,
  `- project memory: \`${projectLogPath}\``,
  `- git repo: ${inGitRepo ? "yes" : "no"}`,
  `- branch: \`${branch}\``,
  `- last commit: \`${commit}\``,
  `- origin: \`${remote}\``,
  `- worktree changes: ${status ? "yes" : "no"}`,
  "",
  "```text",
  status || "(clean worktree or not a git repo)",
  "```",
  "",
];

fs.mkdirSync(path.dirname(logPath), { recursive: true });
fs.mkdirSync(projectsDir, { recursive: true });

if (!fs.existsSync(projectLogPath)) {
  const header = [
    `# Project Memory: ${projectName}`,
    "",
    `- project root: \`${projectRoot}\``,
    `- project slug: \`${projectSlug}\``,
    `- created: \`${timestamp}\``,
    "",
    "This file is an append-only automatic breadcrumb log for this project.",
    "",
  ];
  fs.writeFileSync(projectLogPath, `${header.join("\n")}\n`, "utf8");
}

fs.appendFileSync(logPath, `${lines.join("\n")}\n`, "utf8");
fs.appendFileSync(projectLogPath, `${lines.join("\n")}\n`, "utf8");
