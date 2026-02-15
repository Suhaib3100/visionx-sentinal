import { IsString, IsNotEmpty, IsObject, IsNumber } from 'class-validator';

export class CreateSnapshotDto {
  @IsString()
  @IsNotEmpty()
  teamId: string;

  @IsString()
  @IsNotEmpty()
  projectId: string;

  @IsString()
  @IsNotEmpty()
  hash: string;

  @IsNumber()
  size: number;

  @IsObject()
  metadata: any;

  @IsString()
  @IsNotEmpty()
  s3Key: string;
}
