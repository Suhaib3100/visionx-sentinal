import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Snapshot, SnapshotStatus } from '../snapshots/entities/snapshot.entity';
import { StaticMetrics } from './entities/static-metrics.entity';

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

@Injectable()
export class EvaluationsService {
  constructor(
    @InjectRepository(Snapshot)
    private snapshotRepository: Repository<Snapshot>,
    @InjectRepository(StaticMetrics)
    private metricsRepository: Repository<StaticMetrics>,
  ) {}

  async getRecentEvaluations(limit = 20): Promise<EvaluationSummary[]> {
    const snapshots = await this.snapshotRepository.find({
      relations: ['team', 'project', 'staticMetrics'],
      order: { createdAt: 'DESC' },
      take: limit,
    });

    return snapshots.map(snapshot => ({
      id: snapshot.id,
      snapshotNumber: snapshot.snapshotNumber,
      teamName: snapshot.team?.name || 'Unknown Team',
      projectTitle: snapshot.project?.title || 'Unknown Project',
      status: snapshot.status,
      finalScore: snapshot.staticMetrics?.totalScore || null,
      createdAt: snapshot.createdAt,
      metrics: snapshot.staticMetrics ? {
        lintScore: snapshot.staticMetrics.lintScore,
        complexityScore: snapshot.staticMetrics.complexityScore,
        securityScore: snapshot.staticMetrics.securityScore,
        testCoverageScore: snapshot.staticMetrics.codeQualityScore || 0,
        totalScore: snapshot.staticMetrics.totalScore,
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

    // Average and top scores
    const metricsWithScores = await this.metricsRepository
      .createQueryBuilder('metrics')
      .select('AVG(metrics.totalScore)', 'avgScore')
      .addSelect('MAX(metrics.totalScore)', 'maxScore')
      .getRawOne();

    return {
      totalSnapshots,
      completedEvaluations,
      pendingEvaluations,
      failedEvaluations,
      evaluationsToday,
      evaluationsThisWeek,
      averageScore: metricsWithScores?.avgScore ? parseFloat(metricsWithScores.avgScore) : null,
      topScore: metricsWithScores?.maxScore ? parseFloat(metricsWithScores.maxScore) : null,
    };
  }
}
