import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FinalScore, ScoreBreakdown } from '../../entities/final-score.entity';
import { Team } from '../../entities/team.entity';

export interface ScoreUpdate {
  teamId: string;
  snapshotId: string;
  staticScore: number;
  aiScore: number;
  breakdown: ScoreBreakdown;
}

@Injectable()
export class ScoringEngineService {
  private readonly logger = new Logger(ScoringEngineService.name);
  
  // Score weights
  private readonly STATIC_WEIGHT = 0.6;
  private readonly AI_WEIGHT = 0.4;

  constructor(
    @InjectRepository(FinalScore)
    private finalScoreRepository: Repository<FinalScore>,
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
  ) {}

  /**
   * Calculate and save final score for a team
   */
  async calculateFinalScore(scoreUpdate: ScoreUpdate): Promise<FinalScore> {
    const { teamId, snapshotId, staticScore, aiScore, breakdown } = scoreUpdate;

    const totalScore = this.calculateWeightedScore(staticScore, aiScore);

    this.logger.log(
      `Calculating final score for team ${teamId}: Static ${staticScore}, AI ${aiScore} = Total ${totalScore}`
    );

    const finalScore = this.finalScoreRepository.create({
      teamId,
      snapshotId,
      staticScore,
      aiScore,
      totalScore,
      rank: 0, // Will be updated by updateRankings()
      weight: {
        static: this.STATIC_WEIGHT,
        ai: this.AI_WEIGHT,
      },
      breakdown,
    });

    await this.finalScoreRepository.save(finalScore);

    // Update team's current score
    await this.teamRepository.update(
      { id: teamId },
      { currentScore: totalScore }
    );

    this.logger.log(`Final score saved: ${totalScore.toFixed(2)} for team ${teamId}`);

    return finalScore;
  }

  /**
   * Calculate weighted score from static and AI components
   */
  private calculateWeightedScore(staticScore: number, aiScore: number): number {
    return staticScore * this.STATIC_WEIGHT + aiScore * this.AI_WEIGHT;
  }

  /**
   * Update rankings for all teams based on their current scores
   */
  async updateRankings(): Promise<void> {
    this.logger.log('Updating team rankings...');

    // Get all teams with their latest scores
    const teams = await this.teamRepository
      .createQueryBuilder('team')
      .where('team.isDisqualified = :disqualified', { disqualified: false })
      .orderBy('team.currentScore', 'DESC')
      .getMany();

    // Update ranks
    for (let i = 0; i < teams.length; i++) {
      const team = teams[i];
      const newRank = i + 1;

      if (team.rank !== newRank) {
        await this.teamRepository.update({ id: team.id }, { rank: newRank });
        this.logger.log(`Updated rank for ${team.name}: ${newRank}`);
      }
    }

    // Also update ranks in final_scores table
    const scores = await this.finalScoreRepository
      .createQueryBuilder('score')
      .leftJoinAndSelect('score.team', 'team')
      .where('team.isDisqualified = :disqualified', { disqualified: false })
      .orderBy('score.totalScore', 'DESC')
      .getMany();

    for (let i = 0; i < scores.length; i++) {
      const score = scores[i];
      const newRank = i + 1;

      if (score.rank !== newRank) {
        await this.finalScoreRepository.update({ id: score.id }, { rank: newRank });
      }
    }

    this.logger.log(`Rankings updated for ${teams.length} teams`);
  }

  /**
   * Get top N teams by score
   */
  async getTopTeams(limit: number = 10): Promise<Team[]> {
    return this.teamRepository
      .createQueryBuilder('team')
      .where('team.isDisqualified = :disqualified', { disqualified: false })
      .orderBy('team.currentScore', 'DESC')
      .take(limit)
      .getMany();
  }

  /**
   * Get team's score history
   */
  async getTeamScoreHistory(teamId: string): Promise<FinalScore[]> {
    return this.finalScoreRepository.find({
      where: { teamId },
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Get team's current score and rank
   */
  async getTeamScore(teamId: string): Promise<{
    score: number;
    rank: number;
    lastEvaluation: Date | null;
  }> {
    const team = await this.teamRepository.findOne({ where: { id: teamId } });

    if (!team) {
      return { score: 0, rank: 0, lastEvaluation: null };
    }

    return {
      score: Number(team.currentScore),
      rank: team.rank,
      lastEvaluation: team.lastSnapshotAt,
    };
  }

  /**
   * Disqualify a team (e.g., for cheating)
   */
  async disqualifyTeam(
    teamId: string,
    reason: string
  ): Promise<void> {
    this.logger.warn(`Disqualifying team ${teamId}: ${reason}`);

    await this.teamRepository.update(
      { id: teamId },
      {
        isDisqualified: true,
        disqualificationReason: reason,
        rank: 0,
      }
    );

    // Recalculate rankings
    await this.updateRankings();
  }

  /**
   * Get score breakdown for a team's latest submission
   */
  async getScoreBreakdown(teamId: string): Promise<ScoreBreakdown | null> {
    const latestScore = await this.finalScoreRepository.findOne({
      where: { teamId },
      order: { createdAt: 'DESC' },
    });

    return latestScore?.breakdown || null;
  }

  /**
   * Get average scores across all teams (for comparison)
   */
  async getAverageScores(): Promise<{
    avgStatic: number;
    avgAI: number;
    avgTotal: number;
  }> {
    const result = await this.finalScoreRepository
      .createQueryBuilder('score')
      .select('AVG(score.staticScore)', 'avgStatic')
      .addSelect('AVG(score.aiScore)', 'avgAI')
      .addSelect('AVG(score.totalScore)', 'avgTotal')
      .getRawOne();

    return {
      avgStatic: parseFloat(result.avgStatic) || 0,
      avgAI: parseFloat(result.avgAI) || 0,
      avgTotal: parseFloat(result.avgTotal) || 0,
    };
  }
}
