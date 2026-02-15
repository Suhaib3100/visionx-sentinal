 import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EvaluationsService } from './evaluations.service';
import { EvaluationsController } from './evaluations.controller';
import { Snapshot } from '../snapshots/entities/snapshot.entity';
import { StaticMetrics } from './entities/static-metrics.entity';
import { AIReport } from './entities/ai-report.entity';
import { FinalScore } from './entities/final-score.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Snapshot, StaticMetrics, AIReport, FinalScore])],
  controllers: [EvaluationsController],
  providers: [EvaluationsService],
  exports: [EvaluationsService],
})
export class EvaluationsModule {}
