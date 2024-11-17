import * as vscode from 'vscode';
import OpenAI from 'openai';
import { config } from 'dotenv';
import { QuantumAnalysis } from './advanced/quantum';
import { BlockchainAnalysis } from './advanced/blockchain';
import { AIMLAnalysis } from './advanced/ai-ml';
import { EdgeAnalysis } from './advanced/edge';
import { CrossPlatformAnalysis } from './advanced/cross-platform';
import { AnalysisResult } from '../types';

// Initialize environment variables
config();

export class AIService {
    private openai: OpenAI;
    private static instance: AIService;
    private static MAX_TOKENS = 16000;
    private static CHUNK_SIZE = 8000;

    private constructor() {
        // Using vscode API for configuration
        const vsConfig = vscode.workspace.getConfiguration('creai');
        const apiKey = vsConfig.get<string>('openaiApiKey') || process.env.OPENAI_API_KEY;
        
        if (!apiKey) {
            // Using vscode API for error message
            vscode.window.showErrorMessage('Please configure your OpenAI API key in VS Code settings or .env file');
            throw new Error('OpenAI API key not found');
        }

        // Show configuration status
        vscode.window.setStatusBarMessage('Creai.Dev: Configured with API key', 3000);
        
        this.openai = new OpenAI({ apiKey });
    }

    public static getInstance(): AIService {
        if (!AIService.instance) {
            AIService.instance = new AIService();
        }
        return AIService.instance;
    }

    private chunkFiles(files: { [key: string]: string }): Array<{ [key: string]: string }> {
        const chunks: Array<{ [key: string]: string }> = [{}];
        let currentChunk = 0;
        let currentSize = 0;

        for (const [path, content] of Object.entries(files)) {
            const fileSize = (path.length + content.length) * 2; // Rough estimate of token size
            
            if (currentSize + fileSize > AIService.CHUNK_SIZE && currentSize > 0) {
                currentChunk++;
                chunks[currentChunk] = {};
                currentSize = 0;
            }

            chunks[currentChunk][path] = content;
            currentSize += fileSize;
        }

        return chunks;
    }

    private getRandomFallbackMessage(): string {
        const messages = [
            "Yo, I couldn't make sense of this code rn. Let's try that again! 🤔",
            "Bruh... something ain't adding up with this analysis. Hit me again! 💯",
            "Aye, we got a lil hiccup. Run it back one more time! 🔄",
            "Hold up, need a sec to process this code properly! 🚀",
            "Nah fam, we need another shot at this. Let's go again! 🎯",
            "Something's off with this code review. One more time! 💪"
        ];
        return messages[Math.floor(Math.random() * messages.length)];
    }

