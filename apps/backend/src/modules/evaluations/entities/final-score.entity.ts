import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Team } from '../../teams/entities/team.entity';
import { Snapshot } from '../../snapshots/entities/snapshot.entity';

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

@Entity('final_scores')
export class FinalScore {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'team_id' })
  teamId: string;

  @Column({ name: 'snapshot_id' })
  snapshotId: string;

  @Column({ name: 'static_score', type: 'decimal', precision: 5, scale: 2 })
  staticScore: number;

  @Column({ name: 'ai_score', type: 'decimal', precision: 5, scale: 2 })
  aiScore: number;

  @Column({ name: 'total_score', type: 'decimal', precision: 5, scale: 2 })
  totalScore: number;

  @Column({ default: 0 })
  rank: number;

  @Column({ type: 'jsonb' })
  weight: ScoreWeight;

  @Column({ type: 'jsonb' })
  breakdown: ScoreBreakdown;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Team, team => team.scores)
  @JoinColumn({ name: 'team_id' })
  team: Team;

  @OneToOne(() => Snapshot, (snapshot) => snapshot.finalScore)
  @JoinColumn({ name: 'snapshot_id' })
  snapshot: Snapshot;
}
