import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { EvaluationsService } from './evaluations.service';

@ApiTags('evaluations')
@Controller('evaluations')
export class EvaluationsController {
  constructor(private readonly evaluationsService: EvaluationsService) {}

  @Get('recent')
  @ApiOperation({ summary: 'Get recent evaluation results' })
  async getRecentEvaluations(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.evaluationsService.getRecentEvaluations(limitNum);
  }

  @Get('pending')
  @ApiOperation({ summary: 'Get pending evaluations in queue' })
  async getPendingEvaluations() {
    return this.evaluationsService.getPendingEvaluations();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get system-wide evaluation statistics' })
  async getSystemStats() {
    return this.evaluationsService.getSystemStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get detailed evaluation by snapshot ID' })
  async getEvaluationDetails(@Param('id') id: string) {
    return this.evaluationsService.getEvaluationDetails(id);
  }
}
