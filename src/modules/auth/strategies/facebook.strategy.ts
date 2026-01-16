import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-facebook';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
    constructor(private configService: ConfigService) {
        super({
            clientID: configService.get<string>('auth.facebook.appId') || 'dummy-app-id',
            clientSecret: configService.get<string>('auth.facebook.appSecret') || 'dummy-app-secret',
            callbackURL: configService.get<string>('auth.facebook.callbackUrl') || 'http://localhost:3000/api/auth/facebook/callback',
            scope: 'email',
            profileFields: ['emails', 'name', 'photos'],
        });
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: (err: any, user: any, info?: any) => void,
    ): Promise<any> {
        const { name, emails, photos } = profile;
        const user = {
            email: emails[0].value,
            fullName: `${name.givenName} ${name.familyName}`,
            avatarUrl: photos[0].value,
            accessToken,
        };
        done(null, user);
    }
}
