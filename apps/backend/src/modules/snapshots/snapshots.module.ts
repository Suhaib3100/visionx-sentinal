import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnapshotsService } from './snapshots.service';
import { SnapshotsController } from './snapshots.controller';
import { Snapshot } from './entities/snapshot.entity';
import { S3Service } from './services/s3.service';

@Module({
  imports: [TypeOrmModule.forFeature([Snapshot])],
  controllers: [SnapshotsController],
  providers: [SnapshotsService, S3Service],
  exports: [SnapshotsService, S3Service],
})
export class SnapshotsModule {}
