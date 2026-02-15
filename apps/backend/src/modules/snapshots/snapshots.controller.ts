import { Controller, Get, Post, Body, Param, UseGuards, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { SnapshotsService } from './snapshots.service';
import { CreateSnapshotDto } from './dto/create-snapshot.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Snapshot } from './entities/snapshot.entity';

@ApiTags('snapshots')
@Controller('snapshots')
export class SnapshotsController {
  constructor(private readonly snapshotsService: SnapshotsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createSnapshotDto: CreateSnapshotDto): Promise<Snapshot> {
    return this.snapshotsService.create(createSnapshotDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(): Promise<Snapshot[]> {
    return this.snapshotsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string): Promise<Snapshot> {
    return this.snapshotsService.findOne(id);
  }

  @Get('team/:teamId')
  @UseGuards(JwtAuthGuard)
  findByTeamId(@Param('teamId') teamId: string): Promise<Snapshot[]> {
    return this.snapshotsService.findByTeamId(teamId);
  }

  @Post('upload/:projectId')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload snapshot file from VS Code extension' })
  async uploadSnapshot(
    @Param('projectId') projectId: string,
    @UploadedFile() file: any,
    @Body('metadata') metadata: string,
  ): Promise<{ success: boolean; snapshotId: string }> {
    const parsedMetadata = JSON.parse(metadata);
    return this.snapshotsService.uploadFromExtension(projectId, file, parsedMetadata);
  }

  @Get('project/:projectId/latest')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get latest snapshot hash for change detection' })
  async getLatestHash(@Param('projectId') projectId: string): Promise<{ hash: string | null }> {
    return this.snapshotsService.getLatestHash(projectId);
  }
}
