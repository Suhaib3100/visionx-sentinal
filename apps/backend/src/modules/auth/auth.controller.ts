import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, AuthResponseDto } from './dto/auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login and get JWT token' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate authentication token for VS Code extension' })
  @ApiResponse({ status: 200, description: 'Token validated successfully' })
  @ApiResponse({ status: 401, description: 'Invalid token' })
  async validateToken(@Body() body: { token: string }): Promise<{ valid: boolean; teamName?: string; teamId?: string; projectId?: string; isLocked?: boolean }> {
    return this.authService.validateToken(body.token);
  }

  @Post('generate-custom-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate a custom token for development/testing' })
  @ApiResponse({ status: 200, description: 'Custom token generated successfully' })
  async generateCustomToken(@Body() body: { teamName: string; teamId?: string; projectId?: string }): Promise<{ token: string; tokenName: string; teamName: string; teamId: string; projectId: string }> {
    return this.authService.generateCustomToken(body.teamName, body.teamId, body.projectId);
  }
}
