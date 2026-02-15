import { Controller, Get, Post, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SessionsService, ActiveSession } from './sessions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

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

  @Post('heartbeat')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Register/update session heartbeat from VS Code extension' })
  @ApiResponse({ status: 200, description: 'Session registered/updated' })
  sendHeartbeat(
    @Query('teamId') teamId: string,
    @Query('teamName') teamName: string,
    @Query('projectId') projectId: string,
  ): { success: boolean; message: string } {
    this.sessionsService.registerSession(teamId, teamName, projectId);
    return {
      success: true,
      message: 'Heartbeat received',
    };
  }

  @Post('trigger-bulk-capture')
  @ApiOperation({ summary: 'Trigger capture for all active sessions (admin only)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns list of teams that should be notified to capture',
    schema: {
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        activeTeams: { 
          type: 'array',
          items: {
            type: 'object',
            properties: {
              teamId: { type: 'string' },
              teamName: { type: 'string' },
              projectId: { type: 'string' }
            }
          }
        },
        count: { type: 'number' }
      }
    }
  })
  triggerBulkCapture(): {
    success: boolean;
    message: string;
    activeTeams: Array<{ teamId: string; teamName: string; projectId: string }>;
    count: number;
  } {
    return this.sessionsService.triggerBulkCapture();
  }

  @Get('check-capture-trigger')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Check if this team should trigger a capture (polled by extension)' })
  @ApiQuery({ name: 'teamId', required: true, type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns whether team should capture now',
    schema: {
      properties: {
        shouldCapture: { type: 'boolean' },
        message: { type: 'string' }
      }
    }
  })
  checkCaptureTrigger(@Query('teamId') teamId: string): {
    shouldCapture: boolean;
    message: string;
  } {
    const shouldCapture = this.sessionsService.shouldTriggerCapture(teamId);
    
    return {
      shouldCapture,
      message: shouldCapture 
        ? 'Admin requested bulk capture - please capture now' 
        : 'No capture trigger pending',
    };
  }
}
