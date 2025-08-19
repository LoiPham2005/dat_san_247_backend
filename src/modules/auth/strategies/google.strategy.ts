import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(
        private configService: ConfigService,
        private authService: AuthService
    ) {
        const clientID = configService.get('GOOGLE_CLIENT_ID');
        const clientSecret = configService.get('GOOGLE_CLIENT_SECRET');
        const callbackURL = configService.get('GOOGLE_CALLBACK_URL');

        if (!clientID || !clientSecret || !callbackURL) {
            throw new Error('Missing Google OAuth configuration');
        }

        super({
            clientID,
            clientSecret,
            callbackURL,
            scope: ['email', 'profile'],
        });
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: VerifyCallback
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
                provider: 'google',
                providerId: profile.id
            };

            const userData = await this.authService.validateOAuthLogin(user, 'google');
            done(null, userData);
        } catch (error) {
            // Fix: Pass undefined instead of null for the user parameter
            done(error, undefined);
        }
    }
}