import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Team } from './team.entity';
import { Snapshot } from './snapshot.entity';

export enum ProjectStatus {
  ACTIVE = 'active',
  SUBMITTED = 'submitted',
  DISQUALIFIED = 'disqualified',
}

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'team_id' })
  teamId: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  category: string;

  @Column({ name: 'tech_stack', type: 'simple-array' })
  techStack: string[];

  @Column({ name: 'repository_url', nullable: true })
  repositoryUrl: string;

  @Column({ name: 'demo_url', nullable: true })
  demoUrl: string;

  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.ACTIVE,
  })
  status: ProjectStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToOne(() => Team, (team) => team.project)
  @JoinColumn({ name: 'team_id' })
  team: Team;

  @OneToMany(() => Snapshot, (snapshot) => snapshot.project)
  snapshots: Snapshot[];
}
