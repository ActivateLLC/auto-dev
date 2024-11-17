export interface CreaiConfig {
    apiKey?: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
}

export const defaultConfig: CreaiConfig = {
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2048
}; 