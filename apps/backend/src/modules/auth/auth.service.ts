import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { LoginDto, RegisterDto, AuthResponseDto, UserRole } from './dto/auth.dto';
import { SessionsService } from '../sessions/sessions.service';
import { ProjectsService } from '../projects/projects.service';

// Temporary in-memory store (replace with database in real implementation)
interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  role: UserRole;
}

@Injectable()
export class AuthService {
  private users: User[] = [
    {
      id: '1',
      email: 'suhaib@percify.io',
      name: 'Suhaib',
      password: '$2b$10$uoAokAaKUh3v0aif9.WP8.dVAhPQr7gMOAYC7iUieA0STihec9q6y',
      role: UserRole.ADMIN,
    },
  ];

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly sessionsService: SessionsService,
    private readonly projectsService: ProjectsService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    // Check if user exists
    const existingUser = this.users.find(u => u.email === registerDto.email);
    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create user
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email: registerDto.email,
      name: registerDto.name,
      password: hashedPassword,
      role: registerDto.role || UserRole.PARTICIPANT,
    };

    this.users.push(newUser);

    return this.generateTokens(newUser);
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = this.users.find(u => u.email === loginDto.email);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user);
  }

  async validateUser(userId: string): Promise<User | null> {
    return this.users.find(u => u.id === userId) || null;
  }

  async validateToken(token: string): Promise<{ valid: boolean; teamName?: string; teamId?: string; projectId?: string; isLocked?: boolean }> {
    try {
      const decoded = this.jwtService.verify(token);
      
      // If token has teamId and projectId, it's a custom token - validate directly
      if (decoded.teamId && decoded.projectId) {
        // Register session
        this.sessionsService.registerSession(
          decoded.teamId,
          decoded.teamName || 'Unknown Team',
          decoded.projectId
        );

        return {
          valid: true,
          teamName: decoded.teamName || 'Unknown Team',
          teamId: decoded.teamId,
          projectId: decoded.projectId,
          isLocked: false,
        };
      }
      
      // Otherwise, it's a regular user token - validate user exists
      const user = await this.validateUser(decoded.sub);
      
      if (!user) {
        return { valid: false };
      }

      // Return with default team/project values
      return {
        valid: true,
        teamName: 'Default Team',
        teamId: decoded.teamId || 'team-123',
        projectId: decoded.projectId || 'project-456',
        isLocked: false,
      };
    } catch (error) {
      return { valid: false };
    }
  }

  async generateCustomToken(teamName: string, teamId?: string, projectId?: string): Promise<{ token: string; tokenName: string; teamName: string; teamId: string; projectId: string }> {
    // If teamId is provided (from admin panel), use it as-is (it's the UUID from database)
    // Otherwise, generate a custom string ID for backward compatibility
    const finalTeamId = teamId || `team-${teamName.toLowerCase().replace(/\s+/g, '-')}`;
    
    // Default projectId based on team name
    const defaultProjectId = `project-${teamName.toLowerCase().replace(/\s+/g, '-')}`;
    let finalProjectId: string = projectId || defaultProjectId;
    
    // If teamId is a UUID (from admin panel), find or create a default project
    if (teamId && this.isUUID(teamId)) {
      try {
        // Try to find existing project for this team
        const existingProject = await this.projectsService.findByTeamId(teamId);
        finalProjectId = existingProject.id;
      } catch (error) {
        // Project doesn't exist, create a default one
        try {
          const newProject = await this.projectsService.create({
            teamId: teamId,
            title: `${teamName} Project`,
            description: 'Default project for team',
            category: 'General',
            techStack: ['VS Code Extension'],
          });
          finalProjectId = newProject.id;
        } catch (createError) {
          // If creation fails (e.g., duplicate), try to get it again
          const project = await this.projectsService.findByTeamId(teamId);
          finalProjectId = project.id;
        }
      }
    }
    
    // Generate token name: TEAMNAME-TOKEN
    const tokenName = `${teamName.toUpperCase().replace(/\s+/g, '-')}-TOKEN`;

    const payload = {
      sub: 'dev-user',
      email: `${teamName.toLowerCase()}@dev.local`,
      role: UserRole.PARTICIPANT,
      teamId: finalTeamId,
      teamName: teamName,
      projectId: finalProjectId,
      tokenName: tokenName,
    };

    const token = this.jwtService.sign(payload, { expiresIn: '30d' });

    return {
      token,
      tokenName,
      teamName,
      teamId: finalTeamId,
      projectId: finalProjectId,
    };
  }

  private isUUID(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }

  private async generateTokens(user: User): Promise<AuthResponseDto> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      access_token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }
}
