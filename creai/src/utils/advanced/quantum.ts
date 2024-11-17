import OpenAI from 'openai';
import { AnalysisResult } from '../../types';

export class QuantumAnalysis {
    static async analyzeQuantumReadiness(
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
                    content: `You are a quantum computing expert. Analyze the codebase for:
1. Quantum computing readiness
2. Potential quantum algorithms that could enhance performance
3. Areas that could benefit from quantum speedup
4. Required modifications for quantum compatibility
5. Hybrid classical-quantum opportunities

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
                    content: `Analyze this codebase for quantum computing potential:\n${filesList}`
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