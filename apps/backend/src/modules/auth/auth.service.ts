import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { LoginDto, RegisterDto, AuthResponseDto, UserRole } from './dto/auth.dto';

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
      email: 'admin@visionx.com',
      name: 'Admin User',
      password: '$2b$10$YourHashedPasswordHere', // Replace with actual hash
      role: UserRole.ADMIN,
    },
  ];

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
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

  async validateToken(token: string): Promise<{ valid: boolean; teamId?: string; projectId?: string; isLocked?: boolean }> {
    try {
      const decoded = this.jwtService.verify(token);
      const user = await this.validateUser(decoded.sub);
      
      if (!user) {
        return { valid: false };
      }

      // In a real implementation, fetch team and project from database
      // For now, return mock data
      return {
        valid: true,
        teamId: decoded.teamId || 'team-123',
        projectId: decoded.projectId || 'project-456',
        isLocked: false,
      };
    } catch (error) {
      return { valid: false };
    }
  }

  private async generateTokens(user: User): Promise<AuthResponseDto> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }
}
