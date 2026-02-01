export enum TeamPrivacy {
    PUBLIC = 'PUBLIC',
    PRIVATE = 'PRIVATE',
    INVITE_ONLY = 'INVITE_ONLY'
}

export enum TeamMemberStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    BANNED = 'BANNED'
}

export enum MatchStatus {
    OPEN = 'OPEN',
    MATCHED = 'MATCHED',
    CONFIRMED = 'CONFIRMED',
    PLAYING = 'PLAYING',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
}

export enum ChallengeType {
    FRIENDLY = 'FRIENDLY',
    COMPETITIVE = 'COMPETITIVE',
    TOURNAMENT = 'TOURNAMENT'
}

export enum PostType {
    STATUS = 'STATUS',
    PHOTO = 'PHOTO',
    VIDEO = 'VIDEO',
    MATCH_RESULT = 'MATCH_RESULT',
    CHECK_IN = 'CHECK_IN',
    ACHIEVEMENT = 'ACHIEVEMENT'
}

export enum PostPrivacy {
    PUBLIC = 'PUBLIC',
    FRIENDS = 'FRIENDS',
    TEAM = 'TEAM',
    PRIVATE = 'PRIVATE'
}

export enum FriendStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
    BLOCKED = 'BLOCKED'
}

export enum ReportType {
    USER = 'USER',
    POST = 'POST',
    COMMENT = 'COMMENT',
    MESSAGE = 'MESSAGE',
    TEAM = 'TEAM'
}

export enum ReportReason {
    SPAM = 'SPAM',
    HARASSMENT = 'HARASSMENT',
    INAPPROPRIATE = 'INAPPROPRIATE',
    FAKE = 'FAKE',
    OTHER = 'OTHER'
}

export enum ReportStatus {
    PENDING = 'PENDING',
    REVIEWING = 'REVIEWING',
    RESOLVED = 'RESOLVED',
    DISMISSED = 'DISMISSED'
}

export enum OrganizerType {
    USER = 'USER',
    TEAM = 'TEAM'
}

export enum TournamentFormat {
    SINGLE_ELIMINATION = 'SINGLE_ELIMINATION',
    DOUBLE_ELIMINATION = 'DOUBLE_ELIMINATION',
    ROUND_ROBIN = 'ROUND_ROBIN',
    GROUP_STAGE_KNOCKOUT = 'GROUP_STAGE_KNOCKOUT'
}

export enum TournamentStatus {
    PLANNING = 'PLANNING',
    REGISTRATION_OPEN = 'REGISTRATION_OPEN',
    REGISTRATION_CLOSED = 'REGISTRATION_CLOSED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
}

export enum TournamentMatchStatus {
    PENDING = 'PENDING',
    LIVE = 'LIVE',
    FINISHED = 'FINISHED',
    CANCELLED = 'CANCELLED'
}
