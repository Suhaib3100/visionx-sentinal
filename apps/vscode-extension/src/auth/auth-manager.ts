// Authentication Manager
import * as vscode from 'vscode';
import axios from 'axios';

export interface AuthState {
  token: string;
  teamName: string;
  teamId: string;
  projectId: string;
  isLocked: boolean;
}

export class AuthManager {
  private static readonly AUTH_KEY = 'visionx.auth';
  private authState: AuthState | null = null;

  constructor(private context: vscode.ExtensionContext) {
    this.loadAuthState();
  }

  private loadAuthState(): void {
    const stored = this.context.globalState.get<AuthState>(AuthManager.AUTH_KEY);
    if (stored) {
      this.authState = stored;
    }
  }

  async authenticate(token: string): Promise<boolean> {
    try {
      const config = vscode.workspace.getConfiguration('visionx');
      const apiUrl = config.get<string>('apiUrl', 'http://localhost:3000/api');

      // Check if this is first-time authentication
      const isFirstTime = this.authState === null;

      // Validate token with backend
      const response = await axios.post(`${apiUrl}/auth/validate`, { token });

      if (response.data.valid) {
        this.authState = {
          token,
          teamName: response.data.teamName || 'Unknown Team',
          teamId: response.data.teamId,
          projectId: response.data.projectId,
          isLocked: response.data.isLocked || false,
        };

        await this.context.globalState.update(AuthManager.AUTH_KEY, this.authState);
        
        // Store flag for first-time capture
        if (isFirstTime) {
          await this.context.globalState.update('visionx.firstTimeAuth', true);
        }
        
        return true;
      }

      return false;
    } catch (error) {
      console.error('Authentication error:', error);
      return false;
    }
  }

  async isFirstTimeAuthentication(): Promise<boolean> {
    const flag = this.context.globalState.get<boolean>('visionx.firstTimeAuth', false);
    return flag;
  }

  async clearFirstTimeFlag(): Promise<void> {
    await this.context.globalState.update('visionx.firstTimeAuth', false);
  }

  async isAuthenticated(): Promise<boolean> {
    return this.authState !== null && !this.authState.isLocked;
  }

  getToken(): string | null {
    return this.authState?.token || null;
  }

  getTeamName(): string | null {
    return this.authState?.teamName || null;
  }

  getTeamId(): string | null {
    return this.authState?.teamId || null;
  }

  getProjectId(): string | null {
    return this.authState?.projectId || null;
  }

  isLocked(): boolean {
    return this.authState?.isLocked || false;
  }

  async lockSubmissions(): Promise<void> {
    if (this.authState) {
      this.authState.isLocked = true;
      await this.context.globalState.update(AuthManager.AUTH_KEY, this.authState);
    }
  }

  async logout(): Promise<void> {
    this.authState = null;
    await this.context.globalState.update(AuthManager.AUTH_KEY, undefined);
  }

  getAuthState(): AuthState | null {
    return this.authState;
  }
}
