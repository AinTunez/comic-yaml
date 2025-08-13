# Comic YAML

Transform your YAML comic scripts into beautifully formatted, professional previews directly in VS Code. Perfect for comic writers, graphic novel authors, and anyone working with sequential art narratives.

## Features

- 📖 **Live Preview**: Open a side-by-side preview of your YAML comic script files
- 🔄 **Auto-Update**: Preview automatically updates as you edit the YAML content
- 🎨 **Professional Formatting**: Clean, readable layout optimized for comic scripts
- 🖨️ **Print & Export**: Save your scripts as PDF with one click
- 📝 **Structured Format**: Full support for chapters, pages, panels, dialogue, and narrative elements
- ⚡ **Smart Error Recovery**: Maintains last valid preview even with syntax errors
- 🎯 **VS Code Integration**: Works seamlessly with VS Code's editor and theme system

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

## Installation

### From VS Code Marketplace
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X / Cmd+Shift+X)
3. Search for "Comic YAML"
4. Click Install

### Manual Installation
1. Download the `.vsix` file from the releases page
2. In VS Code, go to Extensions
3. Click the "..." menu and select "Install from VSIX..."

## Requirements

- VS Code version 1.74.0 or higher
- YAML files following the comic script structure (`.comic.yml` or `.comic.yaml`)

## Extension Settings

This extension works out of the box with no configuration required.

## Known Issues

Please report issues on our [GitHub repository](https://github.com/aintunez/comic-yaml/issues).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This extension is licensed under the [MIT License](LICENSE).