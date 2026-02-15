import { Injectable } from '@nestjs/common';

export interface ActiveSession {
  id: string;
  teamName: string;
  teamId: string;
  projectId: string;
  connectedAt: Date;
  lastActivity: Date;
  ipAddress?: string;
  status: 'connected' | 'idle' | 'disconnected';
}

@Injectable()
export class SessionsService {
  private activeSessions: Map<string, ActiveSession> = new Map();

  registerSession(teamId: string, teamName: string, projectId: string, ipAddress?: string): ActiveSession {
    const sessionId = `session-${teamId}-${Date.now()}`;
    
    const session: ActiveSession = {
      id: sessionId,
      teamName,
      teamId,
      projectId,
      connectedAt: new Date(),
      lastActivity: new Date(),
      ipAddress,
      status: 'connected',
    };

    // Remove old sessions for this team
    for (const [key, existingSession] of this.activeSessions.entries()) {
      if (existingSession.teamId === teamId) {
        this.activeSessions.delete(key);
      }
    }

    this.activeSessions.set(sessionId, session);
    return session;
  }

  updateActivity(teamId: string): void {
    for (const session of this.activeSessions.values()) {
      if (session.teamId === teamId) {
        session.lastActivity = new Date();
        session.status = 'connected';
      }
    }
  }

  getActiveSessions(): ActiveSession[] {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    // Update session status based on last activity
    for (const session of this.activeSessions.values()) {
      if (session.lastActivity < fiveMinutesAgo) {
        session.status = 'idle';
      }
    }

    return Array.from(this.activeSessions.values());
  }

  getSessionByTeamId(teamId: string): ActiveSession | undefined {
    return Array.from(this.activeSessions.values()).find(s => s.teamId === teamId);
  }

  disconnectSession(teamId: string): void {
    for (const [key, session] of this.activeSessions.entries()) {
      if (session.teamId === teamId) {
        session.status = 'disconnected';
        // Remove after 1 minute
        setTimeout(() => {
          this.activeSessions.delete(key);
        }, 60000);
      }
    }
  }

  getSessionCount(): number {
    return this.activeSessions.size;
  }
}
