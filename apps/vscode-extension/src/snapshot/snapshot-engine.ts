// Snapshot Engine - Creates and uploads project snapshots
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as tar from 'tar';
import { AuthManager } from '../auth/auth-manager';
import { APIClient } from '../api/api-client';
import { WorkspaceScanner } from '../workspace/workspace-scanner';

export interface SnapshotResult {
  success: boolean;
  skipped?: boolean;
  message?: string;
  compressedSize?: string;
}

export class SnapshotEngine {
  private lastHash: string | null = null;

  constructor(
    private authManager: AuthManager,
    private apiClient: APIClient,
    private workspaceScanner: WorkspaceScanner
  ) {}

  async createAndUploadSnapshot(isFinal = false): Promise<SnapshotResult> {
    try {
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) {
        return { success: false, message: 'No workspace folder open' };
      }

      // Check if submissions are locked
      if (this.authManager.isLocked()) {
        return { success: false, message: 'Submissions are locked' };
      }

      // Scan workspace
      const metadata = await this.workspaceScanner.scanWorkspace();
      if (!metadata) {
        return { success: false, message: 'Failed to scan workspace' };
      }

      // Check if anything changed (unless final submission)
      if (!isFinal && this.lastHash === metadata.projectHash) {
        return { success: true, skipped: true };
      }

      // Create tarball
      const tarballPath = await this.createTarball(workspaceFolder.uri.fsPath, metadata.fileTree);
      const tarballBuffer = fs.readFileSync(tarballPath);
      const compressedSize = this.formatBytes(tarballBuffer.length);

      // Upload to backend
      const uploadMetadata = {
        ...metadata,
        isFinal,
        timestamp: new Date().toISOString(),
        teamId: this.authManager.getTeamId(),
        projectId: this.authManager.getProjectId(),
      };

      const result = await this.apiClient.uploadSnapshot(tarballBuffer, uploadMetadata);

      // Cleanup
      fs.unlinkSync(tarballPath);

      if (result.success) {
        this.lastHash = metadata.projectHash;
        return { success: true, compressedSize };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  private async createTarball(rootPath: string, files: string[]): Promise<string> {
    const tempDir = path.join(rootPath, '.visionx-temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tarballPath = path.join(tempDir, `snapshot-${Date.now()}.tar.gz`);

    await tar.create(
      {
        gzip: true,
        file: tarballPath,
        cwd: rootPath,
      },
      files
    );

    return tarballPath;
  }

  private formatBytes(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }
}
