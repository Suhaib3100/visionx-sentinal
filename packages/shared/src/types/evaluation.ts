/**
 * Evaluation Types
 * Represents the evaluation results for a snapshot
 */

export interface Evaluation {
  id: string;
  snapshotId: string;
  teamId: string;
  staticMetrics: StaticMetrics;
  aiReport: AIReport;
  finalScore: FinalScore;
  riskFlags: RiskFlag[];
  status: EvaluationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface StaticMetrics {
  id: string;
  snapshotId: string;
  lintScore: number;
  lintIssues: LintIssue[];
  complexityScore: number;
  complexityMetrics: ComplexityMetrics;
  securityScore: number;
  securityIssues: SecurityIssue[];
  testCoverage: TestCoverage;
  codeQualityScore: number;
  totalScore: number;
  createdAt: Date;
}

export interface LintIssue {
  file: string;
  line: number;
  column: number;
  severity: 'error' | 'warning' | 'info';
  message: string;
  rule: string;
}

export interface ComplexityMetrics {
  cyclomaticComplexity: number;
  cognitiveComplexity: number;
  maintainabilityIndex: number;
  linesOfCode: number;
  logicalLinesOfCode: number;
  commentPercentage: number;
}

export interface SecurityIssue {
  file: string;
  line: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  message: string;
  cwe?: string;
}

export interface TestCoverage {
  percentage: number;
  lines: CoverageMetric;
  functions: CoverageMetric;
  branches: CoverageMetric;
  statements: CoverageMetric;
}

export interface CoverageMetric {
  total: number;
  covered: number;
  percentage: number;
}

export interface AIReport {
  id: string;
  snapshotId: string;
  creativityScore: number;
  innovationScore: number;
  codeQualityScore: number;
  architectureScore: number;
  documentationScore: number;
  overallScore: number;
  feedback: AIFeedback[];
  summary: string;
  model: string;
  tokensUsed: number;
  createdAt: Date;
}

export interface AIFeedback {
  category: string;
  score: number;
  positives: string[];
  negatives: string[];
  suggestions: string[];
}

export interface FinalScore {
  id: string;
  teamId: string;
  snapshotId: string;
  staticScore: number;
  aiScore: number;
  totalScore: number;
  rank: number;
  weight: ScoreWeight;
  breakdown: ScoreBreakdown;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScoreWeight {
  static: number;
  ai: number;
}

export interface ScoreBreakdown {
  lint: number;
  complexity: number;
  security: number;
  testCoverage: number;
  creativity: number;
  innovation: number;
  architecture: number;
  documentation: number;
}

export interface RiskFlag {
  type: RiskType;
  severity: 'high' | 'medium' | 'low';
  message: string;
  evidence: string[];
  autoResolve: boolean;
}

export enum RiskType {
  SIMILARITY = 'similarity',
  UNUSUAL_GROWTH = 'unusual_growth',
  SUSPICIOUS_PATTERN = 'suspicious_pattern',
  MULTIPLE_SUBMISSIONS = 'multiple_submissions',
}

export enum EvaluationStatus {
  PENDING = 'pending',
  ANALYZING = 'analyzing',
  AI_EVALUATION = 'ai_evaluation',
  COMPLETED = 'completed',
  FAILED = 'failed',
}
