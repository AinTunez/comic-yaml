import * as vscode from 'vscode'
import { yamlToChapter } from './yamlConverter'
import { renderChapter } from './markdownRenderer'

export class ComicScriptPreviewPanel {
  public static currentPanel: ComicScriptPreviewPanel | undefined
  
  public static readonly viewType = 'comicScriptPreview'
  
  private readonly _panel: vscode.WebviewPanel
  private readonly _extensionUri: vscode.Uri
  private _disposables: vscode.Disposable[] = []
  private _currentMarkdown: string = ''
  private _lastValidYaml: string = ''
  
  public static createOrShow(extensionUri: vscode.Uri) {
    const column = vscode.window.activeTextEditor
      ? vscode.ViewColumn.Beside
      : undefined
    
    if (ComicScriptPreviewPanel.currentPanel) {
      ComicScriptPreviewPanel.currentPanel._panel.reveal(column)
      return
    }
    
    const panel = vscode.window.createWebviewPanel(
      ComicScriptPreviewPanel.viewType,
      'Comic Script Preview',
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [
          vscode.Uri.joinPath(extensionUri, 'media')
        ]
      }
    )
    
    ComicScriptPreviewPanel.currentPanel = new ComicScriptPreviewPanel(panel, extensionUri)
  }
  
  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel
    this._extensionUri = extensionUri
    
    this._update()
    
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables)
    
    this._panel.onDidChangeViewState(
      e => {
        if (this._panel.visible) {
          this._update()
        }
      },
      null,
      this._disposables
    )

    this._panel.webview.onDidReceiveMessage(
      message => {
        switch (message.command) {
          case 'print':
            this._handlePrint()
            break
        }
      },
      undefined,
      this._disposables
    )
  }
  
  public updateContent(yamlContent: string) {
    console.log('Updating content with YAML:', yamlContent.substring(0, 100) + '...')
    
    try {
      // Try to parse the YAML
      const chapter = yamlToChapter(yamlContent)
      console.log('Converted chapter:', chapter)
      const markdown = renderChapter(chapter)
      console.log('Generated markdown:', markdown.substring(0, 200) + '...')
      
      // If successful, store both the YAML and markdown
      this._lastValidYaml = yamlContent
      this._currentMarkdown = markdown
      
      // Update the HTML
      this._panel.webview.html = this._getHtmlForWebview(this._panel.webview, markdown)
      
    } catch (error) {
      console.log('YAML parsing failed, using last valid content:', error)
      
      // If we have last valid YAML, use that
      if (this._lastValidYaml) {
        try {
          const chapter = yamlToChapter(this._lastValidYaml)
          const markdown = renderChapter(chapter)
          this._currentMarkdown = markdown
          this._panel.webview.html = this._getHtmlForWebview(this._panel.webview, markdown)
        } catch (fallbackError) {
          console.log('Fallback parsing also failed:', fallbackError)
          // Keep the existing content if fallback fails too
        }
      }
      // If no valid YAML exists yet, keep whatever content is currently shown
    }
  }

  public getCurrentMarkdown(): string {
    return this._currentMarkdown
  }

  public print() {
    this._handlePrint()
  }

  private async _handlePrint() {
    try {
      const fs = require('fs')
      const path = require('path')
      const os = require('os')
      
      // Create a printable HTML version without the print button
      const printableHtml = this._getPrintableHtml()
      
      // Create a temporary HTML file
      const tempDir = os.tmpdir()
      const tempFile = path.join(tempDir, `comic-script-${Date.now()}.html`)
      
      fs.writeFileSync(tempFile, printableHtml)
      
      // Open in default browser
      await vscode.env.openExternal(vscode.Uri.file(tempFile))
      
      vscode.window.showInformationMessage('Comic script opened in browser for printing. The temporary file will be cleaned up automatically.')
      
      // Clean up the temp file after a delay
      setTimeout(() => {
        try {
          if (fs.existsSync(tempFile)) {
            fs.unlinkSync(tempFile)
          }
        } catch (e) {
          // Ignore cleanup errors
        }
      }, 30000) // 30 seconds
      
    } catch (error) {
      vscode.window.showErrorMessage(`Print failed: ${error}`)
    }
  }

  private _getPrintableHtml(): string {
    const content = this._currentMarkdown ? this._markdownToHtml(this._currentMarkdown) : `
      <h1>Comic Script Preview</h1>
      <p>No content available for printing.</p>
    `;

    return this._getHtmlTemplate(content, false);
  }

  public dispose() {
    ComicScriptPreviewPanel.currentPanel = undefined
    
    this._panel.dispose()
    
    while (this._disposables.length) {
      const x = this._disposables.pop()
      if (x) {
        x.dispose()
      }
    }
  }
  
  private _update() {
    const webview = this._panel.webview
    
    this._panel.title = 'Comic Script Preview'
    this._panel.webview.html = this._getHtmlForWebview(webview, this._currentMarkdown)
  }
  
  private _getHtmlForWebview(webview: vscode.Webview, markdown?: string) {
    const content = markdown ? this._markdownToHtml(markdown) : `
      <h1>Comic Script Preview</h1>
      <p>Select a YAML file and click the preview button to see the comic script rendered here.</p>
    `;
    return this._getHtmlTemplate(content, true);
  }

  private _getHtmlTemplate(content: string, includeButton: boolean): string {
    const printButton = includeButton ? `
            <div class="print-button">
                <button id="printBtn" style="
                    background-color: #0366d6;
                    color: #fff;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-family: inherit;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                ">🖨️ Print</button>
            </div>` : '';

    const printButtonScript = includeButton ? `
        <script>
            const vscode = acquireVsCodeApi();
            
            document.addEventListener('DOMContentLoaded', function() {
                const printBtn = document.getElementById('printBtn');
                if (printBtn) {
                    printBtn.addEventListener('click', function() {
                        console.log('Print button clicked');
                        vscode.postMessage({ command: 'print' });
                    });
                } else {
                    console.error('Print button not found');
                }
            });
        </script>` : '';

    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Comic Script Preview${includeButton ? '' : ' - Print'}</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.4;
                margin: 0;
                padding: 1rem;
                color: #000;
                background-color: #fff;
                font-size: 12px;
            }
            
            h1 {
                color: #333;
                font-size: 18px;
                margin: 1rem 0;
                font-weight: 700;
                text-align: center;
            }
            
            h2 {
                color: #555;
                margin: 1.5rem 0 0.5rem 0;
                font-size: 16px;
                font-weight: 600;
                border-bottom: 1px solid #e0e0e0;
                padding-bottom: 0.2rem;
            }
            
            h2:first-of-type {
                margin-top: 2.5rem;
            }
            
            h3 {
                color: #666;
                margin: 1.5rem 0 0.5rem 0;
                font-size: 12px;
                font-weight: 500;
            }
            
            p {
                margin: 0.5rem 0;
                line-height: 1.5;
                font-size: 12px;
                color: #000;
            }
            
            blockquote {
                border-left: 3px solid #dfe2e5;
                padding: 0.5rem 0.75rem;
                margin: 0.75rem 0;
                color: #6a737d;
                background: #f6f8fa;
                font-size: 12px;
                line-height: 1.4;
            }
            
            blockquote p {
                margin: 0.25rem 0;
                line-height: 1.4;
                color: #6a737d;
            }
            
            blockquote p:first-child {
                margin-top: 0;
            }
            
            blockquote p:last-child {
                margin-bottom: 0;
            }
            
            em {
                font-style: italic;
                color: inherit;
            }
            
            strong {
                font-weight: bold;
                color: inherit;
            }
            
            .content {
                max-width: 800px;
                margin: 0 auto;
                ${includeButton ? 'position: relative;' : ''}
            }
            
            ${includeButton ? `
            .print-button {
                position: absolute;
                top: 10px;
                right: 10px;
                z-index: 1000;
            }
            
            @media print {
                .print-button {
                    display: none !important;
                }
            }` : ''}
        </style>
    </head>
    <body>
        <div class="content">
            ${printButton}
            <div${includeButton ? ' id="preview-content"' : ''}>
                ${content}
            </div>
        </div>
        ${printButtonScript}
    </body>
    </html>`;
  }

  private _markdownToHtml(markdown: string): string {
    const lines = markdown.split('\n');
    let html = '';
    let inBlockquote = false;
    let blockquoteContent = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.startsWith('> ')) {
        if (!inBlockquote) {
          inBlockquote = true;
          blockquoteContent = '';
        }
        const content = line.substring(2);
        if (blockquoteContent) blockquoteContent += '\n';
        blockquoteContent += content;
      } else {
        if (inBlockquote) {
          html += '<blockquote>' + this._processBlockquoteContent(blockquoteContent) + '</blockquote>\n';
          inBlockquote = false;
          blockquoteContent = '';
        }
        
        if (line.trim() === '') {
          html += '\n';
        } else if (line.startsWith('# ')) {
          html += '<h1>' + line.substring(2) + '</h1>\n';
        } else if (line.startsWith('## ')) {
          html += '<h2>' + line.substring(3) + '</h2>\n';
        } else if (line.startsWith('### ')) {
          html += '<h3>' + line.substring(4) + '</h3>\n';
        } else {
          html += '<p>' + this._processInlineFormatting(line) + '</p>\n';
        }
      }
    }
    
    if (inBlockquote) {
      html += '<blockquote>' + this._processBlockquoteContent(blockquoteContent) + '</blockquote>\n';
    }
    
    return html;
  }

  private _processBlockquoteContent(content: string): string {
    const lines = content.split('\n').filter(line => line.trim());
    let html = '';
    
    for (const line of lines) {
      if (line.trim() === '') continue;
      
      if (line.startsWith('>')) {
        html += '<p>' + this._processInlineFormatting(line.substring(1).trim()) + '</p>\n';
      } else {
        html += '<p>' + this._processInlineFormatting(line) + '</p>\n';
      }
    }
    
    return html;
  }

  private _processInlineFormatting(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
  }
}