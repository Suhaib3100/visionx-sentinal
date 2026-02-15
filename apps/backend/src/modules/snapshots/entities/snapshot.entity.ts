import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { Team } from '../../teams/entities/team.entity';
import { Project } from '../../projects/entities/project.entity';
import { StaticMetrics } from '../../evaluations/entities/static-metrics.entity';
import { FinalScore } from '../../evaluations/entities/final-score.entity';

export enum SnapshotStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface SnapshotMetadata {
  techStack: any;
  fileTree: any;
  gitInfo?: any;
  environment: any;
}

@Entity('snapshots')
export class Snapshot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'team_id' })
  teamId: string;

  @Column({ name: 'project_id' })
  projectId: string;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @Column({ name: 'snapshot_number' })
  snapshotNumber: number;

  @Column({ name: 's3_key' })
  s3Key: string;

  @Column({ type: 'bigint' })
  size: number;

  @Column()
  hash: string;

  @Column({ type: 'jsonb' })
  metadata: SnapshotMetadata;

  @Column({
    type: 'enum',
    enum: SnapshotStatus,
    default: SnapshotStatus.PENDING,
  })
  status: SnapshotStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Team, team => team.snapshots)
  @JoinColumn({ name: 'team_id' })
  team: Team;

  @ManyToOne(() => Project, project => project.snapshots)
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @OneToOne(() => StaticMetrics, metrics => metrics.snapshot)
  staticMetrics: StaticMetrics;

  @OneToOne(() => FinalScore, (finalScore) => finalScore.snapshot)
  finalScore: FinalScore;
}
