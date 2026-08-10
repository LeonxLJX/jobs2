import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// JWT 认证守卫 / JWT authentication guard
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
