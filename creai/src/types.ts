export interface CodeContext {
    dependencies: Map<string, string>;
    architecturePattern: string;
    businessDomain: string;
    teamSize: number;
    developmentPhase: 'prototype' | 'mvp' | 'scaling' | 'maintenance';
    techStack: string[];
    deploymentTargets: string[];
}

export interface Framework {
    name: string;
    version: string;
    type: 'frontend' | 'backend' | 'fullstack' | 'mobile';
}

export interface ProjectStructure {
    files: Map<string, string>;
    dependencies: Map<string, string>;
    configuration: any;
}

export interface AnalysisResult {
    summary: string;
    recommendations: string[];
    codeExamples: Map<string, string>;
    risks: string[];
    nextSteps: string[];
}

export interface AIResponse {
    technicalContent: string;
    explanation: string;
    visualizations: Array<Diagram>;
    implementationSteps: Array<Step>;
    alternativeSolutions: Array<Solution>;
    tradeoffs: Array<Tradeoff>;
    futureConsiderations: Array<Consideration>;
}

export interface Diagram {
    type: 'architecture' | 'flow' | 'sequence' | 'class';
    content: string;
}

export interface Step {
    order: number;
    description: string;
    code?: string;
    warning?: string;
}

export interface Solution {
    approach: string;
    benefits: string[];
    drawbacks: string[];
    implementation: string;
}

export interface Tradeoff {
    aspect: string;
    pros: string[];
    cons: string[];
    recommendation: string;
}

export interface Consideration {
    topic: string;
    impact: 'high' | 'medium' | 'low';
    timeframe: 'short' | 'medium' | 'long';
    description: string;
}

// ... rest of the types ... 