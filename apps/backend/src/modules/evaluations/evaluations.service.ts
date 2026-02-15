import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Snapshot, SnapshotStatus } from '../snapshots/entities/snapshot.entity';
import { StaticMetrics } from './entities/static-metrics.entity';
import { FinalScore } from './entities/final-score.entity';
import { AIReport } from './entities/ai-report.entity';

export interface EvaluationSummary {
  id: string;
  snapshotNumber: number;
  teamName: string;
  projectTitle: string;
  status: string;
  finalScore: number | null;
  createdAt: Date;
  metrics: {
    lintScore: number;
    complexityScore: number;
    securityScore: number;
    testCoverageScore: number;
    totalScore: number;
  } | null;
}

export interface SystemStats {
  totalSnapshots: number;
  completedEvaluations: number;
  pendingEvaluations: number;
  failedEvaluations: number;
  evaluationsToday: number;
  evaluationsThisWeek: number;
  averageScore: number | null;
  topScore: number | null;
}

export interface EvaluationDetail {
  snapshot: {
    id: string;
    snapshotNumber: number;
    teamName: string;
    projectTitle: string;
    status: string;
    createdAt: Date;
    s3Key: string;
    size: number;
    metadata: any;
  };
  scores: {
    final: number | null;
    static: number | null;
    ai: number | null;
    rank: number | null;
  };
  staticMetrics: {
    lintScore: number;
    complexityScore: number;
    securityScore: number;
    testCoverageScore: number;
    totalScore: number;
    lintIssues: any[];
    complexityMetrics: any;
    securityIssues: any[];
    testCoverage: any;
  } | null;
  aiReport: {
    creativityScore: number;
    innovationScore: number;
    codeQualityScore: number;
    architectureScore: number;
    documentationScore: number;
    overallScore: number;
    summary: string;
    feedback: Array<{
      category: string;
      score: number;
      positives: string[];
      negatives: string[];
      suggestions: string[];
    }>;
    model: string;
    tokensUsed: number;
  } | null;
}

@Injectable()
export class EvaluationsService {
  constructor(
    @InjectRepository(Snapshot)
    private snapshotRepository: Repository<Snapshot>,
    @InjectRepository(StaticMetrics)
    private metricsRepository: Repository<StaticMetrics>,
    @InjectRepository(FinalScore)
    private finalScoreRepository: Repository<FinalScore>,
    @InjectRepository(AIReport)
    private aiReportRepository: Repository<AIReport>,
  ) {}

  async getRecentEvaluations(limit = 20): Promise<EvaluationSummary[]> {
    const snapshots = await this.snapshotRepository.find({
      relations: ['team', 'project', 'staticMetrics', 'finalScore'],
      order: { createdAt: 'DESC' },
      take: limit,
    });

    return snapshots.map(snapshot => ({
      id: snapshot.id,
      snapshotNumber: snapshot.snapshotNumber,
      teamName: snapshot.team?.name || 'Unknown Team',
      projectTitle: snapshot.project?.title || 'Unknown Project',
      status: snapshot.status,
      finalScore: snapshot.finalScore ? parseFloat(snapshot.finalScore.totalScore.toString()) : null,
      createdAt: snapshot.createdAt,
      metrics: snapshot.staticMetrics ? {
        lintScore: parseFloat(snapshot.staticMetrics.lintScore.toString()),
        complexityScore: parseFloat(snapshot.staticMetrics.complexityScore.toString()),
        securityScore: parseFloat(snapshot.staticMetrics.securityScore.toString()),
        testCoverageScore: parseFloat((snapshot.staticMetrics.codeQualityScore || 0).toString()),
        totalScore: parseFloat(snapshot.staticMetrics.totalScore.toString()),
      } : null,
    }));
  }

  async getPendingEvaluations(): Promise<EvaluationSummary[]> {
    const snapshots = await this.snapshotRepository.find({
      where: { status: SnapshotStatus.PENDING },
      relations: ['team', 'project'],
      order: { createdAt: 'ASC' },
    });

    return snapshots.map(snapshot => ({
      id: snapshot.id,
      snapshotNumber: snapshot.snapshotNumber,
      teamName: snapshot.team?.name || 'Unknown Team',
      projectTitle: snapshot.project?.title || 'Unknown Project',
      status: snapshot.status,
      finalScore: null,
      createdAt: snapshot.createdAt,
      metrics: null,
    }));
  }

