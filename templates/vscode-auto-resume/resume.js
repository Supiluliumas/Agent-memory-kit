const fs = require("fs");
const os = require("os");
const path = require("path");
const { exec } = require("child_process");

function runCommand(command, cwd) {
  return new Promise((resolve) => {
    exec(command, {
      cwd,
      encoding: "utf8",
      shell: "/bin/zsh",
      env: process.env,
      maxBuffer: 1024 * 1024,
    }, (error, stdout, stderr) => {
      resolve({
        ok: !error,
        stdout: (stdout || "").trim(),
        stderr: (stderr || "").trim(),
      });
    });
  });
}

function fileExists(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.F_OK);
    return true;
  } catch (_error) {
    return false;
  }
}

async function collectWorkspaceContext(workspaceRoot) {
  const memoryCommand = `${path.join(os.homedir(), ".agent-memory", "project-context.sh")}`;
  const resumeScriptPath = path.join(workspaceRoot, "scripts", "resume-context.sh");

  const memoryResult = await runCommand(memoryCommand, workspaceRoot);
  const resumeResult = fileExists(resumeScriptPath)
    ? await runCommand("./scripts/resume-context.sh", workspaceRoot)
    : { ok: false, stdout: "", stderr: "scripts/resume-context.sh not found" };

  return {
    generatedAt: new Date().toISOString(),
    workspaceRoot,
    memoryCommand,
    resumeScriptPath: fileExists(resumeScriptPath) ? "scripts/resume-context.sh" : null,
    memory: memoryResult,
    resume: resumeResult,
  };
}

async function ensureIgnored(workspaceRoot) {
  const gitPathResult = await runCommand("git rev-parse --git-path info/exclude", workspaceRoot);
  if (!gitPathResult.ok || !gitPathResult.stdout) {
    return false;
  }

  const excludePath = path.isAbsolute(gitPathResult.stdout)
    ? gitPathResult.stdout
    : path.join(workspaceRoot, gitPathResult.stdout);

  fs.mkdirSync(path.dirname(excludePath), { recursive: true });
  const existing = fileExists(excludePath) ? fs.readFileSync(excludePath, "utf8") : "";
  const lines = existing.split(/\r?\n/).filter(Boolean);

  if (!lines.includes(".agent-memory/")) {
    const next = existing.endsWith("\n") || existing.length === 0
      ? `${existing}.agent-memory/\n`
      : `${existing}\n.agent-memory/\n`;
    fs.writeFileSync(excludePath, next, "utf8");
  }

  return true;
}

function renderMarkdown(snapshot) {
  const sections = [
    "# Startup Context",
    "",
    `- generatedAt: \`${snapshot.generatedAt}\``,
    `- workspaceRoot: \`${snapshot.workspaceRoot}\``,
    `- memoryCommand: \`${snapshot.memoryCommand}\``,
    `- resumeScript: \`${snapshot.resumeScriptPath || "(not found)"}\``,
    "",
    "## project-context.sh",
    "",
    "```text",
    snapshot.memory.stdout || snapshot.memory.stderr || "(no output)",
    "```",
    "",
    "## resume-context.sh",
    "",
    "```text",
    snapshot.resume.stdout || snapshot.resume.stderr || "(no output)",
    "```",
    "",
  ];

  return sections.join("\n");
}

async function writeWorkspaceContext(workspaceRoot) {
  const snapshot = await collectWorkspaceContext(workspaceRoot);
  const outputDir = path.join(workspaceRoot, ".agent-memory");
  const markdownPath = path.join(outputDir, "startup-context.md");
  const jsonPath = path.join(outputDir, "startup-context.json");

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(markdownPath, renderMarkdown(snapshot), "utf8");
  fs.writeFileSync(jsonPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
  await ensureIgnored(workspaceRoot);

  return {
    snapshot,
    markdownPath,
    jsonPath,
  };
}

module.exports = {
  collectWorkspaceContext,
  renderMarkdown,
  ensureIgnored,
  writeWorkspaceContext,
};
