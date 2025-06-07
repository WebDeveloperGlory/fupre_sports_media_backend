export enum UserRole {
    USER = 'user',
    SUPER_ADMIN = 'super-admin',
    MEDIA_ADMIN = 'media-admin',
    HEAD_MEDIA_ADMIN = 'head-media-admin',
    COMPETITION_ADMIN = 'competition-admin',
    TEAM_ADMIN = 'team-admin',
    LIVE_FIXTURE_ADMIN = 'live-fixture-admin'
}

export enum SportType {
    FOOTBALL = 'football',
    BASKETBALL = 'basketball',
    VOLLEYBALL = 'volleyball',
    ALL = 'all'
}

export enum UserStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    SUSPENDED = 'suspended'
}