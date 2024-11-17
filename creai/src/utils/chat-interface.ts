import * as vscode from 'vscode';
import { AIService } from './ai-service';

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export class ChatInterface {
    private static readonly viewType = 'creai.chatView';
    private static panel: vscode.WebviewPanel | undefined;
    private static messages: ChatMessage[] = [];
    private static aiService: AIService;

    static initialize(aiService: AIService) {
        this.aiService = aiService;
    }

    static show() {
        if (this.panel) {
            this.panel.reveal();
        } else {
            this.panel = vscode.window.createWebviewPanel(
                this.viewType,
                'Creai Chat 💬',
                vscode.ViewColumn.Two,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true,
                }
            );

            this.panel.onDidDispose(() => {
                this.panel = undefined;
            });

            // Handle messages from the webview
            this.panel.webview.onDidReceiveMessage(
                async message => {
                    switch (message.command) {
                        case 'sendMessage':
                            await this.handleUserMessage(message.text);
                            break;
                        case 'clearChat':
                            this.clearChat();
                            break;
                    }
                }
            );
        }

        this.updateChatView();
    }

    private static async handleUserMessage(content: string) {
        // Add user message to chat
        this.messages.push({
            role: 'user',
            content,
            timestamp: new Date()
        });

        this.updateChatView();

        // Process with AI and get response
        try {
            const response = await this.processUserMessage(content);
            this.messages.push({
                role: 'assistant',
                content: response,
                timestamp: new Date()
            });
            this.updateChatView();
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to get AI response: ${error}`);
        }
    }

    private static async processUserMessage(content: string): Promise<string> {
        // Get current file or workspace context
        const editor = vscode.window.activeTextEditor;
        const context = editor ? editor.document.getText() : 'No file open';

        // Process with AI
        const response = await this.aiService.processChatMessage(content, context, this.messages);
        return response;
    }

    private static clearChat() {
        this.messages = [];
        this.updateChatView();
    }

    private static updateChatView() {
        if (!this.panel) return;

        this.panel.webview.html = this.getChatHtml();
    }

    private static getChatHtml(): string {
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
                        margin: 0;
                        display: flex;
                        flex-direction: column;
                        height: 100vh;
                    }
                    .chat-container {
                        flex: 1;
                        overflow-y: auto;
                        margin-bottom: 20px;
                    }
                    .message {
                        margin: 10px 0;
                        padding: 10px;
                        border-radius: 10px;
                        max-width: 80%;
                    }
                    .user-message {
                        background: var(--vscode-button-background);
                        color: var(--vscode-button-foreground);
                        margin-left: auto;
                    }
                    .assistant-message {
                        background: var(--vscode-editor-background);
                        color: var(--vscode-editor-foreground);
                        margin-right: auto;
                    }
                    .input-container {
                        display: flex;
                        gap: 10px;
                        padding: 10px;
                        background: var(--vscode-editor-background);
                        position: sticky;
                        bottom: 0;
                    }
                    .chat-input {
                        flex: 1;
                        padding: 10px;
                        border: 1px solid var(--vscode-input-border);
                        background: var(--vscode-input-background);
                        color: var(--vscode-input-foreground);
                        border-radius: 5px;
                    }
                    .send-button {
                        padding: 10px 20px;
                        background: var(--vscode-button-background);
                        color: var(--vscode-button-foreground);
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                    }
                    .clear-button {
                        padding: 5px 10px;
                        background: var(--vscode-button-secondaryBackground);
                        color: var(--vscode-button-secondaryForeground);
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        margin-bottom: 10px;
                    }
                    .timestamp {
                        font-size: 0.8em;
                        opacity: 0.7;
                        margin-top: 5px;
                    }
                    pre {
                        background: var(--vscode-textBlockQuote-background);
                        padding: 10px;
                        border-radius: 5px;
                        overflow-x: auto;
                    }
                </style>
            </head>
            <body>
                <button class="clear-button" onclick="clearChat()">Clear Chat</button>
                <div class="chat-container">
                    ${this.messages.map(msg => `
                        <div class="message ${msg.role}-message">
                            ${this.formatMessageContent(msg.content)}
                            <div class="timestamp">${msg.timestamp.toLocaleTimeString()}</div>
                        </div>
                    `).join('')}
                </div>
                <div class="input-container">
                    <input type="text" 
                           class="chat-input" 
                           placeholder="Ask me anything about your code..."
                           onkeypress="if(event.key === 'Enter') sendMessage()">
                    <button class="send-button" onclick="sendMessage()">Send</button>
                </div>
                <script>
                    const vscode = acquireVsCodeApi();
                    const input = document.querySelector('.chat-input');
                    
                    function sendMessage() {
                        const text = input.value.trim();
                        if (text) {
                            vscode.postMessage({
                                command: 'sendMessage',
                                text: text
                            });
                            input.value = '';
                        }
                    }
                    
                    function clearChat() {
                        vscode.postMessage({
                            command: 'clearChat'
                        });
                    }
                    
                    // Auto-scroll to bottom
                    const chatContainer = document.querySelector('.chat-container');
                    chatContainer.scrollTop = chatContainer.scrollHeight;
                </script>
            </body>
            </html>
        `;
    }

    private static formatMessageContent(content: string): string {
        // Convert markdown code blocks to HTML
        return content.replace(/```(\w+)?\n([\s\S]*?)```/g, 
            (_, lang, code) => `<pre><code class="language-${lang || ''}">${code}</code></pre>`
        );
    }
} 