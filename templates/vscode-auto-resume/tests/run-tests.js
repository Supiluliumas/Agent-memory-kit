const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");

const { writeWorkspaceContext } = require("../resume");

async function main() {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "agent-memory-kit-"));
  const fakeHome = path.join(tempRoot, "home");
  const workspaceRoot = path.join(tempRoot, "workspace");

  fs.mkdirSync(path.join(fakeHome, ".agent-memory"), { recursive: true });
  fs.mkdirSync(path.join(workspaceRoot, "scripts"), { recursive: true });
  fs.mkdirSync(workspaceRoot, { recursive: true });
  require("child_process").execFileSync("git", ["init"], { cwd: workspaceRoot, stdio: "ignore" });

  fs.writeFileSync(
    path.join(fakeHome, ".agent-memory", "project-context.sh"),
    "#!/bin/sh\necho 'project root: test-workspace'\necho 'current goal: restore context'\n",
    "utf8"
  );
  fs.writeFileSync(
    path.join(workspaceRoot, "scripts", "resume-context.sh"),
    "#!/bin/sh\necho 'Security HUB resume context'\necho 'immediate next step: continue testing'\n",
    "utf8"
  );

  fs.chmodSync(path.join(fakeHome, ".agent-memory", "project-context.sh"), 0o755);
  fs.chmodSync(path.join(workspaceRoot, "scripts", "resume-context.sh"), 0o755);

  const originalHome = process.env.HOME;
  process.env.HOME = fakeHome;

  try {
    const result = await writeWorkspaceContext(workspaceRoot);
    const markdown = fs.readFileSync(result.markdownPath, "utf8");
    const json = JSON.parse(fs.readFileSync(result.jsonPath, "utf8"));
    const exclude = fs.readFileSync(path.join(workspaceRoot, ".git", "info", "exclude"), "utf8");

    assert(markdown.includes("project root: test-workspace"));
    assert(markdown.includes("immediate next step: continue testing"));
    assert.strictEqual(json.resumeScriptPath, "scripts/resume-context.sh");
    assert.strictEqual(json.memory.ok, true);
    assert(exclude.includes(".agent-memory/"));
  } finally {
    process.env.HOME = originalHome;
  }

  console.log("VS Code auto-resume tests passed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
