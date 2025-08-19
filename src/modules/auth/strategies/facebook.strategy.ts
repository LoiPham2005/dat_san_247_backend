import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-facebook';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
    constructor(
        private configService: ConfigService,
        private authService: AuthService
    ) {
        const clientID = configService.get('FACEBOOK_APP_ID');
        const clientSecret = configService.get('FACEBOOK_APP_SECRET');
        const callbackURL = configService.get('FACEBOOK_CALLBACK_URL');

        if (!clientID || !clientSecret || !callbackURL) {
            throw new Error('Missing Facebook OAuth configuration');
        }

        super({
            clientID,
            clientSecret,
            callbackURL,
            scope: 'email',
            profileFields: ['emails', 'name', 'photos'],
        });
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: (err: any, user: any) => void
    ): Promise<any> {
        try {
            if (!profile.emails || !profile.name || !profile.photos) {
                throw new UnauthorizedException('Missing profile information');
            }

            const user = {
                email: profile.emails[0].value,
                username: profile.emails[0].value.split('@')[0],
                avatar: profile.photos[0].value,
                firstName: profile.name.givenName,
                lastName: profile.name.familyName,
                provider: 'facebook',
                providerId: profile.id
            };

            const userData = await this.authService.validateOAuthLogin(user, 'facebook');
            done(null, userData);
        } catch (error) {
            done(error, null);
        }
    }
}