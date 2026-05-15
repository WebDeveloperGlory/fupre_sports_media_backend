# Fupre Sports Media API

A REST API for sports media management at FUPRE — handling football teams, fixtures, competitions, player statistics, TOTS voting, and a multi-role admin system.

The project ships as two parallel API versions. Both run from the same codebase and share the same database.

---

## API Versions

| Version | Language | Base URL | Documentation |
|---|---|---|---|
| **V1 / V1.2** | JavaScript | `/api/v1` · `/api/v1.2` | [README.v1.md](./README.v1.md) |
| **V2** | TypeScript | `/api/v2` | [README.v2.md](./README.v2.md) |

> **Which one should I use?**
> V2 is the active development version — TypeScript, cleaner architecture, and WebSocket support. V1/V1.2 remain stable and are fully documented for reference and backward compatibility.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB with Mongoose ODM |
| Authentication | JWT (HTTP-only cookies) |
| Documentation | Swagger / OpenAPI |
| WebSockets | Socket.io (V2) |
| Language | JavaScript (V1/V1.2) · TypeScript (V2) |

---

## Project Structure

```
fupre-sports-media-api/
├── app/
│   ├── v1/                  # JavaScript — V1 and V1.2 routes
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── server.js
│   │
│   └── v2/                  # TypeScript — V2 routes
│       ├── controllers/
│       ├── models/
│       ├── routes/
│       ├── services/
│       └── server.ts
│
├── dist/                    # Compiled TypeScript output
├── index.js                 # Main entry point
├── README.md                # This file
├── README.v1.md             # V1 / V1.2 full documentation
├── README.v2.md             # V2 full documentation
├── package.json
└── tsconfig.json
```

---

## Quick Start

```bash
git clone <repository-url>
cd fupre-sports-media-api
npm install
cp .env.example .env
```

```bash
npm run dev          # Development (both versions, auto-reload)
npm run start:v1     # V1 only
npm run start:v2     # V2 only (requires build first)
npm run build:v2     # Compile TypeScript
npm start            # Production (both versions)
```

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

## Response Format

All endpoints return a consistent envelope:

```json
{ "code": "00", "message": "Success", "data": {} }
{ "code": "99", "message": "Error description" }
```

Paginated responses include a `pagination` object: `{ page, limit, total, pages }`.

---

## Swagger Docs

| Version | URL |
|---|---|
| V1 | `http://localhost:PORT/api/v1/api-docs` |
| V1.2 | `http://localhost:PORT/api/v1.2/api-docs` |
| V2 | `http://localhost:PORT/api/v2/api-docs` |
| Health check | `http://localhost:PORT/` |

---

## Version Docs

- [V1 / V1.2 — Full route reference, schemas, constants, middleware](./README.v1.md)
- [V2 — Full route reference, schemas, WebSocket events](./README.v2.md)