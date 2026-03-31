const vscode = require("vscode");
const { writeWorkspaceContext } = require("./resume");

async function refreshAllWorkspaces(output) {
  const folders = vscode.workspace.workspaceFolders || [];

  for (const folder of folders) {
    try {
      const result = await writeWorkspaceContext(folder.uri.fsPath);
      output.appendLine(`Refreshed startup context for ${folder.uri.fsPath}`);
      output.appendLine(`  markdown: ${result.markdownPath}`);
      output.appendLine(`  json: ${result.jsonPath}`);
    } catch (error) {
      output.appendLine(`Failed to refresh ${folder.uri.fsPath}: ${error && error.message ? error.message : String(error)}`);
    }
  }
}

function activate(context) {
  const output = vscode.window.createOutputChannel("Agent Memory Kit");

  const command = vscode.commands.registerCommand("agentMemoryKit.refreshWorkspaceContext", async () => {
    await refreshAllWorkspaces(output);
  });

  context.subscriptions.push(command, output);
  refreshAllWorkspaces(output);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
