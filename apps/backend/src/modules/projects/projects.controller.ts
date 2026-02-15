import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Project } from './entities/project.entity';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createProjectDto: CreateProjectDto): Promise<Project> {
    return this.projectsService.create(createProjectDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(): Promise<Project[]> {
    return this.projectsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string): Promise<Project> {
    return this.projectsService.findOne(id);
  }

  @Get('team/:teamId')
  @UseGuards(JwtAuthGuard)
  findByTeamId(@Param('teamId') teamId: string): Promise<Project> {
    return this.projectsService.findByTeamId(teamId);
  }

  @Get(':id/stats')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get project statistics for VS Code extension' })
  async getProjectStats(@Param('id') id: string): Promise<any> {
    return this.projectsService.getProjectStats(id);
  }
}
