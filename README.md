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
credits: 
  - Written by XMAN
  - Edited by YMAN

pages:
  - name: "Opening Scene"  # Optional page name
    panels:
      - name: "Establishing Shot"  # Optional panel name
        desc: "Wide shot of the city skyline at dawn"
        fx: "RUMBLE"
        caption: "The city never sleeps..."
        dialogue:
          - "CHARACTER": "Hello world!"
          - "CHARACTER/thought": "This is a thought bubble"
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

## Testing & Development

This extension includes comprehensive Playwright testing for automated demos and feature validation.

### Running Tests

#### Install Test Dependencies
```bash
npm install
npm run install:playwright
```

#### Run VS Code Extension Tests
```bash
npm run test
```

#### Run Playwright Tests
```bash
# Run all Playwright tests
npm run test:playwright

# Run with UI (interactive)
npm run test:playwright:ui

# Run only the comprehensive demo test
npm run test:playwright:demo
```

### Automated Demo Features

The Playwright tests include a comprehensive demo that automatically:

1. **Creates a complete comic script** with title, synopsis, credits, and multiple pages
2. **Demonstrates HTML Preview** with professional comic script formatting
3. **Shows Markdown Export** with clean, export-ready formatting
4. **Tests Live Updates** by editing YAML in real-time
5. **Validates Error Handling** with invalid YAML parsing

## License

This extension is licensed under the [MIT License](LICENSE).