    private async analyzeChunk(files: { [key: string]: string }, context: string = ''): Promise<string> {
        const filesList = Object.entries(files)
            .map(([path, content]) => `File: ${path}\n\`\`\`\n${content}\n\`\`\`\n---\n`)
            .join('\n');

        const systemPrompt = `You are an advanced, fully autonomous code assistant designed to analyze, optimize, rewrite, and generate entire codebases. Your primary goal is to assist developers by performing in-depth analysis, generating new code, refactoring existing code, and ensuring the overall quality, scalability, and functionality of applications across multiple frameworks, languages, platforms, and industries.

Your capabilities include:
- Complete codebase creation and architecture design
- Autonomous refactoring and optimization
- Full-stack development across multiple languages and frameworks
- Security implementation and compliance
- Testing and CI/CD pipeline creation
- Comprehensive documentation generation

For this analysis, focus on:
1. Overall Architecture Assessment
2. Code Quality and Patterns
3. Performance Optimization Opportunities
4. Security Considerations
5. Testing Coverage
6. Documentation Status
7. Scalability Potential
8. Technical Debt Identification

${context ? 'Previous Analysis Context:\n' + context + '\n\n' : ''}
Provide actionable insights and specific code examples where relevant.`;

        const response = await this.openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: `Please analyze this portion of the repository and provide comprehensive insights:\n${filesList}`
                }
            ],
            temperature: 0.4,
            max_tokens: AIService.MAX_TOKENS,
        });

        return response.choices[0].message.content || this.getRandomFallbackMessage();
    }

    async analyzeRepository(files: { [key: string]: string }): Promise<string> {
        const chunks = this.chunkFiles(files);
        let fullAnalysis = '';
        let context = '';

        for (let i = 0; i < chunks.length; i++) {
            const chunkAnalysis = await this.analyzeChunk(chunks[i], context);
            context += `\nChunk ${i + 1} Analysis Summary:\n${chunkAnalysis}\n`;
            fullAnalysis += `\n\n## Analysis Part ${i + 1}:\n${chunkAnalysis}`;
        }

        // Final summary if multiple chunks
        if (chunks.length > 1) {
            const summaryPrompt = `Please provide a consolidated summary of the entire codebase based on these analyses:\n${context}`;
            const finalSummary = await this.openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                    {
                        role: "system",
                        content: "Create a concise summary of the entire codebase analysis, highlighting the most important findings and recommendations."
                    },
                    {
                        role: "user",
                        content: summaryPrompt
                    }
                ],
                temperature: 0.4,
                max_tokens: 4000,
            });

            fullAnalysis = `# Yo, Check This Out! 🚀\n${finalSummary.choices[0].message.content}\n\n# The Deep Dive 🔍${fullAnalysis}`;
        }

        return fullAnalysis || "Aye, something's not clicking. Let's try analyzing this again! 💡";
    }

    async reviewCode(files: { [key: string]: string }): Promise<string> {
        const chunks = this.chunkFiles(files);
        let fullReview = '';
        let context = '';

        for (let i = 0; i < chunks.length; i++) {
            const chunkReview = await this.reviewChunk(chunks[i], context);
            context += `\nChunk ${i + 1} Review Summary:\n${chunkReview}\n`;
            fullReview += `\n\n## Review Part ${i + 1}:\n${chunkReview}`;
        }

        // Final summary if multiple chunks
        if (chunks.length > 1) {
            const summaryPrompt = `Please provide a consolidated review summary based on these analyses:\n${context}`;
            const finalSummary = await this.openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                    {
                        role: "system",
                        content: "Create a concise summary of the entire code review, highlighting critical issues and key recommendations."
                    },
                    {
                        role: "user",
                        content: summaryPrompt
                    }
                ],
                temperature: 0.4,
                max_tokens: 4000,
            });

            fullReview = `# The Quick Rundown 🎯\n${finalSummary.choices[0].message.content}\n\n# All The Details 📝${fullReview}`;
        }

        return `# Code Review Time! 🔥\n${fullReview}\n\n---\nYour friendly neighborhood code assistant, Creai.Dev 😎`;
    }

    private async reviewChunk(files: { [key: string]: string }, context: string = ''): Promise<string> {
        const filesList = Object.entries(files)
            .map(([path, content]) => `File: ${path}\n\`\`\`\n${content}\n\`\`\`\n---\n`)
            .join('\n');

        const systemPrompt = `You are an advanced, fully autonomous code assistant designed to analyze, optimize, rewrite, and generate entire codebases. Your primary goal is to assist developers by performing in-depth analysis, generating new code, refactoring existing code, and ensuring the overall quality, scalability, and functionality of applications across multiple frameworks, languages, platforms, and industries.

Primary Responsibilities:

1. COMPREHENSIVE ANALYSIS
- Evaluate architecture and code quality
- Identify technical debt and inefficiencies
- Assess feature completeness

2. CODE OPTIMIZATION
- Suggest performance improvements
- Recommend modern alternatives
- Optimize resource usage

3. SECURITY AUDIT
- Identify vulnerabilities
- Recommend security best practices
- Suggest compliance improvements

4. ARCHITECTURE REVIEW
- Assess scalability potential
- Evaluate system design
- Suggest architectural improvements

5. TESTING STRATEGY
- Review test coverage
- Suggest test improvements
- Recommend testing frameworks

6. DOCUMENTATION
- Assess documentation quality
- Suggest documentation improvements
- Provide code examples

${context ? 'Previous Review Context:\n' + context + '\n\n' : ''}
Please provide:
- Detailed analysis with specific examples
- Actionable recommendations
- Priority-based improvement roadmap
- Code snippets for suggested changes`;

        const response = await this.openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: `Please review this portion of the codebase and provide comprehensive recommendations:\n${filesList}`
                }
            ],
            temperature: 0.4,
            max_tokens: AIService.MAX_TOKENS,
        });

        return response.choices[0].message.content || this.getRandomFallbackMessage();
    }

    async performAdvancedAnalysis(files: { [key: string]: string }): Promise<string> {
        const analyses = await Promise.all([
            QuantumAnalysis.analyzeQuantumReadiness(this.openai, files),
            BlockchainAnalysis.analyzeWeb3Patterns(this.openai, files),
            AIMLAnalysis.analyzeAIPipelines(this.openai, files),
            EdgeAnalysis.analyzeEdgeComputing(this.openai, files),
            CrossPlatformAnalysis.analyzeCrossPlatform(this.openai, files)
        ]);

        const [quantum, blockchain, aiml, edge, crossPlatform] = analyses;

        return this.formatAdvancedAnalysis(quantum, blockchain, aiml, edge, crossPlatform);
    }

    private formatAdvancedAnalysis(...results: AnalysisResult[]): string {
        const sections = [
            { title: "🔮 Quantum Computing Analysis", result: results[0] },
            { title: "⛓️ Blockchain/Web3 Analysis", result: results[1] },
            { title: "🤖 AI/ML Pipeline Analysis", result: results[2] },
            { title: "📡 Edge Computing Analysis", result: results[3] },
            { title: "🌐 Cross-Platform Analysis", result: results[4] }
        ];

        return sections.map(({ title, result }) => `
# ${title}

## Summary
${result.summary}

## Key Recommendations
${result.recommendations.map(rec => `- ${rec}`).join('\n')}

## Potential Risks
${result.risks.map(risk => `- ${risk}`).join('\n')}

## Next Steps
${result.nextSteps.map(step => `- ${step}`).join('\n')}

---`).join('\n\n');
    }

    async processChatMessage(
        message: string, 
        context: string, 
        history: Array<{role: string, content: string}>
    ): Promise<string> {
        const response = await this.openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: `You are an advanced, conversational code assistant. You help developers by analyzing code, suggesting improvements, and answering questions. Current context:\n${context}`
                },
                ...history.map(msg => ({
                    role: msg.role as 'user' | 'assistant',
                    content: msg.content
                })),
                {
                    role: "user",
                    content: message
                }
            ],
            temperature: 0.7,
            max_tokens: 2000
        });

        return response.choices[0].message.content || this.getRandomFallbackMessage();
    }
} 