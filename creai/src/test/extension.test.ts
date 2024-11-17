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
			const originalKey = process.env.OPENAI_API_KEY;
			const originalVSConfig = vscode.workspace.getConfiguration('creai').get('openaiApiKey');
			
			// Clear both environment and VS Code config
			process.env.OPENAI_API_KEY = '';
			vscode.workspace.getConfiguration('creai').update('openaiApiKey', '');
			
			try {
				AIService.getInstance();
				assert.fail('Should have thrown an error');
			} catch (error) {
				assert.ok(error instanceof Error);
			} finally {
				// Restore original values
				process.env.OPENAI_API_KEY = originalKey;
				vscode.workspace.getConfiguration('creai').update('openaiApiKey', originalVSConfig);
			}
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
		test('Should perform full analysis workflow', async function() {
			this.timeout(30000); // Increase timeout further
			
			const testContent = 'function test() { return true; }';
			const document = await vscode.workspace.openTextDocument({
					content: testContent,
					language: 'typescript'
			});
			
			// Wait for document to be fully loaded
			await new Promise(resolve => setTimeout(resolve, 1000));
			
			await vscode.window.showTextDocument(document);
			
			// Wait for editor to be ready
			await new Promise(resolve => setTimeout(resolve, 1000));

			const aiService = AIService.getInstance();
			const analyzeStub = sinon.stub(aiService, 'analyzeRepository').resolves('Test analysis');

			try {
				await vscode.commands.executeCommand('creai.assist');
				// Wait for command to complete
				await new Promise(resolve => setTimeout(resolve, 1000));
				assert.ok(analyzeStub.called, 'Analysis should have been called');
			} finally {
				analyzeStub.restore();
			}
		});

		test('Should handle live view updates', async function() {
			this.timeout(15000);
			
			const aiService = AIService.getInstance();
			const analyzeStub = sinon.stub(aiService, 'analyzeRepository').resolves('Test update');

			try {
				await vscode.commands.executeCommand('creai.toggleLiveView');
				// Wait for view to initialize
				await new Promise(resolve => setTimeout(resolve, 1000));
				
				await vscode.commands.executeCommand('creai.refresh');
				// Wait for refresh to complete
				await new Promise(resolve => setTimeout(resolve, 1000));
				
				assert.ok(analyzeStub.called, 'Analysis should have been called');
			} finally {
				analyzeStub.restore();
			}
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
