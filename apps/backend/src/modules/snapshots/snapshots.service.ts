import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Snapshot, SnapshotStatus } from './entities/snapshot.entity';
import { CreateSnapshotDto } from './dto/create-snapshot.dto';
import { S3Service } from './services/s3.service';

@Injectable()
export class SnapshotsService {
  constructor(
    @InjectRepository(Snapshot)
    private readonly snapshotRepository: Repository<Snapshot>,
    private readonly s3Service: S3Service,
  ) {}

  async create(createSnapshotDto: CreateSnapshotDto): Promise<Snapshot> {
    // Get the latest snapshot number for this team
    const latestSnapshot = await this.snapshotRepository.findOne({
      where: { teamId: createSnapshotDto.teamId },
      order: { snapshotNumber: 'DESC' },
    });

    const snapshotNumber = latestSnapshot ? latestSnapshot.snapshotNumber + 1 : 1;

    const snapshot = this.snapshotRepository.create({
      ...createSnapshotDto,
      snapshotNumber,
      timestamp: new Date(),
      status: SnapshotStatus.PENDING,
    });

    return this.snapshotRepository.save(snapshot);
  }

  async findAll(): Promise<Snapshot[]> {
    return this.snapshotRepository.find({
      relations: ['team', 'project'],
      order: { timestamp: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Snapshot> {
    const snapshot = await this.snapshotRepository.findOne({
      where: { id },
      relations: ['team', 'project', 'staticMetrics'],
    });

    if (!snapshot) {
      throw new NotFoundException(`Snapshot with ID ${id} not found`);
    }

    return snapshot;
  }

  async findByTeamId(teamId: string): Promise<Snapshot[]> {
    return this.snapshotRepository.find({
      where: { teamId },
      order: { snapshotNumber: 'DESC' },
      relations: ['staticMetrics'],
    });
  }

  async updateStatus(id: string, status: SnapshotStatus): Promise<Snapshot> {
    const snapshot = await this.findOne(id);
    snapshot.status = status;
    return this.snapshotRepository.save(snapshot);
  }
}
