'use client';

import { useState, useEffect } from 'react';
import { Users, Activity, Clock, Wifi, WifiOff, Camera } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

interface ActiveSession {
  id: string;
  teamName: string;
  teamId: string;
  projectId: string;
  connectedAt: string;
  lastActivity: string;
  ipAddress?: string;
  status: 'connected' | 'idle' | 'disconnected';
}

export default function AdminConnectionsPage() {
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggeringCapture, setTriggeringCapture] = useState(false);

  const fetchSessions = async () => {
    try {
      const data = await apiClient.get<ActiveSession[]>('/sessions/active');
      setSessions(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Failed to load sessions:', error);
      toast.error('Failed to load active sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkCapture = async () => {
    setTriggeringCapture(true);
    
    try {
      const response = await apiClient.post<{
        success: boolean;
        message: string;
        count: number;
        activeTeams: Array<{ teamId: string; teamName: string; projectId: string }>;
      }>('/sessions/trigger-bulk-capture', {});

      if (response.success) {
        toast.success(`📸 ${response.message}`, {
          description: `Triggered capture for ${response.count} team(s). Extensions will capture within 30 seconds.`,
          duration: 5000,
        });
        
        // Log the teams
        console.log('Bulk capture triggered for teams:', response.activeTeams);
      } else {
        toast.error('Failed to trigger bulk capture');
      }
    } catch (error: any) {
      console.error('Failed to trigger bulk capture:', error);
      const message = error?.response?.data?.message || 'Failed to trigger bulk capture';
      toast.error(message);
    } finally {
      setTriggeringCapture(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchSessions, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-500"><Wifi className="mr-1 h-3 w-3" />Connected</Badge>;
      case 'idle':
        return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" />Idle</Badge>;
      case 'disconnected':
        return <Badge variant="destructive"><WifiOff className="mr-1 h-3 w-3" />Disconnected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTimeSince = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const connectedCount = sessions.filter(s => s.status === 'connected').length;
  const idleCount = sessions.filter(s => s.status === 'idle').length;

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin - Active Connections</h1>
          <p className="text-muted-foreground">Monitor teams connected to the VS Code extension</p>
        </div>
        <Button 
          onClick={handleBulkCapture}
          disabled={triggeringCapture || connectedCount === 0}
          size="lg"
        >
          <Camera className="mr-2 h-4 w-4" />
          {triggeringCapture ? 'Triggering...' : 'Capture All Teams'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessions.length}</div>
            <p className="text-xs text-muted-foreground">Active and idle</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected</CardTitle>
            <Wifi className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{connectedCount}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Idle</CardTitle>
            <Activity className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{idleCount}</div>
            <p className="text-xs text-muted-foreground">No activity (5+ min)</p>
          </CardContent>
        </Card>
      </div>

      {/* Sessions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>
            Real-time view of teams connected to the extension (auto-refreshes every 5s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading sessions...
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No active sessions. Teams will appear here when they connect via the VS Code extension.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Connected At</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead>Project ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium">{session.teamName}</TableCell>
                    <TableCell>{getStatusBadge(session.status)}</TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {new Date(session.connectedAt).toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {getTimeSince(session.connectedAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {getTimeSince(session.lastActivity)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs">{session.projectId}</code>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
