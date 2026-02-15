// Teams List Page
'use client';

import { useState } from 'react';
import { Plus, Search, Users, Trophy, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTeams } from '@/hooks/use-visionx-data';
import Link from 'next/link';

export default function TeamsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: teamsData, isLoading, error } = useTeams(1, 100);

  const teams = teamsData?.data || [];
  const filteredTeams = teams.filter((team: any) =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Teams</h1>
          <p className="text-muted-foreground">Manage hackathon teams and members</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Team
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teams.length}</div>
            <p className="text-xs text-muted-foreground">Registered teams</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teams.reduce((acc: number, team: any) => acc + (team.projects?.length || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">Projects submitted</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teams.reduce((acc: number, team: any) => acc + (team.members?.length || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">Participants</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Teams</CardTitle>
              <CardDescription>
                {filteredTeams.length} of {teams.length} teams
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search teams..."
                  className="pl-8 w-75"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 w-full bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8 text-muted-foreground">
              Failed to load teams. Please try again.
            </div>
          ) : filteredTeams.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? 'No teams found matching your search.' : 'No teams registered yet.'}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTeams.map((team: any) => (
                <Link key={team.id} href={`/dashboard/teams/${team.id}`}>
                  <Card className="h-full hover:bg-accent/50 transition-colors cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{team.name}</CardTitle>
                          <CardDescription className="mt-1">
                            {team.members?.length || 0} member{team.members?.length !== 1 ? 's' : ''}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary">{team.projects?.length || 0} projects</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {team.members && team.members.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {team.members.slice(0, 3).map((member: any, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {member}
                              </Badge>
                            ))}
                            {team.members.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{team.members.length - 3} more
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No members yet</p>
                        )}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>Created {new Date(team.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
