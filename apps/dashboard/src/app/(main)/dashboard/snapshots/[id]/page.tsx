'use client';

import { use, useState, useEffect } from 'react';
import { ArrowLeft, Calendar, FileCode, CheckCircle2, Clock, XCircle, RefreshCw, Github, Package } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

interface SnapshotDetails {
  id: string;
  snapshotNumber: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  timestamp: string;
  createdAt: string;
  size: number;
  hash: string;
  s3Key: string;
  metadata: {
    commit?: string;
    branch?: string;
    techStack?: any;
    fileTree?: any;
    gitInfo?: any;
    environment?: any;
  };
  staticMetrics?: {
    lintScore: number;
    complexityScore: number;
    securityScore: number;
    testCoverageScore: number;
    totalScore: number;
    lintIssues: any;
    complexityMetrics: any;
    securityIssues: any;
    testCoverage: any;
    totalFiles: number;
    totalLines: number;
  };
  team?: {
    id: string;
    name: string;
  };
  project?: {
    id: string;
    title: string;
  };
}

export default function SnapshotDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [snapshot, setSnapshot] = useState<SnapshotDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSnapshot = async () => {
    try {
      setRefreshing(true);
      const data = await apiClient.get<SnapshotDetails>(`/snapshots/${id}`);
      setSnapshot(data);
    } catch (error: any) {
      console.error('Failed to load snapshot:', error);
      toast.error('Failed to load snapshot details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSnapshot();
    
    // Auto-refresh every 10 seconds if pending or processing
    const interval = setInterval(() => {
      if (snapshot?.status === 'pending' || snapshot?.status === 'processing') {
        fetchSnapshot();
      }
    }, 10000);
    
    return () => clearInterval(interval);
  }, [id, snapshot?.status]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-6 w-6 text-green-500" />;
      case 'processing':
        return <Clock className="h-6 w-6 text-orange-500 animate-spin" />;
      case 'failed':
        return <XCircle className="h-6 w-6 text-red-500" />;
      default:
        return <Clock className="h-6 w-6 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'processing': return 'bg-orange-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return <div className="h-64 w-full bg-muted animate-pulse rounded" />;
  }

  if (!snapshot) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-2xl font-bold">Snapshot not found</h2>
        <Link href="/dashboard/projects">
          <Button className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/projects/${snapshot.project?.id}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Snapshot #{snapshot.snapshotNumber}</h1>
            <p className="text-muted-foreground">
              {snapshot.team?.name} • {snapshot.project?.title}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={fetchSnapshot} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {getStatusIcon(snapshot.status)}
        </div>
      </div>

      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Status
            <Badge variant={
              snapshot.status === 'completed' ? 'default' :
              snapshot.status === 'processing' ? 'secondary' :
              snapshot.status === 'failed' ? 'destructive' : 'outline'
            }>
              {snapshot.status}
            </Badge>
          </CardTitle>
          <CardDescription>
            {snapshot.status === 'pending' && 'Waiting in queue for processing...'}
            {snapshot.status === 'processing' && 'Currently being analyzed by the worker...'}
            {snapshot.status === 'completed' && 'Analysis complete!'}
            {snapshot.status === 'failed' && 'Processing failed. Please try uploading again.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Progress Bar */}
            {(snapshot.status === 'pending' || snapshot.status === 'processing') && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Processing Progress</span>
                  <span>{snapshot.status === 'pending' ? '0%' : '50%'}</span>
                </div>
                <Progress value={snapshot.status === 'pending' ? 0 : 50} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {snapshot.status === 'pending' 
                    ? 'Your snapshot will be processed shortly. This page will auto-refresh every 10 seconds.'
                    : 'Running static analysis, security checks, and AI evaluation...'}
                </p>
              </div>
            )}

            {/* Metadata */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Uploaded</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(snapshot.createdAt || snapshot.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Size</p>
                  <p className="text-sm text-muted-foreground">
                    {(snapshot.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              {snapshot.metadata?.commit && (
                <div className="flex items-center gap-2">
                  <FileCode className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Commit</p>
                    <p className="text-sm text-muted-foreground font-mono">
                      {snapshot.metadata.commit.substring(0, 7)}
                    </p>
                  </div>
                </div>
              )}
              {snapshot.metadata?.branch && (
                <div className="flex items-center gap-2">
                  <Github className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Branch</p>
                    <p className="text-sm text-muted-foreground">
                      {snapshot.metadata.branch}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quality Metrics */}
      {snapshot.staticMetrics && (
        <Card>
          <CardHeader>
            <CardTitle>Quality Analysis</CardTitle>
            <CardDescription>Static code analysis results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Overall Score */}
              <div className="text-center">
                <div className="text-6xl font-bold text-primary mb-2">
                  {snapshot.staticMetrics.totalScore?.toFixed(1) || 'N/A'}
                </div>
                <p className="text-muted-foreground">Overall Quality Score</p>
              </div>

              {/* Individual Scores */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Lint Quality</span>
                    <span className="text-sm text-muted-foreground">
                      {snapshot.staticMetrics.lintScore}/100
                    </span>
                  </div>
                  <Progress value={snapshot.staticMetrics.lintScore} className={`h-2 ${getStatusColor('completed')}`} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Complexity</span>
                    <span className="text-sm text-muted-foreground">
                      {snapshot.staticMetrics.complexityScore}/100
                    </span>
                  </div>
                  <Progress value={snapshot.staticMetrics.complexityScore} className={`h-2 ${getStatusColor('completed')}`} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Security</span>
                    <span className="text-sm text-muted-foreground">
                      {snapshot.staticMetrics.securityScore}/100
                    </span>
                  </div>
                  <Progress value={snapshot.staticMetrics.securityScore} className={`h-2 ${getStatusColor('completed')}`} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Test Coverage</span>
                    <span className="text-sm text-muted-foreground">
                      {snapshot.staticMetrics.testCoverageScore}/100
                    </span>
                  </div>
                  <Progress value={snapshot.staticMetrics.testCoverageScore} className={`h-2 ${getStatusColor('completed')}`} />
                </div>
              </div>

              {/* Code Stats */}
              <div className="grid gap-4 md:grid-cols-3 pt-4 border-t">
                <div className="text-center">
                  <div className="text-2xl font-bold">{snapshot.staticMetrics.totalFiles}</div>
                  <p className="text-sm text-muted-foreground">Total Files</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{snapshot.staticMetrics.totalLines.toLocaleString()}</div>
                  <p className="text-sm text-muted-foreground">Lines of Code</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {Math.round(snapshot.staticMetrics.totalLines / snapshot.staticMetrics.totalFiles)}
                  </div>
                  <p className="text-sm text-muted-foreground">Avg Lines/File</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Raw Data (for debugging) */}
      {snapshot.status === 'pending' && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Information</CardTitle>
            <CardDescription>Snapshot successfully uploaded, awaiting processing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Snapshot ID:</span>
                <span className="font-mono">{snapshot.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">S3 Location:</span>
                <span className="font-mono text-xs">{snapshot.s3Key}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hash:</span>
                <span className="font-mono text-xs">{snapshot.hash}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
