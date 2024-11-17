import * as vscode from 'vscode';
import * as dotenv from 'dotenv';
import * as path from 'path';

export function loadEnvironment(context: vscode.ExtensionContext): void {
    const envPath = path.join(context.extensionPath, '.env');
    dotenv.config({ path: envPath });
} 

