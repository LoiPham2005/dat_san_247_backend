// src/auth/guards/jwt-auth.guard.ts
// chặn hoặc cho phép truy cập route.
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}