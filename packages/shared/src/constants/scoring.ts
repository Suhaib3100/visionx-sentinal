/**
 * Scoring Constants
 * Weights and thresholds for evaluation scoring
 */

export const SCORING_WEIGHTS = {
  // Static Analysis (60%)
  STATIC: {
    TOTAL: 0.6,
    LINT: 0.15,
    COMPLEXITY: 0.15,
    SECURITY: 0.2,
    TEST_COVERAGE: 0.1,
  },
  
  // AI Evaluation (40%)
  AI: {
    TOTAL: 0.4,
    CREATIVITY: 0.12,
    INNOVATION: 0.12,
    ARCHITECTURE: 0.08,
    DOCUMENTATION: 0.08,
  },
} as const;

export const SCORE_THRESHOLDS = {
  LINT: {
    EXCELLENT: 95,
    GOOD: 85,
    FAIR: 70,
    POOR: 50,
  },
  
  COMPLEXITY: {
    EXCELLENT: 20,
    GOOD: 40,
    FAIR: 60,
    POOR: 80,
  },
  
  SECURITY: {
    CRITICAL_ISSUES: 0,
    HIGH_ISSUES: 2,
    MEDIUM_ISSUES: 5,
  },
  
  TEST_COVERAGE: {
    EXCELLENT: 80,
    GOOD: 60,
    FAIR: 40,
    POOR: 20,
  },
} as const;

export const MAX_SCORES = {
  STATIC_TOTAL: 100,
  AI_TOTAL: 100,
  FINAL_TOTAL: 100,
} as const;

export const SNAPSHOT_CONFIG = {
  INTERVAL_MINUTES: 45,
  MAX_FILE_SIZE_MB: 50,
  MAX_FILES: 1000,
  ALLOWED_EXTENSIONS: [
    '.js', '.ts', '.jsx', '.tsx',
    '.py', '.java', '.go', '.rs',
    '.html', '.css', '.scss',
    '.json', '.yaml', '.yml',
    '.md', '.txt',
  ],
  IGNORED_PATTERNS: [
    'node_modules',
    'dist',
    'build',
    '.git',
    'coverage',
    '*.log',
  ],
} as const;

export const EVALUATION_CONFIG = {
  WORKER_CONCURRENCY: 10,
  RETRY_ATTEMPTS: 3,
  TIMEOUT_MINUTES: 5,
  AI_MODEL: 'gpt-4-turbo-preview',
  AI_MAX_TOKENS: 2000,
} as const;
