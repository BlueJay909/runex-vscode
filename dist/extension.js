/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(__webpack_require__(1));
const childProcess = __importStar(__webpack_require__(2));
const fs = __importStar(__webpack_require__(3));
const path = __importStar(__webpack_require__(4));
const llmPromptViewProvider_1 = __webpack_require__(5);
function activate(context) {
    console.log('LLM Codebase Prompt Gen extension is now active!');
    // Register the webview view provider.
    const viewProvider = new llmPromptViewProvider_1.LlmPromptViewProvider(context.extensionUri);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(llmPromptViewProvider_1.LlmPromptViewProvider.viewType, viewProvider));
    // Register a command (from the Command Palette) to launch runex and open its output in a new editor.
    const disposable = vscode.commands.registerCommand('llm-codebase-prompt-gen.generatePrompt', async () => {
        await runPythonScriptAndOpenEditor(context);
    });
    context.subscriptions.push(disposable);
}
function deactivate() { }
async function runPythonScriptAndOpenEditor(context) {
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
    const pythonPath = config.get('pythonPath', 'python3');
    const runexFlags = config.get('runexFlags', '').split(' ').filter(flag => flag);
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
        return new Promise((resolve) => {
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
function checkPythonInstalled() {
    return new Promise((resolve) => {
        childProcess.execFile('python3', ['--version'], (error, stdout, stderr) => {
            resolve(!error);
        });
    });
}


/***/ }),
/* 1 */
/***/ ((module) => {

module.exports = require("vscode");

/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = require("child_process");

/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = require("fs");

/***/ }),
/* 4 */
/***/ ((module) => {

module.exports = require("path");

/***/ }),
/* 5 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LlmPromptViewProvider = void 0;
const vscode = __importStar(__webpack_require__(1));
const childProcess = __importStar(__webpack_require__(2));
const fs = __importStar(__webpack_require__(3));
const path = __importStar(__webpack_require__(4));
class LlmPromptViewProvider {
    _extensionUri;
    static viewType = 'llmPromptWebview';
    _view;
    constructor(_extensionUri) {
        this._extensionUri = _extensionUri;
    }
    resolveWebviewView(webviewView, context, _token) {
        console.log("Resolving LLM Prompt view (using runex.pex)");
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };
        webviewView.webview.html = this.getHtmlContent();
        webviewView.webview.onDidReceiveMessage(async (message) => {
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
                        }
                        else {
                            vscode.window.showInformationMessage('.gitignore file not found.');
                        }
                    }
                    else {
                        vscode.window.showErrorMessage("No workspace folder open");
                    }
                    break;
                }
                default:
                    break;
            }
        });
    }
    runPythonScript() {
        const folders = vscode.workspace.workspaceFolders;
        if (!folders || folders.length === 0) {
            vscode.window.showErrorMessage('No workspace folder is open.');
            return;
        }
        const workspaceRoot = folders[0].uri.fsPath;
        // Read configuration settings.
        const config = vscode.workspace.getConfiguration('llmPrompt');
        const pythonPath = config.get('pythonPath', 'python3');
        const runexFlags = config.get('runexFlags', '').split(' ').filter(flag => flag);
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
            return new Promise((resolve) => {
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
    getHtmlContent() {
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
exports.LlmPromptViewProvider = LlmPromptViewProvider;


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(0);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;
//# sourceMappingURL=extension.js.map