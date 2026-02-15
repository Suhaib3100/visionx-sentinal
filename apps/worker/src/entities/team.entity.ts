import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Project } from './project.entity';
import { Snapshot } from './snapshot.entity';
import { FinalScore } from './final-score.entity';

export enum MemberRole {
  LEADER = 'leader',
  MEMBER = 'member',
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  githubUsername?: string;
}

@Entity('teams')
export class Team {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'jsonb' })
  members: TeamMember[];

  @Column({ name: 'registered_at', type: 'timestamp' })
  registeredAt: Date;

  @Column({ name: 'last_snapshot_at', type: 'timestamp', nullable: true })
  lastSnapshotAt: Date;

  @Column({ name: 'total_snapshots', default: 0 })
  totalSnapshots: number;

  @Column({ name: 'current_score', type: 'decimal', precision: 5, scale: 2, default: 0 })
  currentScore: number;

  @Column({ default: 0 })
  rank: number;

  @Column({ name: 'is_disqualified', default: false })
  isDisqualified: boolean;

  @Column({ name: 'disqualification_reason', nullable: true })
  disqualificationReason: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToOne(() => Project, (project) => project.team)
  project: Project;

  @OneToMany(() => Snapshot, (snapshot) => snapshot.team)
  snapshots: Snapshot[];

  @OneToMany(() => FinalScore, (score) => score.team)
  scores: FinalScore[];
}
