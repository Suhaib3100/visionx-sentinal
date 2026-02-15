import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { LeaderboardService } from './leaderboard.service';

@ApiTags('leaderboard')
@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get('top/:topN')
  @ApiOperation({ summary: 'Get top N teams on the leaderboard' })
  @ApiParam({ name: 'topN', description: 'Number of top teams to return', example: 100 })
  @ApiResponse({ status: 200, description: 'Returns top teams' })
  async getTopTeams(@Param('topN') topN: string) {
    const limit = parseInt(topN, 10);
    return this.leaderboardService.getTopTeams(limit);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get leaderboard statistics' })
  @ApiResponse({ status: 200, description: 'Returns leaderboard stats' })
  async getLeaderboardStats() {
    return this.leaderboardService.getLeaderboardStats();
  }

  @Get('team/:teamId/rank')
  @ApiOperation({ summary: 'Get team rank on leaderboard' })
  @ApiParam({ name: 'teamId', description: 'Team ID' })
  @ApiResponse({ status: 200, description: 'Returns team rank' })
  async getTeamRank(@Param('teamId') teamId: string) {
    return this.leaderboardService.getTeamRank(teamId);
  }

  @Get('team/:teamId/history')
  @ApiOperation({ summary: 'Get team score history' })
  @ApiParam({ name: 'teamId', description: 'Team ID' })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ApiResponse({ status: 200, description: 'Returns team score history' })
  async getTeamScoreHistory(
    @Param('teamId') teamId: string,
    @Query('limit') limit?: string,
  ) {
    const maxLimit = limit ? parseInt(limit, 10) : 50;
    return this.leaderboardService.getTeamScoreHistory(teamId, maxLimit);
  }
}
