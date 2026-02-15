import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team, MemberRole } from './entities/team.entity';
import { CreateTeamDto } from './dto/create-team.dto';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
  ) {}

  async create(createTeamDto: CreateTeamDto): Promise<Team> {
    // Generate slug
    const slug = createTeamDto.name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    // Check if team name or slug exists
    const existing = await this.teamRepository.findOne({
      where: [{ name: createTeamDto.name }, { slug }],
    });

    if (existing) {
      throw new ConflictException('Team name already exists');
    }

    // Add IDs to members and cast role
    const membersWithIds = createTeamDto.members.map(member => ({
      ...member,
      id: Math.random().toString(36).substr(2, 9),
      role: member.role as MemberRole,
    }));

    const team = this.teamRepository.create({
      name: createTeamDto.name,
      slug,
      members: membersWithIds,
      registeredAt: new Date(),
      totalSnapshots: 0,
      currentScore: 0,
      rank: 0,
    });

    return this.teamRepository.save(team);
  }

  async findAll(): Promise<Team[]> {
    return this.teamRepository.find({
      order: { rank: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Team> {
    const team = await this.teamRepository.findOne({
      where: { id },
      relations: ['project', 'snapshots'],
    });

    if (!team) {
      throw new NotFoundException(`Team with ID ${id} not found`);
    }

    return team;
  }

async findBySlug(slug: string): Promise<Team> {
    const team = await this.teamRepository.findOne({
      where: { slug },
    });

    if (!team) {
      throw new NotFoundException(`Team with slug ${slug} not found`);
    }

    return team;
  }
}
