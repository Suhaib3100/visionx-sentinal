// Detailed Evaluation View
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Code, 
  Shield, 
  Zap, 
  TestTube2, 
  Award,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileCode,
  Package,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  Target,
  Activity,
  Brain,
  BookOpen
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { apiClient } from '@/lib/api-client';

export default function EvaluationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [evaluation, setEvaluation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvaluation = async () => {
      try {
        const data = await apiClient.get(`/evaluations/${params.id}`);
        setEvaluation(data);
        setError(null);
      } catch (error: any) {
        console.error('Failed to fetch evaluation:', error);
        if (error.response?.status === 404) {
          setError('Evaluation not found');
        } else {
          setError(error.response?.data?.message || 'Failed to load evaluation');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluation();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!evaluation || error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <AlertTriangle className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">{error || 'Evaluation not found'}</p>
        <button onClick={() => router.back()} className="text-primary hover:underline">
          Go back
        </button>
      </div>
    );
  }

  const { snapshot, scores, staticMetrics, aiReport } = evaluation;
  const isCompleted = snapshot.status === 'completed';

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{snapshot.projectTitle}</h1>
          <p className="text-muted-foreground">
            {snapshot.teamName} • Snapshot #{snapshot.snapshotNumber} • {new Date(snapshot.createdAt).toLocaleString()}
          </p>
        </div>
        {isCompleted && scores.final && (
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Final Score</p>
            <p className="text-4xl font-bold">{scores.final.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">Rank #{scores.rank || 'N/A'}</p>
          </div>
        )}
      </div>

      {/* Score Cards */}
      {isCompleted && scores.final && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Static Analysis</CardTitle>
              <Code className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{scores.static?.toFixed(1) || 'N/A'}/100</div>
              <Progress value={scores.static || 0} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Evaluation</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{scores.ai?.toFixed(1) || 'N/A'}/100</div>
              <Progress value={scores.ai || 0} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Final Score</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{scores.final.toFixed(1)}/100</div>
              <Progress value={scores.final} className="mt-2" />
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analysis">Code Analysis</TabsTrigger>
          <TabsTrigger value="ai">AI Insights</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
          <TabsTrigger value="suggestions">Recommendations</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Project Description */}
          <Card>
            <CardHeader>
              <CardTitle>About This Project</CardTitle>
              <CardDescription>What this project does</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Project Purpose</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {snapshot.metadata?.fileTree?.includes('README.md') 
                    ? 'This is a comprehensive software project with documentation. ' 
                    : ''
                  }
                  Based on the codebase structure, this project consists of{' '}
                  {snapshot.metadata?.fileTree?.some((f: string) => f.includes('apps/backend/')) && 'a NestJS backend API, '}
                  {snapshot.metadata?.fileTree?.some((f: string) => f.includes('apps/dashboard/')) && 'a Next.js dashboard frontend, '}
                  {snapshot.metadata?.fileTree?.some((f: string) => f.includes('apps/worker/')) && 'a worker service for background processing, '}
                  {snapshot.metadata?.fileTree?.some((f: string) => f.includes('apps/vscode-extension/')) && 'a VS Code extension, '}
                  and supporting infrastructure.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Key Components</h4>
                <div className="grid gap-2">
                  {snapshot.metadata?.fileTree?.some((f: string) => f.includes('apps/backend/')) && (
                    <div className="flex items-start gap-2 text-sm">
                      <Code className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-medium">Backend API</span>
                        <span className="text-muted-foreground"> - RESTful API built with NestJS</span>
                      </div>
                    </div>
                  )}
                  {snapshot.metadata?.fileTree?.some((f: string) => f.includes('apps/dashboard/')) && (
                    <div className="flex items-start gap-2 text-sm">
                      <Package className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-medium">Dashboard Frontend</span>
                        <span className="text-muted-foreground"> - User interface built with Next.js</span>
                      </div>
                    </div>
                  )}
                  {snapshot.metadata?.fileTree?.some((f: string) => f.includes('apps/worker/')) && (
                    <div className="flex items-start gap-2 text-sm">
                      <Activity className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-medium">Worker Service</span>
                        <span className="text-muted-foreground"> - Background job processing</span>
                      </div>
                    </div>
                  )}
                  {snapshot.metadata?.fileTree?.some((f: string) => f.includes('apps/vscode-extension/')) && (
                    <div className="flex items-start gap-2 text-sm">
                      <FileCode className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-medium">VS Code Extension</span>
                        <span className="text-muted-foreground"> - IDE integration for code submission</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {aiReport?.summary && (
                <div>
                  <h4 className="font-semibold mb-2">AI Assessment</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {aiReport.summary}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Project Overview</CardTitle>
              <CardDescription>Technical details and structure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {snapshot.metadata?.techStack && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Tech Stack
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(snapshot.metadata.techStack).map(([key, value]: [string, any]) => (
                      <Badge key={key} variant="secondary">
                        {key}: {typeof value === 'object' ? JSON.stringify(value) : value}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <FileCode className="h-4 w-4" />
                  Snapshot Details
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Size</p>
                    <p className="font-medium">{(snapshot.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <p className="font-medium capitalize">{snapshot.status}</p>
                  </div>
                  {snapshot.metadata?.environment && (
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Environment</p>
                      <p className="font-medium">{JSON.stringify(snapshot.metadata.environment, null, 2)}</p>
                    </div>
                  )}
                </div>
              </div>

              {snapshot.metadata?.fileTree && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <FileCode className="h-4 w-4" />
                      Codebase Statistics
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Total Files</p>
                        <p className="text-2xl font-bold">{snapshot.metadata.fileTree.length}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">TypeScript</p>
                        <p className="text-2xl font-bold">
                          {snapshot.metadata.fileTree.filter((f: string) => f.endsWith('.ts') || f.endsWith('.tsx')).length}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">JavaScript</p>
                        <p className="text-2xl font-bold">
                          {snapshot.metadata.fileTree.filter((f: string) => f.endsWith('.js') || f.endsWith('.jsx')).length}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Docs</p>
                        <p className="text-2xl font-bold">
                          {snapshot.metadata.fileTree.filter((f: string) => f.endsWith('.md')).length}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <Separator />

              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <FileCode className="h-4 w-4" />
                  Snapshot Details
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Size</p>
                    <p className="font-medium">{(snapshot.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <p className="font-medium capitalize">{snapshot.status}</p>
                  </div>
                  {snapshot.metadata?.environment && (
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Environment</p>
                      <p className="font-medium">{JSON.stringify(snapshot.metadata.environment, null, 2)}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Completeness Assessment */}
          {aiReport && (
            <Card>
              <CardHeader>
                <CardTitle>Project Completeness</CardTitle>
                <CardDescription>AI-powered assessment of project maturity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center">
                    <Activity className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                    <p className="text-2xl font-bold">{aiReport.creativityScore.toFixed(0)}%</p>
                    <p className="text-xs text-muted-foreground">Creativity</p>
                  </div>
                  <div className="text-center">
                    <Lightbulb className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
                    <p className="text-2xl font-bold">{aiReport.innovationScore.toFixed(0)}%</p>
                    <p className="text-xs text-muted-foreground">Innovation</p>
                  </div>
                  <div className="text-center">
                    <Code className="h-6 w-6 mx-auto mb-2 text-green-500" />
                    <p className="text-2xl font-bold">{aiReport.codeQualityScore.toFixed(0)}%</p>
                    <p className="text-xs text-muted-foreground">Code Quality</p>
                  </div>
                  <div className="text-center">
                    <Target className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                    <p className="text-2xl font-bold">{aiReport.architectureScore.toFixed(0)}%</p>
                    <p className="text-xs text-muted-foreground">Architecture</p>
                  </div>
                  <div className="text-center">
                    <BookOpen className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                    <p className="text-2xl font-bold">{aiReport.documentationScore.toFixed(0)}%</p>
                    <p className="text-xs text-muted-foreground">Documentation</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Code Analysis Tab */}
        <TabsContent value="analysis" className="space-y-4">
          {staticMetrics && (
            <>
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Lint Score</CardTitle>
                    <Code className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{staticMetrics.lintScore.toFixed(1)}</div>
                    <Progress value={staticMetrics.lintScore} className="mt-2" />
                    <p className="text-xs text-muted-foreground mt-2">
                      {staticMetrics.lintIssues?.length || 0} issues found
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Complexity</CardTitle>
                    <Zap className="h-4 w-4 text-yellow-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{staticMetrics.complexityScore.toFixed(1)}</div>
                    <Progress value={staticMetrics.complexityScore} className="mt-2" />
                    {staticMetrics.complexityMetrics && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Cyclomatic: {staticMetrics.complexityMetrics.cyclomaticComplexity}
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Security</CardTitle>
                    <Shield className="h-4 w-4 text-red-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{staticMetrics.securityScore.toFixed(1)}</div>
                    <Progress value={staticMetrics.securityScore} className="mt-2" />
                    <p className="text-xs text-muted-foreground mt-2">
                      {staticMetrics.securityIssues?.length || 0} vulnerabilities
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Test Coverage</CardTitle>
                    <TestTube2 className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{staticMetrics.testCoverageScore.toFixed(1)}</div>
                    <Progress value={staticMetrics.testCoverageScore} className="mt-2" />
                    {staticMetrics.testCoverage && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {staticMetrics.testCoverage.percentage}% covered
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {staticMetrics.complexityMetrics && (
                <Card>
                  <CardHeader>
                    <CardTitle>Complexity Metrics</CardTitle>
                    <CardDescription>Detailed code complexity analysis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Cyclomatic Complexity</p>
                        <p className="text-2xl font-bold">{staticMetrics.complexityMetrics.cyclomaticComplexity}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Cognitive Complexity</p>
                        <p className="text-2xl font-bold">{staticMetrics.complexityMetrics.cognitiveComplexity}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Maintainability Index</p>
                        <p className="text-2xl font-bold">{staticMetrics.complexityMetrics.maintainabilityIndex}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Lines of Code</p>
                        <p className="text-2xl font-bold">{staticMetrics.complexityMetrics.linesOfCode}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Logical Lines</p>
                        <p className="text-2xl font-bold">{staticMetrics.complexityMetrics.logicalLinesOfCode}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Comment %</p>
                        <p className="text-2xl font-bold">{staticMetrics.complexityMetrics.commentPercentage}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="ai" className="space-y-4">
          {aiReport?.feedback && aiReport.feedback.length > 0 ? (
            aiReport.feedback.map((item: any, idx: number) => (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {item.category}
                    <Badge variant={item.score >= 70 ? 'default' : item.score >= 40 ? 'secondary' : 'destructive'}>
                      {item.score}/100
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {item.positives && item.positives.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-green-600 flex items-center gap-2 mb-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Strengths
                      </h4>
                      <ul className="space-y-1">
                        {item.positives.map((pos: string, i: number) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <TrendingUp className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                            <span>{pos}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {item.negatives && item.negatives.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-red-600 flex items-center gap-2 mb-2">
                        <XCircle className="h-4 w-4" />
                        Areas for Improvement
                      </h4>
                      <ul className="space-y-1">
                        {item.negatives.map((neg: string, i: number) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <TrendingDown className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                            <span>{neg}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {item.suggestions && item.suggestions.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-blue-600 flex items-center gap-2 mb-2">
                        <Lightbulb className="h-4 w-4" />
                        Suggestions
                      </h4>
                      <ul className="space-y-1">
                        {item.suggestions.map((sug: string, i: number) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <span className="text-blue-500 mt-0.5 shrink-0">→</span>
                            <span>{sug}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No AI insights available yet
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Issues Tab */}
        <TabsContent value="issues" className="space-y-4">
          {staticMetrics ? (
            <>
              {/* Lint Issues */}
              {staticMetrics.lintIssues && staticMetrics.lintIssues.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="h-5 w-5 text-blue-500" />
                      Lint Issues ({staticMetrics.lintIssues.length})
                    </CardTitle>
                    <CardDescription>Code style and quality issues</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {staticMetrics.lintIssues.slice(0, 50).map((issue: any, idx: number) => (
                        <div key={idx} className="p-3 rounded-lg border bg-card">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <p className="font-mono text-sm">{issue.file}:{issue.line}:{issue.column}</p>
                              <p className="text-sm text-muted-foreground mt-1">{issue.message}</p>
                              <p className="text-xs text-muted-foreground mt-1">Rule: {issue.rule}</p>
                            </div>
                            <Badge variant={issue.severity === 'error' ? 'destructive' : 'secondary'}>
                              {issue.severity}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      {staticMetrics.lintIssues.length > 50 && (
                        <p className="text-sm text-muted-foreground text-center py-2">
                          ... and {staticMetrics.lintIssues.length - 50} more issues
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Security Issues */}
              {staticMetrics.securityIssues && staticMetrics.securityIssues.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-red-500" />
                      Security Vulnerabilities ({staticMetrics.securityIssues.length})
                    </CardTitle>
                    <CardDescription>Potential security risks detected</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {staticMetrics.securityIssues.map((issue: any, idx: number) => (
                        <div key={idx} className="p-3 rounded-lg border bg-card">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <p className="font-mono text-sm">{issue.file}:{issue.line}</p>
                              <p className="text-sm text-muted-foreground mt-1">{issue.message}</p>
                              <div className="flex gap-2 mt-2">
                                <Badge variant="outline">{issue.category}</Badge>
                                {issue.cwe && <Badge variant="outline">CWE-{issue.cwe}</Badge>}
                              </div>
                            </div>
                            <Badge 
                              variant={
                                issue.severity === 'critical' || issue.severity === 'high' 
                                  ? 'destructive' 
                                  : 'secondary'
                              }
                            >
                              {issue.severity}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {(!staticMetrics.lintIssues || staticMetrics.lintIssues.length === 0) && 
               (!staticMetrics.securityIssues || staticMetrics.securityIssues.length === 0) && (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
                    <p>No critical issues found!</p>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No analysis data available
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="suggestions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                What Could Have Been Done
              </CardTitle>
              <CardDescription>AI-powered recommendations for improvement</CardDescription>
            </CardHeader>
            <CardContent>
              {aiReport?.feedback && aiReport.feedback.length > 0 ? (
                <div className="space-y-6">
                  {aiReport.feedback.map((item: any, idx: number) => (
                    item.suggestions && item.suggestions.length > 0 && (
                      <div key={idx}>
                        <h4 className="font-semibold mb-3">{item.category}</h4>
                        <div className="space-y-2">
                          {item.suggestions.map((suggestion: string, i: number) => (
                            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                              <Target className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                              <p className="text-sm">{suggestion}</p>
                            </div>
                          ))}
                        </div>
                        {idx < aiReport.feedback.length - 1 && <Separator className="mt-4" />}
                      </div>
                    )
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No recommendations available yet
                </p>
              )}
            </CardContent>
          </Card>

          {aiReport && (
            <Card>
              <CardHeader>
                <CardTitle>AI Model Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Model</p>
                    <p className="font-medium">{aiReport.model}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tokens Used</p>
                    <p className="font-medium">{aiReport.tokensUsed.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
