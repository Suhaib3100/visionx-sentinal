import { IsString, IsNotEmpty, IsArray, MinLength, MaxLength, IsOptional, IsUrl } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  teamId: string;

  @IsString()
  @MinLength(3)
  @MaxLength(100)
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsArray()
  @IsString({ each: true })
  techStack: string[];

  @IsUrl()
  @IsOptional()
  repositoryUrl?: string;

  @IsUrl()
  @IsOptional()
  demoUrl?: string;
}
