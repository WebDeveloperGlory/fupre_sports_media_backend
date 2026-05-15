# Fupre Sports Media API

A dual-version REST API for sports media management, supporting football teams, fixtures, competitions, player statistics, TOTS voting, and a multi-role admin system.

**Built with:** Node.js · Express · MongoDB (Mongoose) · JWT · Socket.io · JavaScript (v1) · TypeScript (v2)

---

## Table of Contents

- [Fupre Sports Media API](#fupre-sports-media-api)
  - [Table of Contents](#table-of-contents)
  - [Project Structure](#project-structure)
  - [Tech Stack](#tech-stack)
  - [Installation \& Setup](#installation--setup)
    - [Scripts](#scripts)
  - [Environment Variables](#environment-variables)
  - [Authentication \& Roles](#authentication--roles)
    - [V1 Roles](#v1-roles)
    - [V1.2 Roles](#v12-roles)
  - [Response Format](#response-format)
    - [Success](#success)
    - [Error](#error)
    - [Paginated (v1.2)](#paginated-v12)
  - [V1 Routes (`/api`)](#v1-routes-api)
    - [Auth Routes (`/api/v1/auth`)](#auth-routes-apiv1auth)
    - [Team Routes (`/api/v1/teams`)](#team-routes-apiv1teams)
    - [Fixture Routes (`/api/v1/fixture`)](#fixture-routes-apiv1fixture)
    - [Competition Routes (`/api/v1/competition`)](#competition-routes-apiv1competition)
    - [Live Fixture Routes (`/api/v1/live-fixtures`)](#live-fixture-routes-apiv1live-fixtures)
    - [Player Routes (`/api/v1/player`)](#player-routes-apiv1player)
    - [TOTS Routes (`/api/v1/tots`)](#tots-routes-apiv1tots)
    - [Admin Routes (`/api/v1/admin`)](#admin-routes-apiv1admin)
    - [General Routes (`/api/v1/general`)](#general-routes-apiv1general)
  - [V1.2 Routes (`/api/v1.2`)](#v12-routes-apiv12)
    - [Authentication Routes (`/api/v1.2/authentication`)](#authentication-routes-apiv12authentication)
    - [User Routes (`/api/v1.2/user`)](#user-routes-apiv12user)
    - [Notification Routes (`/api/v1.2/notification`)](#notification-routes-apiv12notification)
    - [Audit Log Routes (`/api/v1.2/audit`)](#audit-log-routes-apiv12audit)
    - [Football Player Routes (`/api/v1.2/football/player`)](#football-player-routes-apiv12footballplayer)
    - [Football Fixture Routes (`/api/v1.2/football/fixture`)](#football-fixture-routes-apiv12footballfixture)
    - [Football Team Routes (`/api/v1.2/football/team`)](#football-team-routes-apiv12footballteam)
    - [Football Competition Routes (`/api/v1.2/football/competition`)](#football-competition-routes-apiv12footballcompetition)
    - [Football TOTS Routes (`/api/v1.2/football/tots`)](#football-tots-routes-apiv12footballtots)
    - [View Routes (`/api/v1.2/views`)](#view-routes-apiv12views)
  - [Entity Schemas](#entity-schemas)
    - [Core Entities](#core-entities)
    - [V1 User](#v1-user)
    - [V1.2 User](#v12-user)
    - [V1.2 FootballPlayer (abbreviated)](#v12-footballplayer-abbreviated)
    - [V1.2 FootballCompetition (abbreviated)](#v12-footballcompetition-abbreviated)
  - [Constants Reference](#constants-reference)
    - [V1 Roles](#v1-roles-1)
    - [V1.2 Roles](#v12-roles-1)
    - [Fixture Types / Status](#fixture-types--status)
    - [Competition Types / Formats](#competition-types--formats)
    - [Match Event Types](#match-event-types)
    - [Player Positions](#player-positions)
    - [Club Status](#club-status)
    - [Knockout Fixture Formats](#knockout-fixture-formats)
  - [Error Codes](#error-codes)
    - [Common Error Messages](#common-error-messages)
  - [Middleware Reference](#middleware-reference)
  - [WebSocket Events (V2)](#websocket-events-v2)
    - [Client → Server](#client--server)
    - [Server → Client](#server--client)
  - [API Documentation](#api-documentation)

---

## Project Structure

```
fupre-sports-media-api/
├── app/
│   ├── v1/                      # JavaScript version
│   │   ├── config/
│   │   │   ├── db.js
│   │   │   ├── env.js
│   │   │   └── swagger.js
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── server.js
│   │
│   └── v2/                      # TypeScript version
│       ├── controllers/
│       ├── models/
│       ├── routes/
│       ├── services/
│       └── server.ts
│
├── dist/                        # Compiled TypeScript (v2)
├── index.js                     # Main entry point
├── package.json
└── tsconfig.json
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB with Mongoose ODM |
| Authentication | JWT (HTTP-only cookies) |
| Documentation | Swagger / OpenAPI |
| WebSockets | Socket.io (v2) |
| Language | JavaScript (v1) + TypeScript (v2) |

---

## Installation & Setup

```bash
# Clone repository
git clone <repository-url>
cd fupre-sports-media-api

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Run V1 (JavaScript)
npm run start:v1

# Build and run V2 (TypeScript)
npm run build:v2
npm run start:v2

# Run both versions
npm start

# Development mode (with auto-reload)
npm run dev
```

### Scripts

| Script | Description |
|---|---|
| `npm start` | Run both v1 and v2 |
| `npm run start:v1` | Run v1 only |
| `npm run start:v2` | Run compiled v2 |
| `npm run build:v2` | Compile TypeScript |
| `npm run dev` | Development with nodemon |
| `npm test` | Run tests |

---

## Environment Variables

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/fupre-sports
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=24h
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
```

---

## Authentication & Roles

Authentication is JWT-based, delivered via HTTP-only cookie on login. All protected routes require a valid cookie.

### V1 Roles

| Role | Permissions |
|---|---|
| `super-admin` | Full access — create/delete users, manage all competitions and teams |
| `competition-admin` | Manage assigned competitions, fixtures, and standings |
| `team-admin` | Manage team squad, friendly requests, view team stats |
| `live-match-admin` | Update live match events and statistics |

### V1.2 Roles

| Role | Permissions |
|---|---|
| `superAdmin` | Full system access |
| `headMediaAdmin` | Top-level media administration |
| `mediaAdmin` | General media administration |
| `sportAdmin` | Manage competitions and fixtures for assigned sport |
| `user` | Authenticated user — can vote in TOTS, view content |

**Authentication flow:**
1. `POST /login` → JWT issued as HTTP-only cookie
2. Subsequent requests automatically include cookie
3. Middleware validates token and attaches `req.user`
4. `authorize()` middleware restricts access by role

---

## Response Format

### Success
```json
{
  "code": "00",
  "message": "Operation successful",
  "data": {}
}
```

### Error
```json
{
  "code": "99",
  "message": "Error description"
}
```

### Paginated (v1.2)
```json
{
  "code": "00",
  "message": "Data retrieved",
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

---

## V1 Routes (`/api`)

### Auth Routes (`/api/v1/auth`)

| Method | Endpoint | Auth | Parameters | Body | Returns |
|---|---|---|---|---|---|
| GET | `/` | Yes (super-admin) | — | — | `data: User[]` |
| POST | `/register` | No | — | `{ name, email, password, role }` | `data: { id, email, role }` |
| POST | `/login` | No | — | `{ email, password }` | JWT cookie |
| POST | `/logout` | Yes | — | — | Clears cookie |
| GET | `/:userId` | No | `userId` | — | `data: User + nextFixtures` |
| DELETE | `/:userId` | Yes (super-admin) | `userId` | — | `data: deletedUser` |

---

### Team Routes (`/api/v1/teams`)

| Method | Endpoint | Auth | Parameters | Query | Body | Returns |
|---|---|---|---|---|---|---|
| GET | `/` | No | — | — | — | `data: Team[]` |
| POST | `/` | Yes (super-admin) | — | — | `{ name, shorthand, department, level }` | `data: createdTeam` |
| GET | `/overview` | No | — | — | — | `data: { overview, teams, featuredTeams }` |
| GET | `/:teamId` | No | `teamId` | — | — | `data: team` |
| GET | `/:teamId/overview` | No | `teamId` | — | — | `data: { info, competitions, recentPerformance, nextFixture, topStats }` |
| GET | `/:teamId/fixtures` | No | `teamId` | — | — | `data: groupedFixtures[]` |
| GET | `/:teamId/stats` | No | `teamId` | — | — | `data: [{ title, data }]` |
| GET | `/:teamId/players` | No | `teamId` | — | — | `data: { coach, assistantCoach, captain, players[] }` |
| PUT | `/:teamId/players` | Yes (team-admin) | `teamId` | — | `{ players[] }` | `data: updatedTeam` |
| GET | `/:teamId/friendly-request` | Yes (team-admin) | `teamId` | — | — | `data: friendlyRequests[]` |
| POST | `/:teamId/friendly-request` | Yes (team-admin) | `teamId` | — | `{ date, location, recipientTeamId }` | `data: request` |
| PUT | `/:teamId/friendly-request/:requestId` | Yes (team-admin) | `teamId, requestId` | — | `{ status }` | `data: updatedRequests` |
| GET | `/:teamId/competition-invitation` | Yes (team-admin) | `teamId` | — | — | `data: competitionInvitations[]` |
| PUT | `/:teamId/competition-invitation/:competitionId` | Yes (team-admin) | `teamId, competitionId` | — | `{ status }` | `data: updatedInvitations` |
| PATCH | `/:teamId/admin` | Yes (super-admin) | `teamId` | — | `{ userId }` | `data: updatedTeam` |

---

### Fixture Routes (`/api/v1/fixture`)

| Method | Endpoint | Auth | Parameters | Query | Body | Returns |
|---|---|---|---|---|---|---|
| GET | `/` | No | — | `limit, filterBy, completed, live, upcoming, startDate` | — | `data: Fixture[]` |
| POST | `/` | Yes (super-admin) | — | — | `{ homeTeam, awayTeam, type, date, stadium, competition }` | `data: createdFixture` |
| GET | `/:fixtureId` | No | `fixtureId` | — | — | `data: fixture (populated)` |
| PATCH | `/:fixtureId` | Yes (super-admin) | `fixtureId` | — | `{ homeTeam?, awayTeam?, date?, stadium? }` | `data: updatedFixture` |
| GET | `/:fixtureId/form` | No | `fixtureId` | — | — | `data: { homeTeamForm, awayTeamForm, homeLastFixtures, awayLastFixtures, head2head }` |
| PUT | `/:fixtureId/result` | Yes (super-admin) | `fixtureId` | — | `{ result, statistics, matchEvents, homeSubs, awaySubs }` | `data: updatedFixture` |
| PUT | `/:fixtureId/formation` | Yes (admin roles) | `fixtureId` | — | `{ homeLineup, awayLineup }` | `data: updatedFixture` |
| GET | `/:fixtureId/player_list` | No | `fixtureId` | — | — | `data: { homeTeam, awayTeam }` |

**Query parameters for `GET /`:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `limit` | number | `10` | Number of fixtures to return |
| `filterBy` | date | — | Filter by specific date (YYYY-MM-DD) |
| `startDate` | date | — | Filter from this date onward |
| `completed` | boolean | `false` | Show only completed fixtures |
| `live` | boolean | `false` | Show only live fixtures |
| `upcoming` | boolean | `false` | Show only upcoming fixtures |

---

### Competition Routes (`/api/v1/competition`)

| Method | Endpoint | Auth | Parameters | Query | Body | Returns |
|---|---|---|---|---|---|---|
| GET | `/` | No | — | — | — | `data: Competition[]` |
| POST | `/` | Yes (super-admin) | — | — | `{ name, rules, type, description, startDate, endDate }` | `data: createdCompetition` |
| GET | `/:competitionId` | No | `competitionId` | — | — | `data: competition` |
| PATCH | `/:competitionId` | Yes (competition-admin) | `competitionId` | — | `{ name?, description?, startDate?, endDate? }` | `data: updatedCompetition` |
| PATCH | `/:competitionId/featured` | Yes (competition-admin) | `competitionId` | — | — | `data: featuredCompetition` |
| GET | `/:competitionId/overview` | No | `competitionId` | — | — | `data: { table, featuredMatches, topScorers, topAssists, leagueFacts }` |
| GET | `/:competitionId/player-stats` | No | `competitionId` | `page, limit, teamId` | — | `data: { stats, pagination }` |
| GET | `/:competitionId/team-stats` | No | `competitionId` | `statType` | — | `data: teamStats` |
| GET | `/:competitionId/top-teams` | No | `competitionId` | `statType` | — | `data: sortedStats` |
| GET | `/:competitionId/top-players` | No | `competitionId` | — | — | `data: { topScorers, topAssists, topYellowCards, topRedCards }` |
| PUT | `/:competitionId/invite-teams` | Yes (competition-admin) | `competitionId` | — | `{ teamIds[] }` | `data: { validUpdates, invalidUpdates }` |
| PUT | `/:competitionId/add-teams` | Yes (competition-admin) | `competitionId` | — | `{ teamIds[] }` | `data: { validUpdates, invalidUpdates, refreshedCompetition }` |
| PUT | `/:competitionId/admin` | Yes (super-admin) | `competitionId` | — | `{ userId }` | `data: updatedCompetition` |
| GET | `/:competitionId/fixtures` | No | `competitionId` | `filter, team` | — | `data: { completedMatches, upcomingMatches }` |
| POST | `/:competitionId/fixtures` | Yes (competition-admin) | `competitionId` | — | `{ fixtures[] }` | `data: refreshedCompetition` |
| PATCH | `/:competitionId/fixtures/:fixtureId` | Yes (competition-admin) | `competitionId, fixtureId` | — | `{ result, statistics, matchEvents }` | `data: { refreshedFixture, refreshedCompetition }` |
| GET | `/:competitionId/league-table` | No | `competitionId` | — | — | `data: leagueTable[]` |
| POST | `/:competitionId/league-table` | Yes (competition-admin) | `competitionId` | — | — | `data: initializedTable` |
| GET | `/:competitionId/knockout/phases` | No | `competitionId` | — | — | `data: knockoutRounds[]` |
| POST | `/:competitionId/knockout/phases` | Yes (competition-admin) | `competitionId` | — | `{ knockoutRounds[] }` | `data: updatedRounds` |
| POST | `/:competitionId/knockout/teams` | Yes (competition-admin) | `competitionId` | — | `{ roundName, teams[] }` | `data: updatedCompetition` |
| POST | `/:competitionId/knockout/fixtures` | Yes (competition-admin) | `competitionId` | — | `{ roundName, fixtures[] }` | `data: updatedCompetition` |

---

### Live Fixture Routes (`/api/v1/live-fixtures`)

| Method | Endpoint | Auth | Parameters | Body | Returns |
|---|---|---|---|---|---|
| POST | `/initialize` | Yes (super-admin, competition-admin) | — | `{ fixtureId, adminId }` | `data: LiveFixture` |
| POST | `/finalize` | Yes (admin roles) | — | `{ fixtureId }` | `data: null` |
| PUT | `/update/:fixtureId` | Yes (admin roles) | `fixtureId` | `{ result?, statistics?, matchEvents?, homeLineup?, awayLineup?, time? }` | `data: updatedLiveFixture` |
| GET | `/fixtures` | Yes (admin roles) | — | — | `data: Fixture[]` |
| GET | `/fixtures/:fixtureId` | No | `fixtureId` | — | `data: LiveFixture` |
| GET | `/fixtures/:fixtureId/players` | No | `fixtureId` | — | `data: { homePlayers, awayPlayers }` |
| PUT | `/fixtures/:fixtureId/formation` | Yes (admin roles) | `fixtureId` | `{ homeLineup, awayLineup }` | `data: updatedLiveFixture` |
| GET | `/admins` | Yes (super-admin, competition-admin) | — | — | `data: User[]` |
| GET | `/admins/live` | Yes (admin roles) | — | — | `data: LiveFixture[]` |

---

### Player Routes (`/api/v1/player`)

| Method | Endpoint | Auth | Parameters | Query | Returns |
|---|---|---|---|---|---|
| GET | `/:playerId` | No | `playerId` | — | `data: Player` |
| PUT | `/:playerId` | Yes (team-admin) | `playerId` | — | `data: updatedPlayer` |
| DELETE | `/:playerId` | Yes (team-admin) | `playerId` | — | `data: deletedPlayer` |
| GET | `/:playerId/stats` | No | `playerId` | `year` | `data: { general, competition }` |

---

### TOTS Routes (`/api/v1/tots`)

| Method | Endpoint | Auth | Parameters | Query | Body | Returns |
|---|---|---|---|---|---|---|
| GET | `/` | No | — | `isActive, year, limit, page` | — | `data: { sessions, pagination }` |
| GET | `/:sessionId` | No | `sessionId` | — | — | `data: { session, totalVotes }` |
| GET | `/:sessionId/players` | No | `sessionId` | `team, position` | — | `data: Player[]` |
| GET | `/:sessionId/result` | No | `sessionId` | — | — | `data: TOTSResult` |
| GET | `/:sessionId/vote/regular` | Yes | `sessionId` | — | — | `data: Vote` |
| POST | `/:sessionId/vote/regular` | Yes | `sessionId` | — | `{ selectedFormation, selectedPlayers }` | `data: createdVote` |
| POST | `/` | Yes (super-admin, competition-admin) | — | — | `{ year, competition, isActive, showVoteCount, startDate, endDate, adminVoteWeight }` | `data: createdSession` |
| POST | `/:sessionId/players` | Yes (admin roles) | `sessionId` | — | `{ playerArray[] }` | `data: updatedSession` |
| DELETE | `/:sessionId/players` | Yes (admin roles) | `sessionId` | — | `{ playerArray[] }` | `data: updatedSession` |
| PUT | `/:sessionId/toggle` | Yes (admin roles) | `sessionId` | — | — | `data: updatedSession` |
| POST | `/:sessionId/vote/admin` | Yes (admin roles) | `sessionId` | — | `{ selectedFormation, selectedPlayers }` | `data: createdAdminVote` |
| POST | `/:sessionId/finalize` | Yes (admin roles) | `sessionId` | — | — | `data: TOTSResult` |

---

### Admin Routes (`/api/v1/admin`)

| Method | Endpoint | Auth | Parameters | Returns |
|---|---|---|---|---|
| GET | `/profile` | Yes (admin roles) | — | `data: adminProfile` |
| GET | `/fixtures` | Yes (competition-admin) | — | `data: { teams, upcomingFixtures, completedFixtures, allCompetitions, allFixtures }` |
| GET | `/records` | Yes (competition-admin) | — | `data: { completed_overdue, completedFixtures, overdueFixtures, allCompetitions }` |
| GET | `/players` | Yes (team-admin) | — | `data: { team, players }` |
| GET | `/competitions` | Yes (admin roles) | — | `data: competitions[]` |
| GET | `/competitions/:competitionId` | Yes (admin roles) | `competitionId` | `data: competitionDetails` |
| GET | `/competitions/:competitionId/fixtures` | Yes (admin roles) | `competitionId` | `data: { teams, rounds, fixtures, currentCompetition }` |

**Access by role:**

| Role | Accessible Routes |
|---|---|
| `super-admin` | All |
| `competition-admin` | `/profile`, `/fixtures`, `/records`, `/competitions`, `/competitions/:id`, `/competitions/:id/fixtures` |
| `team-admin` | `/profile`, `/players`, `/competitions` |
| `live-match-admin` | `/profile` |

---

### General Routes (`/api/v1/general`)

| Method | Endpoint | Auth | Returns |
|---|---|---|---|
| GET | `/` | No | `data: { fixtureCount, allCompetitionsCount, ongoingCompetitionsCount, teamCount, featuredCompetition }` |

---

## V1.2 Routes (`/api/v1.2`)

### Authentication Routes (`/api/v1.2/authentication`)

| Method | Endpoint | Auth | Body | Returns |
|---|---|---|---|---|
| POST | `/register/regular` | No | `{ name, email, password }` | `data: { id, name, email, role }` |
| POST | `/register/admin` | Yes (superAdmin) | `{ name, email, role, password }` | `data: { id, name, email, role }` |
| POST | `/login` | No | `{ email, password }` | `data: { token, user }` + cookie |
| POST | `/logout` | Yes | — | Clears cookie |
| POST | `/update-password` | Yes | `{ oldPassword, newPassword, confirmNewPassword }` | `data: null` |

---

### User Routes (`/api/v1.2/user`)

| Method | Endpoint | Auth | Parameters | Body | Returns |
|---|---|---|---|---|---|
| GET | `/` | Yes (superAdmin) | — | — | `data: User[]` |
| GET | `/me` | Yes | — | — | `data: { user, unreadNotifications, notifications }` |
| GET | `/:userId` | Yes | `userId` | — | `data: User` |
| PUT | `/:userId` | Yes | `userId` | `{ name?, sports?, mediaAccess? }` | `data: updatedUser` |
| DELETE | `/:userId` | Yes (superAdmin) | `userId` | — | `data: deletedUser` |
| PUT | `/:userId/reset-password` | Yes (superAdmin) | `userId` | `{ newPassword, confirmNewPassword }` | `data: null` |

---

### Notification Routes (`/api/v1.2/notification`)

| Method | Endpoint | Auth | Parameters | Query | Body | Returns |
|---|---|---|---|---|---|---|
| GET | `/` | Yes | — | `limit, page, includeRead` | — | `data: Notification[], pagination` |
| POST | `/` | Yes | — | — | `{ recipient, title, message, date? }` | `data: notification` |
| DELETE | `/` | Yes | — | — | — | `data: { deleted }` |
| GET | `/stats` | Yes | — | — | — | `data: { total, unread, read }` |
| POST | `/all` | Yes (superAdmin) | — | — | `{ title, message, date? }` | `data: { count }` |
| PUT | `/read-all` | Yes | — | — | — | `data: { modifiedCount }` |
| PUT | `/:notificationId/status` | Yes | `notificationId` | — | `{ read }` | `data: notification` |
| PUT | `/:notificationId/read` | Yes | `notificationId` | — | — | `data: notification` |

**Query parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `limit` | number | `20` | Items per page |
| `page` | number | `1` | Page number |
| `includeRead` | boolean | `false` | Include read notifications |

---

### Audit Log Routes (`/api/v1.2/audit`)

| Method | Endpoint | Auth | Parameters | Query | Returns |
|---|---|---|---|---|---|
| GET | `/` | Yes (superAdmin) | — | `page, limit` | `data: { logs, pagination }` |
| GET | `/:logId` | Yes (superAdmin) | `logId` | — | `data: auditLog` |
| DELETE | `/:logId` | Yes (superAdmin) | `logId` | — | `data: null` |
| GET | `/user/:userId` | Yes (superAdmin) | `userId` | `page, limit` | `data: { logs, pagination }` |
| GET | `/entity/:entity/:entityId` | Yes (superAdmin) | `entity, entityId` | `page, limit` | `data: { logs, pagination }` |

---

### Football Player Routes (`/api/v1.2/football/player`)

| Method | Endpoint | Auth | Parameters | Body | Returns |
|---|---|---|---|---|---|
| POST | `/` | Yes (superAdmin) | — | `{ playerArray[], teamType, teamId }` | `data: Player[]` |
| GET | `/:playerId` | No | `playerId` | — | `data: player (with age, currentTeams)` |
| PUT | `/:playerId` | Yes (team-admin) | `playerId` | `{ name?, position?, number?, birthDate?, departmentTeam?, clubTeam?, schoolTeam?, clubStatus? }` | `data: updatedPlayer` |
| DELETE | `/:playerId` | Yes (team-admin) | `playerId` | — | `data: deletedPlayer` |
| PUT | `/:playerId/stats` | Yes (team-admin) | `playerId` | `{ statsUpdate: { teamType, matchType?, competitionId?, season?, stats } }` | `data: updatedStats` |
| PUT | `/:playerId/transfer` | Yes (superAdmin) | `playerId` | `{ status, toClub, transferDate?, returnDate? }` | `data: { player, newClub, oldClub, transferDetails }` |

---

### Football Fixture Routes (`/api/v1.2/football/fixture`)

| Method | Endpoint | Auth | Parameters | Query | Body | Returns |
|---|---|---|---|---|---|---|
| GET | `/` | No | — | `limit, page, filterBy, completed, live, upcoming, postponed, startDate` | — | `data: { fixtures, pagination }` |
| GET | `/:fixtureId` | No | `fixtureId` | — | — | `data: fixture (fully populated)` |
| GET | `/teams/:teamId` | No | `teamId` | — | — | `data: Fixture[]` |
| POST | `/` | Yes (superAdmin) | — | — | `{ homeTeam, awayTeam, date?, stadium?, isDateTBD? }` | `data: createdFixture` |
| PUT | `/:fixtureId` | Yes (superAdmin) | `fixtureId` | — | `{ homeTeam?, awayTeam?, date?, stadium? }` | `data: updatedFixture` |
| PUT | `/:fixtureId/status` | Yes (superAdmin) | `fixtureId` | — | `{ status, postponementReason?, newDate? }` | `data: updatedFixture` |
| PUT | `/:fixtureId/formation` | Yes (superAdmin) | `fixtureId` | — | `{ homeLineup?, awayLineup? }` | `data: updatedFixture` |
| PUT | `/:fixtureId/result` | Yes (superAdmin) | `fixtureId` | — | `{ result, statistics, matchEvents, homeSubs, awaySubs }` | `data: updatedFixture` |
| DELETE | `/:fixtureId` | Yes (superAdmin) | `fixtureId` | — | — | `data: deletedFixture` |

**Query parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `limit` | number | `10` | Items per page |
| `page` | number | `1` | Page number |
| `filterBy` | date | — | Filter by specific date |
| `startDate` | date | — | Filter from date onward |
| `completed` | boolean | `false` | Show completed only |
| `live` | boolean | `false` | Show live only |
| `upcoming` | boolean | `false` | Show upcoming only |
| `postponed` | boolean | `false` | Show postponed only |

---

### Football Team Routes (`/api/v1.2/football/team`)

| Method | Endpoint | Auth | Parameters | Query | Body | Returns |
|---|---|---|---|---|---|---|
| GET | `/` | No | — | `department, year, limit, page` | — | `data: { teams, pagination }` |
| GET | `/:teamId` | No | `teamId` | — | — | `data: team (populated)` |
| GET | `/:teamId/players` | No | `teamId` | — | — | `data: { team, players }` |
| GET | `/:teamId/competitions` | No | `teamId` | — | — | `data: { team, competitions }` |
| GET | `/:teamId/form` | No | `teamId` | — | — | `data: form[]` |
| GET | `/:teamId/team-statistics` | No | `teamId` | `startDate, endDate, competitionId` | — | `data: { team, stats, form, fixtures }` |
| GET | `/:teamId/player-statistics` | No | `teamId` | `startDate, endDate, competitionId` | — | `data: playerStats[]` |
| POST | `/` | Yes | — | — | `{ name, shorthand, department?, year?, type }` | `data: createdTeam` |
| PUT | `/:teamId` | Yes | `teamId` | — | `{ name?, shorthand?, department?, year?, logo?, colors? }` | `data: updatedTeam` |
| PUT | `/:teamId/captain` | Yes | `teamId` | — | `{ playerId }` | `data: updatedTeam` |
| PUT | `/:teamId/admin` | Yes (superAdmin) | `teamId` | — | `{ adminId }` | `data: updatedTeam` |
| POST | `/:teamId/players` | Yes | `teamId` | — | `{ name, department, position, number }` | `data: createdPlayer` |
| DELETE | `/:teamId/players/:playerId` | Yes | `teamId, playerId` | — | — | `data: null` |
| GET | `/:teamId/friendly-requests` | Yes | `teamId` | — | — | `data: friendlyRequests[]` |
| POST | `/:teamId/friendly-requests` | Yes | `teamId` | — | `{ date, location, recipientTeamId }` | `data: request` |
| PUT | `/:teamId/friendly-requests/:requestId/status` | Yes | `teamId, requestId` | — | `{ status }` | `data: updatedRequests` |
| DELETE | `/:teamId` | Yes (superAdmin) | `teamId` | — | — | `data: deletedTeam` |

---

### Football Competition Routes (`/api/v1.2/football/competition`)

| Method | Endpoint | Auth | Parameters | Query | Body | Returns |
|---|---|---|---|---|---|---|
| GET | `/` | No | — | `status, sportType, limit, page, sort, isFeatured` | — | `data: { competitions, pagination }` |
| GET | `/:competitionId` | No | `competitionId` | — | — | `data: competition` |
| GET | `/:competitionId/fixtures` | No | `competitionId` | `limit, page, fromDate, toDate` | — | `data: { fixtures, pagination }` |
| GET | `/:competitionId/teams` | No | `competitionId` | — | — | `data: teams[]` |
| GET | `/:competitionId/teams/:teamId/squad` | No | `competitionId, teamId` | — | — | `data: { team, squad }` |
| GET | `/:competitionId/standings` | No | `competitionId` | — | — | `data: leagueTable[]` |
| GET | `/:competitionId/knockout` | No | `competitionId` | — | — | `data: knockoutRounds[]` |
| GET | `/:competitionId/groups` | No | `competitionId` | — | — | `data: groupStage[]` |
| GET | `/:competitionId/groups/:groupName` | No | `competitionId, groupName` | — | — | `data: group` |
| POST | `/` | Yes (superAdmin, sportAdmin) | — | — | `{ name, description, sportType, format, season, startDate, endDate, rounds?, rules? }` | `data: createdCompetition` |
| PUT | `/:competitionId` | Yes (admin roles) | `competitionId` | — | `{ name?, description?, rounds?, startDate?, endDate?, format?, rules? }` | `data: updatedCompetition` |
| PUT | `/:competitionId/status` | Yes (admin roles) | `competitionId` | — | `{ status }` | `data: updatedCompetition` |
| PUT | `/:competitionId/feature` | Yes (admin roles) | `competitionId` | — | — | `data: updatedCompetition` |
| PUT | `/:competitionId/admin` | Yes (admin roles) | `competitionId` | — | `{ adminId }` | `data: updatedCompetition` |
| PUT | `/:competitionId/teams/invite` | Yes (admin roles) | `competitionId` | — | `{ teamIds[] }` | `data: { invitedTeams, invalidTeamIds, duplicateInvites }` |
| PUT | `/:competitionId/teams/add` | Yes (admin roles) | `competitionId` | — | `{ teamIds[] }` | `data: { competition, invalidTeamIds }` |
| PUT | `/:competitionId/teams/:teamId/remove` | Yes (admin roles) | `competitionId, teamId` | — | — | `data: updatedCompetition` |
| PUT | `/:competitionId/teams/:teamId/squad` | Yes (admin roles) | `competitionId, teamId` | — | `{ players[] }` | `data: { teamId, playerCount }` |
| PUT | `/:competitionId/initialize-table` | Yes (admin roles) | `competitionId` | — | — | `data: leagueTable[]` |
| POST | `/:competitionId/fixtures` | Yes (admin roles) | `competitionId` | — | `{ homeTeam, awayTeam, date, stadium?, referee?, matchWeek? }` | `data: createdFixture` |
| PUT | `/:competitionId/fixtures/:fixtureId` | Yes (admin roles) | `competitionId, fixtureId` | — | `{ result, statistics, matchEvents, homeSubs, awaySubs }` | `data: { fixture, competition }` |
| DELETE | `/:competitionId/fixtures/:fixtureId` | Yes (admin roles) | `competitionId, fixtureId` | — | — | `data: deletedFixture` |
| PUT | `/:competitionId/knockout` | Yes (admin roles) | `competitionId` | — | `{ name, fixtureFormat }` | `data: newRound` |
| PUT | `/:competitionId/knockout/fixtures/:fixtureId/add` | Yes (admin roles) | `competitionId, fixtureId` | — | `{ roundName }` | `data: round` |
| PUT | `/:competitionId/knockout/fixtures/:fixtureId/remove` | Yes (admin roles) | `competitionId, fixtureId` | — | `{ roundName }` | `data: round` |
| PUT | `/:competitionId/groups` | Yes (admin roles) | `competitionId` | — | `{ name }` | `data: newGroup` |
| PUT | `/:competitionId/groups/teams/:teamId/add` | Yes (admin roles) | `competitionId, teamId` | — | `{ groupName }` | `data: group` |
| PUT | `/:competitionId/groups/teams/:teamId/remove` | Yes (admin roles) | `competitionId, teamId` | — | `{ groupName }` | `data: group` |
| PUT | `/:competitionId/groups/fixtures/:fixtureId/add` | Yes (admin roles) | `competitionId, fixtureId` | — | `{ groupName }` | `data: group` |
| PUT | `/:competitionId/groups/fixtures/:fixtureId/remove` | Yes (admin roles) | `competitionId, fixtureId` | — | `{ groupName }` | `data: group` |
| DELETE | `/:competitionId` | Yes (admin roles) | `competitionId` | — | — | `data: deletedCompetition` |

---

### Football TOTS Routes (`/api/v1.2/football/tots`)

| Method | Endpoint | Auth | Parameters | Query | Body | Returns |
|---|---|---|---|---|---|---|
| GET | `/` | No | — | `isActive, year, limit, page` | — | `data: { sessions, pagination }` |
| GET | `/:sessionId` | No | `sessionId` | — | — | `data: { session, totalVotes }` |
| GET | `/:sessionId/players` | No | `sessionId` | `team, position` | — | `data: Player[]` |
| GET | `/:sessionId/result` | No | `sessionId` | — | — | `data: TOTSResult` |
| GET | `/:sessionId/vote/regular` | Yes | `sessionId` | — | — | `data: Vote` |
| POST | `/:sessionId/vote/regular` | Yes | `sessionId` | — | `{ selectedFormation, selectedPlayers }` | `data: createdVote` |
| POST | `/` | Yes (superAdmin, headMediaAdmin) | — | — | `{ year, competition, isActive, showVoteCount, startDate, endDate, adminVoteWeight }` | `data: createdSession` |
| POST | `/:sessionId/players` | Yes (admin roles) | `sessionId` | — | `{ playerArray[] }` | `data: updatedSession` |
| DELETE | `/:sessionId/players` | Yes (admin roles) | `sessionId` | — | `{ playerArray[] }` | `data: updatedSession` |
| PUT | `/:sessionId/toggle` | Yes (admin roles) | `sessionId` | — | — | `data: updatedSession` |
| POST | `/:sessionId/vote/admin` | Yes (admin roles) | `sessionId` | — | `{ selectedFormation, selectedPlayers }` | `data: createdAdminVote` |
| POST | `/:sessionId/finalize` | Yes (admin roles) | `sessionId` | — | — | `data: TOTSResult` |

---

### View Routes (`/api/v1.2/views`)

| Method | Endpoint | Auth | Query | Returns |
|---|---|---|---|---|
| GET | `/homepage` | No | `fixtureFilterBy, fixtureLimit` | `data: { highlightedFixture, totalFixtures, totalCompetitions, totalOngoingCompetitions, totalTeams, featuredCompetition }` |

---

## Entity Schemas

### Core Entities

| Entity | Collection | Description |
|---|---|---|
| `User` | `users` | V1 system users with role-based access |
| `Team` | `teams` | Football teams — squad, fixtures, invitations |
| `Player` | `players` | Individual players with stats and records |
| `Fixture` | `fixtures` | Match schedules, results, lineups, events |
| `Competition` | `competitions` | League and knockout tournaments |
| `MatchStatistic` | `matchstatistics` | In-match statistics (corners, cards, possession) |
| `PlayerCompetitionStats` | `playercompetitionstats` | Competition-level player statistics |
| `LiveFixture` | `livefixtures` | Real-time match data |
| `TOTS` / `Vote` / `TOTSResult` | `tots*` | TOTS session, votes, and finalized results |
| `Notification` | `notifications` | User notifications (v1.2) |
| `AuditLog` | `auditlogs` | Admin action logs (v1.2) |

### V1 User
```typescript
{
  name: string;
  email: string;
  password: string; // hashed
  role: 'super-admin' | 'competition-admin' | 'team-admin' | 'live-match-admin';
  status: 'active' | 'suspended';
  associatedTeam?: ObjectId;
  associatedCompetitions?: ObjectId[];
  lastLogin?: Date;
}
```

### V1.2 User
```typescript
{
  name: string;
  email: string;
  password: string; // hashed
  role: 'user' | 'superAdmin' | 'mediaAdmin' | 'headMediaAdmin' | 'sportAdmin';
  sports?: string[];
  mediaAccess?: string[];
  status: 'active' | 'inactive' | 'suspended';
  lastLogin?: Date;
}
```

### V1.2 FootballPlayer (abbreviated)
```typescript
{
  name: string;
  matricNumber?: string;
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  number?: number;
  birthDate?: Date;
  baseTeam?: ObjectId;
  departmentTeam?: ObjectId;
  clubTeam?: ObjectId;
  schoolTeam?: ObjectId;
  clubStatus: 'active' | 'loaned' | 'transferred' | 'retired';
  transferDetails?: { status, fromClub, toClub, transferDate, returnDate? };
  stats: {
    careerTotals: { goals, ownGoals, assists, yellowCards, redCards, appearances, cleanSheets, minutesPlayed };
    byTeam: { base?, department?, club?, school? };
    byCompetition: [{ competition, season, stats }];
  };
  generalRecord: [{ year, goals, ownGoals, assists, yellowCards, redCards, appearances, cleanSheets }];
}
```

### V1.2 FootballCompetition (abbreviated)
```typescript
{
  name: string;
  description: string;
  sportType: 'football' | 'chess' | 'basketball' | 'volleyball';
  format: 'knockout' | 'hybrid' | 'league';
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  season: string;
  isFeatured: boolean;
  teams: [{ team: ObjectId, squadList: ObjectId[] }];
  leagueTable: [{ team, played, points, wins, losses, draws, goalsFor, goalsAgainst, goalDifference, form, position }];
  knockoutRounds: [{ name, fixtures, fixtureFormat, completed }];
  groupStage: [{ name, standings, fixtures }];
  stats: { totalGoals, homeWinsPercentage, awayWinsPercentage, ... };
  rules: { substitutions, extraTime, penalties, matchDuration, squadSize };
}
```

---

## Constants Reference

### V1 Roles
```js
'super-admin' | 'competition-admin' | 'team-admin' | 'live-match-admin'
```

### V1.2 Roles
```js
'user' | 'superAdmin' | 'mediaAdmin' | 'headMediaAdmin' | 'sportAdmin'
```

### Fixture Types / Status
```js
type:   'league' | 'friendly' | 'cup'               // v1
type:   'friendly' | 'competitive'                  // v1.2
status: 'upcoming' | 'live' | 'completed'           // v1
status: 'upcoming' | 'live' | 'completed' | 'postponed' | 'tbd'  // v1.2
```

### Competition Types / Formats
```js
type / format: 'league' | 'knockout' | 'hybrid'
status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
```

### Match Event Types
```js
// v1
'goal' | 'assist' | 'yellowCard' | 'redCard' | 'substitution'

// v1.2 (extended)
'goal' | 'ownGoal' | 'assist' | 'yellowCard' | 'redCard' | 'substitution'
| 'foul' | 'corner' | 'offside' | 'shotOnTarget' | 'shotOffTarget'
| 'kickoff' | 'halftime' | 'fulltime' | 'varDecision' | 'injury'
| 'penaltyAwarded' | 'penaltyScored' | 'penaltyMissed' | 'penaltySaved'
| 'goalDisallowed' | 'goalConfirmed'
```

### Player Positions
```js
// v1: 'GK' | 'CB' | 'LB' | 'RB' | 'WB' | 'CMF' | 'DMF' | 'AMF' | 'LW' | 'RW' | 'ST'
// v1.2 (grouped): 'GK' | 'DEF' | 'MID' | 'FWD'
```

### Club Status
```js
'active' | 'loaned' | 'transferred' | 'retired' | 'not-applicable'
```

### Knockout Fixture Formats
```js
'single_leg' | 'two_legs' | 'best_of_three'
```

---

## Error Codes

| Code | Meaning |
|---|---|
| `00` | Success |
| `99` | Error (see `message` field) |
| HTTP `500` | Internal server error |

### Common Error Messages

| Message | Cause |
|---|---|
| `Invalid Team ID` | MongoDB ObjectId invalid or team not found |
| `Unauthorized` | Missing or expired JWT cookie |
| `Forbidden` | User role has no permission for this route |
| `Fixture not found` | `fixtureId` does not exist |
| `User Not Found` | `userId` invalid or deleted |
| `Invalid Competition` | `competitionId` does not exist |
| `Live fixture already exists` | Fixture is already in live state |
| `Not enough votes` | TOTS finalization requires minimum 10 votes |
| `Invalid Players` | Player IDs not found or not in competition |

---

## Middleware Reference

| Middleware | Description |
|---|---|
| `authenticateUser` | Validates JWT from cookie, attaches `req.user` |
| `authorize(roles[])` | Restricts access to users with specified roles |
| `hasTeamPermissions` | Checks team-admin owns the target team |
| `hasCompetitionPermissions` | Checks competition-admin owns the competition |
| `auditMiddleware` | Logs IP, route, method, and user agent to `req.auditInfo` |

---

## WebSocket Events (V2)

### Client → Server

| Event | Payload | Description |
|---|---|---|
| `joinMatch` | `{ matchId }` | Join a specific match room |
| `disconnect` | — | Client disconnects |

### Server → Client

| Event | Payload | Description |
|---|---|---|
| `matchUpdate` | Full `LiveFixture` object | Broadcast on any live fixture update |

```js
const socket = io('http://localhost:3000');
socket.emit('joinMatch', 'fixtureId123');
socket.on('matchUpdate', (data) => console.log(data));
```

---

## API Documentation

| Version | Swagger UI URL |
|---|---|
| V1 | `http://localhost:PORT/api/v1/api-docs` |
| V1.2 | `http://localhost:PORT/api/v1.2/api-docs` |
| Health Check | `http://localhost:PORT/` |