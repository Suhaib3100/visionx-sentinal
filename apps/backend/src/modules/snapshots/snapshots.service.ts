import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Snapshot, SnapshotStatus } from './entities/snapshot.entity';
import { CreateSnapshotDto } from './dto/create-snapshot.dto';
import { S3Service } from './services/s3.service';
import { SQSPublisherService } from './services/sqs-publisher.service';
import { SessionsService } from '../sessions/sessions.service';
import { TeamsService } from '../teams/teams.service';

@Injectable()
export class SnapshotsService {
  private readonly logger = new Logger(SnapshotsService.name);

  constructor(
    @InjectRepository(Snapshot)
    private readonly snapshotRepository: Repository<Snapshot>,
    private readonly s3Service: S3Service,
    private readonly sqsPublisher: SQSPublisherService,
    private readonly sessionsService: SessionsService,
    private readonly teamsService: TeamsService,
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

    const savedSnapshot = await this.snapshotRepository.save(snapshot);

    // Publish evaluation job to SQS
    try {
      await this.sqsPublisher.publishEvaluationJob({
        snapshotId: savedSnapshot.id,
        s3Path: savedSnapshot.s3Key,
        projectId: savedSnapshot.projectId,
        teamId: savedSnapshot.teamId,
        timestamp: savedSnapshot.timestamp,
      });

      this.logger.log(`Evaluation job published for snapshot: ${savedSnapshot.id}`);
    } catch (error) {
      this.logger.error(
        `Failed to publish evaluation job for snapshot ${savedSnapshot.id}: ${error.message}`,
        error.stack
      );
      // Don't fail the snapshot creation if SQS publish fails
      // The snapshot is still created and can be manually re-evaluated
    }

    return savedSnapshot;
  }

  async findAll(): Promise<Snapshot[]> {
    return this.snapshotRepository.find({
      relations: ['team', 'project', 'staticMetrics'],
      order: { timestamp: 'DESC' },
    });
  }

  async findByProjectId(projectId: string): Promise<Snapshot[]> {
    return this.snapshotRepository.find({
      where: { projectId },
      relations: ['team', 'project', 'staticMetrics'],
      order: { snapshotNumber: 'DESC' },
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

  async uploadFromExtension(
    projectId: string,
    file: any,
    metadata: any,
  ): Promise<{ success: boolean; snapshotId: string }> {
    try {
      // Upload file to S3
      const s3Key = `snapshots/${projectId}/${Date.now()}-${file.originalname}`;
      await this.s3Service.uploadFile(
        s3Key,
        file.buffer,
        file.mimetype || 'application/gzip',
      );

      // Create snapshot record
      const snapshot = await this.create({
        teamId: metadata.teamId,
        projectId,
        s3Key,
        hash: metadata.projectHash || 'unknown',
        size: file.size || 0,
        metadata: {
          ...metadata,
          commit: metadata.commit,
          branch: metadata.branch,
        },
      });

      // Register session for this team
      try {
        const team = await this.teamsService.findOne(metadata.teamId);
        this.sessionsService.registerSession(
          metadata.teamId,
          team.name,
          projectId,
        );
        this.logger.log(`Session registered for team: ${team.name}`);
      } catch (error) {
        this.logger.error(`Failed to register session: ${error.message}`);
        // Don't fail the upload if session registration fails
      }

      return {
        success: true,
        snapshotId: snapshot.id,
      };
    } catch (error) {
      this.logger.error(`Failed to upload snapshot: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to upload snapshot: ${error.message}`);
    }
  }

  async getLatestHash(projectId: string): Promise<{ hash: string | null }> {
    const latest = await this.snapshotRepository.findOne({
      where: { projectId },
      order: { timestamp: 'DESC' },
    });

    return {
      hash: (latest?.metadata as any)?.projectHash || null,
    };
  }
}
