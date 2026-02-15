/**
 * Team Types
 * Represents teams, projects, and user entities
 */

export interface Team {
  id: string;
  name: string;
  slug: string;
  members: TeamMember[];
  projectId: string;
  registeredAt: Date;
  lastSnapshotAt?: Date;
  totalSnapshots: number;
  currentScore: number;
  rank: number;
  isDisqualified: boolean;
  disqualificationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  githubUsername?: string;
}

export enum MemberRole {
  LEADER = 'leader',
  MEMBER = 'member',
}

export interface Project {
  id: string;
  teamId: string;
  title: string;
  description: string;
  category: string;
  techStack: string[];
  repositoryUrl?: string;
  demoUrl?: string;
  status: ProjectStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum ProjectStatus {
  ACTIVE = 'active',
  SUBMITTED = 'submitted',
  DISQUALIFIED = 'disqualified',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  teamId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'admin',
  JUDGE = 'judge',
  PARTICIPANT = 'participant',
}

export interface ManualOverride {
  id: string;
  teamId: string;
  snapshotId: string;
  judgeId: string;
  originalScore: number;
  overrideScore: number;
  reason: string;
  category: string;
  approved: boolean;
  createdAt: Date;
}

export interface CreateTeamDto {
  name: string;
  members: Omit<TeamMember, 'id'>[];
}

export interface CreateProjectDto {
  teamId: string;
  title: string;
  description: string;
  category: string;
  techStack: string[];
}
