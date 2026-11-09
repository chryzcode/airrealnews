import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

// Neon serverless Postgres client. Created lazily so importing this module
// (e.g. from vite.config.ts during a build) never requires DATABASE_URL.
let _sql = null;
function getSql() {
  if (!_sql) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error(
        'DATABASE_URL is not set. Add your Neon Postgres connection string to the environment.'
      );
    }
    _sql = neon(connectionString);
  }
  return _sql;
}

// The rest of the codebase still writes SQLite-style `?` placeholders. Postgres
// uses numbered `$1, $2, ...` placeholders, so translate them positionally here
// to keep every call site unchanged.
function toPgPlaceholders(sqlText) {
  let index = 0;
  return sqlText.replace(/\?/g, () => `$${++index}`);
}

// Low-level query used during schema setup. Does NOT wait for ensureDbReady(),
// which would recurse while the schema is still being created.
async function rawQuery(sqlText, params = []) {
  return getSql().query(toPgPlaceholders(sqlText), params);
}

const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS staff (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    bureau TEXT NOT NULL,
    email TEXT,
    avatar TEXT,
    bio TEXT,
    articles_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (now()::text)
  )`,
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'journalist',
    staff_id TEXT,
    name TEXT NOT NULL,
    created_at TEXT DEFAULT (now()::text),
    last_login TEXT,
    FOREIGN KEY(staff_id) REFERENCES staff(id) ON DELETE SET NULL
  )`,
  `CREATE TABLE IF NOT EXISTS articles (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT,
    category TEXT NOT NULL,
    image_url TEXT NOT NULL,
    image_caption TEXT,
    published_at TEXT NOT NULL,
    read_time TEXT NOT NULL,
    author_id TEXT,
    is_breaking INTEGER DEFAULT 0,
    is_lead INTEGER DEFAULT 0,
    key_takeaways TEXT,
    content TEXT NOT NULL,
    pull_quote_text TEXT,
    pull_quote_attribution TEXT,
    audio_duration TEXT,
    comments_count INTEGER DEFAULT 0,
    tags TEXT,
    source_url TEXT,
    source_name TEXT,
    created_at TEXT DEFAULT (now()::text),
    FOREIGN KEY(author_id) REFERENCES staff(id) ON DELETE SET NULL
  )`,
  `CREATE TABLE IF NOT EXISTS ads (
    id TEXT PRIMARY KEY,
    client_name TEXT NOT NULL,
    title TEXT NOT NULL,
    tagline TEXT NOT NULL,
    image_url TEXT NOT NULL,
    target_url TEXT NOT NULL,
    placement TEXT NOT NULL,
    active INTEGER DEFAULT 1,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    badge_text TEXT,
    created_at TEXT DEFAULT (now()::text)
  )`,
  `CREATE TABLE IF NOT EXISTS live_updates (
    id TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL,
    time_ago TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author TEXT NOT NULL,
    is_flash INTEGER DEFAULT 0,
    category TEXT NOT NULL,
    source_url TEXT,
    source_name TEXT,
    published_at TEXT,
    created_at TEXT DEFAULT (now()::text)
  )`,
  `CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    article_id TEXT NOT NULL,
    author_name TEXT NOT NULL,
    avatar TEXT,
    timestamp TEXT NOT NULL,
    text TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (now()::text),
    FOREIGN KEY(article_id) REFERENCES articles(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS telemetry (
    flight TEXT PRIMARY KEY,
    airline TEXT NOT NULL,
    route TEXT NOT NULL,
    aircraft TEXT NOT NULL,
    altitude TEXT NOT NULL,
    speed TEXT NOT NULL,
    corridor TEXT NOT NULL,
    squawk TEXT NOT NULL,
    status TEXT NOT NULL
  )`
];

