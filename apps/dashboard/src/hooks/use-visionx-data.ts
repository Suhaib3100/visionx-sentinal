// React Query hooks for VisionX Eval data fetching
'use client';

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type {
  Team,
  Project,
  Snapshot,
  LeaderboardEntry,
  LeaderboardStats,
  ScoreHistory,
  FinalScore,
  EvaluationReport,
  SystemStats,
} from '@/types/visionx';

// Query keys
export const queryKeys = {
  teams: ['teams'] as const,
  team: (id: string) => ['teams', id] as const,
  projects: (teamId: string) => ['projects', teamId] as const,
  project: (id: string) => ['projects', id] as const,
  snapshots: (projectId: string) => ['snapshots', projectId] as const,
  leaderboard: (topN: number) => ['leaderboard', topN] as const,
  leaderboardStats: ['leaderboard', 'stats'] as const,
  teamRank: (teamId: string) => ['leaderboard', 'rank', teamId] as const,
  teamScore: (teamId: string) => ['teams', teamId, 'score'] as const,
  scoreHistory: (teamId: string) => ['teams', teamId, 'history'] as const,
  evaluation: (snapshotId: string) => ['evaluation', snapshotId] as const,
  systemStats: ['system', 'stats'] as const,
  pendingEvaluations: ['evaluations', 'pending'] as const,
  recentEvaluations: ['evaluations', 'recent'] as const,
};

// Teams
export const useTeams = (page = 1, limit = 50) => {
  return useQuery({
    queryKey: [...queryKeys.teams, page, limit],
    queryFn: () => apiClient.getTeams(page, limit),
    staleTime: 30000, // 30 seconds
  });
};

export const useTeam = (teamId: string) => {
  return useQuery({
    queryKey: queryKeys.team(teamId),
    queryFn: () => apiClient.getTeam(teamId),
    enabled: !!teamId,
  });
};

export const useCreateTeam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; members: string[] }) => apiClient.createTeam(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams });
    },
  });
};

export const useUpdateTeam = (teamId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<{ name: string; members: string[] }>) =>
      apiClient.updateTeam(teamId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.team(teamId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.teams });
    },
  });
};

export const useDeleteTeam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (teamId: string) => apiClient.deleteTeam(teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams });
    },
  });
};

// Projects
export const useProjects = (teamId: string) => {
  return useQuery({
    queryKey: queryKeys.projects(teamId),
    queryFn: () => apiClient.getProjects(teamId),
    enabled: !!teamId,
  });
};

export const useProject = (projectId: string) => {
  return useQuery({
    queryKey: queryKeys.project(projectId),
    queryFn: () => apiClient.getProject(projectId),
    enabled: !!projectId,
  });
};

export const useCreateProject = (teamId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; description: string; githubUrl: string }) =>
      apiClient.createProject(teamId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects(teamId) });
    },
  });
};

// Snapshots
export const useSnapshots = (projectId: string) => {
  return useQuery({
    queryKey: queryKeys.snapshots(projectId),
    queryFn: () => apiClient.getSnapshots(projectId),
    enabled: !!projectId,
  });
};

export const useUploadSnapshot = (projectId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { file: File; metadata?: { commit?: string; branch?: string } }) =>
      apiClient.uploadSnapshot(projectId, data.file, data.metadata),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.snapshots(projectId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.pendingEvaluations });
    },
  });
};

// Leaderboard
export const useLeaderboard = (topN = 100, options?: Omit<UseQueryOptions<LeaderboardEntry[]>, 'queryKey' | 'queryFn'>) => {
  return useQuery({
    queryKey: queryKeys.leaderboard(topN),
    queryFn: () => apiClient.getLeaderboard(topN),
    staleTime: 5000, // 5 seconds - frequent updates
    refetchInterval: 5000, // Auto-refresh every 5 seconds
    ...options,
  });
};

export const useLeaderboardStats = () => {
  return useQuery({
    queryKey: queryKeys.leaderboardStats,
    queryFn: () => apiClient.getLeaderboardStats(),
    staleTime: 10000,
    refetchInterval: 10000,
  });
};

export const useTeamRank = (teamId: string) => {
  return useQuery({
    queryKey: queryKeys.teamRank(teamId),
    queryFn: () => apiClient.getTeamRank(teamId),
    enabled: !!teamId,
    staleTime: 5000,
  });
};

export const useTeamScore = (teamId: string) => {
  return useQuery({
    queryKey: queryKeys.teamScore(teamId),
    queryFn: () => apiClient.getTeamScore(teamId),
    enabled: !!teamId,
  });
};

export const useScoreHistory = (teamId: string, limit = 50) => {
  return useQuery({
    queryKey: [...queryKeys.scoreHistory(teamId), limit],
    queryFn: () => apiClient.getTeamScoreHistory(teamId, limit),
    enabled: !!teamId,
  });
};

// Evaluations
export const useEvaluation = (snapshotId: string) => {
  return useQuery({
    queryKey: queryKeys.evaluation(snapshotId),
    queryFn: () => apiClient.getEvaluationReport(snapshotId),
    enabled: !!snapshotId,
  });
};

// System & Admin
export const useSystemStats = () => {
  return useQuery({
    queryKey: queryKeys.systemStats,
    queryFn: () => apiClient.getSystemStats(),
    staleTime: 60000, // 1 minute
    refetchInterval: 60000,
  });
};

export const usePendingEvaluations = () => {
  return useQuery({
    queryKey: queryKeys.pendingEvaluations,
    queryFn: () => apiClient.getPendingEvaluations(),
    staleTime: 10000,
    refetchInterval: 10000,
  });
};

export const useRecentEvaluations = (limit = 20) => {
  return useQuery({
    queryKey: [...queryKeys.recentEvaluations, limit],
    queryFn: () => apiClient.getRecentEvaluations(limit),
    staleTime: 10000,
    refetchInterval: 10000,
  });
};
