// API Client for VisionX Backend
import * as vscode from 'vscode';
import axios, { AxiosInstance } from 'axios';
import { AuthManager } from '../auth/auth-manager';

export interface SnapshotUploadResult {
  success: boolean;
  snapshotId?: string;
  message?: string;
}

export class APIClient {
  private client: AxiosInstance;

  constructor(private authManager: AuthManager) {
    const config = vscode.workspace.getConfiguration('visionx');
    const apiUrl = config.get<string>('apiUrl', 'http://localhost:3000/api');

    this.client = axios.create({
      baseURL: apiUrl,
      timeout: 60000,
    });

    // Add auth interceptor
    this.client.interceptors.request.use((config) => {
      const token = this.authManager.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  async uploadSnapshot(snapshotData: Buffer, metadata: any): Promise<SnapshotUploadResult> {
    try {
      const projectId = this.authManager.getProjectId();
      if (!projectId) {
        throw new Error('No project ID found');
      }

      const formData = new FormData();
      formData.append('file', new Blob([snapshotData]), 'snapshot.tar.gz');
      formData.append('metadata', JSON.stringify(metadata));

      const response = await this.client.post(
        `/snapshots/upload/${projectId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return {
        success: true,
        snapshotId: response.data.snapshotId,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  }

  async getProjectStats(): Promise<any> {
    try {
      const projectId = this.authManager.getProjectId();
      if (!projectId) {
        throw new Error('No project ID found');
      }

      const response = await this.client.get(`/projects/${projectId}/stats`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message);
    }
  }

  async getLastSnapshotHash(): Promise<string | null> {
    try {
      const projectId = this.authManager.getProjectId();
      if (!projectId) {
        return null;
      }

      const response = await this.client.get(`/snapshots/project/${projectId}/latest`);
      return response.data?.hash || null;
    } catch (error) {
      return null;
    }
  }

  async sendHeartbeat(): Promise<boolean> {
    try {
      const teamId = this.authManager.getTeamId();
      const projectId = this.authManager.getProjectId();
      const teamName = this.authManager.getTeamName();
      
      if (!teamId || !projectId) {
        return false;
      }

      await this.client.post('/sessions/heartbeat', null, {
        params: {
          teamId,
          teamName: teamName || 'Unknown Team',
          projectId,
        },
      });

      return true;
    } catch (error) {
      console.error('VisionX: Failed to send heartbeat:', error);
      return false;
    }
  }

  async checkCaptureTrigger(): Promise<{ shouldCapture: boolean; message: string }> {
    try {
      const teamId = this.authManager.getTeamId();
      if (!teamId) {
        return { shouldCapture: false, message: 'No team ID' };
      }

      const response = await this.client.get('/sessions/check-capture-trigger', {
        params: { teamId },
      });

      return response.data;
    } catch (error) {
      return { shouldCapture: false, message: 'Check failed' };
    }
  }
}
