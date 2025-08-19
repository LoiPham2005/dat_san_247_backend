// src/auth/strategies/jwt.strategy.ts
// định nghĩa cách xác thực (JWT, Google, Facebook...).
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { User } from '../../users/entities/user.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private usersService: UsersService,
        private configService: ConfigService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET'),
        });
    }

    async validate(payload: any): Promise<User> {
        const user = await this.usersService.findOne(payload.id);
        if (!user || !user.status) {
            throw new UnauthorizedException('Người dùng không tồn tại hoặc đã bị vô hiệu hóa');
        }
        return user;
    }
}