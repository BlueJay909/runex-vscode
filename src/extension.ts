// src/extension.ts
import * as vscode from 'vscode';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { LlmPromptViewProvider } from './llmPromptViewProvider';

export function activate(context: vscode.ExtensionContext) {
    console.log('LLM Codebase Prompt Gen extension is now active!');

    // Register the webview view provider.
    const viewProvider = new LlmPromptViewProvider(context.extensionUri);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(LlmPromptViewProvider.viewType, viewProvider)
    );

    // Register a command (from the Command Palette) that launches the Python script and opens the prompt in a new editor.
    const disposable = vscode.commands.registerCommand('llm-codebase-prompt-gen.generatePrompt', async () => {
        await runPythonScriptAndOpenEditor(context);
    });
    context.subscriptions.push(disposable);
}

export function deactivate() {}

/**
 * Checks if Python is installed by running "python3 --version".
 */
function checkPythonInstalled(): Promise<boolean> {
    return new Promise((resolve) => {
        childProcess.execFile('python3', ['--version'], (error, stdout, stderr) => {
            if (error) {
                resolve(false);
            } else {
                resolve(true);
            }
        });
    });
}

/**
 * Runs the bundled Python script to generate the prompt (via stdout) and opens the output in a new editor.
 */
async function runPythonScriptAndOpenEditor(context: vscode.ExtensionContext) {
    // Check if Python is installed.
    const pythonInstalled = await checkPythonInstalled();
    if (!pythonInstalled) {
        vscode.window.showErrorMessage('Python 3 is required for this extension. Please install Python 3 and try again.');
        return;
    }

    // Ensure a workspace is open.
    if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
        vscode.window.showErrorMessage('No workspace folder is open.');
        return;
    }
    const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;

    // Get the absolute path to the bundled Python script (assumes it is in a folder named "python").
    const pythonScriptPath = context.asAbsolutePath(path.join('python', 'generate_prompt.py'));
    if (!fs.existsSync(pythonScriptPath)) {
        vscode.window.showErrorMessage(`Python script not found at ${pythonScriptPath}`);
        return;
    }

    const args = [workspaceRoot]; // No output file argument needed now.

    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Generating prompt via Python script...",
        cancellable: false
    }, (progress) => {
        return new Promise<void>((resolve) => {
            childProcess.execFile('python3', [pythonScriptPath, ...args], (error, stdout, stderr) => {
                if (error) {
                    vscode.window.showErrorMessage("Error running Python script: " + error.message);
                    console.error("Python script error:", error, stderr);
                    resolve();
                    return;
                }
                // Use stdout as the prompt result.
                (async () => {
                  const doc = await vscode.workspace.openTextDocument({ content: stdout, language: 'plaintext' });
                  await vscode.window.showTextDocument(doc, { preview: false });
                })();
                resolve();
            });
        });
    });
}