  async getSystemStats(): Promise<SystemStats> {
    const totalSnapshots = await this.snapshotRepository.count();
    const completedEvaluations = await this.snapshotRepository.count({
      where: { status: SnapshotStatus.COMPLETED },
    });
    const pendingEvaluations = await this.snapshotRepository.count({
      where: { status: SnapshotStatus.PENDING },
    });
    const failedEvaluations = await this.snapshotRepository.count({
      where: { status: SnapshotStatus.FAILED },
    });

    // Today's evaluations (last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const evaluationsToday = await this.snapshotRepository.count({
      where: {
        createdAt: new Date(yesterday.getTime()) as any, // TypeORM will handle this correctly
      },
    });

    // This week's evaluations (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const evaluationsThisWeek = await this.snapshotRepository.count({
      where: {
        createdAt: new Date(oneWeekAgo.getTime()) as any,
      },
    });

    // Average and top scores from final scores
    const scoresWithStats = await this.finalScoreRepository
      .createQueryBuilder('score')
      .select('AVG(score.totalScore)', 'avgScore')
      .addSelect('MAX(score.totalScore)', 'maxScore')
      .getRawOne();

    return {
      totalSnapshots,
      completedEvaluations,
      pendingEvaluations,
      failedEvaluations,
      evaluationsToday,
      evaluationsThisWeek,
      averageScore: scoresWithStats?.avgScore ? parseFloat(scoresWithStats.avgScore) : null,
      topScore: scoresWithStats?.maxScore ? parseFloat(scoresWithStats.maxScore) : null,
    };
  }

  async getEvaluationDetails(snapshotId: string): Promise<EvaluationDetail> {
    const snapshot = await this.snapshotRepository.findOne({
      where: { id: snapshotId },
      relations: ['team', 'project', 'staticMetrics', 'finalScore'],
    });

    if (!snapshot) {
      throw new NotFoundException(`Evaluation with ID ${snapshotId} not found`);
    }

    // Fetch AI report separately
    const aiReport = await this.aiReportRepository.findOne({
      where: { snapshotId },
    });

    return {
      snapshot: {
        id: snapshot.id,
        snapshotNumber: snapshot.snapshotNumber,
        teamName: snapshot.team?.name || 'Unknown Team',
        projectTitle: snapshot.project?.title || 'Unknown Project',
        status: snapshot.status,
        createdAt: snapshot.createdAt,
        s3Key: snapshot.s3Key,
        size: parseInt(snapshot.size.toString()),
        metadata: snapshot.metadata,
      },
      scores: {
        final: snapshot.finalScore ? parseFloat(snapshot.finalScore.totalScore.toString()) : null,
        static: snapshot.finalScore ? parseFloat(snapshot.finalScore.staticScore.toString()) : null,
        ai: snapshot.finalScore ? parseFloat(snapshot.finalScore.aiScore.toString()) : null,
        rank: snapshot.finalScore?.rank || null,
      },
      staticMetrics: snapshot.staticMetrics ? {
        lintScore: parseFloat(snapshot.staticMetrics.lintScore.toString()),
        complexityScore: parseFloat(snapshot.staticMetrics.complexityScore.toString()),
        securityScore: parseFloat(snapshot.staticMetrics.securityScore.toString()),
        testCoverageScore: parseFloat((snapshot.staticMetrics.codeQualityScore || 0).toString()),
        totalScore: parseFloat(snapshot.staticMetrics.totalScore.toString()),
        lintIssues: snapshot.staticMetrics.lintIssues || [],
        complexityMetrics: snapshot.staticMetrics.complexityMetrics || {},
        securityIssues: snapshot.staticMetrics.securityIssues || [],
        testCoverage: snapshot.staticMetrics.testCoverage || null,
      } : null,
      aiReport: aiReport ? {
        creativityScore: parseFloat(aiReport.creativityScore.toString()),
        innovationScore: parseFloat(aiReport.innovationScore.toString()),
        codeQualityScore: parseFloat(aiReport.codeQualityScore.toString()),
        architectureScore: parseFloat(aiReport.architectureScore.toString()),
        documentationScore: parseFloat(aiReport.documentationScore.toString()),
        overallScore: parseFloat(aiReport.overallScore.toString()),
        summary: aiReport.summary,
        feedback: aiReport.feedback,
        model: aiReport.model,
        tokensUsed: aiReport.tokensUsed,
      } : null,
    };
  }
}
