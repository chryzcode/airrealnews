# Air Real News (ARN) - Hybrid Intelligence & Global Broadcast Network

**Air Real News (ARN)** is an independent international broadcast and digital news platform built with React, TypeScript, Tailwind CSS, and a **Node 24 API backed by Neon serverless PostgreSQL**.

ARN operates on a **Hybrid News Architecture**:
1. **Air Real News Staff & CEO Authority**: Pinned Lead Stories, investigative disclosures, breaking banners, defense analysis, commercial sponsorships, and newsroom accounts are managed directly by ARN authenticated staff.
2. **Automated Live Global & Nigerian National Wire Feeds**: The Continuous Live Desk and secondary wire beats automatically ingest verified live updates from a broad multi-source network — international (**BBC News**, **Al Jazeera**, **The Guardian**, **Sky News**, **France 24**, **NPR**, **New York Times**, **Bloomberg**, **WSJ**, **Space.com**, **NASA**, **Breaking Defense**, **Defense News**, **The War Zone**, **FlightGlobal**, **Simple Flying**) and Nigerian national desks (**The Punch**, **Vanguard**, **Premium Times**, **Channels Television**, **Daily Trust**, **Nigerian Tribune**, **The Whistler**, **Arise News**, **ThisDay**, **The Sun**, **Blueprint**, **Nairametrics**, **BusinessDay**) every 20 minutes and on-demand.

---

## 🔐 Authenticated Newsroom Roles & Credentials

The platform features encrypted authentication using native Node `scrypt` hashing and HMAC-SHA256 JWT sessions:

**First-run setup**: No accounts ship with the project. On first launch, if no Chief Executive account exists, the login screen opens a one-time setup wizard where the CEO creates their own credentials. Once that account exists, the wizard is disabled and all further accounts are provisioned from the *Security & Accounts* tab.

| Role | Provisioned by | Editorial Authority & Permissions |
|---|---|---|
| **CEO & Editor-in-Chief** | One-time first-run setup wizard | **Full Sovereign Authority**: Publish/delete any story, manage commercial advertising inventory, accredit journalists, provision staff login accounts, change passwords. |
| **Managing Editor** | CEO (Security & Accounts tab) | **Editorial & Ad Ops**: Publish/edit articles, broadcast live wire flashes, manage commercial ad campaigns, accredit journalists, provision correspondent accounts. |
| **Staff Correspondent** | CEO or Managing Editor | **News & Wire Desk**: Publish articles assigned to byline, broadcast live corridor wire dispatches, manage profile passphrase. |

> **Note**: Click *"Staff Portal & Ads"* in the top navigation bar to sign in. Passphrases can be changed at any time in the *Security & Accounts* tab.

---

## 🏛️ Hybrid System Architecture

```
                  ┌───────────────────────────────────────────────┐
                  │            Air Real News Platform             │
                  │              (React + Vite UI)                │
                  └───────────────┬───────────────────────────────┘
                                  │
                                  ▼
                  ┌───────────────────────────────────────────────┐
                  │            REST API (/api/...)                │
                  │             (server/api.js)                   │
                  └───────┬───────────────────────────────┬───────┘
                          │                               │
                          ▼                               ▼
          ┌───────────────────────────────┐  ┌───────────────────────────────┐
          │      ARN CEO & Staff Desk     │  │     Automated Wire Feeds      │
          │     (Token-Authenticated)     │  │     (server/ingestion.js)     │
          │  - Lead Investigations        │  │  - BBC / Al Jazeera / Sky     │
          │  - Commercial Ad Inventory    │  │  - Guardian / France24 / NPR  │
          │  - Newsroom Account Control   │  │  - Defense & Aerospace Wires  │
          └───────────────┬───────────────┘  └────────────┬──────────────────┘
                          │                               │
                          └───────────────┬───────────────┘
                                          │
                                          ▼
                  ┌───────────────────────────────────────────────┐
                  │   Neon Serverless PostgreSQL (@neondatabase)  │
                  │        (DATABASE_URL connection string)       │
                  └───────────────────────────────────────────────┘
```

---

## 🚀 Key Features

