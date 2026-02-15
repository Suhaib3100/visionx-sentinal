import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
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
}
