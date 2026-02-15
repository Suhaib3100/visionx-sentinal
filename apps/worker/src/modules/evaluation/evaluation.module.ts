import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Snapshot } from '../../entities/snapshot.entity';
import { StaticMetrics } from '../../entities/static-metrics.entity';
import { AIReport } from '../../entities/ai-report.entity';
import { FinalScore } from '../../entities/final-score.entity';
import { EvaluationOrchestratorService } from './evaluation-orchestrator.service';
import { LintAnalyzerService } from './analyzers/lint-analyzer.service';
import { ComplexityAnalyzerService } from './analyzers/complexity-analyzer.service';
import { SecurityScannerService } from './analyzers/security-scanner.service';
import { TestCoverageAnalyzerService } from './analyzers/test-coverage-analyzer.service';
import { AIModule } from '../ai/ai.module';
import { LeaderboardModule } from '../leaderboard/leaderboard.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Snapshot, StaticMetrics, AIReport, FinalScore]),
    AIModule,
    LeaderboardModule,
  ],
  providers: [
    EvaluationOrchestratorService,
    LintAnalyzerService,
    ComplexityAnalyzerService,
    SecurityScannerService,
    TestCoverageAnalyzerService,
  ],
  exports: [EvaluationOrchestratorService],
})
export class EvaluationModule {}
