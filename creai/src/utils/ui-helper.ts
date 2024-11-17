import * as vscode from 'vscode';

export class UIHelper {
    private static readonly viewType = 'creai.resultView';
    private static panel: vscode.WebviewPanel | undefined;
    private static terminal: vscode.Terminal | undefined;
    private static statusBar: vscode.StatusBarItem;

    static initialize() {
        this.statusBar = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100
        );
        this.statusBar.text = "$(search) Creai.Dev";
        this.statusBar.command = 'creai.toggleLiveView';
        this.statusBar.show();
    }

    static showResults(title: string, content: string, isLive: boolean = false) {
        if (this.panel) {
            this.panel.reveal();
        } else {
            this.panel = vscode.window.createWebviewPanel(
                this.viewType,
                title,
                vscode.ViewColumn.Two,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true,
                    enableCommandUris: true
                }
            );

            this.panel.onDidDispose(() => {
                this.panel = undefined;
            });
        }

        this.panel.title = title;
        this.panel.webview.html = this.getWebviewContent(title, content, isLive);

        if (isLive) {
            // Setup message handling for live view
            this.panel.webview.onDidReceiveMessage(
                async message => {
                    switch (message.command) {
                        case 'search':
                            await vscode.commands.executeCommand('workbench.action.findInFiles', {
                                query: message.text
                            });
                            break;
                        case 'terminal':
                            await this.executeInTerminal(message.command);
                            break;
                        case 'refresh':
                            await vscode.commands.executeCommand('creai.refresh');
                            break;
                    }
                }
            );
        }
    }

    static async executeInTerminal(command: string): Promise<void> {
        if (!this.terminal) {
            this.terminal = vscode.window.createTerminal('Creai.Dev');
        }
        this.terminal.show();
        this.terminal.sendText(command);
    }

    private static getWebviewContent(title: string, content: string, isLive: boolean = false): string {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { 
                        font-family: var(--vscode-font-family); 
                        padding: 20px;
                        max-width: 1200px;
                        margin: 0 auto;
                    }
                    h1 { color: var(--vscode-editor-foreground); }
                    pre { 
                        background: var(--vscode-editor-background); 
                        padding: 10px;
                        overflow-x: auto;
                    }
                    .toolbar {
                        position: sticky;
                        top: 0;
                        background: var(--vscode-editor-background);
                        padding: 10px;
                        margin-bottom: 20px;
                        border-bottom: 1px solid var(--vscode-panel-border);
                        display: ${isLive ? 'flex' : 'none'};
                        gap: 10px;
                        align-items: center;
                    }
                    .search-box {
                        flex: 1;
                        padding: 5px;
                        background: var(--vscode-input-background);
                        color: var(--vscode-input-foreground);
                        border: 1px solid var(--vscode-input-border);
                    }
                    button {
                        padding: 5px 10px;
                        background: var(--vscode-button-background);
                        color: var(--vscode-button-foreground);
                        border: none;
                        cursor: pointer;
                    }
                    button:hover {
                        background: var(--vscode-button-hoverBackground);
                    }
                    .terminal-input {
                        width: 100%;
                        padding: 5px;
                        margin-top: 10px;
                        background: var(--vscode-input-background);
                        color: var(--vscode-input-foreground);
                        border: 1px solid var(--vscode-input-border);
                    }
                </style>
            </head>
            <body>
                <div class="toolbar">
                    <input type="text" class="search-box" placeholder="Search in files..." id="searchInput">
                    <button onclick="search()">Search</button>
                    <button onclick="refresh()">Refresh</button>
                    <input type="text" class="terminal-input" placeholder="Terminal command..." id="terminalInput">
                    <button onclick="executeCommand()">Run</button>
                </div>
                <h1>${title}</h1>
                <div>${this.formatContent(content)}</div>
                ${isLive ? `
                <script>
                    const vscode = acquireVsCodeApi();
                    
                    function search() {
                        const searchText = document.getElementById('searchInput').value;
                        vscode.postMessage({ command: 'search', text: searchText });
                    }
                    
                    function executeCommand() {
                        const command = document.getElementById('terminalInput').value;
                        vscode.postMessage({ command: 'terminal', text: command });
                        document.getElementById('terminalInput').value = '';
                    }
                    
                    function refresh() {
                        vscode.postMessage({ command: 'refresh' });
                    }

                    // Add Enter key support
                    document.getElementById('searchInput').addEventListener('keypress', (e) => {
                        if (e.key === 'Enter') search();
                    });
                    
                    document.getElementById('terminalInput').addEventListener('keypress', (e) => {
                        if (e.key === 'Enter') executeCommand();
                    });
                </script>
                ` : ''}
            </body>
            </html>
        `;
    }

    private static formatContent(content: string): string {
        // Convert markdown-style code blocks to HTML
        return content.replace(/```(\w+)?\n([\s\S]*?)```/g, 
            (_, lang, code) => `<pre><code class="language-${lang || ''}">${code}</code></pre>`
        );
    }

    static updateLiveView(content: string) {
        if (this.panel) {
            this.showResults('Live View 🔄', content, true);
        }
    }

    static toggleTerminal() {
        if (!this.terminal) {
            this.terminal = vscode.window.createTerminal('Creai.Dev');
        }
        this.terminal.show();
    }
} 