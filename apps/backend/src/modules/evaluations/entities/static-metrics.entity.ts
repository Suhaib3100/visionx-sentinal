import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Snapshot } from '../../snapshots/entities/snapshot.entity';

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
  lines: { total: number; covered: number; percentage: number };
  functions: { total: number; covered: number; percentage: number };
  branches: { total: number; covered: number; percentage: number };
  statements: { total: number; covered: number; percentage: number };
}

@Entity('static_metrics')
export class StaticMetrics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'snapshot_id' })
  snapshotId: string;

  @Column({ name: 'lint_score', type: 'decimal', precision: 5, scale: 2 })
  lintScore: number;

  @Column({ name: 'lint_issues', type: 'jsonb' })
  lintIssues: LintIssue[];

  @Column({ name: 'complexity_score', type: 'decimal', precision: 5, scale: 2 })
  complexityScore: number;

  @Column({ name: 'complexity_metrics', type: 'jsonb' })
  complexityMetrics: ComplexityMetrics;

  @Column({ name: 'security_score', type: 'decimal', precision: 5, scale: 2 })
  securityScore: number;

  @Column({ name: 'security_issues', type: 'jsonb' })
  securityIssues: SecurityIssue[];

  @Column({ name: 'test_coverage', type: 'jsonb', nullable: true })
  testCoverage: TestCoverage;

  @Column({ name: 'code_quality_score', type: 'decimal', precision: 5, scale: 2 })
  codeQualityScore: number;

  @Column({ name: 'total_score', type: 'decimal', precision: 5, scale: 2 })
  totalScore: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @OneToOne(() => Snapshot, snapshot => snapshot.staticMetrics)
  @JoinColumn({ name: 'snapshot_id' })
  snapshot: Snapshot;
}
