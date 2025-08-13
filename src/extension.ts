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
          ComicScriptPreviewPanel.currentPanel.updateContent(yamlContent)
        }
      } else {
        console.log('No YAML file found or no active editor')
      }
    }, 200)
  })

  const openMarkdownPreviewCommand = vscode.commands.registerCommand('comicScriptPreview.openMarkdownPreview', () => {
    console.log('Opening markdown preview...')
    
    // Get the active editor BEFORE creating the document
    const activeEditor = vscode.window.activeTextEditor
    console.log('Active editor:', activeEditor?.document.fileName)
    
    if (activeEditor && isComicYamlFile(activeEditor.document)) {
      console.log('Found comic YAML file, generating markdown...')
      const yamlContent = activeEditor.document.getText()
      
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
    if (activeEditor && 
        event.document === activeEditor.document && 
        isComicYamlFile(event.document) &&
        ComicScriptPreviewPanel.currentPanel) {
      
      const yamlContent = event.document.getText()
      ComicScriptPreviewPanel.currentPanel.updateContent(yamlContent)
    }
  })
  
  // Update preview when switching to a different YAML file
  const onDidChangeActiveTextEditor = vscode.window.onDidChangeActiveTextEditor(editor => {
    if (editor && 
        isComicYamlFile(editor.document) && 
        ComicScriptPreviewPanel.currentPanel) {
      
      const yamlContent = editor.document.getText()
      ComicScriptPreviewPanel.currentPanel.updateContent(yamlContent)
    }
  })
  
  context.subscriptions.push(
    openPreviewCommand,
    openMarkdownPreviewCommand,
    printCommand,
    onDidChangeTextDocument,
    onDidChangeActiveTextEditor
  )
}

function isComicYamlFile(document: vscode.TextDocument): boolean {
  const fileName = document.fileName.toLowerCase()
  return fileName.endsWith('.comic.yml') || fileName.endsWith('.comic.yaml')
}

export function deactivate() {}