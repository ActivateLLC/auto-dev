import * as vscode from 'vscode';

export interface SearchOptions {
    query: string;
    includePattern?: string;
    excludePattern?: string;
    caseSensitive?: boolean;
    wholeWord?: boolean;
    regex?: boolean;
    maxResults?: number;
}

export class SearchService {
    private static searchHistory: string[] = [];
    private static readonly MAX_HISTORY = 10;

    static async performSearch(options: SearchOptions): Promise<void> {
        this.addToSearchHistory(options.query);
        
        await vscode.commands.executeCommand('workbench.action.findInFiles', {
            query: options.query,
            filesToInclude: options.includePattern,
            filesToExclude: options.excludePattern,
            isCaseSensitive: options.caseSensitive,
            isWholeWords: options.wholeWord,
            isRegex: options.regex,
            maxResults: options.maxResults
        });
    }

    static getSearchHistory(): string[] {
        return [...this.searchHistory];
    }

    private static addToSearchHistory(query: string): void {
        if (!this.searchHistory.includes(query)) {
            this.searchHistory.unshift(query);
            if (this.searchHistory.length > this.MAX_HISTORY) {
                this.searchHistory.pop();
            }
        }
    }

    static async searchInCurrentFile(query: string): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const document = editor.document;
            const text = document.getText();
            const matches = this.findMatches(text, query);
            this.highlightMatches(editor, matches);
        }
    }

    private static findMatches(text: string, query: string): vscode.Range[] {
        const matches: vscode.Range[] = [];
        let match: RegExpExecArray | null;
        const regex = new RegExp(query, 'gi');
        
        while ((match = regex.exec(text)) !== null) {
            const startPos = match.index;
            const endPos = startPos + match[0].length;
            const startPosition = this.indexToPosition(text, startPos);
            const endPosition = this.indexToPosition(text, endPos);
            matches.push(new vscode.Range(startPosition, endPosition));
        }
        
        return matches;
    }

    private static indexToPosition(text: string, index: number): vscode.Position {
        const textBefore = text.substring(0, index);
        const lines = textBefore.split('\n');
        return new vscode.Position(lines.length - 1, lines[lines.length - 1].length);
    }

    private static highlightMatches(editor: vscode.TextEditor, ranges: vscode.Range[]): void {
        const decorationType = vscode.window.createTextEditorDecorationType({
            backgroundColor: new vscode.ThemeColor('editor.findMatchHighlightBackground'),
            borderRadius: '3px'
        });
        
        editor.setDecorations(decorationType, ranges);
        
        // Clear decorations after a delay
        setTimeout(() => {
            decorationType.dispose();
        }, 3000);
    }
} 