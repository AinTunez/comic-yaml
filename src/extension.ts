import * as vscode from 'vscode'
import { ComicScriptPreviewPanel } from './webviewPanel'

export function activate(context: vscode.ExtensionContext) {
  const openPreviewCommand = vscode.commands.registerCommand('comicScriptPreview.openPreview', () => {
    console.log('Opening comic script preview...')
    
    // Get the active editor BEFORE creating the panel
    const activeEditor = vscode.window.activeTextEditor
    console.log('Active editor:', activeEditor?.document.fileName)
    
    ComicScriptPreviewPanel.createOrShow(context.extensionUri)
    
    // Small delay to ensure panel is fully created before updating content
    setTimeout(() => {
      if (activeEditor && isComicYamlFile(activeEditor.document)) {
        console.log('Found YAML file, updating content...')
        const yamlContent = activeEditor.document.getText()
        console.log('YAML content length:', yamlContent.length)
        if (ComicScriptPreviewPanel.currentPanel) {
          ComicScriptPreviewPanel.currentPanel.setSourceDocument(activeEditor.document)
          ComicScriptPreviewPanel.currentPanel.updateContent(yamlContent)
        }
      } else {
        console.log('No YAML file found or no active editor')
      }
    }, 200)
  })

  const openMarkdownPreviewCommand = vscode.commands.registerCommand('comicScriptPreview.openMarkdownPreview', () => {
    console.log('Opening markdown preview...')
    
    // Function to find a comic YAML file among open editors
    const findComicYamlEditor = (): vscode.TextEditor | undefined => {
      // First check if the active editor is a comic YAML file
      const activeEditor = vscode.window.activeTextEditor
      if (activeEditor && isComicYamlFile(activeEditor.document)) {
        return activeEditor
      }
      
      // If we have a preview panel with a tracked source document, use that
      if (ComicScriptPreviewPanel.currentPanel) {
        const sourceDoc = ComicScriptPreviewPanel.currentPanel.getSourceDocument()
        if (sourceDoc && isComicYamlFile(sourceDoc)) {
          // Find the editor for this document
          const editor = vscode.window.visibleTextEditors.find(e => e.document === sourceDoc)
          if (editor) {
            return editor
          }
          // Return pseudo-editor if no actual editor found
          return { document: sourceDoc } as vscode.TextEditor
        }
      }
      
      // If not, search through all visible editors
      for (const editor of vscode.window.visibleTextEditors) {
        if (isComicYamlFile(editor.document)) {
          return editor
        }
      }
      
      // If still not found, check all open editors (tabs)
      for (const document of vscode.workspace.textDocuments) {
        if (isComicYamlFile(document)) {
          // Return a pseudo-editor object with the document
          return vscode.window.visibleTextEditors.find(e => e.document === document) ||
                 { document } as vscode.TextEditor
        }
      }
      
      return undefined
    }
    
    const yamlEditor = findComicYamlEditor()
    console.log('Found YAML editor:', yamlEditor?.document.fileName)
    
    if (yamlEditor) {
      console.log('Found comic YAML file, generating markdown...')
      const yamlContent = yamlEditor.document.getText()
      
      // Convert YAML to markdown
      const { yamlToChapter } = require('./yamlConverter')
      const { renderChapter } = require('./markdownRenderer')
      
      try {
        // Try to get current markdown from the preview panel first
        let markdown = ''
        if (ComicScriptPreviewPanel.currentPanel) {
          markdown = ComicScriptPreviewPanel.currentPanel.getCurrentMarkdown()
        }
        
        if (!markdown) {
          // Fall back to generating markdown directly
          const chapter = yamlToChapter(yamlContent)
          markdown = renderChapter(chapter)
        }
        
        // Create a webview panel for the markdown preview
        const panel = vscode.window.createWebviewPanel(
          'markdownPreview',
          'Comic Script Markdown',
          vscode.ViewColumn.Beside,
          {
            enableScripts: false,
            retainContextWhenHidden: true
          }
        )
        
        panel.webview.html = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Comic Script Markdown</title>
            <style>
                body {
                    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                    line-height: 1.5;
                    margin: 0;
                    padding: 20px;
                    color: #333;
                    background-color: #fff;
                    font-size: 14px;
                }
                pre {
                    white-space: pre-wrap;
                    word-wrap: break-word;
                    margin: 0;
                }
            </style>
        </head>
        <body>
            <pre>${markdown.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
        </body>
        </html>`
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to generate markdown: ${error}`)
      }
    } else {
      vscode.window.showInformationMessage('Please open a .comic.yml or .comic.yaml file first')
    }
  })

  const printCommand = vscode.commands.registerCommand('comicScriptPreview.print', () => {
    if (ComicScriptPreviewPanel.currentPanel) {
      ComicScriptPreviewPanel.currentPanel.print()
    } else {
      vscode.window.showInformationMessage('Please open the preview first')
    }
  })
  
  // Auto-update preview when YAML content changes
  const onDidChangeTextDocument = vscode.workspace.onDidChangeTextDocument(event => {
    const activeEditor = vscode.window.activeTextEditor
    
    // Update if the changed document is a comic YAML file and we have a preview panel
    if (isComicYamlFile(event.document) && ComicScriptPreviewPanel.currentPanel) {
      // Check if this is the document we should be tracking
      const shouldUpdate = 
        (activeEditor && event.document === activeEditor.document) || // YAML file is active
        (ComicScriptPreviewPanel.currentPanel.getSourceDocument() === event.document) // Preview panel is active, tracking this YAML
      
      if (shouldUpdate) {
        const yamlContent = event.document.getText()
        ComicScriptPreviewPanel.currentPanel.setSourceDocument(event.document)
        ComicScriptPreviewPanel.currentPanel.updateContent(yamlContent)
      }
    }
  })
  
  // Update preview when switching to a different YAML file
  const onDidChangeActiveTextEditor = vscode.window.onDidChangeActiveTextEditor(editor => {
    // Only update if we have a preview panel
    if (!ComicScriptPreviewPanel.currentPanel) {
      return
    }
    
    // If switching to a comic YAML file, update the preview
    if (editor && isComicYamlFile(editor.document)) {
      const yamlContent = editor.document.getText()
      ComicScriptPreviewPanel.currentPanel.setSourceDocument(editor.document)
      ComicScriptPreviewPanel.currentPanel.updateContent(yamlContent)
    }
    // When switching away from a YAML file, keep the preview content
    // The panel already retains its last valid state, so we don't need to do anything
  })
  
  // Throttle mechanism for cursor sync
  let syncTimeout: NodeJS.Timeout | undefined
  
  // Sync preview based on cursor position
  const onDidChangeTextEditorSelection = vscode.window.onDidChangeTextEditorSelection(event => {
    const editor = event.textEditor
    
    // Check if this is a comic YAML file and we have a preview panel
    if (isComicYamlFile(editor.document) && ComicScriptPreviewPanel.currentPanel) {
      // Check if this is the document being tracked
      const trackedDoc = ComicScriptPreviewPanel.currentPanel.getSourceDocument()
      if (trackedDoc === editor.document) {
        // Clear any pending sync
        if (syncTimeout) {
          clearTimeout(syncTimeout)
        }
        
        // Throttle the sync to avoid too many updates during rapid navigation
        syncTimeout = setTimeout(() => {
          // Get the cursor position
          const cursorPosition = event.selections[0]?.active
          if (cursorPosition) {
            const cursorLine = cursorPosition.line
            
            // Find the structural context at the cursor line
            const context = findYamlContext(editor.document, cursorLine)
            
            if (context && ComicScriptPreviewPanel.currentPanel) {
              // Send context-based scroll update to preview panel
              ComicScriptPreviewPanel.currentPanel.syncScrollToElement(context)
            }
          }
        }, 100) // 100ms delay for throttling
      }
    }
  })
  
  context.subscriptions.push(
    openPreviewCommand,
    openMarkdownPreviewCommand,
    printCommand,
    onDidChangeTextDocument,
    onDidChangeActiveTextEditor,
    onDidChangeTextEditorSelection
  )
}

