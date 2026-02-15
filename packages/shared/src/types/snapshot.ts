/**
 * Snapshot Types
 * Represents a code snapshot submitted by a team
 */

export interface Snapshot {
  id: string;
  teamId: string;
  projectId: string;
  timestamp: Date;
  snapshotNumber: number;
  s3Key: string;
  size: number;
  hash: string;
  metadata: SnapshotMetadata;
  status: SnapshotStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface SnapshotMetadata {
  techStack: TechStack;
  fileTree: FileNode;
  gitInfo?: GitInfo;
  environment: Environment;
}

export interface TechStack {
  languages: LanguageInfo[];
  frameworks: string[];
  libraries: DependencyInfo[];
  tools: string[];
}

export interface LanguageInfo {
  name: string;
  version?: string;
  percentage: number;
  files: number;
  lines: number;
}

export interface DependencyInfo {
  name: string;
  version: string;
  type: 'production' | 'development';
}

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  children?: FileNode[];
}

export interface GitInfo {
  branch: string;
  commitHash: string;
  commitMessage: string;
  author: string;
  commitDate: Date;
  isClean: boolean;
  changedFiles?: number;
}

export interface Environment {
  nodeVersion?: string;
  pythonVersion?: string;
  os: string;
  arch: string;
}

export enum SnapshotStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface CreateSnapshotDto {
  teamId: string;
  projectId: string;
  files: SnapshotFile[];
  metadata: SnapshotMetadata;
}

export interface SnapshotFile {
  path: string;
  content: string;
  hash: string;
}
