import { db } from './db.js';
import { ingestLiveFeeds } from './ingestion.js';
import { verifyPassword, hashPassword, generateToken, verifyToken } from './auth.js';

// Note: feed ingestion is triggered by the Vercel Cron job (/api/cron/ingest)
// or on demand via POST /api/ingest. A long-running setInterval cannot survive
// in a serverless function, so no background timer is registered here.

// Helper to parse JSON body. Serverless platforms (Vercel) pre-parse the request
// body into req.body, in which case the raw stream is already consumed.
function getJsonBody(req) {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'string') {
      try {
        return Promise.resolve(req.body ? JSON.parse(req.body) : {});
      } catch (err) {
        return Promise.reject(err);
      }
    }
    return Promise.resolve(req.body);
  }

  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

// Extract authentication from request Bearer token
function getAuth(req) {
  const header = req.headers['authorization'] || req.headers['Authorization'] || '';
  if (!header.startsWith('Bearer ')) return null;
  const token = header.slice(7).trim();
  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}

// Dynamic Real-Time Time-Ago Calculator
function formatLiveTimeAgo(dateInput) {
  if (!dateInput) return 'Just now';
  
  if (typeof dateInput === 'string' && (/\b\d+[mhd]\s+ago\b/i.test(dateInput) || dateInput === 'Just now')) {
    return dateInput;
  }

  const d = new Date(dateInput);
  if (isNaN(d.getTime())) {
    return 'Just now';
  }

  const diffMs = Date.now() - d.getTime();
  const diffSec = Math.max(0, Math.floor(diffMs / 1000));
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

// Format article row from DB to frontend Article interface
function formatArticle(row) {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle || undefined,
    category: row.category,
    imageUrl: row.image_url,
    imageCaption: row.image_caption || undefined,
    publishedAt: formatLiveTimeAgo(row.published_at || row.created_at),
    readTime: row.read_time || '3 min read',
    authorId: row.author_id || undefined,
    author: {
      name: row.author_name || (row.source_name ? `ARN Wire (${row.source_name})` : 'Air Real News Desk'),
      role: row.author_role || (row.source_name ? 'Syndicated Wire Dispatch' : 'Staff Correspondent'),
      avatar: row.author_avatar || undefined,
      bureau: row.author_bureau || 'Global Newsroom',
    },
    isBreaking: Boolean(row.is_breaking),
    isLead: Boolean(row.is_lead),
    keyTakeaways: row.key_takeaways ? JSON.parse(row.key_takeaways) : [],
    content: row.content ? JSON.parse(row.content) : [],
    pullQuote: row.pull_quote_text ? {
      text: row.pull_quote_text,
      attribution: row.pull_quote_attribution || 'ARN Correspondent'
    } : undefined,
    audioDuration: row.audio_duration || '4:20',
    commentsCount: Number(row.comments_count || 0),
    tags: row.tags ? JSON.parse(row.tags) : [],
    sourceUrl: row.source_url || undefined,
    sourceName: row.source_name || undefined
  };
}

