import { Injectable, CanActivate, ExecutionContext, Inject } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
import { ConfigService } from '@nestjs/config';

dotenv.config();

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,

    @Inject(ConfigService)
    private config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false; // No JWT token provided
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = this.jwtService.verify(token, { secret: this.config.get<string>('JWT_SECRET') }); // Replace with your secret key
      const user = await this.authService.validateUser(decoded);

      // Attach user object to the request for later use
      request.user = user;

      return true; // Authorization successful
    } catch (error) {
      console.error('Error validating JWT token:', error);
      return false; // JWT token validation failed
    }
  }
}
