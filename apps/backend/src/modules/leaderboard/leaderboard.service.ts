import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FinalScore } from '../evaluations/entities/final-score.entity';
import { Team } from '../teams/entities/team.entity';

export interface LeaderboardEntry {
  teamId: string;
  teamName: string;
  score: number;
  rank: number;
  snapshotCount: number;
  lastSubmission: Date;
}

export interface LeaderboardStats {
  totalTeams: number;
  totalSnapshots: number;
  averageScore: number;
  topScore: number;
  lastUpdated: Date;
}

export interface TeamRank {
  teamId: string;
  teamName: string;
  rank: number;
  score: number;
  totalTeams: number;
}

export interface ScoreHistory {
  snapshotId: string;
  score: number;
  timestamp: Date;
  rank: number;
}

@Injectable()
export class LeaderboardService {
  constructor(
    @InjectRepository(FinalScore)
    private readonly finalScoreRepository: Repository<FinalScore>,
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
  ) {}

  async getTopTeams(limit: number = 100): Promise<LeaderboardEntry[]> {
    // Get best (max score, latest snapshot) for each team
    const topScores = await this.finalScoreRepository
      .createQueryBuilder('fs')
      .leftJoinAndSelect('fs.team', 'team')
      .leftJoinAndSelect('fs.snapshot', 'snapshot')
      .where((qb) => {
        // Subquery to get the ID of the best score record for each team
        // (highest score, and if tied, most recent)
        const subQuery = qb
          .subQuery()
          .select('fs3.id')
          .from(FinalScore, 'fs3')
          .where('fs3.team_id = fs.team_id')
          .orderBy('fs3.total_score', 'DESC')
          .addOrderBy('fs3.created_at', 'DESC')
          .limit(1)
          .getQuery();
        return `fs.id = ${subQuery}`;
      })
      .orderBy('fs.total_score', 'DESC')
      .addOrderBy('fs.created_at', 'DESC')
      .limit(limit)
      .getMany();

    // Get snapshot count for each team
    const snapshotCounts = await this.finalScoreRepository
      .createQueryBuilder('fs')
      .select('fs.team_id', 'teamId')
      .addSelect('COUNT(*)', 'count')
      .groupBy('fs.team_id')
      .getRawMany();

    const countMap = new Map(
      snapshotCounts.map((sc) => [sc.teamId, parseInt(sc.count, 10)])
    );

    return topScores.map((score, index) => ({
      teamId: score.teamId,
      teamName: score.team?.name || 'Unknown Team',
      score: parseFloat(score.totalScore.toString()),
      rank: index + 1,
      snapshotCount: countMap.get(score.teamId) || 0,
      lastSubmission: score.createdAt,
    }));
  }

  async getLeaderboardStats(): Promise<LeaderboardStats> {
    const [totalTeams, totalSnapshots, avgScoreResult, topScoreResult] = await Promise.all([
      this.teamRepository.count(),
      this.finalScoreRepository.count(),
      this.finalScoreRepository
        .createQueryBuilder('fs')
        .select('AVG(fs.total_score)', 'avg')
        .getRawOne(),
      this.finalScoreRepository
        .createQueryBuilder('fs')
        .select('MAX(fs.total_score)', 'max')
        .getRawOne(),
    ]);

    return {
      totalTeams,
      totalSnapshots,
      averageScore: parseFloat(avgScoreResult?.avg || '0'),
      topScore: parseFloat(topScoreResult?.max || '0'),
      lastUpdated: new Date(),
    };
  }

  async getTeamRank(teamId: string): Promise<TeamRank> {
    const team = await this.teamRepository.findOne({
      where: { id: teamId },
    });

    if (!team) {
      throw new Error('Team not found');
    }

    // Get team's best score
    const bestScore = await this.finalScoreRepository.findOne({
      where: { teamId },
      order: { totalScore: 'DESC' },
    });

    if (!bestScore) {
      return {
        teamId,
        teamName: team.name,
        rank: 0,
        score: 0,
        totalTeams: await this.teamRepository.count(),
      };
    }

    // Calculate rank
    const higherScoresCount = await this.finalScoreRepository
      .createQueryBuilder('fs')
      .where((qb) => {
        const subQuery = qb
          .subQuery()
          .select('MAX(fs2.total_score)', 'maxScore')
          .from(FinalScore, 'fs2')
          .where('fs2.team_id = fs.team_id')
          .getQuery();
        return `fs.total_score = ${subQuery}`;
      })
      .andWhere('fs.total_score > :score', { score: bestScore.totalScore })
      .getCount();

    return {
      teamId,
      teamName: team.name,
      rank: higherScoresCount + 1,
      score: parseFloat(bestScore.totalScore.toString()),
      totalTeams: await this.teamRepository.count(),
    };
  }

  async getTeamScoreHistory(teamId: string, limit: number = 50): Promise<ScoreHistory[]> {
    const scores = await this.finalScoreRepository.find({
      where: { teamId },
      order: { createdAt: 'DESC' },
      take: limit,
    });

    return scores.map((score) => ({
      snapshotId: score.snapshotId,
      score: parseFloat(score.totalScore.toString()),
      timestamp: score.createdAt,
      rank: score.rank || 0,
    }));
  }
}