// Syndicated wire desk entities and the newsroom leadership directory. These
// rows are referenced by articles.author_id, so they must exist before any
// wire article is ingested.
const SEED_STAFF = [
  [
    'staff-wire-bbc',
    'BBC World News Wire',
    'Syndicated International Newsfeed',
    'London Bureau',
    'syndicated@bbci.co.uk',
    'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=200&q=80',
    'Automated real-time international news wire feed ingested and verified by ARN.',
    24
  ],
  [
    'staff-wire-aviation',
    'Global Aerospace Wire Desk',
    'Aviation Safety & Flight Dispatches',
    'International Wire',
    'aviation-wire@airrealnews.org',
    'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=200&q=80',
    'Real-time automated civil aviation, airport, and aerospace industry dispatches.',
    18
  ],
  [
    'staff-wire-global',
    'Global News Wire Desk',
    'Syndicated International Newsfeed',
    'International Wire',
    'global-wire@airrealnews.org',
    'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=200&q=80',
    'Automated multi-source world and geopolitics wire aggregation from verified international outlets.',
    40
  ],
  [
    'staff-wire-economy',
    'Global Markets Wire Desk',
    'Economy & Markets Dispatches',
    'International Wire',
    'markets-wire@airrealnews.org',
    'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=200&q=80',
    'Real-time market, business, and macro-economy dispatches aggregated from leading financial wires.',
    22
  ],
  [
    'staff-wire-defense',
    'Defense & Security Wire Desk',
    'Defense, Security & Strategic Analysis',
    'International Wire',
    'defense-wire@airrealnews.org',
    'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=200&q=80',
    'Automated defense, military aviation, and strategic security wire coverage.',
    20
  ],
  [
    'staff-wire-space',
    'Aerospace & Space Wire Desk',
    'Space, Science & Aerospace Dispatches',
    'International Wire',
    'space-wire@airrealnews.org',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=200&q=80',
    'Real-time space, satellite, and scientific aerospace dispatches from NASA and global science wires.',
    16
  ],
  [
    'staff-wire-nigeria',
    'Nigeria National News Desk',
    'Nigerian National Newsfeed',
    'Lagos National Bureau',
    'nigeria-wire@airrealnews.org',
    'https://images.unsplash.com/photo-1618828665033-4f02332a7535?auto=format&fit=crop&w=200&q=80',
    'Automated real-time Nigerian national news aggregation from leading national outlets across the federation.',
    28
  ],
  [
    'staff-wire-nigeria-biz',
    'Nigeria Business Wire Desk',
    'Nigerian Business & Markets Dispatches',
    'Lagos Business Bureau',
    'nigeria-business-wire@airrealnews.org',
    'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=200&q=80',
    'Automated Nigerian business, markets, and macro-economy dispatches from leading financial wires.',
    14
  ],
  [
    'staff-ceo',
    'Jonathan Sterling',
    'Chief Executive & Editor-in-Chief',
    'London (Westminster Bureau)',
    'ceo@airrealnews.org',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    'Chief Executive Officer and Editor-in-Chief of Air Real News (ARN) Media Network.',
    32
  ],
  [
    'staff-editor',
    'Elena Rostova',
    'Managing Newsroom Director',
    'Geneva (Palais des Nations)',
    'elena.rostova@airrealnews.org',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    'Directs editorial strategy, verification protocols, and global investigative units.',
    19
  ],
  [
    'staff-marcus',
    'Marcus Vance',
    'Senior Defense & Aerospace Analyst',
    'Washington, D.C.',
    'marcus.vance@airrealnews.org',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    'Specialist in military avionics, corridor telemetry, and strategic airspace geopolitics.',
    15
  ]
];

async function initSchema() {
  // `staff` is referenced by foreign keys on other tables, so create it first.
  await rawQuery(SCHEMA_STATEMENTS[0]);
  await Promise.all(SCHEMA_STATEMENTS.slice(1).map((statement) => rawQuery(statement)));

  const seedStatement =
    'INSERT INTO staff (id, name, role, bureau, email, avatar, bio, articles_count) ' +
    'VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT (id) DO NOTHING';
  await Promise.all(SEED_STAFF.map((row) => rawQuery(seedStatement, row)));
}

// Serverless functions have no startup hook, so the schema is created once per
// process on demand. The promise is memoized so concurrent requests share a
// single initialization.
let _ready = null;
export function ensureDbReady() {
  if (!_ready) {
    _ready = initSchema().catch((err) => {
      _ready = null;
      throw err;
    });
  }
  return _ready;
}

export async function query(sqlText, params = []) {
  await ensureDbReady();
  return rawQuery(sqlText, params);
}

// Minimal async adapter that mirrors the old synchronous node:sqlite API
// (prepare().get()/all()/run()) so existing call sites only need `await`.
export const db = {
  prepare(sqlText) {
    return {
      async get(...params) {
        const rows = await query(sqlText, params);
        return rows[0];
      },
      async all(...params) {
        return query(sqlText, params);
      },
      async run(...params) {
        await query(sqlText, params);
        return { changes: 1 };
      }
    };
  }
};

// No default user accounts are seeded. The first Chief Executive account is
// created through the one-time setup wizard on the login screen (see
// /api/auth/setup), so no hardcoded credentials ship in source.
