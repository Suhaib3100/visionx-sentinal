// VisionX Eval Leaderboard Page
'use client';

import { Trophy, TrendingUp, Users, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLeaderboard, useLeaderboardStats } from '@/hooks/use-visionx-data';
import { StatsCard } from '@/components/stats-card';
import { LoadingState } from '@/components/loading-state';
import { EmptyState } from '@/components/empty-state';
import { Progress } from '@/components/ui/progress';

export default function LeaderboardPage() {
  const { data: leaderboard, isLoading: leaderboardLoading, error: leaderboardError } = useLeaderboard(100);
  const { data: stats, isLoading: statsLoading } = useLeaderboardStats();

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Leaderboard</h1>
        <p className="text-muted-foreground">Real-time rankings for all teams</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                </CardHeader>
                <CardContent>
                  <div className="h-8 w-20 bg-muted animate-pulse rounded" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <StatsCard
              title="Total Teams"
              value={stats?.totalTeams || 0}
              icon={Users}
              description="Competing teams"
            />
            <StatsCard
              title="Average Score"
              value={stats?.averageScore ? parseFloat(stats.averageScore.toString()).toFixed(1) : '0.0'}
              icon={BarChart3}
              description="Out of 100"
            />
            <StatsCard
              title="Top Score"
              value={stats?.topScore ? parseFloat(stats.topScore.toString()).toFixed(1) : '0.0'}
              icon={TrendingUp}
              description="Highest score"
            />
            <StatsCard
              title="Total Evaluations"
              value={stats?.totalEvaluations || 0}
              icon={Trophy}
              description="Completed"
            />
          </>
        )}
      </div>

      {/* Leaderboard Table */}
      <Card>
        <CardHeader>
          <CardTitle>Live Rankings</CardTitle>
          <CardDescription>
            Auto-refreshes every 5 seconds • Showing top 100 teams
          </CardDescription>
        </CardHeader>
        <CardContent>
          {leaderboardLoading ? (
            <LoadingState message="Loading leaderboard..." />
          ) : leaderboardError ? (
            <EmptyState
              icon={Trophy}
              title="Failed to load leaderboard"
              description="Please try again later"
            />
          ) : !leaderboard || leaderboard.length === 0 ? (
            <EmptyState
              icon={Trophy}
              title="No teams evaluated yet"
              description="Teams will appear here once evaluations are complete"
            />
          ) : (
            <div className="space-y-2">
              {leaderboard.map((entry, index) => {
                const isTopThree = index < 3;
                const medalColor =
                  index === 0
                    ? 'text-yellow-500'
                    : index === 1
                    ? 'text-gray-400'
                    : 'text-amber-600';

                return (
                  <div
                    key={entry.teamId}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {/* Rank */}
                      <div
                        className={`flex items-center justify-center w-10 h-10 rounded-full ${isTopThree ? 'bg-primary/10' : 'bg-muted'}`}
                      >
                        {isTopThree ? (
                          <Trophy className={`h-5 w-5 ${medalColor}`} />
                        ) : (
                          <span className="font-bold">{entry.rank}</span>
                        )}
                      </div>

                      {/* Team Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{entry.teamName}</h3>
                          {isTopThree && (
                            <Badge variant="secondary" className="text-xs">
                              Top {entry.rank}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Last evaluated: {new Date(entry.lastEvaluatedAt).toLocaleString()}
                        </p>
                      </div>

                      {/* Score */}
                      <div className="text-right">
                        <div className="text-2xl font-bold">{parseFloat(entry.score.toString()).toFixed(1)}</div>
                        <div className="text-sm text-muted-foreground">/ 100</div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-32">
                        <Progress value={entry.score} max={100} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
