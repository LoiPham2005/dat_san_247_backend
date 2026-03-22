import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { users } from '@prisma/client';

@Injectable()
export class TokenService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    private async getUserPermissions(roleId: string | null): Promise<string[]> {
        if (!roleId) return [];

        const rolePermissions = await this.prisma.role_permissions.findMany({
            where: { role_id: roleId },
            include: { permissions: true }
        });

        return rolePermissions.map(rp => rp.permissions.slug);
    }

    async issueTokens(user: users & { role_id: string | null; role: { slug: string; id: string } | null }) {
        const permissions = await this.getUserPermissions(user.role_id);
        
        const is_venue_staff = (user as any).is_venue_staff === true;

        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role?.slug || 'customer',
            is_venue_staff: is_venue_staff,
            permissions: permissions,
        };

        const [access_token, refresh_token] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.configService.get('auth.jwtSecret') || this.configService.get('JWT_SECRET'),
                expiresIn: this.configService.get('auth.jwtExpiresIn') || this.configService.get('JWT_EXPIRES_IN') || '1d',
            }),
            this.jwtService.signAsync(payload, {
                secret: this.configService.get('auth.refreshSecret') || this.configService.get('JWT_REFRESH_SECRET'),
                expiresIn: this.configService.get('auth.refreshExpiresIn') || this.configService.get('JWT_REFRESH_EXPIRES_IN') || '7d',
            }),
        ]);

        // Parse expires_in to Date object (simplified)
        const expiresDays = parseInt(this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7') || 7;
        const expiresAt = new Date(Date.now() + expiresDays * 24 * 60 * 60 * 1000);

        await this.prisma.refresh_tokens.create({
            data: {
                user_id: user.id,
                token: refresh_token,
                expires_at: expiresAt,
            },
        });

        return {
            access_token,
            refresh_token,
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                avatar_url: user.avatar_url,
                role: user.role,
                is_venue_staff: is_venue_staff,
            },
        };
    }

    async rotateRefresh(oldToken: string) {
        const refreshTokenRecord = await this.prisma.refresh_tokens.findUnique({
            where: { token: oldToken },
            include: { users: { include: { role: true } } },
        });

        if (
            !refreshTokenRecord ||
            refreshTokenRecord.is_revoked ||
            refreshTokenRecord.expires_at < new Date()
        ) {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }

        // Revoke old token
        await this.prisma.refresh_tokens.update({
            where: { id: refreshTokenRecord.id },
            data: { is_revoked: true },
        });

        // Issue new tokens
        return this.issueTokens(refreshTokenRecord.users);
    }

    async revokeToken(token: string) {
        await this.prisma.refresh_tokens.updateMany({
            where: { token },
            data: { is_revoked: true },
        });
    }
}
