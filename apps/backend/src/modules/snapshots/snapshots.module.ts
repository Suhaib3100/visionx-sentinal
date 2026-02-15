import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnapshotsService } from './snapshots.service';
import { SnapshotsController } from './snapshots.controller';
import { Snapshot } from './entities/snapshot.entity';
import { S3Service } from './services/s3.service';
import { SQSPublisherService } from './services/sqs-publisher.service';
import { SessionsModule } from '../sessions/sessions.module';
import { TeamsModule } from '../teams/teams.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Snapshot]),
    SessionsModule,
    TeamsModule,
  ],
  controllers: [SnapshotsController],
  providers: [SnapshotsService, S3Service, SQSPublisherService],
  exports: [SnapshotsService, S3Service],
})
export class SnapshotsModule {}
