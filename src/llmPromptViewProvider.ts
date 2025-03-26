import * as vscode from 'vscode';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export class LlmPromptViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'llmPromptWebview';
  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    console.log("Resolving LLM Prompt view (using runex.pex)");
    this._view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };

    webviewView.webview.html = this.getHtmlContent();

    webviewView.webview.onDidReceiveMessage(async message => {
      switch (message.command) {
        case 'executePython':
          this.runPythonScript();
          break;
        case 'copy':
          await vscode.env.clipboard.writeText(message.text);
          vscode.window.showInformationMessage('Prompt copied to clipboard!');
          break;
        case 'openEditor': {
          const doc = await vscode.workspace.openTextDocument({ content: message.text, language: 'plaintext' });
          await vscode.window.showTextDocument(doc, { preview: false });
          break;
        }
        case 'openIgnore': {
          const folders = vscode.workspace.workspaceFolders;
          if (folders && folders.length > 0) {
            const workspaceRoot = folders[0].uri.fsPath;
            const ignorePath = path.join(workspaceRoot, ".gitignore");
            if (fs.existsSync(ignorePath)) {
              const doc = await vscode.workspace.openTextDocument(ignorePath);
              await vscode.window.showTextDocument(doc);
            } else {
              vscode.window.showInformationMessage('.gitignore file not found.');
            }
          } else {
            vscode.window.showErrorMessage("No workspace folder open");
          }
          break;
        }
        default:
          break;
      }
    });
  }

  private runPythonScript() {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders || folders.length === 0) {
      vscode.window.showErrorMessage('No workspace folder is open.');
      return;
    }
    const workspaceRoot = folders[0].uri.fsPath;

    // Read configuration settings.
    const config = vscode.workspace.getConfiguration('llmPrompt');
    const pythonPath = config.get<string>('pythonPath', 'python3');
    const runexFlags = config.get<string>('runexFlags', '').split(' ').filter(flag => flag);

    // Get the absolute path to the bundled runex.pex.
    const pythonScriptPath = this._extensionUri.fsPath
      ? path.join(this._extensionUri.fsPath, 'python', 'runex.pex')
      : '';
    if (!fs.existsSync(pythonScriptPath)) {
      vscode.window.showErrorMessage(`runex.pex not found at ${pythonScriptPath}`);
      return;
    }

    // Build arguments: workspace root plus any additional flags.
    const args = [workspaceRoot, ...runexFlags];

    vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: "Generating prompt via runex...",
      cancellable: false
    }, (progress) => {
      return new Promise<void>((resolve) => {
        childProcess.execFile(pythonPath, [pythonScriptPath, ...args], (error, stdout, stderr) => {
          if (error) {
            vscode.window.showErrorMessage("Error running runex: " + error.message);
            console.error("runex error:", error, stderr);
            resolve();
            return;
          }
          this._view?.webview.postMessage({ command: 'updatePrompt', prompt: stdout });
          resolve();
        });
      });
    });
  }

  private getHtmlContent(): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>LLM Prompt</title>
  <style>
    body {
      font-family: var(--vscode-font-family, sans-serif);
      padding: 10px;
      background-color: var(--vscode-editor-background);
      color: var(--vscode-editor-foreground);
    }
    h2 {
      color: var(--vscode-editor-foreground);
    }
    button {
      margin: 5px;
      padding: 5px 10px;
      background-color: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: 1px solid var(--vscode-button-border);
      border-radius: 2px;
      cursor: pointer;
    }
    button:hover {
      background-color: var(--vscode-button-hoverBackground);
    }
    pre {
      white-space: pre-wrap;
      word-wrap: break-word;
      background-color: var(--vscode-editorWidget-background);
      color: var(--vscode-editorWidget-foreground);
      padding: 10px;
      border: 1px solid var(--vscode-editorWidget-border);
      max-height: 300px;
      overflow-y: auto;
    }
  </style>
</head>
<body>
  <h2>LLM Codebase Prompt Generator</h2>
  <p>This tool uses .gitignore rules.</p>
  <div>
    <button id="executeButton">Generate Prompt (Python)</button>
    <button id="copyButton">Copy Prompt</button>
    <button id="openEditorButton">Open in Editor</button>
    <button id="openIgnoreButton">Open .gitignore</button>
  </div>
  <pre id="prompt">Click "Generate Prompt (Python)" to run.</pre>
  <script>
    const vscode = acquireVsCodeApi();
    document.getElementById('executeButton').addEventListener('click', () => {
      vscode.postMessage({ command: 'executePython' });
    });
    document.getElementById('copyButton').addEventListener('click', () => {
      const text = document.getElementById('prompt').innerText;
      vscode.postMessage({ command: 'copy', text: text });
    });
    document.getElementById('openEditorButton').addEventListener('click', () => {
      const text = document.getElementById('prompt').innerText;
      vscode.postMessage({ command: 'openEditor', text: text });
    });
    document.getElementById('openIgnoreButton').addEventListener('click', () => {
      vscode.postMessage({ command: 'openIgnore' });
    });
    window.addEventListener('message', event => {
      const message = event.data;
      if (message.command === 'updatePrompt') {
        document.getElementById('prompt').innerText = message.prompt;
      }
    });
  </script>
</body>
</html>
    `;
  }
}
