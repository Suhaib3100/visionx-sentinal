import { IsString, IsNotEmpty, IsArray, MinLength, MaxLength, ArrayMinSize, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class TeamMemberDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  role: 'leader' | 'member';
}

export class CreateTeamDto {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  name: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => TeamMemberDto)
  members: TeamMemberDto[];
}
