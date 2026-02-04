import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Team entities
import { Team } from './entities/team.entity';
import { TeamMember } from './entities/team-member.entity';
import { TeamJoinRequest } from './entities/team-join-request.entity';
import { TeamInvitation } from './entities/team-invitation.entity';

// Match entities
import { MatchFinding } from './entities/match-finding.entity';
import { MatchParticipant } from './entities/match-participant.entity';
import { MatchResult } from './entities/match-result.entity';
import { Tournament } from './entities/tournament.entity';
import { TournamentBracket, TournamentMatch } from './entities/tournament-bracket.entity';
import { TournamentParticipant } from './entities/tournament-participant.entity';

// Social entities
import { Post } from './entities/post.entity';
import { SocialLike } from './entities/social-like.entity';
import { PostComment } from './entities/post-comment.entity';
import { SocialMedia } from './entities/social-media.entity';

// Friend entities
import { Friendship } from './entities/friendship.entity';
import { UserFollower } from './entities/user-follower.entity';

// Profile entities
import { UserProfile } from './entities/user-profile.entity';
import { UserAchievement } from './entities/user-achievement.entity';

// Other entities
import { Report } from './entities/report.entity';
import { UserBlock } from './entities/user-block.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            // Teams
            Team,
            TeamMember,
            TeamJoinRequest,
            TeamInvitation,
            // Matches
            MatchFinding,
            MatchParticipant,
            MatchResult,
            Tournament,
            TournamentBracket,
            TournamentMatch,
            TournamentParticipant,
            // Social
            Post,
            SocialLike,
            PostComment,
            SocialMedia,
            // Friends
            Friendship,
            UserFollower,
            // Profiles
            UserProfile,
            UserAchievement,
            // Others
            Report,
            UserBlock,
        ]),
    ],
    controllers: [],
    providers: [],
    exports: [],
})
export class SocialModule { }