### 1. 🔄 Automated Live Wire Ingestion & Periodic Scheduling
- Automatically fetches and dedupes real-time dispatches from a broad wire network — international (**BBC**, **Al Jazeera**, **The Guardian**, **Sky News**, **France 24**, **NPR**, **New York Times**, **Bloomberg**, **WSJ**, **MarketWatch**, **Space.com**, **NASA**, **Breaking Defense**, **Defense News**, **The War Zone**, **FlightGlobal**, **Simple Flying**) plus dedicated Nigerian national desks (**The Punch**, **Vanguard**, **Premium Times**, **Channels TV**, **Daily Trust**, **Nigerian Tribune**, **The Whistler**, **Arise News**, **ThisDay**, **The Sun**, **Blueprint**, **Nairametrics**, **BusinessDay**) on a scheduled refresh.
- **One-Click Sync**: Click the **"Sync Wire"** button in the header banner or Live Desk widget to immediately poll and ingest the latest live reports.
- **Direct Wire Attribution**: Wire stories feature syndicated source badges with *"View Source Wire ↗"* external links.

### 2. ✍️ ARN Staff Newsroom & Commercial Ad Operations
- **Sovereign Editorial Control**: ARN staff retains complete authority over the **Lead Story**, breaking ribbon banners, investigative disclosures, and strategic commentary.
- **Commercial Ad Operations**: Deploy, activate, and pause sponsor campaigns (*Top Billboard*, *Sidebar Spotlight*, and *In-Feed Native*). Real-time tracking calculates impressions, clicks, and CTR%.
- **Live Dispatches & Staff Directory**: Post custom staff wire flashes and accredit journalists across London, Geneva, Washington, Brussels, and Singapore.
- **User Account Management**: CEO and Managing Editors can provision new newsroom team accounts with role-based access.

### 3. ✈️ ARN Global Airspace & Corridor Radar
- Real-time civilian flight tracking telemetry across key international corridors (*Geneva Demilitarized Sector*, *Central Eurasian Safe Path*, *Arabian Sea High-Altitude*, *NAT Track Zulu*).
- Cruising altitudes (FL380–FL410), speeds (Mach 0.82–0.86), squawk codes, and ICAO safety verifications.

### 4. 📖 Immersive Article Reader with Web Speech Audio
- Integrated speech synthesizer (`window.speechSynthesis`) reads any article aloud.
- Reader comments with upvotes stored directly in the Postgres database.

---

## 💻 Running in Development

1. Create a Neon Postgres project and copy its connection string.
2. Add it to `.env` (see `.env.example`):

```bash
DATABASE_URL=postgresql://user:password@ep-xxxx.aws.neon.tech/neondb?sslmode=require
ARN_JWT_SECRET=your-long-random-secret
```

3. Start the Vite dev server with the integrated Node API:

```bash
npm run dev
```

Open **[http://localhost:5173](http://localhost:5173)** in your browser. The database
schema is created automatically on the first API request.

---

## 🚢 Production Deployment (Vercel + Neon)

1. Push the repository to GitHub and import it in Vercel.
2. Add the following **Environment Variables** in the Vercel project settings:
   - `DATABASE_URL` — your Neon connection string
   - `ARN_JWT_SECRET` — a long random signing secret
   - `CRON_SECRET` — optional; protects the scheduled ingestion endpoint
3. Deploy. Vercel builds the frontend (`dist/`) and serves the API from the
   `api/[...route].js` serverless function.
4. Ingestion runs on the schedule in `vercel.json` (currently every 6 hours) via
   `GET /api/cron/ingest`. Trigger an immediate refresh any time by clicking
   **"Sync Wire"** in the UI or calling `POST /api/ingest`.

> **Note:** Vercel's Hobby plan limits cron jobs to a daily schedule. Change the
> `schedule` in `vercel.json` to `0 5 * * *` if the deploy rejects the current
> frequency.

### Standalone Node server (optional)

```bash
# 1. Compile production bundle
npm run build

# 2. Run the standalone Node server (serves API + static frontend)
npm start
```

The server runs on port `3001` (or whatever `PORT` is defined in `.env`).

