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

  triggerBulkCapture(): {
    success: boolean;
    message: string;
    activeTeams: Array<{ teamId: string; teamName: string; projectId: string }>;
    count: number;
  } {
    const activeSessions = this.getActiveSessions();
    
    // Filter only connected sessions (not idle or disconnected)
    const connectedSessions = activeSessions.filter(
      s => s.status === 'connected' || s.status === 'idle'
    );

    const activeTeams = connectedSessions.map(session => ({
      teamId: session.teamId,
      teamName: session.teamName,
      projectId: session.projectId,
    }));

    // Mark all sessions for capture trigger
    for (const session of connectedSessions) {
      (session as any).captureTrigger = Date.now();
    }

    return {
      success: true,
      message: `Bulk capture triggered for ${activeTeams.length} active team(s)`,
      activeTeams,
      count: activeTeams.length,
    };
  }

  shouldTriggerCapture(teamId: string): boolean {
    for (const session of this.activeSessions.values()) {
      if (session.teamId === teamId && (session as any).captureTrigger) {
        const triggerTime = (session as any).captureTrigger;
        const now = Date.now();
        
        // Capture trigger is valid for 2 minutes
        if (now - triggerTime < 2 * 60 * 1000) {
          // Clear the trigger flag
          delete (session as any).captureTrigger;
          return true;
        }
      }
    }
    return false;
  }
}
