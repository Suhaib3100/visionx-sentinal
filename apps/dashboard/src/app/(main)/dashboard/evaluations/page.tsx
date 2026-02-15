// Evaluations Monitoring Dashboard
'use client';

import { useRouter } from 'next/navigation';
import { Clock, CheckCircle2, XCircle, AlertTriangle, Code, Shield, Zap, TestTube2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useSystemStats, useRecentEvaluations, usePendingEvaluations } from '@/hooks/use-visionx-data';

export default function EvaluationsPage() {
  const router = useRouter();
  const { data: stats } = useSystemStats();
  const { data: recent, isLoading: recentLoading } = useRecentEvaluations(20);
  const { data: pending } = usePendingEvaluations();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500"><CheckCircle2 className="mr-1 h-3 w-3" />Completed</Badge>;
      case 'processing':
        return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" />Processing</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Evaluations</h1>
        <p className="text-muted-foreground">Monitor real-time evaluation pipeline</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Snapshots</CardTitle>
            <Code className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalSnapshots || 0}</div>
            <p className="text-xs text-muted-foreground">Submissions received</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.completedEvaluations || 0}</div>
            <p className="text-xs text-muted-foreground">Successfully evaluated</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats?.pendingEvaluations || 0}</div>
            <p className="text-xs text-muted-foreground">In queue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.failedEvaluations || 0}</div>
            <p className="text-xs text-muted-foreground">Errors encountered</p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Today's Activity</CardTitle>
            <CardDescription>Evaluations processed in the last 24 hours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Completed</span>
                  <span className="text-sm text-muted-foreground">
                    {stats?.evaluationsToday || 0} evaluations
                  </span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div>
                  <p className="text-sm text-muted-foreground">Average Score</p>
                  <p className="text-2xl font-bold">{stats?.averageScore?.toFixed(1) || '0.0'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Top Score</p>
                  <p className="text-2xl font-bold">{stats?.topScore?.toFixed(1) || '0.0'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>This Week</CardTitle>
            <CardDescription>Weekly evaluation summary</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Total Processed</span>
                  <span className="text-sm text-muted-foreground">
                    {stats?.evaluationsThisWeek || 0} evaluations
                  </span>
                </div>
                <Progress value={60} className="h-2" />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold">
                    {stats?.completedEvaluations && stats?.totalSnapshots
                      ? ((stats.completedEvaluations / stats.totalSnapshots) * 100).toFixed(1)
                      : '0.0'}
                    %
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Time</p>
                  <p className="text-2xl font-bold">~45s</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Evaluations */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Evaluations</CardTitle>
          <CardDescription>Last 20 evaluation results • Auto-refreshes every 10s</CardDescription>
        </CardHeader>
        <CardContent>
          {recentLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 w-full bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : !recent || recent.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No evaluations completed yet
            </div>
          ) : (
            <div className="space-y-3">
              {recent.map((evaluation: any) => (
                <div
                  key={evaluation.id}
                  onClick={() => router.push(`/dashboard/evaluations/${evaluation.id}`)}
                  className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{evaluation.teamName}</h3>
                      {getStatusBadge(evaluation.status)}
                      {evaluation.finalScore && (
                        <Badge variant="secondary">Score: {evaluation.finalScore.toFixed(1)}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {evaluation.projectTitle} • {new Date(evaluation.createdAt).toLocaleString()}
                    </p>

                    {evaluation.status === 'completed' && evaluation.metrics && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="flex items-center gap-2">
                          <Code className="h-4 w-4 text-blue-500" />
                          <div>
                            <p className="text-xs text-muted-foreground">Lint</p>
                            <p className="text-sm font-medium">{evaluation.metrics.lintScore}/100</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-yellow-500" />
                          <div>
                            <p className="text-xs text-muted-foreground">Complexity</p>
                            <p className="text-sm font-medium">{evaluation.metrics.complexityScore}/100</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-red-500" />
                          <div>
                            <p className="text-xs text-muted-foreground">Security</p>
                            <p className="text-sm font-medium">{evaluation.metrics.securityScore}/100</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <TestTube2 className="h-4 w-4 text-green-500" />
                          <div>
                            <p className="text-xs text-muted-foreground">Tests</p>
                            <p className="text-sm font-medium">{evaluation.metrics.testCoverageScore}/100</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {evaluation.status === 'failed' && evaluation.error && (
                      <div className="flex items-center gap-2 p-2 rounded bg-destructive/10 text-destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-sm">{evaluation.error}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Queue */}
      {pending && pending.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Queue</CardTitle>
            <CardDescription>{pending.length} evaluations waiting to be processed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pending.map((item: any, idx: number) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                      <span className="text-sm font-medium">{idx + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium">{item.teamName}</p>
                      <p className="text-sm text-muted-foreground">{item.projectTitle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground animate-spin" />
                    <span className="text-sm text-muted-foreground">In queue</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
