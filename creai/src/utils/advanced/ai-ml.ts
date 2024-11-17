import OpenAI from 'openai';
import { AnalysisResult } from '../../types';

export class AIMLAnalysis {
    static async analyzeAIPipelines(
        openai: OpenAI,
        codebase: { [key: string]: string }
    ): Promise<AnalysisResult> {
        const filesList = Object.entries(codebase)
            .map(([path, content]) => `File: ${path}\n\`\`\`\n${content}\n\`\`\`\n---\n`)
            .join('\n');

        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: `You are an AI/ML pipeline expert. Analyze the codebase for:
1. ML model integration points
2. Data pipeline optimization
3. AI service opportunities
4. Model training workflows
5. MLOps best practices
6. Data preprocessing requirements
7. Model serving architecture
8. Performance monitoring
9. A/B testing capabilities
10. Feature engineering opportunities

Format your response in JSON with the following structure:
{
    "summary": "Overall analysis summary",
    "recommendations": ["recommendation1", "recommendation2", ...],
    "risks": ["risk1", "risk2", ...],
    "nextSteps": ["step1", "step2", ...],
    "codeExamples": {"file1.ts": "example code", ...}
}`
                },
                {
                    role: "user",
                    content: `Analyze this codebase for AI/ML pipeline potential:\n${filesList}`
                }
            ],
            temperature: 0.4,
            max_tokens: 4000,
            response_format: { type: "json_object" }
        });

        try {
            const content = JSON.parse(response.choices[0].message.content || '{}');
            return {
                summary: content.summary || '',
                recommendations: content.recommendations || [],
                risks: content.risks || [],
                nextSteps: content.nextSteps || [],
                codeExamples: new Map(Object.entries(content.codeExamples || {}))
            };
        } catch (error) {
            console.error('Failed to parse AI response:', error);
            return {
                summary: response.choices[0].message.content || '',
                recommendations: [],
                codeExamples: new Map(),
                risks: [],
                nextSteps: []
            };
        }
    }
} 