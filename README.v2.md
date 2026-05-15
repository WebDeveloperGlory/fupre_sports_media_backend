# 🏟️ Fupre Sports Media API — V2

> A TypeScript REST API for sports media management covering football competitions, live match tracking, player management, blogs, basketball, and a multi-role admin system. Built with **Node.js**, **Express**, **MongoDB**, and **Socket.IO**.

[![TypeScript](https://img.shields.io/badge/TypeScript-Language-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-Runtime-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express.js-Framework-000000?logo=express&logoColor=white)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?logo=mongodb&logoColor=white)](https://mongodb.com)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-Real--time-010101?logo=socket.io&logoColor=white)](https://socket.io)

> **Note:** This is V2 (TypeScript). The V1 JavaScript API has a different codebase and is documented separately.

---

## 📖 Overview

Fupre Sports Media is a university sports platform supporting multiple sports (football, basketball). V2 is a full TypeScript rewrite of the V1 JavaScript API with a richer feature set — live match fan engagement, player verification workflows, competition cloning, team-based player suggestions, basketball management, admin dashboards, and blog/media management.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Language | TypeScript |
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB + Mongoose |
| Authentication | JWT (HTTP-only cookies, 24h expiry) |
| Password Hashing | bcrypt (salt rounds: 12) |
| Real-time | Socket.IO |
| Email | Nodemailer (Gmail) |
| File Uploads | Cloudinary (via multer) |
| API Docs | Swagger / OpenAPI at `/api-docs` |

---

## 📁 Project Structure

```
app/v2/
├── config/
│   ├── db.ts                     # Mongoose connection + model registry
│   ├── env.ts                    # Environment variables
│   ├── socket.ts                 # Socket.IO initializer
│   └── swagger.ts                # Swagger spec
├── controllers/
│   ├── general/                  # auth, user, blog, deptnfac
│   ├── football/                 # competition, team, fixture, live, player, admin
│   ├── basketball/               # player, team
│   └── views/                    # adminDashboard, homepage
├── events/
│   └── socketEvents.ts           # Socket room management
│   └── socketEmits.ts            # Typed socket emit helpers
├── middlewares/
│   └── general/
│       ├── authMiddleware.ts      # JWT cookie auth
│       └── adminMiddleware.ts     # Role checks
├── models/
│   ├── general/                  # User, Blog, Notification, Highlight, Faculty, Department
│   ├── football/                 # Competition, Fixture, LiveFixture, Player, Team
│   └── basketball/               # Player, Team, PlayerContract, PlayerCareerStat
├── routes/
│   ├── general/                  # auth, user, blog, deptnfac
│   ├── football/                 # competition, team, fixture, live, player, admin
│   ├── basketball/               # player, team
│   └── views/                    # adminDashboard, homepage
├── services/                     # Business logic (mirrors controllers)
├── types/                        # Enums: user, fixture, team, player, competition, blog, auditlog
└── utils/
    ├── general/                  # auditLogUtils, notificationUtils, otpUtils, jwtUtils, liveFixtureUtils, cloudinaryUtils
    └── sport/football/           # teamUtils
```

---

## 🔐 Authentication

JWT is issued as an **HTTP-only cookie** (`authToken`, 24-hour expiry) on login and OTP verification. All protected routes require this cookie. On logout, the cookie is cleared.

### OTP Flow (Account Activation / Password Reset)
1. Register → account created with `status: inactive`
2. `POST /auth/otp/request` → OTP generated and emailed
3. `POST /auth/otp/verify` → OTP verified, account activated, JWT cookie set
4. `POST /auth/password/reset` → change password using verified session

### Role Hierarchy

```
super-admin
  ├── Register any admin role
  ├── Full access to all routes
  ├── Manage competitions, teams, players, fixtures
  └── Delete/ban users

head-media-admin
  ├── Manage blog review and publishing
  └── View media dashboard + pending POTM fixtures

media-admin
  └── Create and edit blogs

competition-admin
  └── Assigned to competitions (manage fixtures, results)

team-admin
  └── Assigned to teams (manage squad, suggest players)

live-fixture-admin
  └── Run live matches (scores, timeline, substitutions)

user
  └── Read access + TOTS voting + POTM voting + player ratings + cheering
```

---

## 🔌 V2 API Routes

**API Docs:** `/api-docs`

---

### Auth — `/auth`

| Method | Endpoint | Auth | Body | Notes |
|--------|----------|------|------|-------|
| POST | `/signup/user` | No | `{ name, email, password }` | Creates inactive user |
| POST | `/signup/admin` | Yes + `hasSignUpPermissions` | `{ name, email, role, password }` | Creates admin user |
| POST | `/login` | No | `{ email, password }` | Sets JWT cookie |
| POST | `/logout` | No | — | Clears JWT cookie |
| POST | `/otp/request` | No | `{ email }` | Sends OTP to email |
| POST | `/otp/verify` | No | `{ email, otp }` | Verifies OTP, activates account, sets JWT cookie |
| POST | `/password/reset` | No | `{ email, newPassword, confirmNewPassword }` | Resets password (must have verified OTP first) |
| GET | `/check/super-admin` | Yes + `isSuperAdmin` | — | Role check endpoint |
| GET | `/check/live-fixture-admin` | Yes + `isLiveFixtureAdmin` | — | Role check endpoint |
| GET | `/check/media-admin` | Yes + `isMediaAdmin` | — | Role check endpoint |
| GET | `/check/head-media-admin` | Yes + `isHeadMediaAdmin` | — | Role check endpoint |

---

### User — `/user`

| Method | Endpoint | Auth | Body | Returns |
|--------|----------|------|------|---------|
| GET | `/me` | Yes | — | `{ user, unreadNotifications, notifications }` |
| PUT | `/me` | Yes | `{ name?, email?, preferences? }` (any `IV2User` fields) | Updated user |

---

### Department & Faculty — `/deptnfac`

| Method | Endpoint | Auth | Body / Params | Returns |
|--------|----------|------|---------------|---------|
| GET | `/faculty` | No | — | Faculty[] |
| GET | `/department` | No | — | Department[] (populated with faculty name) |
| POST | `/faculty` | Yes + superAdmin | `{ name }` | Faculty |
| POST | `/department` | Yes + superAdmin | `{ name, faculty }` | Department |
| PUT | `/faculty/:facultyId` | Yes + superAdmin | `{ name }` | Updated faculty |
| PUT | `/department/:departmentId` | Yes + superAdmin | `{ name, faculty }` | Updated department |
| DELETE | `/faculty/:facultyId` | Yes + superAdmin | — | null |
| DELETE | `/department/:departmentId` | Yes + superAdmin | — | null |

---

### Blog — `/blog`

| Method | Endpoint | Auth | Body / Params | Returns |
|--------|----------|------|---------------|---------|
| GET | `/` | No | — | Blog[] (all, with author populated) |
| GET | `/:blogId` | No | — | Blog (increments views) |
| POST | `/` | Yes + `hasGeneralBlogPermissions` | `{ title, content, category, coverImage? }` | Blog (`isReviewed: true` if headMediaAdmin) |
| PUT | `/:blogId` | Yes + `hasGeneralBlogPermissions` | `{ title?, content?, category?, coverImage? }` | Updated blog |
| PUT | `/:blogId/publish` | Yes + `isHeadMediaAdmin` | — | Published blog |
| DELETE | `/:blogId` | Yes + `hasGeneralBlogPermissions` | — | null (only author or superAdmin/headMediaAdmin can delete) |

**Blog Categories:** `football`, `basketball`, `chesss`, `volleyball`, `athletics`, `general`

---

### Football — Competition — `/competition`

#### Public Routes (No Auth)

| Method | Endpoint | Query | Returns |
|--------|----------|-------|---------|
| GET | `/` | `?status, ?type, ?isFeatured, ?limit (default 10), ?page (default 1)` | `{ competitions, pagination }` |
| GET | `/:competitionId` | — | Competition (populated teams, squad, awards) |
| GET | `/:competitionId/league-table` | — | `leagueTable[]` (populated team names) |
| GET | `/:competitionId/knockout` | — | `knockoutRounds[]` (populated fixtures + teams) |
| GET | `/:competitionId/group` | — | `groupStage[]` (populated standings + fixtures) |
| GET | `/:competitionId/team` | — | `teams[]` with squad lists |
| GET | `/:competitionId/fixture` | `?limit, ?page, ?fromDate, ?toDate` | `{ fixtures, pagination }` |
| GET | `/:competitionId/stat` | — | Competition stats (topScorers, topAssists, bestDefenses) |

#### Admin Routes (Yes + superAdmin)

| Method | Endpoint | Body | Returns |
|--------|----------|------|---------|
| POST | `/` | `{ name, shorthand, type, season, startDate, endDate, registrationDeadline?, description }` | Competition |
| POST | `/:competitionId/clone` | `{ name, season, startDate, endDate }` | Cloned competition |
| PUT | `/:competitionId/status/general` | `{ status }` | Updated status |
| PUT | `/:competitionId/info` | `{ name?, shorthand?, season?, startDate?, endDate?, prizeMoney?, substitutions?, extraTime?, penalties?, matchDuration?, squadSize? }` | Competition (only editable when `upcoming`) |
| PUT | `/:competitionId/team/register` | `{ teamId }` | Updated teams array |
| PUT | `/:competitionId/team/unregister` | `{ teamId }` | Updated teams array |
| PUT | `/:competitionId/team/standings` | `{ teamId, isGroup?, groupId?, played?, points?, wins?, losses?, draws?, goalsFor?, goalsAgainst?, form? }` | Updated standing |
| PUT | `/:competitionId/team/squad` | `{ teamId, squadList[] }` | Updated teams |
| PUT | `/:competitionId/league-table` | — | Initialized league standings (all registered teams, 0 points) |
| PUT | `/:competitionId/group` | `{ name, teamIds[], qualificationRules? }` | New group |
| PUT | `/:competitionId/knockout` | `{ name }` | Updated knockoutRounds |
| DELETE | `/:competitionId/group/groupName` | — | Updated groupStage |
| DELETE | `/:competitionId/knockout/roundName` | — | Updated knockoutRounds |
| PUT | `/:competitionId/fixture` | `{ homeTeam, awayTeam, stadium, scheduledDate, referee, isDerby?, isKnockoutRound?, knockoutId?, isGroupFixture?, groupId? }` | Created fixture |
| PUT | `/:competitionId/fixture/update` | `{ fixtureId, scheduledDate?, status?, postponedReason?, rescheduledDate? }` | Updated fixture |
| PUT | `/:competitionId/fixture/result` | `{ fixtureId, result, statistics? }` | Updated fixture (status → completed) |
| PUT | `/:competitionId/rule` | `{ substitutions?, extraTime?, penalties?, matchDuration?, squadSize? }` | Updated rules |
| PUT | `/:competitionId/format` | `{ groupStage?, knockoutStage?, leagueStage? }` | Updated format |
| PUT | `/:competitionId/additional-rule` | `{ title, description }` | Updated extraRules |
| DELETE | `/:competitionId/additional-rule` | `{ title, lastUpdated }` | Updated extraRules |
| PUT | `/:competitionId/sponsor` | `{ name, logo?, tier }` | Updated sponsors |
| DELETE | `/:competitionId/sponsor` | `{ name }` | Updated sponsors |
| PUT | `/:competitionId/award/player` | `{ name }` | Updated player awards |
| DELETE | `/:competitionId/award/player` | `{ name }` | Updated player awards |
| PUT | `/:competitionId/award/team` | `{ name }` | Updated team awards |
| DELETE | `/:competitionId/award/team` | `{ name }` | Updated team awards |
| PUT | `/:competitionId/admin` | `{ admin }` (userId of a `competition-admin` user) | Updated admin |
| PUT | `/:competitionId/status/active` | `{ isActive }` | Updated isActive |
| PUT | `/:competitionId/feature` | — | Makes this competition featured (unfeatured previous one) |
| DELETE | `/:competitionId` | — | null |

---

### Football — Team — `/teams`

#### Public Routes (No Auth)

| Method | Endpoint | Query | Returns |
|--------|----------|-------|---------|
| GET | `/` | `?facultyId, ?departmentId, ?type, ?academicYear, ?limit (default 10), ?page (default 1)` | Teams[] (populated dept/faculty) |
| GET | `/:teamId` | — | Team (populated dept/faculty) |
| GET | `/:teamId/stats` | `?startDate, ?endDate, ?competitionId` | `{ team, stats }` (based on completed fixtures) |
| GET | `/:teamId/players` | — | `{ team, players }` (rich player detail with role, jerseyNumber, seasonalStats, competitionStats) |
| GET | `/:teamId/competition` | `?season` | Competition performance array |

#### Admin Routes (Yes + superAdmin)

| Method | Endpoint | Body | Returns |
|--------|----------|------|---------|
| POST | `/` | `{ name, shorthand, type, academicYear, department?, faculty? }` | Team |
| DELETE | `/:teamId/delete` | — | null |
| PUT | `/:teamId/update/info` | `{ name?, shorthand?, academicYear?, color? }` | Team |
| PUT | `/:teamId/update/coaches` | `{ name, role }` | Updated team (adds coach via `$addToSet`) |
| PUT | `/:teamId/update/admin` | `{ adminId }` (must be `team-admin` role) | Updated admin field |
| PUT | `/:teamId/update/stats` | `{ matchesPlayed, wins, draws, losses, goalsFor, goalsAgainst, cleanSheets }` | Updated team |

---

### Football — Fixture — `/fixture`

#### Public Routes (No Auth)

| Method | Endpoint | Query | Returns |
|--------|----------|-------|---------|
| GET | `/` | `?status, ?limit (default 5)` | Fixtures[] (populated teams + competition) |
| GET | `/single/:fixtureId` | — | Full fixture (populated teams, competition, goalScorers, lineups, timeline, POTM, playerRatings) |
| GET | `/today` | — | Today's fixtures (scheduled/live/postponed with rescheduled date today) |
| GET | `/recent` | `?limit (default 5)` | Most recently completed fixtures |

#### Admin Routes (Yes + superAdmin)

| Method | Endpoint | Body | Returns |
|--------|----------|------|---------|
| PUT | `/:fixtureId/reschedule` | `{ postponedReason, rescheduledDate }` | Fixture (status → postponed) |

---

### Football — Live Fixture — `/live`

#### Public Routes (No Auth)

| Method | Endpoint | Returns |
|--------|----------|---------|
| GET | `/` | All live fixtures (fully populated — competition, teams, goalScorers, lineups, substitutions, timeline, POTM, playerRatings) |
| GET | `/:fixtureId` | Single live fixture (matched by `fixture` field, not `_id`) |
| GET | `/:fixtureId/players` | `{ homePlayers, awayPlayers }` (role, position, jerseyNumber per player) |

#### User Routes

| Method | Endpoint | Auth | Body | Notes |
|--------|----------|------|------|-------|
| PUT | `/:fixtureId/user/cheer/unofficial` | No | `{ team, isOfficial: false }` | Anonymous cheer |
| PUT | `/:fixtureId/user/cheeer/official` | Yes | `{ team, isOfficial: true }` | Authenticated cheer |
| PUT | `/:fixtureId/user/player-rating/submit` | No | `{ playerId, rating (1-10), isHomePlayer }` | Fan player rating |
| PUT | `/:fixtureId/user/potm/submit` | Yes | `{ playerId }` | POTM vote (available after 70 min) |

#### Admin Routes

| Method | Endpoint | Auth | Body | Notes |
|--------|----------|------|------|-------|
| POST | `/` | Yes + superAdmin | `{ fixtureId, adminId }` | Initializes live fixture, sets fixture status → live |
| POST | `/:fixtureId/end` | Yes + superAdmin | — | Ends fixture: updates fixture doc, standings, player stats, team stats, competition stats, deletes live fixture |
| PUT | `/:fixtureId/status/update` | Yes + `hasLiveFixturePermissions` | `{ status }` | LiveStatus update |
| PUT | `/:fixtureId/stats/update` | Yes + `hasLiveFixturePermissions` | `{ stats: { home, away } }` | Match statistics |
| PUT | `/:fixtureId/lineups/update` | Yes + `hasLiveFixturePermissions` | `{ lineups: { home, away } }` | Lineups |
| PUT | `/:fixtureId/score/update` | Yes + `hasLiveFixturePermissions` | `{ homeScore?, awayScore?, isHalftime?, homePenalty?, awayPenalty? }` | Score |
| PUT | `/:fixtureId/general/update` | Yes + `hasLiveFixturePermissions` | `{ weather?, attendance?, referee?, kickoff?, stream? }` | General info |
| PUT | `/:fixtureId/time/update` | Yes + `hasLiveFixturePermissions` | `{ regularTime, injuryTime? }` | Match clock |
| PUT | `/:fixtureId/timeline/add` | Yes + `hasLiveFixturePermissions` | `{ event: FixtureTimeline }` | Add timeline event |
| PUT | `/:fixtureId/timeline/edit` | Yes + `hasLiveFixturePermissions` | `{ eventId, type?, team?, player?, relatedPlayer?, minute?, injuryTime?, description?, goalType?, cardType? }` | Edit timeline event |
| PUT | `/:fixtureId/timeline/delete` | Yes + `hasLiveFixturePermissions` | `{ eventId }` | Delete timeline event |
| PUT | `/:fixtureId/substitution/add` | Yes + `hasLiveFixturePermissions` | `{ team, playerOutId, playerInId, minute, injury, injuryTime? }` | Add substitution + timeline event |
| PUT | `/:fixtureId/substitution/edit` | Yes + `hasLiveFixturePermissions` | `{ substitutionId, updates }` | Edit substitution |
| PUT | `/:fixtureId/substitution/delete` | Yes + `hasLiveFixturePermissions` | `{ substitutionId }` | Remove substitution |
| PUT | `/:fixtureId/goalscorer/add` | Yes + `hasLiveFixturePermissions` | `{ playerId, teamId, time, goalType? }` | Add goal scorer + timeline event |
| PUT | `/:fixtureId/goalscorer/delete` | Yes + `hasLiveFixturePermissions` | `{ goalScorerId }` | Remove goal scorer |
| PUT | `/:fixtureId/admin/potm/submit` | Yes + `hasRatingPermissions` | `{ playerId }` | Set official POTM |
| PUT | `/:fixtureId/admin/player-rating/submit` | Yes + `hasRatingPermissions` | `{ ratings: [{ playerId, isHomePlayer, rating (0-10), stats? }] }` | Set official player ratings |

---

### Football — Player — `/player`

#### Public Routes (No Auth)

| Method | Endpoint | Returns |
|--------|----------|---------|
| GET | `/details/:playerId` | Player (populated dept, competitionStats.competition, teams.team) |

#### Admin Routes

| Method | Endpoint | Auth | Body | Returns |
|--------|----------|------|------|---------|
| GET | `/suggested` | Yes + `hasTeamPermissions` | `?teamId, ?limit, ?page` | `{ team, suggestedPlayers }` (players eligible for the team based on type) |
| POST | `/register/verified` | Yes + superAdmin | `{ name, department, admissionYear, preferredFoot?, height?, weight? }` | Player (`verificationStatus: verified`) |
| POST | `/register/unverified` | Yes + `hasTeamPermissions` | `{ name, department, admissionYear }` | Player (`verificationStatus: pending`) |
| PUT | `/:playerId/update` | Yes + superAdmin | `{ name?, admissionYear?, preferredFoot?, height?, weight?, clubStatus?, marketValue? }` | Player |
| PUT | `/:playerId/verify-registration` | Yes + superAdmin | `{ status: 'verified' | 'rejected', reason? }` | Player |
| PUT | `/:playerId/team-registration` | Yes + `hasTeamPermissions` | `{ teamId, role?, position?, jerseyNumber? }` | Player (also adds to team.players) |

---

### Football — Admin — `/admin`

| Method | Endpoint | Auth | Returns |
|--------|----------|------|---------|
| GET | `/all` | Yes + superAdmin | All non-user accounts |
| GET | `/media` | Yes + `isHeadMediaAdmin` | Users with `media-admin` or `head-media-admin` role |
| GET | `/live-fixture` | Yes + superAdmin | Users with `live-fixture-admin` role |

---

### Basketball — Player — `/basketball/player`

| Method | Endpoint | Auth | Body / Query | Returns |
|--------|----------|------|--------------|---------|
| GET | `/` | No | `?limit, ?page, ?academicYear, ?departmentId, ?preferredHand, ?position` | `{ page, limit, total, players }` |
| GET | `/:playerId` | No | — | Player (populated dept, seasonStats, careerStats, contracts) |
| POST | `/register/verified` | Yes + superAdmin | Multipart: `{ name, admissionYear, departmentId, weight, height, nationality, preferredHand, position }` + image file | Player (image uploaded to Cloudinary) |
| PUT | `/:playerId/update` | Yes + superAdmin | `{ name?, admissionYear?, nationality?, preferredHand?, position?, height?, weight? }` | Player |
| PUT | `/:playerId/update/image` | Yes + superAdmin | Multipart: image file | Player |
| PUT | `/:playerId/contracts/sign` | Yes + superAdmin | `{ teamId, startDate, endDate?, contractType, jerseyNumber }` | Contract (previous contract ended if overlapping) |
| PUT | `/:playerId/contracts/extend` | Yes + superAdmin | `{ endDate, jerseyNumber? }` | Updated contract |

**Player Positions:** `PG`, `SG`, `SF`, `PF`, `C`  
**Preferred Hands:** `left`, `right`, `ambidextrous`  
**Contract Types:** `permanent`, `on-loan`, `trial`

---

### Basketball — Team — `/basketball/team`

| Method | Endpoint | Auth | Body / Params | Returns |
|--------|----------|------|---------------|---------|
| GET | `/` | No | `?limit, ?page, ?academicYear, ?type, ?departmentId, ?facultyId` | `{ page, limit, total, teams }` |
| GET | `/:playerId` | No | — | Team (populated dept/faculty) |
| GET | `/:playerId/players` | No | — | Team players (populated with dept name) |
| POST | `/` | Yes + superAdmin | Multipart: `{ name, shorthand, type, academicYear, departmentId?, facultyId?, primaryColor?, secondaryColor? }` + image (logo) | Team |
| DELETE | `/:teamId` | Yes + superAdmin | — | null |
| PUT | `/:teamId/update` | Yes + superAdmin | `{ name?, shorthand?, academicYear?, primaryColor?, secondaryColor?, coaches? }` | Team |
| PUT | `/:teamId/update/logo` | Yes + superAdmin | Multipart: image file | Updated logo |
| PUT | `/:teamId/update/admin` | Yes + superAdmin | `{ adminId }` (must be `team-admin` role) | Updated admin |

---

### Views — Admin Dashboard — `/views`

| Method | Endpoint | Auth | Returns |
|--------|----------|------|---------|
| GET | `/media-admin/dashboard` | Yes + `isHeadMediaAdmin` | `{ totalBlogs, totalHeadMediaAdmins, totalMediaAdmins, totalPublishedBlogs, totalUnverifiedBlogs, totalPendingPOTM }` |
| GET | `/media-admin/potm-fixtures` | Yes + `isHeadMediaAdmin` | `{ pendingLivePOTM, pendingFixturePOTM }` (fixtures from last 7 days missing official POTM) |
| GET | `/super-admin/dashboard/football` | Yes + superAdmin | `{ totalTeams, totalCompetitions, totalPlayers, totalFixtures, totalLiveFixtures, totalUnverifiedPlayers, totalActiveCompetitions, totalAdminCount, auditLogs (last 10) }` |

---

### Views — Homepage / Public Pages — `/views/pages`

| Method | Endpoint | Auth | Returns |
|--------|----------|------|---------|
| GET | `/homepage` | No | `{ football: { totalCompetitions, totalTeams, totalUpcomingFixtures }, basketball: {}, general: { totalCompetitions, totalTeams, totalPlayedFixtures, totalActiveCompetitions }, fixtures: { latest (5) }, blogs: { total, latest (5) } }` |
| GET | `/competition` | No | `{ general: { totalUpcomingFixtures, totalCompetitions, totalCompletedCompetitions }, football: { activeCompetitions: { total, list } }, basketball: {} }` |
| GET | `/competition/football` | No | `{ competitionFixturesCount, liveCompetitionFixturesCount, allCompetitions, allActiveCompetitions, featuredCompetitions }` (with populated league tables and top scorers) |

---

## 📡 WebSocket Events (Socket.IO)

All events are scoped to **fixture rooms** (the original `fixture._id`, not the live fixture's `_id`).

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `joinMatch` | `matchId` (string) | Join a fixture room |
| `disconnect` | — | Leave all rooms |

### Server → Client

All events emit to the fixture's room ID:

| Event | Payload | Description |
|-------|---------|-------------|
| `score-update` | `FixtureResult` | Score or penalty update |
| `minute-update` | `{ minute, injuryTime? }` | Match clock tick |
| `timeline-update` | Single `FixtureTimeline` event | New or updated timeline event |
| `statistics-update` | `{ home: FixtureStat, away: FixtureStat }` | Match stats update |
| `status-update` | `LiveStatus` string | Match status change (e.g. `half-time`, `2nd-half`) |
| `general-update` | `{ weather?, attendance?, referee?, kickoffTime?, updatedAt }` | General fixture info |
| `cheer-update` | `FixtureCheerMeter` | Fan cheer counts |
| `potm-update` | `FixturePlayerOfTheMatch` | POTM votes update |
| `substitution-update` | Single `FixtureSubstitutions` event | New substitution |
| `goalscorer-update` | `goalScorers[]` | Full updated goal scorers array |

### Connection Example

```javascript
const socket = io('https://your-api.com');
socket.emit('joinMatch', 'fixtureId123');

socket.on('score-update', (result) => console.log('Score:', result));
socket.on('minute-update', ({ minute, injuryTime }) => console.log(`${minute}'`));
socket.on('timeline-update', (event) => console.log('Event:', event.type));
```

---

## 🗃️ Data Models

### User

```typescript
interface IV2User {
  _id: ObjectId;
  name: string;
  email: string;             // unique
  password: string;          // bcrypt, salt rounds 12
  role: 'user' | 'super-admin' | 'media-admin' | 'head-media-admin' | 'competition-admin' | 'team-admin' | 'live-fixture-admin';
  sport: 'football' | 'basketball' | 'volleyball' | 'all' | null;
  status: 'active' | 'inactive' | 'suspended';
  otp: string | null;
  otpExpiresAt: Date | null;
  lastLogin: Date | null;
  passwordChangedAt: Date | null;
  preferences: {
    notifications: {
      inApp: boolean;    // default: true
      email: boolean;    // default: false
    };
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### Notification

```typescript
interface IV2Notification {
  _id: ObjectId;
  recipient: ObjectId;   // ref: V2User
  title: string;
  message: string;
  date: Date;
  read: boolean;         // default: false
  createdAt: Date;
  updatedAt: Date;
}
```

### Blog

```typescript
interface IV2Blog {
  _id: ObjectId;
  author: ObjectId;      // ref: V2User
  category: 'football' | 'basketball' | 'chesss' | 'volleyball' | 'athletics' | 'general';
  title: string;
  content: string;
  coverImage?: string;
  isReviewed: boolean;   // default: false (auto-true for headMediaAdmin)
  isPublished: boolean;  // default: false
  views: number;         // default: 0, incremented on GET
  createdAt: Date;
  updatedAt: Date;
}
```

### Highlight

```typescript
interface IV2Highlight {
  _id: ObjectId;
  author: ObjectId;   // ref: V2User
  title: string;
  sport: string;
  views: number;      // default: 0
  createdAt: Date;
  updatedAt: Date;
}
```

### Faculty

```typescript
interface IV2Faculty {
  _id: ObjectId;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Department

```typescript
interface IV2Department {
  _id: ObjectId;
  name: string;
  faculty: ObjectId;   // ref: V2Faculty
  createdAt: Date;
  updatedAt: Date;
}
```

### Audit Log

```typescript
interface IV2AuditLog {
  _id: ObjectId;
  userId: ObjectId;        // ref: V2User
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT';
  entity: string;          // e.g. 'V2FootballCompetition', 'V2FootballPlayer'
  entityId: ObjectId;
  details: object;
  previousValues: object;
  newValues: object;
  ipAddress: string;
  userAgent: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Football Competition

```typescript
interface IV2FootballCompetition {
  _id: ObjectId;
  name: string;           // unique
  shorthand: string;
  type: 'league' | 'knockout' | 'hybrid';
  logo?: string;
  coverImage?: string;
  description?: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'canceled';
  isActive: boolean;      // default: true
  isFeatured?: boolean;
  season: string;
  startDate: Date;
  endDate: Date;
  registrationDeadline?: Date;
  currentStage?: string;  // set to 'registration-phase' on create
  admin: ObjectId;        // ref: V2User

  format: {
    groupStage?: { numberOfGroups, teamsPerGroup, advancingPerGroup };
    knockoutStage?: { hasTwoLegs, awayGoalsRule };
    leagueStage?: { matchesPerTeam, pointsSystem: { win, draw, loss } };
  };

  teams: Array<{
    team: ObjectId;
    squad: Array<{ player: ObjectId; jerseyNumber: number; isCaptain: boolean; position: string }>;
  }>;

  leagueTable: Array<{
    team: ObjectId;
    played: number; points: number; disciplinaryPoints: number;
    wins: number; losses: number; draws: number;
    goalsFor: number; goalsAgainst: number; goalDifference: number;
    form: string[]; position: number;
  }>;

  knockoutRounds: Array<{
    name: string;
    fixtures: ObjectId[];
    completed: boolean;
  }>;

  groupStage: Array<{
    name: string;
    standings: LeagueStandings[];
    fixtures: ObjectId[];
    qualificationRules: Array<{ position, destination, knockoutRound?, isBestLoserCandidate? }>;
    qualifiedTeams: Array<{ team, originalPosition, qualifiedAs, destination }>;
  }>;

  stats: {
    averageGoalsPerMatch: number; averageAttendance: number; cleanSheets: number;
    topScorers: Array<{ player, team, goals, penalties }>;
    topAssists: Array<{ player, team, assists }>;
    bestDefenses: Array<{ team, cleanSheets, goalsConceded }>;
  };

  awards: {
    player: Array<{ name: string; winner: { player, team } | null }>;
    team: Array<{ name: string; winner: ObjectId | null }>;
  };

  rules: {
    substitutions: { allowed: boolean; maximum: number };  // defaults: true, 5
    extraTime: boolean;    // default: false
    penalties: boolean;    // default: false
    matchDuration: { normal: number; extraTime?: number };  // default: 90
    squadSize: { min: number; max: number };  // defaults: 7, 23
  };

  extraRules: Array<{ title, description, lastUpdated }>;
  sponsors: Array<{ name, logo: string | null, tier: 'title' | 'gold' | 'silver' | 'bronze' | 'other' }>;
  prizeMoney?: { champion: number; runnerUp: number };

  createdAt: Date;
  updatedAt: Date;
}
```

### Football Fixture

```typescript
interface IV2FootballFixture {
  _id: ObjectId;
  competition?: ObjectId;      // ref: V2FootballCompetition
  homeTeam: ObjectId;          // ref: V2FootballTeam
  awayTeam: ObjectId;          // ref: V2FootballTeam
  matchType: 'friendly' | 'competition';  // default: competition
  stadium?: string;

  scheduledDate: Date;
  status: 'scheduled' | 'live' | 'completed' | 'postponed' | 'canceled';  // default: scheduled
  postponedReason?: string;
  rescheduledDate?: Date;
  isDerby: boolean;            // default: false

  result: {
    homeScore: number; awayScore: number;
    halftimeHomeScore: number | null; halftimeAwayScore: number | null;
    homePenalty: number | null; awayPenalty: number | null;
    winner?: 'home' | 'away' | 'draw';  // auto-calculated on save when completed
  };

  goalScorers: Array<{ player: ObjectId; team: ObjectId; time: number }>;

  statistics: {
    home: { shotsOnTarget, shotsOffTarget, fouls, yellowCards, redCards, offsides, corners, possessionTime };
    away: { /* same */ };
  };

  lineups: {
    home: { startingXI: Array<{ player, position, shirtNumber, isCaptain }>, substitutes: Array<{ player, position, shirtNumber }>, formation?, coach? };
    away: { /* same */ };
  };

  substitutions: Array<{ team, playerOut, playerIn, minute, injury }>;
  timeline: Array<{ type, team, player, relatedPlayer?, minute, injuryTime?, description, goalType?, cardType? }>;
  commentary: Array<{ minute, injuryTime, type, text, eventId }>;

  playerOfTheMatch: {
    official?: ObjectId;
    fanVotes: Array<{ player, votes }>;
    userVotes: Array<{ userId, playerId, timestamp }>;
  };

  playerRatings: Array<{
    player: ObjectId; team: 'home' | 'away';
    official?: { rating: number (0-10), ratedBy: ObjectId };
    fanRatings: { average: number, count: number, distribution: { '1'..'10': number } };
    stats?: { goals, assists, shots, passes, tackles, saves };
  }>;

  referee?: string;
  attendance?: number;
  weather?: { condition, temperature };
  highlights: Array<{ platform, url, isOfficial, requiresSubscription }>;
  odds?: { preMatch: { homeWin, draw, awayWin, overUnder[] }, live: { updatedAt, homeWin, draw, awayWin, overUnder[] } };

  createdAt: Date;
  updatedAt: Date;
}
```

### Football Live Fixture

```typescript
interface IV2FootballLiveFixture {
  _id: ObjectId;
  fixture: ObjectId;           // ref: V2FootballFixture
  competition?: ObjectId;
  homeTeam: ObjectId;
  awayTeam: ObjectId;
  matchType: 'friendly' | 'competition';
  stadium?: string;
  matchDate: Date;
  kickoffTime?: Date;
  referee?: string;

  status: 'pre-match' | '1st-half' | 'half-time' | '2nd-half' | 'extra-time' | 'penalties' | 'finished' | 'postponed' | 'abandoned';
  currentMinute: number;  // default: 0
  injuryTime: number;     // default: 0

  result: {
    homeScore: number; awayScore: number;
    halftimeHomeScore: number | null; halftimeAwayScore: number | null;
    homePenalty: number | null; awayPenalty: number | null;
  };

  goalScorers: Array<{ player, team, time }>;
  statistics: { home: FixtureStat, away: FixtureStat };
  lineups: { home: FixtureLineup, away: FixtureLineup };
  substitutions: FixtureSubstitutions[];
  timeline: FixtureTimeline[];
  commentary: FixtureCommentary[];
  streamLinks: Array<{ platform, url, isOfficial, requiresSubscription }>;

  cheerMeter: {
    official: { home: number, away: number };
    unofficial: { home: number, away: number };
    userVotes: Array<{ userId, team, isOfficial, timestamp }>;
  };

  playerOfTheMatch: {
    official?: ObjectId;
    fanVotes: Array<{ player, votes }>;
    userVotes: Array<{ userId, playerId, timestamp }>;
  };

  playerRatings: FixturePlayerRatings[];
  odds?: FixtureOdds;
  attendance?: number;
  weather?: { condition, temperature, humidity };
  admin: ObjectId;   // ref: V2User (live-fixture-admin)

  createdAt: Date;
  updatedAt: Date;
}
```

### Football Player

```typescript
interface IV2FootballPlayer {
  _id: ObjectId;
  name: string;
  department: ObjectId;    // ref: V2Department
  admissionYear: string;

  teams: Array<{
    team: ObjectId;        // ref: V2FootballTeam
    role: 'player' | 'captain' | 'vice-captain';
    position: string;
    jerseyNumber: number;
    isActive: boolean;
    joinedAt: Date;
  }>;

  careerStats: { appearances, goals, assists, cleanSheets, yellowCards, redCards, motmAwards };

  seasonalStats: Array<{
    academicYear: string;
    team: ObjectId;
    stats: { appearances, goals, assists, cleanSheets, yellowCards, redCards, motmAwards };
  }>;

  competitionStats: Array<{
    competition: ObjectId;
    season: string;
    team: ObjectId;
    appearances, goals, assists, yellowCards, redCards, minutesPlayed: number;
  }>;

  clubStatus?: 'registered' | 'on-loan' | 'transferred-out';
  loanDetails?: { fromClub, toTeam, startDate, endDate, terms };
  marketValue?: number;

  preferredFoot?: 'left' | 'right' | 'both';
  height?: number;
  weight?: number;

  createdBy: ObjectId;
  verificationStatus: 'pending' | 'verified' | 'rejected';  // default: pending
  verifiedBy?: ObjectId;
  eligibleTeams: ObjectId[];  // auto-populated on create based on department + admissionYear

  createdAt: Date;
  updatedAt: Date;
}
```

### Football Team

```typescript
interface IV2FootballTeam {
  _id: ObjectId;
  name: string;
  shorthand: string;
  type: 'departmental-level' | 'departmental-general' | 'faculty-general' | 'level-general' | 'school-general' | 'club';
  academicYear: string;
  department?: ObjectId;  // required for departmental types
  faculty?: ObjectId;     // required for faculty-general

  coaches: Array<{ name: string; role: 'head' | 'assistant' | 'goalkeeping' | 'fitness' }>;
  players: ObjectId[];    // ref: V2FootballPlayer

  friendlyRequests: Array<{
    requestId: ObjectId;
    team: ObjectId;
    status: 'pending' | 'accepted' | 'rejected';
    proposedDate: Date;
    message: string;
    type: 'recieved' | 'sent';
    createdAt: Date;
  }>;

  competitionPerformance: Array<{
    competition: ObjectId;
    season: string;
    stats: { played, wins, draws, losses, goalsFor, goalsAgainst, cleanSheets };
    achievements: string[];
  }>;

  stats: { matchesPlayed, wins, draws, losses, goalsFor, goalsAgainst, cleanSheets };

  logo?: string;
  colors?: { primary: string; secondary: string };
  admin?: ObjectId;

  createdAt: Date;
  updatedAt: Date;
}
```

### Basketball Player

```typescript
interface IV2BasketballPlayer {
  _id: ObjectId;
  name: string;
  admissionYear: string;
  department: ObjectId;
  weight: number;
  height: number;
  nationality: string;
  preferredHand: 'left' | 'right' | 'ambidextrous';
  position: 'PG' | 'SG' | 'SF' | 'PF' | 'C';
  photo: string;       // Cloudinary URL
  marketValue?: number;
  contracts: ObjectId[];           // ref: V2BasketballPlayerContract
  careerStats: ObjectId;           // ref: V2BasketballPlayerCareerStat
  seasonStats: ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Basketball Team

```typescript
interface IV2BasketballTeam {
  _id: ObjectId;
  name: string;
  shorthand: string;
  type: TeamTypes;       // same enum as football teams
  academicYear: string;
  department?: ObjectId;
  faculty?: ObjectId;
  logo: string;          // Cloudinary URL
  colors?: { primary: string; secondary: string };
  coaches: Array<{ name, role }>;
  players: ObjectId[];
  admin?: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 📊 Response Format

```json
// Success
{ "code": "00", "message": "Operation successful", "data": { ... } }

// Error (4xx)
{ "code": "99", "message": "Error description" }

// Server Error (5xx)
{ "message": "Error message from catch block" }
```

---

## ⚙️ Middleware Reference

| Middleware | Location | Description |
|------------|----------|-------------|
| `authenticateUser` | `authMiddleware.ts` | Validates JWT from `authToken` cookie, attaches `req.user: { userId, email, role }` |
| `isSuperAdmin` | `adminMiddleware.ts` | Requires `super-admin` role |
| `isHeadMediaAdmin` | `adminMiddleware.ts` | Requires `head-media-admin` role |
| `isMediaAdmin` | `adminMiddleware.ts` | Requires `media-admin` or `head-media-admin` role |
| `isLiveFixtureAdmin` | `adminMiddleware.ts` | Requires `live-fixture-admin` role |
| `hasSignUpPermissions` | `adminMiddleware.ts` | Checks if user can register other admins |
| `hasTeamPermissions` | `adminMiddleware.ts` | Checks if user is the admin of the team in question |
| `hasLiveFixturePermissions` | `adminMiddleware.ts` | Checks if user has live match update permissions |
| `hasRatingPermissions` | `adminMiddleware.ts` | Checks if user can submit official ratings/POTM |
| `hasGeneralBlogPermissions` | `adminMiddleware.ts` | Checks if user can create/edit blogs |
| `singleImageUpload` | `cloudinaryUtils.ts` | Multer multipart handler for single image |
| `auditInfo` (global) | `server.ts` | Attaches `req.auditInfo: { ipAddress, timestamp, route, method, userAgent }` to all requests |

---

## 🔤 Constants Reference

### User Roles
```typescript
enum UserRole {
  USER = 'user',
  SUPER_ADMIN = 'super-admin',
  MEDIA_ADMIN = 'media-admin',
  HEAD_MEDIA_ADMIN = 'head-media-admin',
  COMPETITION_ADMIN = 'competition-admin',
  TEAM_ADMIN = 'team-admin',
  LIVE_FIXTURE_ADMIN = 'live-fixture-admin'
}
```

### Sport Types
```typescript
enum SportType { FOOTBALL = 'football', BASKETBALL = 'basketball', VOLLEYBALL = 'volleyball', ALL = 'all' }
```

### User Status
```typescript
enum UserStatus { ACTIVE = 'active', INACTIVE = 'inactive', SUSPENDED = 'suspended' }
```

### Fixture Status
```typescript
enum FixtureStatus { SCHEDULED = 'scheduled', LIVE = 'live', COMPLETED = 'completed', POSTPONED = 'postponed', CANCELED = 'canceled' }
```

### Live Match Status
```typescript
enum LiveStatus {
  PREMATCH = 'pre-match', FIRSTHALF = '1st-half', HALFTIME = 'half-time',
  SECONDHALF = '2nd-half', EXTRATIME = 'extra-time', PENALTIES = 'penalties',
  FINISHED = 'finished', POSTPONED = 'postponed', ABANDONED = 'abandoned'
}
```

### Competition Types
```typescript
enum CompetitionTypes { LEAGUE = 'league', KNOCKOUT = 'knockout', HYBRID = 'hybrid' }
```

### Team Types
```typescript
enum TeamTypes {
  DEPARTMENT_LEVEL = 'departmental-level',   // e.g. CS 100L
  DEPARTMENT_GENERAL = 'departmental-general', // e.g. CS Dept
  FACULTY_GENERAL = 'faculty-general',
  LEVEL_GENERAL = 'level-general',
  SCHOOL_GENERAL = 'school-general',
  CLUB = 'club'
}
```

### Timeline Event Types
```typescript
enum FixtureTimelineType {
  GOAL = 'goal', YELLOWCARD = 'yellow-card', REDCARD = 'red-card',
  SUBSTITUTION = 'substitution', CORNER = 'corner', OFFSIDE = 'offside',
  PENALTYAWARDED = 'penalty-awarded', PENALTYMISSED = 'penalty-missed',
  PENALTYSAVED = 'penalty-saved', OWNGOAL = 'own-goal',
  VARDECISION = 'var-decision', INJURY = 'injury'
}
```

### Goal Types
```typescript
enum FixtureTimelineGoalType { REGULAR = 'regular', PENALTY = 'penalty', FREEKICK = 'free-kick', HEADER = 'header', OWNGOAL = 'own-goal' }
```

### Card Types
```typescript
enum FixtureTimelineCardType { FIRSTYELLOW = 'first-yellow', SECONDYELLOW = 'second-yellow', STRAIGHTRED = 'straight-red' }
```

### Audit Log Actions
```typescript
enum LogAction { CREATE = 'CREATE', UPDATE = 'UPDATE', DELETE = 'DELETE', LOGIN = 'LOGIN', LOGOUT = 'LOGOUT' }
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB
- Gmail account (for OTP/notification emails)
- Cloudinary account (for image uploads)

### Installation

```bash
git clone <repository-url>
cd fupre-sports-media-api
npm install
```

### Environment Variables

```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/fupre-sports

# Auth
JWT_SECRET=your-super-secret-key

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# Email (Gmail)
NODEMAILER_USER=your-gmail@gmail.com
NODEMAILER_PASSWORD=your-gmail-app-password

# OTP
OTP_EXPIRATION=600        # seconds (10 minutes)

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Run

```bash
# Development
npm run dev

# Build
npm run build:v2

# Production
npm run start:v2
```

**API Docs:** `http://localhost:PORT/api-docs`

---

## 📄 License

MIT License — see [LICENSE](./LICENSE) for details.

---

<p align="center">Built for Fupre Sports Media &nbsp;·&nbsp; Node.js + TypeScript + MongoDB</p>