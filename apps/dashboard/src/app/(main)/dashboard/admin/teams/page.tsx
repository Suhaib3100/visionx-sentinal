// Admin - Teams Management with Token Generation
'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Key, Users, Copy, Check, Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { apiClient } from '@/lib/api-client';

interface Team {
  id: string;
  name: string;
  members?: any[]; // Array of team members from backend
  token?: string;
  participantCount?: number;
  createdAt: string;
}

interface Participant {
  name: string;
  email: string;
  role: 'leader' | 'member';
}

export default function AdminTeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isGenerateTokenOpen, setIsGenerateTokenOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [generatedToken, setGeneratedToken] = useState('');
  const [tokenName, setTokenName] = useState('');
  const [copiedToken, setCopiedToken] = useState(false);

  // Form state
  const [newTeamName, setNewTeamName] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([
    { name: '', email: '', role: 'leader' },
  ]);

  // Load teams on mount
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const teamsData = await apiClient.get<Team[]>('/teams');
        // apiClient.get returns data directly, Ensure it's an array and filter out any invalid entries
        setTeams(Array.isArray(teamsData) ? teamsData.filter(t => t && t.id) : []);
      } catch (error: any) {
        const message = error?.response?.data?.message || 'Failed to load teams';
        toast.error(message);
        console.error('Load teams error:', error?.response?.data);
      }
    };
    fetchTeams();
  }, []);

  const filteredTeams = teams.filter((team) =>
    team?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateTeam = async () => {
    try {
      const validParticipants = participants.filter(
        (p) => p.name.trim() !== '' && p.email.trim() !== ''
      );

      if (validParticipants.length === 0) {
        toast.error('Please add at least one participant');
        return;
      }

      if (newTeamName.length < 3) {
        toast.error('Team name must be at least 3 characters');
        return;
      }

      const newTeam = await apiClient.post<Team>('/teams', {
        name: newTeamName,
        members: validParticipants,
      });

      // apiClient.post returns the team data directly
      if (newTeam && newTeam.id) {
        setTeams([...teams, newTeam]);
      }
      
      setIsCreateOpen(false);
      setNewTeamName('');
      setParticipants([{ name: '', email: '', role: 'leader' }]);

      toast.success('Team created successfully!');
      
      // Reload teams to ensure we have the correct data
      setTimeout(() => {
        apiClient.get<Team[]>('/teams').then((teamsData) => {
          setTeams(Array.isArray(teamsData) ? teamsData.filter(t => t && t.id) : []);
        }).catch(() => {});
      }, 500);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to create team';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
      console.error('Create team error:', error?.response?.data);
    }
  };

  const handleGenerateToken = async (team: Team) => {
    try {
      const response = await apiClient.post<{ token: string; tokenName: string; teamName: string; teamId: string; projectId: string }>('/auth/generate-custom-token', {
        teamName: team.name,
        teamId: team.id,
      });

      // apiClient.post returns data directly, not wrapped in response.data
      setGeneratedToken(response.token);
      setTokenName(response.tokenName);
      setSelectedTeam(team);
      setIsGenerateTokenOpen(true);
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Failed to generate token';
      toast.error(message);
      console.error('Generate token error:', error?.response?.data || error);
    }
  };

  const copyToken = () => {
    navigator.clipboard.writeText(generatedToken);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);

    toast.success('Token copied to clipboard');
  };

  const addParticipant = () => {
    setParticipants([...participants, { name: '', email: '', role: 'member' }]);
  };

  const updateParticipant = (index: number, field: keyof Participant, value: string) => {
    const updated = [...participants];
    updated[index] = { ...updated[index], [field]: value };
    setParticipants(updated);
  };

  const removeParticipant = (index: number) => {
    setParticipants(participants.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin - Team Management</h1>
          <p className="text-muted-foreground">Create teams and generate access tokens</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Team
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-full sm:max-w-131.25">
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
              <DialogDescription>
                Create a new team and add participants. A token will be generated after creation.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="teamName">Team Name</Label>
                <Input
                  id="teamName"
                  placeholder="e.g., bytecrew, techninjas, etc."
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label>Participants</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addParticipant}
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {participants.map((participant, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <div className="flex-1 space-y-2">
                        <Input
                          placeholder="Name"
                          value={participant.name}
                          onChange={(e) => updateParticipant(index, 'name', e.target.value)}
                        />
                        <Input
                          placeholder="Email"
                          type="email"
                          value={participant.email}
                          onChange={(e) => updateParticipant(index, 'email', e.target.value)}
                        />
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          value={participant.role}
                          onChange={(e) => updateParticipant(index, 'role', e.target.value as 'leader' | 'member')}
                        >
                          <option value="leader">Leader</option>
                          <option value="member">Member</option>
                        </select>
                      </div>
                      {participants.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeParticipant(index)}
                          className="mt-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTeam} disabled={!newTeamName.trim()}>
                Create Team
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
            <p className="text-xs text-muted-foreground">Active teams</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teams.reduce((sum, team) => sum + (team?.members?.length || team?.participantCount || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">Across all teams</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tokens Generated</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teams.filter((t) => t.token).length}
            </div>
            <p className="text-xs text-muted-foreground">Active access tokens</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Teams List</CardTitle>
          <CardDescription>Manage teams and generate access tokens</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search teams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Team Name</TableHead>
                <TableHead>Participants</TableHead>
                <TableHead>Token Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeams.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No teams found. Create your first team to get started.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTeams.map((team) => {
                  const memberCount = team?.members?.length || team?.participantCount || 0;
                  return (
                  <TableRow key={team.id}>
                    <TableCell className="font-medium">{team.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {memberCount} member{memberCount !== 1 ? 's' : ''}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {team.token ? (
                        <Badge variant="default" className="bg-green-500">Active</Badge>
                      ) : (
                        <Badge variant="outline">Not generated</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(team.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleGenerateToken(team)}
                        >
                          <Key className="mr-1 h-3 w-3" />
                          {team.token ? 'View' : 'Generate'} Token
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Token Dialog */}
      <Dialog open={isGenerateTokenOpen} onOpenChange={setIsGenerateTokenOpen}>
        <DialogContent className="max-w-full sm:max-w-150">
          <DialogHeader>
            <DialogTitle>Access Token for {selectedTeam?.name}</DialogTitle>
            <DialogDescription>
              This token should be used in the VS Code extension for authentication.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Token Name */}
            <div className="rounded-lg border bg-blue-50 dark:bg-blue-950 p-3">
              <Label className="text-xs font-semibold uppercase text-muted-foreground mb-1 block">
                Token Name
              </Label>
              <div className="text-lg font-mono font-bold text-blue-700 dark:text-blue-300">
                {tokenName}
              </div>
            </div>

            {/* JWT Token */}
            <div className="rounded-lg border bg-muted p-4">
              <div className="mb-2 flex items-center justify-between">
                <Label className="text-xs font-semibold uppercase text-muted-foreground">
                  JWT Token
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyToken}
                  className="h-7 text-xs"
                >
                  {copiedToken ? (
                    <>
                      <Check className="mr-1 h-3 w-3" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1 h-3 w-3" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <code className="block w-full break-all text-xs font-mono">
                {generatedToken}
              </code>
            </div>

            <div className="rounded-lg border bg-green-50 dark:bg-green-950 p-4">
              <h4 className="mb-2 font-semibold text-sm">How to use:</h4>
              <ol className="space-y-1 text-sm text-muted-foreground">
                <li>1. Copy the token above</li>
                <li>2. Open VS Code and install the VisionX Eval extension</li>
                <li>3. Click the VisionX icon in the Activity Bar</li>
                <li>4. Paste the token in the authentication field</li>
                <li>5. Click "Connect" to authenticate</li>
              </ol>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsGenerateTokenOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