function isComicYamlFile(document: vscode.TextDocument): boolean {
  const fileName = document.fileName.toLowerCase()
  return fileName.endsWith('.comic.yml') || fileName.endsWith('.comic.yaml')
}

function findYamlContext(document: vscode.TextDocument, lineNumber: number): { pageIndex?: number, panelIndex?: number } | null {
  const text = document.getText()
  const lines = text.split('\n')
  
  // Track current context as we parse
  let currentPageIndex = -1
  let currentPanelIndex = -1
  let inPages = false
  let inPanels = false
  
  for (let i = 0; i <= lineNumber && i < lines.length; i++) {
    const line = lines[i]
    const trimmedLine = line.trim()
    
    // Check if we're entering pages section
    if (trimmedLine === 'pages:') {
      inPages = true
      currentPageIndex = -1
      currentPanelIndex = -1
      continue
    }
    
    // Check for page start - pages can start with any field (name, layout, panels, etc.)
    // Look for "  - " at the beginning (2 spaces, dash, space)
    if (inPages && /^  - /.test(line)) {
      currentPageIndex++
      currentPanelIndex = -1
      inPanels = false
    }
    
    // Check if we're entering panels section
    if (inPages && /^    panels:/.test(line)) {
      inPanels = true
      currentPanelIndex = -1
      continue
    }
    
    // Check for panel start (6 spaces, dash, space)
    if (inPanels && /^      - /.test(line)) {
      currentPanelIndex++
    }
  }
  
  // Return the context if we found valid indices
  if (currentPageIndex >= 0) {
    return {
      pageIndex: currentPageIndex,
      panelIndex: currentPanelIndex >= 0 ? currentPanelIndex : undefined
    }
  }
  
  return null
}

export function deactivate() {}