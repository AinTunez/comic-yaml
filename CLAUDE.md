# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

**Build and Compile:**
```bash
npm run compile
```

**Watch Mode (auto-compile on changes):**
```bash
npm run watch
```

**Install Dependencies:**
```bash
npm install
```

**Launch Extension for Testing:**
Press `F5` in VS Code to launch Extension Development Host

## Project Architecture

This is a VS Code extension for previewing YAML comic scripts as formatted markdown.

**Core Components:**

- **Extension Entry** (`src/extension.ts`): Registers commands and manages the extension lifecycle. Handles auto-updates when YAML files change and maintains the webview panel state.

- **Type System** (`src/types.ts`): Defines the data structure for comic scripts including Chapter, Page, Panel, and Dialogue types. These types represent the hierarchical structure of comic scripts.

- **YAML Processing** (`src/yamlConverter.ts`): Converts YAML strings to typed Chapter objects. Handles dialogue parsing with special syntax for narration (`/narration`) and character speech types (`Character/type`).

- **Markdown Rendering** (`src/markdownRenderer.ts`): Converts Chapter objects to formatted markdown. Handles rendering hierarchy from chapters down to individual dialogue lines with proper formatting for panels, captions, and dialogue.

- **Webview Panel** (`src/webviewPanel.ts`): Manages the preview panel UI using VS Code's webview API. Handles real-time updates, HTML generation, and print functionality. Maintains state for error recovery and provides browser-based printing.

**Key Features:**
- Live preview updates as YAML is edited
- Error recovery (maintains last valid state during invalid edits)
- Print functionality via browser
- Support for `.comic.yml` and `.comic.yaml` files

**YAML Format:**
Files use a structured format with `title`, `synopsis`, `credits`, and `pages` containing nested `panels` with `dialogue` arrays. Special dialogue syntax includes `/narration` for narrative text and `Character/type` for different speech types.