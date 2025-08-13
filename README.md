# Comic Script Preview

A VS Code extension for previewing YAML comic scripts as formatted markdown.

## Features

- **Live Preview**: Open a side-by-side preview of your YAML comic script files
- **Auto-Update**: Preview automatically updates as you edit the YAML content
- **Comic Script Format**: Supports the structured comic script format with chapters, pages, panels, and dialogue
- **VS Code Integration**: Works seamlessly with VS Code's editor and theme system

## Usage

1. Open a `.comic.yml` or `.comic.yaml` file containing a comic script
2. Click the preview button in the editor title bar, or use the command palette:
   - `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
   - Type "Open Comic Script Preview"
3. The preview panel will open to the side showing your formatted comic script
4. Use the print button in the preview to print or save as PDF

## Comic Script YAML Format

The extension expects YAML files with this structure:

```yaml
title: "Chapter Title"
synopsis: "Optional chapter synopsis"
credits: "Writer: John Doe, Artist: Jane Smith"

pages:
  - name: "Opening Scene"  # Optional page name
    panels:
      - name: "Establishing Shot"  # Optional panel name
        desc: "Wide shot of the city skyline at dawn"
        fx: "RUMBLE"
        caption: "The city never sleeps..."
        dialogue:
          - "Character/speech": "Hello world!"
          - "Character/thought": "This is a thought bubble"
          - "/narration": "Narrative text"
        endCaption: "To be continued..."
```

## Development

To build and test the extension:

1. Install dependencies: `npm install`
2. Compile: `npm run compile`
3. Open in VS Code and press F5 to launch Extension Development Host

## Requirements

- VS Code ^1.74.0
- YAML files with comic script structure