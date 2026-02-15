import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

export interface AIFeedback {
  category: string;
  score: number;
  positives: string[];
  negatives: string[];
  suggestions: string[];
}

@Entity('ai_reports')
export class AIReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'snapshot_id' })
  snapshotId: string;

  @Column({ name: 'creativity_score', type: 'decimal', precision: 5, scale: 2 })
  creativityScore: number;

  @Column({ name: 'innovation_score', type: 'decimal', precision: 5, scale: 2 })
  innovationScore: number;

  @Column({ name: 'code_quality_score', type: 'decimal', precision: 5, scale: 2 })
  codeQualityScore: number;

  @Column({ name: 'architecture_score', type: 'decimal', precision: 5, scale: 2 })
  architectureScore: number;

  @Column({ name: 'documentation_score', type: 'decimal', precision: 5, scale: 2 })
  documentationScore: number;

  @Column({ name: 'overall_score', type: 'decimal', precision: 5, scale: 2 })
  overallScore: number;

  @Column({ type: 'jsonb' })
  feedback: AIFeedback[];

  @Column({ type: 'text' })
  summary: string;

  @Column()
  model: string;

  @Column({ name: 'tokens_used' })
  tokensUsed: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
