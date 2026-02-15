import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    // Check if team already has a project
    const existing = await this.projectRepository.findOne({
      where: { teamId: createProjectDto.teamId },
    });

    if (existing) {
      throw new ConflictException('Team already has a project');
    }

    const project = this.projectRepository.create(createProjectDto);
    return this.projectRepository.save(project);
  }

  async findAll(): Promise<Project[]> {
    return this.projectRepository.find({
      relations: ['team'],
    });
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['team', 'snapshots'],
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project;
  }

  async findByTeamId(teamId: string): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { teamId },
      relations: ['team'],
    });

    if (!project) {
      throw new NotFoundException(`Project for team ${teamId} not found`);
    }

    return project;
  }

  async getProjectStats(id: string): Promise<any> {
    const project = await this.findOne(id);
    
    // Get latest snapshot
    const latestSnapshot = project.snapshots?.[0] || null;
    
    return {
      projectId: project.id,
      teamId: project.teamId,
      snapshotCount: project.snapshots?.length || 0,
      score: (latestSnapshot as any)?.finalScore?.finalScore || null,
      rank: (latestSnapshot as any)?.finalScore?.rank || null,
      lastEvaluated: latestSnapshot?.timestamp || null,
    };
  }
}
