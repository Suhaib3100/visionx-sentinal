// VisionX Eval Type Definitions

export interface Team {
  id: string;
  name: string;
  members: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  teamId: string;
  title: string;
  description: string;
  githubUrl: string;
  createdAt: string;
  updatedAt: string;
  team?: Team;
}

export interface Snapshot {
  id: string;
  projectId: string;
  s3Key: string;
  s3Bucket: string;
  commit?: string;
  branch?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
  project?: Project;
  evaluation?: EvaluationReport;
}

export interface StaticMetrics {
  id: string;
  snapshotId: string;
  lintScore: number;
  complexityScore: number;
  securityScore: number;
  testCoverageScore: number;
  lintIssues: number;
  complexityAvg: number;
  securityIssues: number;
  testCoveragePercentage: number;
  createdAt: string;
}

export interface AIReport {
  id: string;
  snapshotId: string;
  innovationScore: number;
  architectureScore: number;
  scalabilityScore: number;
  alignmentScore: number;
  readabilityScore: number;
  documentationScore: number;
  feedback: string;
  riskFlags: string[];
  tokensUsed: number;
  modelVersion: string;
  createdAt: string;
}

export interface FinalScore {
  id: string;
  teamId: string;
  projectId: string;
  snapshotId: string;
  staticScore: number;
  aiScore: number;
  finalScore: number;
  rank: number;
  createdAt: string;
  updatedAt: string;
  team?: Team;
  project?: Project;
  snapshot?: Snapshot;
}

export interface EvaluationReport {
  snapshot: Snapshot;
  staticMetrics?: StaticMetrics;
  aiReport?: AIReport;
  finalScore?: FinalScore;
}

export interface LeaderboardEntry {
  teamId: string;
  teamName: string;
  score: number;
  rank: number;
  lastEvaluatedAt: string;
}

export interface LeaderboardStats {
  totalTeams: number;
  averageScore: number;
  topScore: number;
  totalEvaluations: number;
}

export interface ScoreHistory {
  score: number;
  timestamp: string;
  snapshotId: string;
}

// API Response types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}

// Form types
export interface SignInFormData {
  email: string;
  password: string;
}

export interface SignUpFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface TeamFormData {
  name: string;
  members: string[];
}

export interface ProjectFormData {
  title: string;
  description: string;
  githubUrl: string;
}

export interface SnapshotUploadFormData {
  file: File;
  commit?: string;
  branch?: string;
}

// Dashboard stats
export interface SystemStats {
  totalTeams: number;
  totalProjects: number;
  totalSnapshots: number;
  pendingEvaluations: number;
  completedEvaluations: number;
  failedEvaluations: number;
  averageScore: number;
  topScore: number;
  evaluationsToday: number;
  evaluationsThisWeek: number;
}

// Chart data
export interface ScoreDistribution {
  range: string;
  count: number;
}

export interface EvaluationTrend {
  date: string;
  count: number;
  avgScore: number;
}
