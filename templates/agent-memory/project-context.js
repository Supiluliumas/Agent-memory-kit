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
  "SESSION.md",
  "docs/session-handoff.md",
  "scripts/resume-context.sh",
  "scripts/resume-context.js",
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

let notesText = "(no project notes yet)";
if (fs.existsSync(projectNotesPath)) {
  notesText = fs.readFileSync(projectNotesPath, "utf8").trimEnd();
}

let memoryTail = "(no project memory yet)";
if (fs.existsSync(projectLogPath)) {
  const content = fs.readFileSync(projectLogPath, "utf8").trimEnd();
  if (content) {
    const lines = content.split("\n");
    memoryTail = lines.slice(-20).join("\n");
  }
}

function readProjectFile(relativePath) {
  const filePath = path.join(projectRoot, relativePath);
  if (!fs.existsSync(filePath)) {
    return "";
  }

  return fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n").trim();
}

function extractMarkdownSection(markdown, headings) {
  if (!markdown) {
    return "";
  }

  const wanted = new Set(headings.map((heading) => heading.toLowerCase()));
  const lines = markdown.split("\n");
  let collecting = false;
  const buffer = [];

  for (const line of lines) {
    const headingMatch = line.match(/^#{1,6}\s+(.*)$/);
    if (headingMatch) {
      const heading = headingMatch[1].trim().toLowerCase();
      if (collecting) {
        break;
      }
      if (wanted.has(heading)) {
        collecting = true;
      }
      continue;
    }

    if (collecting) {
      buffer.push(line);
    }
  }

  return buffer.join("\n").trim();
}

function firstNonEmpty(values) {
  for (const value of values) {
    if (value && value.trim()) {
      return value.trim();
    }
  }
  return "";
}

const sessionText = readProjectFile("SESSION.md");
const handoffText = readProjectFile("docs/session-handoff.md");
const primaryResumeFile = foundFiles[0] || "(none)";
const localResumeScript = foundFiles.find((file) => file.startsWith("scripts/resume-context")) || "";

const currentGoal = firstNonEmpty([
  extractMarkdownSection(sessionText, ["Continue From Here", "Current Goal", "Current Focus"]),
  extractMarkdownSection(notesText, ["Current Goal", "Current Focus"]),
  extractMarkdownSection(summaryText, ["Current Goal", "Current Focus"]),
]);

const immediateNextStep = firstNonEmpty([
  extractMarkdownSection(sessionText, ["Immediate Next Step", "Next Steps"]),
  extractMarkdownSection(notesText, ["Next Steps", "Immediate Next Step"]),
  extractMarkdownSection(summaryText, ["Next Steps", "Immediate Next Step"]),
  extractMarkdownSection(handoffText, ["Doporučené další kroky", "Recommended Next Steps"]),
]);

const resumeChecklist = localResumeScript
  ? [`1. Run ${localResumeScript}`, `2. Open ${primaryResumeFile}`]
  : [`1. Open ${primaryResumeFile}`];

if (foundFiles.includes("docs/session-handoff.md") && primaryResumeFile !== "docs/session-handoff.md") {
  resumeChecklist.push("3. Open docs/session-handoff.md");
}

if (foundFiles.includes("AGENTS.md")) {
  resumeChecklist.push("4. Review AGENTS.md");
}

if (foundFiles.includes("CLAUDE.md")) {
  resumeChecklist.push("5. Review CLAUDE.md");
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
  "resume now:",
  `primary resume file: ${primaryResumeFile}`,
  `local resume script: ${localResumeScript || "(none found)"}`,
  `current goal: ${currentGoal || "(not captured yet)"}`,
  `immediate next step: ${immediateNextStep || "(not captured yet)"}`,
  "recommended startup:",
  resumeChecklist.join("\n"),
  "",
  "project summary:",
  summaryText,
  "",
  "recent project memory:",
  memoryTail,
];

console.log(output.join("\n"));
