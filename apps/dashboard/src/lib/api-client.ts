// VisionX Eval API Client
import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

class APIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        // Don't redirect on 401 - just return the error
        // This allows public endpoints to work
        return Promise.reject(error);
      }
    );
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('authToken');
  }

  private clearAuth(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  // Generic HTTP methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const { data } = await this.client.get<T>(url, config);
    return data;
  }

  async post<T = any>(url: string, body?: any, config?: AxiosRequestConfig): Promise<T> {
    const { data } = await this.client.post<T>(url, body, config);
    return data;
  }

  async put<T = any>(url: string, body?: any, config?: AxiosRequestConfig): Promise<T> {
    const { data } = await this.client.put<T>(url, body, config);
    return data;
  }

  async patch<T = any>(url: string, body?: any, config?: AxiosRequestConfig): Promise<T> {
    const { data } = await this.client.patch<T>(url, body, config);
    return data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const { data } = await this.client.delete<T>(url, config);
    return data;
  }

  // Auth endpoints
  async signIn(email: string, password: string) {
    const { data } = await this.client.post('/auth/login', { email, password });
    if (data.access_token) {
      localStorage.setItem('authToken', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  }

  async signUp(name: string, email: string, password: string) {
    const { data } = await this.client.post('/auth/register', { name, email, password });
    return data;
  }

  async signOut() {
    this.clearAuth();
  }

  async getCurrentUser() {
    const { data } = await this.client.get('/auth/me');
    return data;
  }

  // Team endpoints
  async getTeams(page = 1, limit = 50) {
    const { data } = await this.client.get('/teams', {
      params: { page, limit },
    });
    return data;
  }

  async getTeam(teamId: string) {
    const { data } = await this.client.get(`/teams/${teamId}`);
    return data;
  }

  async createTeam(teamData: { name: string; members: string[] }) {
    const { data } = await this.client.post('/teams', teamData);
    return data;
  }

  async updateTeam(teamId: string, teamData: Partial<{ name: string; members: string[] }>) {
    const { data } = await this.client.patch(`/teams/${teamId}`, teamData);
    return data;
  }

  async deleteTeam(teamId: string) {
    const { data } = await this.client.delete(`/teams/${teamId}`);
    return data;
  }

  // Project endpoints
  async getProjects(teamId: string) {
    const { data } = await this.client.get(`/teams/${teamId}/projects`);
    return data;
  }

  async getProject(projectId: string) {
    const { data } = await this.client.get(`/projects/${projectId}`);
    return data;
  }

  async createProject(teamId: string, projectData: { title: string; description: string; githubUrl: string }) {
    const { data } = await this.client.post(`/teams/${teamId}/projects`, projectData);
    return data;
  }

  // Snapshot endpoints
  async getSnapshots(projectId: string) {
    const { data } = await this.client.get(`/snapshots/project/${projectId}`);
    return data;
  }

  async uploadSnapshot(projectId: string, file: File, metadata?: { commit?: string; branch?: string }) {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata?.commit) formData.append('commit', metadata.commit);
    if (metadata?.branch) formData.append('branch', metadata.branch);

    const { data } = await this.client.post(`/projects/${projectId}/snapshots`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  }

  // Leaderboard endpoints
  async getLeaderboard(topN = 100) {
    const { data } = await this.client.get(`/leaderboard/top/${topN}`);
    return data;
  }

  async getTeamRank(teamId: string) {
    const { data } = await this.client.get(`/leaderboard/team/${teamId}/rank`);
    return data;
  }

  async getLeaderboardStats() {
    const { data } = await this.client.get('/leaderboard/stats');
    return data;
  }

  async getTeamScoreHistory(teamId: string, limit = 50) {
    const { data } = await this.client.get(`/leaderboard/team/${teamId}/history`, {
      params: { limit },
    });
    return data;
  }

  // Evaluation endpoints
  async getEvaluationReport(snapshotId: string) {
    const { data } = await this.client.get(`/snapshots/${snapshotId}/evaluation`);
    return data;
  }

  async getTeamScore(teamId: string) {
    const { data } = await this.client.get(`/teams/${teamId}/score`);
    return data;
  }

  // Admin endpoints
  async getSystemStats() {
    const { data } = await this.client.get('/evaluations/stats');
    return data;
  }

  async getPendingEvaluations() {
    const { data } = await this.client.get('/evaluations/pending');
    return data;
  }

  async getRecentEvaluations(limit = 20) {
    const { data } = await this.client.get('/evaluations/recent', {
      params: { limit },
    });
    return data;
  }
}

// Export singleton instance
export const apiClient = new APIClient();
export default apiClient;
