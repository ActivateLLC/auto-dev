import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { AIService } from './utils/ai-service';
import { UIHelper } from './utils/ui-helper';

// Helper function to recursively get all files
async function getAllFiles(dirPath: string, arrayOfFiles: string[] = [], ignore: Set<string> = new Set()): Promise<string[]> {
	const files = fs.readdirSync(dirPath);

	for (const file of files) {
		const fullPath = path.join(dirPath, file);
		
		// Skip node_modules, .git, and other common ignore patterns
		if (ignore.has(file) || file.startsWith('.')) {
			continue;
		}

		if (fs.statSync(fullPath).isDirectory()) {
			arrayOfFiles = await getAllFiles(fullPath, arrayOfFiles, ignore);
		} else {
			arrayOfFiles.push(fullPath);
		}
	}

	return arrayOfFiles;
}

export function activate(context: vscode.ExtensionContext) {
	console.log('Creai.Dev autonomous bot is now active!');

	// Initialize UI Helper
	UIHelper.initialize();

	// Register commands
	let toggleLiveView = vscode.commands.registerCommand('creai.toggleLiveView', async () => {
		try {
			const workspaceFolders = vscode.workspace.workspaceFolders;
			if (!workspaceFolders) {
				vscode.window.showWarningMessage('Please open a workspace to use Creai.Dev Live View');
				return;
			}

			// Get repository files
			const repoFiles = await getRepositoryFiles(workspaceFolders);
			
			// Process with AI
			const aiService = AIService.getInstance();
			const analysis = await aiService.analyzeRepository(repoFiles);
			
			// Display results in live view
			UIHelper.showResults('Live View 🔄', analysis, true);
			
		} catch (error) {
			vscode.window.showErrorMessage(`Creai.Dev Live View error: ${error}`);
		}
	});

	// Refresh command for live view
	let refreshCommand = vscode.commands.registerCommand('creai.refresh', async () => {
		try {
			const workspaceFolders = vscode.workspace.workspaceFolders;
			if (!workspaceFolders) return;

			const repoFiles = await getRepositoryFiles(workspaceFolders);
			const aiService = AIService.getInstance();
			const analysis = await aiService.analyzeRepository(repoFiles);
			UIHelper.updateLiveView(analysis);
		} catch (error) {
			vscode.window.showErrorMessage(`Refresh failed: ${error}`);
		}
	});

	// Register the autonomous code assistance command
	let codeAssistCommand = vscode.commands.registerCommand('creai.assist', async () => {
		try {
			const workspaceFolders = vscode.workspace.workspaceFolders;
			if (!workspaceFolders) {
				vscode.window.showWarningMessage('Please open a workspace to use Creai.Dev');
				return;
			}

			const statusBarItem = vscode.window.createStatusBarItem(
				vscode.StatusBarAlignment.Right
			);
			statusBarItem.text = "$(sync~spin) Creai.Dev is analyzing repository...";
			statusBarItem.show();

			const ignoreSet = new Set([
				'node_modules',
				'dist',
				'build',
				'out',
				'.git',
				'coverage'
			]);

			const repoFiles: { [key: string]: string } = {};
			for (const folder of workspaceFolders) {
				const files = await getAllFiles(folder.uri.fsPath, [], ignoreSet);
				
				for (const file of files) {
					try {
						const relativePath = path.relative(folder.uri.fsPath, file);
						const content = fs.readFileSync(file, 'utf8');
						repoFiles[relativePath] = content;
					} catch (err) {
						console.warn(`Failed to read file ${file}:`, err);
					}
				}
			}

			// Process with AI
			const aiService = AIService.getInstance();
			const analysis = await aiService.analyzeRepository(repoFiles);
			
			// Display results
			UIHelper.showResults('Repository Analysis', analysis);
			
			statusBarItem.hide();
			vscode.window.showInformationMessage(`Analysis complete for ${Object.keys(repoFiles).length} files`);
			
		} catch (error) {
			vscode.window.showErrorMessage(`Creai.Dev error: ${error}`);
		}
	});

	// Register the code review command
	let reviewCommand = vscode.commands.registerCommand('creai.review', async () => {
		try {
			const workspaceFolders = vscode.workspace.workspaceFolders;
			if (!workspaceFolders) {
				vscode.window.showWarningMessage('Please open a workspace to use Creai.Dev code review');
				return;
			}

			const statusBarItem = vscode.window.createStatusBarItem(
				vscode.StatusBarAlignment.Right
			);
			statusBarItem.text = "$(sync~spin) Creai.Dev is reviewing code...";
			statusBarItem.show();

			const ignoreSet = new Set([
				'node_modules',
				'dist',
				'build',
				'out',
				'.git',
				'coverage'
			]);

			const repoFiles: { [key: string]: string } = {};
			for (const folder of workspaceFolders) {
				const files = await getAllFiles(folder.uri.fsPath, [], ignoreSet);
				
				for (const file of files) {
					try {
						const relativePath = path.relative(folder.uri.fsPath, file);
						const content = fs.readFileSync(file, 'utf8');
						repoFiles[relativePath] = content;
					} catch (err) {
						console.warn(`Failed to read file ${file}:`, err);
					}
				}
			}

			// Process with AI
			const aiService = AIService.getInstance();
			const review = await aiService.reviewCode(repoFiles);
			
			// Display results
			UIHelper.showResults('Code Review Results', review);
			
			statusBarItem.hide();
			vscode.window.showInformationMessage('Code review complete!');
			
		} catch (error) {
			vscode.window.showErrorMessage(`Creai.Dev code review error: ${error}`);
		}
	});

	// Helper function to get repository files
	async function getRepositoryFiles(workspaceFolders: readonly vscode.WorkspaceFolder[]) {
		const ignoreSet = new Set([
			'node_modules',
			'dist',
			'build',
			'out',
			'.git',
			'coverage'
		]);

		const repoFiles: { [key: string]: string } = {};
		for (const folder of workspaceFolders) {
			const files = await getAllFiles(folder.uri.fsPath, [], ignoreSet);
			
			for (const file of files) {
				try {
					const relativePath = path.relative(folder.uri.fsPath, file);
					const content = fs.readFileSync(file, 'utf8');
					repoFiles[relativePath] = content;
				} catch (err) {
					console.warn(`Failed to read file ${file}:`, err);
				}
			}
		}
		return repoFiles;
	}

	context.subscriptions.push(
		codeAssistCommand, 
		reviewCommand, 
		toggleLiveView, 
		refreshCommand
	);
}

export function deactivate() {}
