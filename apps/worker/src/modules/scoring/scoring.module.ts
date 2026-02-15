import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinalScore } from '../../entities/final-score.entity';
import { Team } from '../../entities/team.entity';
import { ScoringEngineService } from './scoring-engine.service';

@Module({
  imports: [TypeOrmModule.forFeature([FinalScore, Team])],
  providers: [ScoringEngineService],
  exports: [ScoringEngineService],
})
export class ScoringModule {}
