import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Redis from 'ioredis';
import { Team } from '../../entities/team.entity';
import { FinalScore } from '../../entities/final-score.entity';

export interface Leadership {
  teamId: string;
  teamName: string;
  score: number;
  rank: number;
}

export interface TeamStats {
  teamId: string;
  teamName: string;
  score: number;
  rank: number;
  totalSnapshots: number;
  lastUpdate: Date;
  scoreHistory: number[];
}

@Injectable()
export class LeaderboardService implements OnModuleInit {
  private readonly logger = new Logger(LeaderboardService.name);
  private redis: Redis;
  
  // Redis keys
  private readonly LEADERBOARD_KEY = 'leaderboard:global';
  private readonly TEAM_STATS_PREFIX = 'team:stats:';
  private readonly SCORE_HISTORY_PREFIX = 'team:history:';

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
    @InjectRepository(FinalScore)
    private finalScoreRepository: Repository<FinalScore>,
  ) {}

  async onModuleInit() {
    // Initialize Redis connection
    const redisConfig = this.configService.get('redis');
    this.redis = new Redis({
      host: redisConfig.host,
      port: redisConfig.port,
      password: redisConfig.password,
      db: redisConfig.db,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    this.redis.on('connect', () => {
      this.logger.log('Redis connected for leaderboard');
    });

    this.redis.on('error', (error) => {
      this.logger.error(`Redis error: ${error.message}`);
    });

    // Initialize leaderboard from database on startup
    await this.initializeLeaderboard();
  }

  /**
   * Initialize leaderboard from database
   */
  private async initializeLeaderboard(): Promise<void> {
    this.logger.log('Initializing leaderboard from database...');

    const teams = await this.teamRepository.find({
      where: { isDisqualified: false },
      order: { currentScore: 'DESC' },
    });

    // Clear existing leaderboard
    await this.redis.del(this.LEADERBOARD_KEY);

    // Add teams to sorted set
    const pipeline = this.redis.pipeline();
    for (const team of teams) {
      pipeline.zadd(
        this.LEADERBOARD_KEY,
        Number(team.currentScore),
        team.id
      );
    }
    await pipeline.exec();

    this.logger.log(`Leaderboard initialized with ${teams.length} teams`);
  }

  /**
   * Update a team's score in the leaderboard
   */
  async updateTeamScore(
    teamId: string,
    score: number,
    snapshotNumber: number
  ): Promise<number> {
    this.logger.log(`Updating leaderboard: Team ${teamId}, Score ${score}`);

    // Update score in Redis sorted set
    await this.redis.zadd(this.LEADERBOARD_KEY, score, teamId);

    // Get team's new rank (0-based to 1-based)
    const rank = await this.redis.zrevrank(this.LEADERBOARD_KEY, teamId);
    const newRank = rank !== null ? rank + 1 : 0;

    // Update team stats cache
    const team = await this.teamRepository.findOne({ where: { id: teamId } });
    if (team) {
      const stats: TeamStats = {
        teamId,
        teamName: team.name,
        score,
        rank: newRank,
        totalSnapshots: snapshotNumber,
        lastUpdate: new Date(),
        scoreHistory: await this.getScoreHistory(teamId),
      };

      await this.redis.setex(
        `${this.TEAM_STATS_PREFIX}${teamId}`,
        3600, // Cache for 1 hour
        JSON.stringify(stats)
      );
    }

    // Add to score history
    await this.redis.zadd(
      `${this.SCORE_HISTORY_PREFIX}${teamId}`,
      Date.now(),
      score.toString()
    );

    // Keep only last 50 scores
    await this.redis.zremrangebyrank(
      `${this.SCORE_HISTORY_PREFIX}${teamId}`,
      0,
      -51
    );

    return newRank;
  }

  /**
   * Get top N teams from leaderboard
   */
  async getTopTeams(limit: number = 10): Promise<LeaderboardEntry[]> {
    const teamIds = await this.redis.zrevrange(
      this.LEADERBOARD_KEY,
      0,
      limit - 1,
      'WITHSCORES'
    );

    const leaderboard: LeaderboardEntry[] = [];

    for (let i = 0; i < teamIds.length; i += 2) {
      const teamId = teamIds[i];
      const score = parseFloat(teamIds[i + 1]);
      const rank = i / 2 + 1;

      const team = await this.teamRepository.findOne({ where: { id: teamId } });

      if (team) {
        leaderboard.push({
          teamId,
          teamName: team.name,
          score,
          rank,
        });
      }
    }

    return leaderboard;
  }

  /**
   * Get team's rank and score
   */
  async getTeamRank(teamId: string): Promise<{ rank: number; score: number }> {
    const score = await this.redis.zscore(this.LEADERBOARD_KEY, teamId);
    const rank = await this.redis.zrevrank(this.LEADERBOARD_KEY, teamId);

    return {
      rank: rank !== null ? rank + 1 : 0,
      score: score !== null ? parseFloat(score) : 0,
    };
  }

  /**
   * Get team's score history
   */
  async getScoreHistory(teamId: string): Promise<number[]> {
    const history = await this.redis.zrange(
      `${this.SCORE_HISTORY_PREFIX}${teamId}`,
      0,
      -1
    );

    return history.map(score => parseFloat(score));
  }

  /**
   * Get teams around a specific rank (for context)
   */
  async getTeamsAroundRank(
    rank: number,
    context: number = 3
  ): Promise<LeaderboardEntry[]> {
    const start = Math.max(0, rank - context - 1);
    const end = rank + context - 1;

    const teamIds = await this.redis.zrevrange(
      this.LEADERBOARD_KEY,
      start,
      end,
      'WITHSCORES'
    );

    const leaderboard: LeaderboardEntry[] = [];

    for (let i = 0; i < teamIds.length; i += 2) {
      const teamId = teamIds[i];
      const score = parseFloat(teamIds[i + 1]);
      const teamRank = start + i / 2 + 1;

      const team = await this.teamRepository.findOne({ where: { id: teamId } });

      if (team) {
        leaderboard.push({
          teamId,
          teamName: team.name,
          score,
          rank: teamRank,
        });
      }
    }

    return leaderboard;
  }

  /**
   * Get total number of teams on leaderboard
   */
  async getTotalTeams(): Promise<number> {
    return this.redis.zcard(this.LEADERBOARD_KEY);
  }

  /**
   * Remove team from leaderboard (e.g., disqualification)
   */
  async removeTeam(teamId: string): Promise<void> {
    this.logger.warn(`Removing team ${teamId} from leaderboard`);
    
    await this.redis.zrem(this.LEADERBOARD_KEY, teamId);
    await this.redis.del(`${this.TEAM_STATS_PREFIX}${teamId}`);
    await this.redis.del(`${this.SCORE_HISTORY_PREFIX}${teamId}`);
  }

  /**
   * Get leaderboard statistics
   */
  async getStatistics(): Promise<{
    totalTeams: number;
    averageScore: number;
    topScore: number;
    lastUpdate: string;
  }> {
    const total = await this.redis.zcard(this.LEADERBOARD_KEY);
    
    const topTeamIds = await this.redis.zrevrange(
      this.LEADERBOARD_KEY,
      0,
      0,
      'WITHSCORES'
    );
    
    const topScore = topTeamIds.length > 1 ? parseFloat(topTeamIds[1]) : 0;

    // Calculate average from database for accuracy
    const result = await this.finalScoreRepository
      .createQueryBuilder('score')
      .select('AVG(score.totalScore)', 'avg')
      .getRawOne();

    return {
      totalTeams: total,
      averageScore: parseFloat(result.avg) || 0,
      topScore,
      lastUpdate: new Date().toISOString(),
    };
  }

  /**
   * Refresh leaderboard from database (manual sync)
   */
  async refreshLeaderboard(): Promise<void> {
    this.logger.log('Manually refreshing leaderboard...');
    await this.initializeLeaderboard();
  }
}

export interface LeaderboardEntry {
  teamId: string;
  teamName: string;
  score: number;
  rank: number;
}
