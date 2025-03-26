# llm-codebase-prompt-gen README

The extension packages runex as a pex

pip install pex

pex runex -m runex.cli -o runex.pex

then it runs it:

[your python interpreter] runex.pex [args] root-dir out-file



## Features

Describe specific features of your extension including screenshots of your extension in action. Image paths are relative to this README file.

For example if there is an image subfolder under your extension project workspace:

\!\[feature X\]\(images/feature-x.png\)

> Tip: Many popular extensions utilize animations. This is an excellent way to show off your extension! We recommend short, focused animations that are easy to follow.

## Requirements

You need to have a python interpreter installed.
Python 3 is required.

## Extension Settings

Through the `contributes.configuration` extension point this extension contributes the following settings:

* `llmPrompt.pythonPath`: set python interpreter path, default `python3`
* `llmPrompt.runexFlags`: Command-line flags to pass to runex.pex (e.g. '-s' for structure-only, '-oj' for JSON output).

## Known Issues



## Release Notes

### 0.0.2
runex packaged as pex


---

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

* Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)


