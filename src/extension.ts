import * as vscode from 'vscode';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { LlmPromptViewProvider } from './llmPromptViewProvider';

export function activate(context: vscode.ExtensionContext) {
    console.log('LLM Codebase Prompt Gen extension is now active!');

    // Register the webview view provider.
    const viewProvider = new LlmPromptViewProvider(context.extensionUri);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(LlmPromptViewProvider.viewType, viewProvider)
    );

    // Register a command (from the Command Palette) to launch runex and open its output in a new editor.
    const disposable = vscode.commands.registerCommand('llm-codebase-prompt-gen.generatePrompt', async () => {
        await runPythonScriptAndOpenEditor(context);
    });
    context.subscriptions.push(disposable);
}

export function deactivate() {}

async function runPythonScriptAndOpenEditor(context: vscode.ExtensionContext) {
    // Check if Python is installed.
    const pythonInstalled = await checkPythonInstalled();
    if (!pythonInstalled) {
        vscode.window.showErrorMessage('Python 3 is required for this extension. Please install Python 3 and try again.');
        return;
    }
    if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
        vscode.window.showErrorMessage('No workspace folder is open.');
        return;
    }
    const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
    const config = vscode.workspace.getConfiguration('llmPrompt');
    const pythonPath = config.get<string>('pythonPath', 'python3');
    const runexFlags = config.get<string>('runexFlags', '').split(' ').filter(flag => flag);
    const pythonScriptPath = context.asAbsolutePath(path.join('python', 'runex.pex'));
    if (!fs.existsSync(pythonScriptPath)) {
        vscode.window.showErrorMessage(`runex.pex not found at ${pythonScriptPath}`);
        return;
    }
    const args = [workspaceRoot, ...runexFlags];

    await vscode.window.withProgress({
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
                (async () => {
                    const doc = await vscode.workspace.openTextDocument({ content: stdout, language: 'plaintext' });
                    await vscode.window.showTextDocument(doc, { preview: false });
                })();
                resolve();
            });
        });
    });
}

function checkPythonInstalled(): Promise<boolean> {
    return new Promise((resolve) => {
        childProcess.execFile('python3', ['--version'], (error, stdout, stderr) => {
            resolve(!error);
        });
    });
}
