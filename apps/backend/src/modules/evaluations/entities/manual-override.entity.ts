import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('manual_overrides')
export class ManualOverride {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'team_id' })
  teamId: string;

  @Column({ name: 'snapshot_id' })
  snapshotId: string;

  @Column({ name: 'judge_id' })
  judgeId: string;

  @Column({ name: 'original_score', type: 'decimal', precision: 5, scale: 2 })
  originalScore: number;

  @Column({ name: 'override_score', type: 'decimal', precision: 5, scale: 2 })
  overrideScore: number;

  @Column({ type: 'text' })
  reason: string;

  @Column()
  category: string;

  @Column({ default: false })
  approved: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
