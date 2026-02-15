import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SessionsService, ActiveSession } from './sessions.service';

@ApiTags('sessions')
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get('active')
  @ApiOperation({ summary: 'Get all active sessions (for admin)' })
  @ApiResponse({ status: 200, description: 'Returns list of active sessions' })
  getActiveSessions(): ActiveSession[] {
    return this.sessionsService.getActiveSessions();
  }

  @Get('count')
  @ApiOperation({ summary: 'Get count of active sessions' })
  @ApiResponse({ status: 200, description: 'Returns session count' })
  getSessionCount(): { count: number } {
    return { count: this.sessionsService.getSessionCount() };
  }
}
