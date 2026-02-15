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
        `/projects/${projectId}/snapshots`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return {
        success: true,
        snapshotId: response.data.id,
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

      const response = await this.client.get(`/projects/${projectId}/snapshots/latest`);
      return response.data?.hash || null;
    } catch (error) {
      return null;
    }
  }
}
