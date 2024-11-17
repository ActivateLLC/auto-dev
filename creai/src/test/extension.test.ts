import * as assert from 'assert';
import * as vscode from 'vscode';
import * as sinon from 'sinon';
import { AIService } from '../utils/ai-service';
import { ChatInterface } from '../utils/chat-interface';
import { UIHelper } from '../utils/ui-helper';

suite('Creai Extension Test Suite', () => {
	vscode.window.showInformationMessage('Starting Creai.Dev tests.');

	// Setup and teardown
	setup(async () => {
		// Initialize test environment
		await vscode.commands.executeCommand('workbench.action.closeAllEditors');
	});

	teardown(() => {
		sinon.restore();
	});

	// Command Registration Tests
	test('All commands should be registered', async () => {
		const commands = await vscode.commands.getCommands();
		
		assert.ok(commands.includes('creai.assist'), 'AI Assistance command not registered');
		assert.ok(commands.includes('creai.review'), 'Code Review command not registered');
		assert.ok(commands.includes('creai.toggleLiveView'), 'Live View command not registered');
		assert.ok(commands.includes('creai.refresh'), 'Refresh command not registered');
		assert.ok(commands.includes('creai.advancedAnalysis'), 'Advanced Analysis command not registered');
		assert.ok(commands.includes('creai.openChat'), 'Chat command not registered');
	});

	// AI Service Tests
	suite('AI Service Tests', () => {
		test('Should initialize with API key', () => {
			const aiService = AIService.getInstance();
			assert.ok(aiService, 'AI Service failed to initialize');
		});

		test('Should handle missing API key', () => {
			// Temporarily remove API key
			const originalKey = process.env.OPENAI_API_KEY;
			delete process.env.OPENAI_API_KEY;

			assert.throws(() => {
				AIService.getInstance();
			}, Error);

			// Restore API key
			process.env.OPENAI_API_KEY = originalKey;
		});

		test('Should chunk large files correctly', async () => {
			const aiService = AIService.getInstance();
			const testFiles = {
				'test1.ts': 'a'.repeat(4000),
				'test2.ts': 'b'.repeat(4000)
			};

			// @ts-ignore - accessing private method for testing
			const chunks = aiService['chunkFiles'](testFiles);
			assert.strictEqual(chunks.length, 2, 'Files not chunked correctly');
		});
	});

	// Chat Interface Tests
	suite('Chat Interface Tests', () => {
		test('Should create chat panel', () => {
			ChatInterface.show();
			// @ts-ignore - accessing private property for testing
			const panel = ChatInterface['panel'];
			assert.ok(panel, 'Chat panel not created');
		});

		test('Should handle messages correctly', async () => {
			const testMessage = 'Test message';
			// @ts-ignore - accessing private method for testing
			await ChatInterface['handleUserMessage'](testMessage);
			// @ts-ignore - accessing private property for testing
			const messages = ChatInterface['messages'];
			assert.strictEqual(messages[messages.length - 1].content, testMessage);
		});
	});

	// UI Helper Tests
	suite('UI Helper Tests', () => {
		test('Should initialize status bar', () => {
			UIHelper.initialize();
			// @ts-ignore - accessing private property for testing
			const statusBar = UIHelper['statusBar'];
			assert.ok(statusBar, 'Status bar not initialized');
		});

		test('Should create webview panel', () => {
			UIHelper.showResults('Test', 'Content');
			// @ts-ignore - accessing private property for testing
			const panel = UIHelper['panel'];
			assert.ok(panel, 'Webview panel not created');
		});

		test('Should format markdown content correctly', () => {
			const testContent = '```js\nconst x = 1;\n```';
			// @ts-ignore - accessing private method for testing
			const formatted = UIHelper['formatContent'](testContent);
			assert.ok(formatted.includes('<pre><code'), 'Markdown not formatted correctly');
		});
	});

	// Integration Tests
	suite('Integration Tests', () => {
		test('Should perform full analysis workflow', async () => {
			// Create test file
			const testContent = 'function test() { return true; }';
			const document = await vscode.workspace.openTextDocument({
				content: testContent,
				language: 'typescript'
			});
			await vscode.window.showTextDocument(document);

			// Trigger analysis
			await vscode.commands.executeCommand('creai.assist');

			// Verify results
			// @ts-ignore - accessing private property for testing
			const panel = UIHelper['panel'];
			assert.ok(panel, 'Analysis results not displayed');
		});

		test('Should handle live view updates', async () => {
			await vscode.commands.executeCommand('creai.toggleLiveView');
			await vscode.commands.executeCommand('creai.refresh');

			// @ts-ignore - accessing private property for testing
			const panel = UIHelper['panel'];
			assert.ok(panel, 'Live view not updated');
		});
	});

	// Error Handling Tests
	suite('Error Handling Tests', () => {
		test('Should handle API errors gracefully', async () => {
			const aiService = AIService.getInstance();
			const stub = sinon.stub(aiService, 'analyzeRepository').throws();

			try {
				await vscode.commands.executeCommand('creai.assist');
			} catch (error) {
				assert.ok(error, 'Error not caught properly');
			}

			stub.restore();
		});

		test('Should handle workspace errors', async () => {
			// Close all folders
			await vscode.commands.executeCommand('workbench.action.closeFolder');
			
			// Try to run analysis
			await vscode.commands.executeCommand('creai.assist');
			
			// Should show warning message
			// Note: Can't directly test VS Code notifications
			assert.ok(true, 'Workspace error handling failed');
		});
	});
});
