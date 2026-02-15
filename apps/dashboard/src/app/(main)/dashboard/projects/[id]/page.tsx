// Project Details with Snapshot Upload
'use client';

import { use, useState } from 'react';
import { ArrowLeft, Upload, Calendar, Github, FileCode, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useProject, useSnapshots, useUploadSnapshot } from '@/hooks/use-visionx-data';
import Link from 'next/link';

export default function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [commit, setCommit] = useState('');
  const [branch, setBranch] = useState('main');
  const [isDragging, setIsDragging] = useState(false);

  const { data: project, isLoading: projectLoading } = useProject(id);
  const { data: snapshots } = useSnapshots(id);
  const uploadMutation = useUploadSnapshot(id);

  const handleFileSelect = (file: File) => {
    if (file.name.endsWith('.tar.gz') || file.name.endsWith('.zip')) {
      setSelectedFile(file);
    } else {
      alert('Please select a .tar.gz or .zip file');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      await uploadMutation.mutateAsync({
        file: selectedFile,
        metadata: { commit: commit || undefined, branch: branch || undefined },
      });
      setSelectedFile(null);
      setCommit('');
      setBranch('main');
      alert('Snapshot uploaded successfully!');
    } catch (error) {
      alert('Failed to upload snapshot');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-orange-500 animate-spin" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (projectLoading) {
    return <div className="h-64 w-full bg-muted animate-pulse rounded" />;
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-2xl font-bold">Project not found</h2>
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
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/projects">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{project.title}</h1>
            <p className="text-muted-foreground">{project.description}</p>
          </div>
        </div>
        {project.githubUrl && (
          <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline">
              <Github className="mr-2 h-4 w-4" />
              View on GitHub
            </Button>
          </a>
        )}
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Snapshot</CardTitle>
          <CardDescription>
            Upload your code as a .tar.gz or .zip file for evaluation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Drag & Drop Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-primary/50'
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              {selectedFile ? (
                <div>
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={() => setSelectedFile(null)}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div>
                  <p className="text-muted-foreground mb-2">
                    Drag & drop your code archive here, or
                  </p>
                  <Button variant="outline" onClick={() => document.getElementById('fileInput')?.click()}>
                    Browse Files
                  </Button>
                  <Input
                    id="fileInput"
                    type="file"
                    accept=".tar.gz,.zip"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file);
                    }}
                  />
                </div>
              )}
            </div>

            {/* Metadata */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="commit">Git Commit (optional)</Label>
                <Input
                  id="commit"
                  placeholder="e.g., abc123def"
                  value={commit}
                  onChange={(e) => setCommit(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="branch">Branch (optional)</Label>
                <Input
                  id="branch"
                  placeholder="e.g., main"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                />
              </div>
            </div>

            {/* Upload Button */}
            <Button
              className="w-full"
              disabled={!selectedFile || uploadMutation.isPending}
              onClick={handleUpload}
            >
              {uploadMutation.isPending ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Snapshot
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Snapshots History */}
      <Card>
        <CardHeader>
          <CardTitle>Snapshot History</CardTitle>
          <CardDescription>{snapshots?.length || 0} snapshots uploaded</CardDescription>
        </CardHeader>
        <CardContent>
          {!snapshots || snapshots.length === 0 ? (
            <div className="text-center py-8">
              <FileCode className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No snapshots uploaded yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {snapshots.map((snapshot: any) => (
                <div
                  key={snapshot.id}
                  className="flex items-start justify-between p-4 rounded-lg border bg-card hover:bg-accent/10 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    {getStatusIcon(snapshot.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">Snapshot #{snapshot.snapshotNumber || snapshot.id.substring(0, 8)}</p>
                        <Badge variant={
                          snapshot.status === 'completed' ? 'default' :
                          snapshot.status === 'processing' ? 'secondary' :
                          snapshot.status === 'failed' ? 'destructive' : 'outline'
                        }>
                          {snapshot.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        {snapshot.metadata?.commit && (
                          <span className="flex items-center gap-1">
                            <FileCode className="h-3 w-3" />
                            {snapshot.metadata.commit.substring(0, 7)}
                          </span>
                        )}
                        {snapshot.metadata?.branch && (
                          <span className="flex items-center gap-1">
                            <Github className="h-3 w-3" />
                            {snapshot.metadata.branch}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(snapshot.createdAt || snapshot.timestamp).toLocaleString()}
                        </span>
                        <span className="text-xs">
                          {(snapshot.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                      
                      {/* Quality Metrics */}
                      {snapshot.staticMetrics && (
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            Lint: {snapshot.staticMetrics.lintScore || 0}/100
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Complexity: {snapshot.staticMetrics.complexityScore || 0}/100
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Security: {snapshot.staticMetrics.securityScore || 0}/100
                          </Badge>
                          <Badge variant="secondary" className="text-xs font-semibold">
                            Total: {snapshot.staticMetrics.totalScore || 0}/100
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {snapshot.staticMetrics && (
                      <div className="text-2xl font-bold text-primary">
                        {parseFloat(snapshot.staticMetrics.totalScore?.toString() || '0').toFixed(1)}
                      </div>
                    )}
                    {snapshot.status === 'pending' && (
                      <Badge variant="outline" className="text-xs">
                        In Queue
                      </Badge>
                    )}
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/dashboard/snapshots/${snapshot.id}`}>
                        {snapshot.status === 'completed' ? 'View Details' : 'Check Status'}
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