export async function handleApiRequest(req, res) {
  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = urlObj.pathname;
  const method = req.method;

  // Set JSON headers and CORS
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  try {
    // ----------------------------------------------------
    // 1. HEALTH CHECK & STATS
    // ----------------------------------------------------
    if (pathname === '/api/health') {
      const artCount = Number((await db.prepare('SELECT COUNT(*) as c FROM articles').get()).c);
      const adCount = Number((await db.prepare('SELECT COUNT(*) as c FROM ads').get()).c);
      const staffCount = Number((await db.prepare('SELECT COUNT(*) as c FROM staff').get()).c);
      const wireCount = Number((await db.prepare('SELECT COUNT(*) as c FROM live_updates').get()).c);
      const userCount = Number((await db.prepare('SELECT COUNT(*) as c FROM users').get()).c);

      res.statusCode = 200;
      res.end(JSON.stringify({
        status: 'online',
        database: 'Neon PostgreSQL (serverless)',
        articles: artCount,
        ads: adCount,
        staff: staffCount,
        liveWire: wireCount,
        users: userCount,
        hybridFeed: 'Active (Global Multi-Source Wire: BBC, Al Jazeera, Guardian, Bloomberg, Defense & Aerospace)',
        timestamp: new Date().toISOString()
      }));
      return;
    }

    // ----------------------------------------------------
    // 2. AUTHENTICATION & STAFF ACCOUNTS API
    // ----------------------------------------------------
    // First-run provisioning status: the portal needs setup until a CEO exists.
    if (pathname === '/api/auth/setup-status' && method === 'GET') {
      const ceoCount = Number((await db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'ceo'").get()).c);
      res.statusCode = 200;
      res.end(JSON.stringify({ needsSetup: ceoCount === 0 }));
      return;
    }

    // One-time self-service CEO account creation. Only available while no CEO
    // account exists, so there are no hardcoded default credentials to ship.
    if (pathname === '/api/auth/setup' && method === 'POST') {
      const ceoCount = Number((await db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'ceo'").get()).c);
      if (ceoCount > 0) {
        res.statusCode = 409;
        res.end(JSON.stringify({ error: 'A Chief Executive account already exists. Please sign in instead.' }));
        return;
      }

      const { username, email, password, name } = await getJsonBody(req);
      if (!username || !email || !password || !name) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'Full name, username, email, and passphrase are required.' }));
        return;
      }
      if (password.length < 6) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'Passphrase must be at least 6 characters.' }));
        return;
      }

      const existing = await db.prepare('SELECT id FROM users WHERE LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?)').get(username, email);
      if (existing) {
        res.statusCode = 409;
        res.end(JSON.stringify({ error: 'That username or email is already in use.' }));
        return;
      }

      const id = `user-ceo-${Date.now()}`;
      const now = new Date().toISOString();
      await db.prepare(`
        INSERT INTO users (id, username, email, password_hash, role, staff_id, name, last_login)
        VALUES (?, ?, ?, ?, 'ceo', NULL, ?, ?)
      `).run(id, username, email, hashPassword(password), name, now);

      const token = generateToken({ id, username, email, role: 'ceo', name, staffId: null });

      res.statusCode = 201;
      res.end(JSON.stringify({
        token,
        user: { id, username, email, role: 'ceo', name, staffId: null, lastLogin: now }
      }));
      return;
    }

    if (pathname === '/api/auth/login' && method === 'POST') {
      const body = await getJsonBody(req);
      const { username, password } = body;

      if (!username || !password) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'Username and password required' }));
        return;
      }

      const user = await db.prepare('SELECT * FROM users WHERE LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?)').get(username, username);
      if (!user) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: 'Invalid username or password' }));
        return;
      }

      const isValid = verifyPassword(password, user.password_hash);
      if (!isValid) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: 'Invalid username or password' }));
        return;
      }

      // Update last login
      const now = new Date().toISOString();
      await db.prepare('UPDATE users SET last_login = ? WHERE id = ?').run(now, user.id);

      const tokenPayload = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        name: user.name,
        staffId: user.staff_id
      };

      const token = generateToken(tokenPayload);

      res.statusCode = 200;
      res.end(JSON.stringify({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          name: user.name,
          staffId: user.staff_id,
          lastLogin: now
        }
      }));
      return;
    }

    if (pathname === '/api/auth/me' && method === 'GET') {
      const auth = getAuth(req);
      if (!auth) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: 'Unauthorized. Valid authentication required.' }));
        return;
      }

      const user = await db.prepare('SELECT id, username, email, role, staff_id, name, created_at, last_login FROM users WHERE id = ?').get(auth.id);
      if (!user) {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: 'User profile not found' }));
        return;
      }

      res.statusCode = 200;
      res.end(JSON.stringify({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        name: user.name,
        staffId: user.staff_id,
        lastLogin: user.last_login
      }));
      return;
    }

    if (pathname === '/api/auth/change-password' && method === 'POST') {
      const auth = getAuth(req);
      if (!auth) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: 'Unauthorized' }));
        return;
      }

      const { currentPassword, newPassword } = await getJsonBody(req);
      if (!currentPassword || !newPassword || newPassword.length < 6) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'New password must be at least 6 characters.' }));
        return;
      }

      const user = await db.prepare('SELECT * FROM users WHERE id = ?').get(auth.id);
      if (!user || !verifyPassword(currentPassword, user.password_hash)) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'Current password incorrect' }));
        return;
      }

      const newHash = hashPassword(newPassword);
      await db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, auth.id);

      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, message: 'Password updated successfully' }));
      return;
    }

    // List all users (CEO and Editor only)
    if (pathname === '/api/auth/users' && method === 'GET') {
      const auth = getAuth(req);
      if (!auth || (auth.role !== 'ceo' && auth.role !== 'editor')) {
        res.statusCode = 403;
        res.end(JSON.stringify({ error: 'Access forbidden. CEO or Editor credentials required.' }));
        return;
      }

      const users = await db.prepare('SELECT id, username, email, role, staff_id, name, created_at, last_login FROM users ORDER BY created_at ASC').all();
      res.statusCode = 200;
      res.end(JSON.stringify(users.map(u => ({
        id: u.id,
        username: u.username,
        email: u.email,
        role: u.role,
        name: u.name,
        staffId: u.staff_id,
        createdAt: u.created_at,
        lastLogin: u.last_login
      }))));
      return;
    }

    // Create staff account (CEO or Editor)
    if (pathname === '/api/auth/create-user' && method === 'POST') {
      const auth = getAuth(req);
      if (!auth || (auth.role !== 'ceo' && auth.role !== 'editor')) {
        res.statusCode = 403;
        res.end(JSON.stringify({ error: 'Access forbidden. Only CEO and Editors can create newsroom accounts.' }));
        return;
      }

      const data = await getJsonBody(req);
      const { username, email, password, role, name, staffId } = data;

      if (!username || !email || !password || !name) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'Username, email, password, and name are required' }));
        return;
      }

      // Check existing
      const existing = await db.prepare('SELECT id FROM users WHERE LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?)').get(username, email);
      if (existing) {
        res.statusCode = 409;
        res.end(JSON.stringify({ error: 'Account with this username or email already exists' }));
        return;
      }

      // Disallow non-CEO from creating another CEO
      const targetRole = auth.role === 'ceo' ? (role || 'journalist') : 'journalist';
      const id = `user-${Date.now()}`;
      const pwHash = hashPassword(password);

      await db.prepare(`
        INSERT INTO users (id, username, email, password_hash, role, staff_id, name)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(id, username, email, pwHash, targetRole, staffId || null, name);

      res.statusCode = 201;
      res.end(JSON.stringify({
        id,
        username,
        email,
        role: targetRole,
        name,
        staffId: staffId || null
      }));
      return;
    }

    // Delete user account (CEO only)
    if (pathname.startsWith('/api/auth/users/') && method === 'DELETE') {
      const auth = getAuth(req);
      if (!auth || auth.role !== 'ceo') {
        res.statusCode = 403;
        res.end(JSON.stringify({ error: 'Access forbidden. Only the CEO can delete staff accounts.' }));
        return;
      }

      const userId = pathname.replace('/api/auth/users/', '');
      if (userId === auth.id) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'Cannot delete your own CEO account.' }));
        return;
      }

      await db.prepare('DELETE FROM users WHERE id = ?').run(userId);
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, deletedId: userId }));
      return;
    }

    // ----------------------------------------------------
    // 3. LIVE WIRE INGESTION TRIGGER (On-Demand Sync)
    // ----------------------------------------------------
    if (pathname === '/api/ingest' && method === 'POST') {
      const result = await ingestLiveFeeds();
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, ...result }));
      return;
    }

    // Scheduled feed refresh. Vercel Cron calls this on a schedule and sends
    // `Authorization: Bearer $CRON_SECRET` when CRON_SECRET is configured.
    if (pathname === '/api/cron/ingest') {
      const cronSecret = process.env.CRON_SECRET;
      if (cronSecret) {
        const header = req.headers['authorization'] || '';
        if (header !== `Bearer ${cronSecret}`) {
          res.statusCode = 401;
          res.end(JSON.stringify({ error: 'Unauthorized cron invocation.' }));
          return;
        }
      }
      const result = await ingestLiveFeeds();
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, ...result }));
      return;
    }

    // ----------------------------------------------------
    // 4. ARTICLES API
    // ----------------------------------------------------
    if (pathname === '/api/articles') {
      if (method === 'GET') {
        const q = urlObj.searchParams.get('q');
        const category = urlObj.searchParams.get('category');
        const isBreaking = urlObj.searchParams.get('breaking');

        let sql = `
          SELECT a.*, s.name as author_name, s.role as author_role, s.avatar as author_avatar, s.bureau as author_bureau
          FROM articles a
          LEFT JOIN staff s ON a.author_id = s.id
          WHERE 1=1
        `;
        const params = [];

        if (category && category !== 'All Stories') {
          sql += ' AND LOWER(a.category) = LOWER(?)';
          params.push(category);
        }

        if (isBreaking === 'true' || isBreaking === '1') {
          sql += ' AND a.is_breaking = 1';
        }

        if (q) {
          sql += ' AND (a.title LIKE ? OR a.subtitle LIKE ? OR a.content LIKE ?)';
          const pattern = `%${q}%`;
          params.push(pattern, pattern, pattern);
        }

        // Order by pinned lead, then genuine recency: prefer the feed's real ISO
        // published_at, falling back to created_at for staff posts that store
        // human strings like "Just now".
        sql += ` ORDER BY a.is_lead DESC,
          CASE WHEN a.published_at LIKE '____-__-__T%' THEN a.published_at ELSE a.created_at END DESC,
          a.created_at DESC`;
        const rows = await db.prepare(sql).all(...params);
        res.statusCode = 200;
        res.end(JSON.stringify(rows.map(formatArticle)));
        return;
      }

      if (method === 'POST') {
        const auth = getAuth(req);
        if (!auth) {
          res.statusCode = 401;
          res.end(JSON.stringify({ error: 'Authentication required to publish news.' }));
          return;
        }

        const data = await getJsonBody(req);
        const id = data.id || `arn-${Date.now()}`;
        const stmt = db.prepare(`
          INSERT INTO articles (
            id, title, subtitle, category, image_url, image_caption, published_at,
            read_time, author_id, is_breaking, is_lead, key_takeaways, content,
            pull_quote_text, pull_quote_attribution, audio_duration, comments_count, tags, source_url, source_name
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        // If this article is marked as lead, unset other leads
        if (data.isLead) {
          await db.prepare('UPDATE articles SET is_lead = 0').run();
        }

        const authorId = data.authorId || auth.staffId || null;

        await stmt.run(
          id,
          data.title,
          data.subtitle || null,
          data.category || 'Air & Aerospace',
          data.imageUrl || 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80',
          data.imageCaption || null,
          data.publishedAt || new Date().toISOString(),
          data.readTime || '4 min read',
          authorId,
          data.isBreaking ? 1 : 0,
          data.isLead ? 1 : 0,
          JSON.stringify(data.keyTakeaways || []),
          JSON.stringify(data.content || []),
          data.pullQuote?.text || null,
          data.pullQuote?.attribution || null,
          data.audioDuration || '4:20',
          0,
          JSON.stringify(data.tags || [data.category || 'News', 'ARN']),
          data.sourceUrl || null,
          data.sourceName || null
        );

        // Increment staff article count
        if (authorId) {
          await db.prepare('UPDATE staff SET articles_count = articles_count + 1 WHERE id = ?').run(authorId);
        }

        const inserted = await db.prepare(`
          SELECT a.*, s.name as author_name, s.role as author_role, s.avatar as author_avatar, s.bureau as author_bureau
          FROM articles a
          LEFT JOIN staff s ON a.author_id = s.id
          WHERE a.id = ?
        `).get(id);

        res.statusCode = 201;
        res.end(JSON.stringify(formatArticle(inserted)));
        return;
      }
    }

    // Article Single / Delete
    if (pathname.startsWith('/api/articles/')) {
      const id = pathname.replace('/api/articles/', '');
      if (method === 'GET') {
        const row = await db.prepare(`
          SELECT a.*, s.name as author_name, s.role as author_role, s.avatar as author_avatar, s.bureau as author_bureau
          FROM articles a
          LEFT JOIN staff s ON a.author_id = s.id
          WHERE a.id = ?
        `).get(id);

        if (!row) {
          res.statusCode = 404;
          res.end(JSON.stringify({ error: 'Article not found' }));
          return;
        }

        res.statusCode = 200;
        res.end(JSON.stringify(formatArticle(row)));
        return;
      }

      if (method === 'DELETE') {
        const auth = getAuth(req);
        if (!auth) {
          res.statusCode = 401;
          res.end(JSON.stringify({ error: 'Authentication required to delete stories.' }));
          return;
        }

        await db.prepare('DELETE FROM articles WHERE id = ?').run(id);
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, deletedId: id }));
        return;
      }
    }

    // ----------------------------------------------------
    // 5. ADS & COMMERCIAL SPONSORSHIPS API
    // ----------------------------------------------------
    if (pathname === '/api/ads') {
      if (method === 'GET') {
        const rows = await db.prepare('SELECT * FROM ads ORDER BY created_at DESC').all();
        const ads = rows.map(r => ({
          id: r.id,
          clientName: r.client_name,
          title: r.title,
          tagline: r.tagline,
          imageUrl: r.image_url,
          targetUrl: r.target_url,
          placement: r.placement,
          active: Boolean(r.active),
          impressions: Number(r.impressions || 0),
          clicks: Number(r.clicks || 0),
          badgeText: r.badge_text || undefined
        }));

        await db.prepare('UPDATE ads SET impressions = impressions + 1 WHERE active = 1').run();

        res.statusCode = 200;
        res.end(JSON.stringify(ads));
        return;
      }

      if (method === 'POST') {
        const auth = getAuth(req);
        if (!auth || (auth.role !== 'ceo' && auth.role !== 'editor')) {
          res.statusCode = 403;
          res.end(JSON.stringify({ error: 'Commercial ad management requires CEO or Senior Editor credentials.' }));
          return;
        }

        const data = await getJsonBody(req);
        const id = data.id || `ad-${Date.now()}`;
        await db.prepare(`
          INSERT INTO ads (id, client_name, title, tagline, image_url, target_url, placement, active, impressions, clicks, badge_text)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          id,
          data.clientName,
          data.title,
          data.tagline || 'Official Partner of Air Real News Media Network',
          data.imageUrl,
          data.targetUrl,
          data.placement || 'top-billboard',
          data.active !== undefined ? (data.active ? 1 : 0) : 1,
          1,
          0,
          data.badgeText || 'SPONSORED'
        );

        const created = await db.prepare('SELECT * FROM ads WHERE id = ?').get(id);
        res.statusCode = 201;
        res.end(JSON.stringify({
          id: created.id,
          clientName: created.client_name,
          title: created.title,
          tagline: created.tagline,
          imageUrl: created.image_url,
          targetUrl: created.target_url,
          placement: created.placement,
          active: Boolean(created.active),
          impressions: created.impressions,
          clicks: created.clicks,
          badgeText: created.badge_text
        }));
        return;
      }
    }

    if (pathname.startsWith('/api/ads/')) {
      const subpath = pathname.replace('/api/ads/', '');
      
      if (subpath.endsWith('/click') && method === 'POST') {
        const adId = subpath.replace('/click', '');
        await db.prepare('UPDATE ads SET clicks = clicks + 1 WHERE id = ?').run(adId);
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, adId }));
        return;
      }

      if (subpath.endsWith('/toggle') && method === 'PUT') {
        const auth = getAuth(req);
        if (!auth || (auth.role !== 'ceo' && auth.role !== 'editor')) {
          res.statusCode = 403;
          res.end(JSON.stringify({ error: 'Unauthorized ad operations.' }));
          return;
        }

        const adId = subpath.replace('/toggle', '');
        await db.prepare('UPDATE ads SET active = CASE WHEN active = 1 THEN 0 ELSE 1 END WHERE id = ?').run(adId);
        const updated = await db.prepare('SELECT * FROM ads WHERE id = ?').get(adId);
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, active: Boolean(updated?.active) }));
        return;
      }

      if (method === 'DELETE') {
        const auth = getAuth(req);
        if (!auth || (auth.role !== 'ceo' && auth.role !== 'editor')) {
          res.statusCode = 403;
          res.end(JSON.stringify({ error: 'Unauthorized ad removal.' }));
          return;
        }

        const adId = subpath;
        await db.prepare('DELETE FROM ads WHERE id = ?').run(adId);
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, deletedId: adId }));
        return;
      }
    }

    // ----------------------------------------------------
    // 6. STAFF DIRECTORY API
    // ----------------------------------------------------
    if (pathname === '/api/staff') {
      if (method === 'GET') {
        const rows = await db.prepare('SELECT * FROM staff ORDER BY name ASC').all();
        const staff = rows.map(r => ({
          id: r.id,
          name: r.name,
          role: r.role,
          bureau: r.bureau,
          email: r.email,
          avatar: r.avatar,
          bio: r.bio,
          articlesCount: Number(r.articles_count || 0)
        }));
        res.statusCode = 200;
        res.end(JSON.stringify(staff));
        return;
      }

      if (method === 'POST') {
        const auth = getAuth(req);
        if (!auth || (auth.role !== 'ceo' && auth.role !== 'editor')) {
          res.statusCode = 403;
          res.end(JSON.stringify({ error: 'Accreditation requires CEO or Managing Editor credentials.' }));
          return;
        }

        const data = await getJsonBody(req);
        const id = data.id || `staff-${Date.now()}`;
        await db.prepare(`
          INSERT INTO staff (id, name, role, bureau, email, avatar, bio, articles_count)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          id,
          data.name,
          data.role,
          data.bureau || 'London Bureau',
          data.email || `${data.name.toLowerCase().replace(/\s+/g, '.')}@airrealnews.org`,
          data.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
          data.bio || 'Accredited Journalist at Air Real News Network.',
          0
        );

        const created = await db.prepare('SELECT * FROM staff WHERE id = ?').get(id);
        res.statusCode = 201;
        res.end(JSON.stringify(created));
        return;
      }
    }

    // ----------------------------------------------------
    // 7. LIVE WIRE DISPATCHES API
    // ----------------------------------------------------
    if (pathname === '/api/live-wire') {
      if (method === 'GET') {
        const rows = await db.prepare('SELECT * FROM live_updates ORDER BY COALESCE(published_at, created_at) DESC LIMIT 50').all();
        const updates = rows.map(r => ({
          id: r.id,
          timestamp: r.timestamp,
          timeAgo: formatLiveTimeAgo(r.published_at || r.created_at) || r.time_ago || 'Live',
          title: r.title,
          content: r.content,
          author: r.author,
          isFlash: Boolean(r.is_flash),
          category: r.category,
          sourceUrl: r.source_url || undefined,
          sourceName: r.source_name || undefined
        }));
        res.statusCode = 200;
        res.end(JSON.stringify(updates));
        return;
      }

      if (method === 'POST') {
        const auth = getAuth(req);
        if (!auth) {
          res.statusCode = 401;
          res.end(JSON.stringify({ error: 'Authentication required to broadcast live wire dispatches.' }));
          return;
        }

        const data = await getJsonBody(req);
        const id = data.id || `wire-${Date.now()}`;
        await db.prepare(`
          INSERT INTO live_updates (id, timestamp, time_ago, title, content, author, is_flash, category, source_url, source_name)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          id,
          data.timestamp || `${new Date().getUTCHours().toString().padStart(2, '0')}:${new Date().getUTCMinutes().toString().padStart(2, '0')} GMT`,
          data.timeAgo || 'Just now',
          data.title,
          data.content,
          data.author || auth.name || 'ARN Wire Desk',
          data.isFlash ? 1 : 0,
          data.category || 'Airspace Alert',
          data.sourceUrl || null,
          data.sourceName || null
        );

        const created = await db.prepare('SELECT * FROM live_updates WHERE id = ?').get(id);
        res.statusCode = 201;
        res.end(JSON.stringify({
          id: created.id,
          timestamp: created.timestamp,
          timeAgo: created.time_ago,
          title: created.title,
          content: created.content,
          author: created.author,
          isFlash: Boolean(created.is_flash),
          category: created.category,
          sourceUrl: created.source_url || undefined,
          sourceName: created.source_name || undefined
        }));
        return;
      }
    }

    // ----------------------------------------------------
    // 8. COMMENTS API (Public with reader identification)
    // ----------------------------------------------------
    if (pathname.startsWith('/api/comments')) {
      if (pathname === '/api/comments' && method === 'POST') {
        const data = await getJsonBody(req);
        const id = data.id || `c-${Date.now()}`;
        await db.prepare(`
          INSERT INTO comments (id, article_id, author_name, avatar, timestamp, text, likes)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
          id,
          data.articleId,
          data.authorName || 'Verified Reader',
          data.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
          data.timestamp || 'Just now',
          data.text,
          1
        );

        await db.prepare('UPDATE articles SET comments_count = comments_count + 1 WHERE id = ?').run(data.articleId);

        const created = await db.prepare('SELECT * FROM comments WHERE id = ?').get(id);
        res.statusCode = 201;
        res.end(JSON.stringify(created));
        return;
      }

      const parts = pathname.split('/');
      if (parts.length === 4 && method === 'GET') {
        const articleId = parts[3];
        const rows = await db.prepare('SELECT * FROM comments WHERE article_id = ? ORDER BY created_at DESC').all(articleId);
        res.statusCode = 200;
        res.end(JSON.stringify(rows));
        return;
      }

      if (pathname.endsWith('/like') && method === 'POST') {
        const commentId = parts[3];
        await db.prepare('UPDATE comments SET likes = likes + 1 WHERE id = ?').run(commentId);
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, commentId }));
        return;
      }
    }

    // ----------------------------------------------------
    // 9. TELEMETRY API
    // ----------------------------------------------------
    if (pathname === '/api/telemetry' && method === 'GET') {
      const rows = await db.prepare('SELECT * FROM telemetry').all();
      res.statusCode = 200;
      res.end(JSON.stringify(rows));
      return;
    }

    // 404
    res.statusCode = 404;
    res.end(JSON.stringify({ error: `Route ${pathname} not found on Air Real News Backend` }));

  } catch (error) {
    console.error('API Error:', error);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: error.message || 'Internal Server Error' }));
  }
}
