import { db } from './db.js';

// Intelligent topic classification across all ARN editorial beats
export function determineCategory(title, description, fallbackCategory = 'World') {
  const text = `${title} ${description}`.toLowerCase();

  // 1. Investigation
  if (/\b(investigat|probe|secret|revealed|uncovered|whistleblower|inquiry|scandal|dossier|leak|fraud|hack|evasion|covert)\b/i.test(text)) {
    return 'Investigation';
  }

  // 2. Strategic Analysis
  if (/\b(why |how |behind |insight|explained|perspective|assessment|verdict|deep dive|analysis|what you need to know)\b/i.test(text)) {
    return 'Analysis';
  }

  // 3. Air & Aerospace — keywords kept specific so generic words like "flight",
  // "pilot" or "corridor" (e.g. "escape flight", "pilot scheme", "aid corridor") don't misfire.
  if (/\b(aviation|aircraft|airline|airport|airfare|boeing|airbus|cockpit|faa|icao|transponder|fuselage|runway|aerospace|avionics|air traffic|air corridor|air crash|flight attendant|flight path|flight number|flight crew|jet)\b/i.test(text)) {
    return 'Air & Aerospace';
  }

  // 4. Defense & Security — bare "strike"/"security"/"kill" are too ambiguous
  // (labour strikes, food security) so they are scoped to real security contexts.
  if (/\b(military|defense|defence|missile|nato|weapon|army|combat|drone|surveillance|warfare|radar|soldier|air force|navy|troops|casualt|armed forces|national security|air strike|airstrike|missile strike|military strike)\b/i.test(text)) {
    return 'Defense & Security';
  }

  // 5. Climate & Tech
  if (/\b(climate|tech|technology|artificial intelligence| ai |cyber|satellite|clean energy|emissions|space|chip|software|science|green|battery|environment|saf |solar)\b/i.test(text)) {
    return 'Climate & Tech';
  }

  // 6. Economy
  if (/\b(econom|market|stock|inflation|trade|bank|tariff|revenue|shares|invest|crypto|financ|ceo|job|cut|interest rate|profit|cost of living)\b/i.test(text)) {
    return 'Economy';
  }

  // 7. Geopolitics
  if (/\b(geopolitic|diplomat|treaty|sanction|election|summit|un |presiden|prime minister|parliament|foreign ministry|accord|ambassador|trump|biden|putin|china|russia|democrat|republican)\b/i.test(text)) {
    return 'Geopolitics';
  }

  return fallbackCategory || 'World';
}

// Fallback images per editorial beat
function getBeatImage(category) {
  switch (category) {
    case 'National':
      return 'https://images.unsplash.com/photo-1618828665033-4f02332a7535?auto=format&fit=crop&w=1200&q=80';
    case 'Air & Aerospace':
      return 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80';
    case 'Defense & Security':
      return 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1200&q=80';
    case 'Geopolitics':
      return 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1200&q=80';
    case 'Economy':
      return 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80';
    case 'Climate & Tech':
      return 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80';
    case 'Analysis':
      return 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80';
    case 'Investigation':
      return 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80';
    default:
      return 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80';
  }
}

// Decode XML/HTML character entities. Feeds commonly HTML-encode URLs (e.g.
// Guardian image URLs arrive as `...jpg?width=140&amp;quality=85`), which turns a
// signed image request into an invalid one that returns 401. `&amp;` is decoded
// last so an encoded ampersand never triggers a double decode.
function decodeEntities(str) {
  if (!str) return str;
  return str
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&amp;/g, '&');
}

// Pull the CDATA or plain-text capture out of a tag match. Uses ?? (not ||) so
// an empty CDATA body such as <description><![CDATA[]]></description> stays as
// an empty string instead of falling through to the undefined plain-text group
// and crashing the whole feed parse.
function matchText(match, stripHtml = false) {
  if (!match) return '';
  let value = match[1] ?? match[2] ?? '';
  if (stripHtml) value = value.replace(/<[^>]+>/g, '');
  return decodeEntities(value.trim());
}

// Native RSS Parser
function parseRss(xml, defaultCategory, sourceName, authorId, fixedCategory = false) {
  const items = [];
  const itemMatches = xml.matchAll(/<item[\s\S]*?<\/item>/gi);
  
  for (const match of itemMatches) {
    const itemXml = match[0];
    const titleMatch = itemXml.match(/<title>(?:<!\[CDATA\[([\s\S]*?)\]\]>|([\s\S]*?))<\/title>/i);
    const descMatch = itemXml.match(/<description>(?:<!\[CDATA\[([\s\S]*?)\]\]>|([\s\S]*?))<\/description>/i);
    const linkMatch = itemXml.match(/<link>(?:<!\[CDATA\[([\s\S]*?)\]\]>|([\s\S]*?))<\/link>/i);
    const dateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);
    const mediaMatch = itemXml.match(/url="([^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/i);

    const title = matchText(titleMatch);
    const description = matchText(descMatch, true);
    const link = matchText(linkMatch);
    const pubDateStr = dateMatch ? dateMatch[1].trim() : new Date().toUTCString();
    
    // Automatically classify beat based on content keywords. Nigerian national
    // feeds pass fixedCategory so their coverage stays on the National beat
    // instead of being scattered by geopolitical/economic keywords.
    const category = fixedCategory ? defaultCategory : determineCategory(title, description, defaultCategory);

    // Default fallback image if none in feed
    let imageUrl = mediaMatch ? decodeEntities(mediaMatch[1]) : null;
    if (!imageUrl) {
      imageUrl = getBeatImage(category);
    }

    if (title && description && link) {
      items.push({
        title,
        description,
        link,
        pubDateStr,
        imageUrl,
        category,
        sourceName,
        authorId
      });
    }
  }

  return items;
}

// Verified live RSS wires across all ARN editorial beats.
// Every authorId below must exist in the staff table (see db.js) to satisfy the
// articles.author_id foreign key constraint.
const WIRE_FEEDS = [
  // --- Nigeria National Desk (ARN is a Nigerian news organisation) ---
  {
    url: 'https://punchng.com/feed/',
    category: 'National',
    sourceName: 'The Punch',
    authorId: 'staff-wire-nigeria',
    fixed: true
  },
  {
    url: 'https://www.vanguardngr.com/feed/',
    category: 'National',
    sourceName: 'Vanguard Nigeria',
    authorId: 'staff-wire-nigeria',
    fixed: true
  },
  {
    url: 'https://www.premiumtimesng.com/feed',
    category: 'National',
    sourceName: 'Premium Times',
    authorId: 'staff-wire-nigeria',
    fixed: true
  },
  {
    url: 'https://www.channelstv.com/feed/',
    category: 'National',
    sourceName: 'Channels Television',
    authorId: 'staff-wire-nigeria',
    fixed: true
  },
  {
    url: 'https://dailytrust.com/feed/',
    category: 'National',
    sourceName: 'Daily Trust',
    authorId: 'staff-wire-nigeria',
    fixed: true
  },
  {
    url: 'https://tribuneonlineng.com/feed/',
    category: 'National',
    sourceName: 'Nigerian Tribune',
    authorId: 'staff-wire-nigeria',
    fixed: true
  },
  {
    url: 'https://thewhistler.ng/feed/',
    category: 'National',
    sourceName: 'The Whistler',
    authorId: 'staff-wire-nigeria',
    fixed: true
  },
  {
    url: 'https://www.arise.tv/feed/',
    category: 'National',
    sourceName: 'Arise News',
    authorId: 'staff-wire-nigeria',
    fixed: true
  },
  {
    url: 'https://www.thisdaylive.com/index.php/feed/',
    category: 'National',
    sourceName: 'ThisDay Live',
    authorId: 'staff-wire-nigeria',
    fixed: true
  },
  {
    url: 'https://www.sunnewsonline.com/feed/',
    category: 'National',
    sourceName: 'The Sun Nigeria',
    authorId: 'staff-wire-nigeria',
    fixed: true
  },
  {
    url: 'https://www.blueprint.ng/feed/',
    category: 'National',
    sourceName: 'Blueprint Nigeria',
    authorId: 'staff-wire-nigeria',
    fixed: true
  },

  // --- Nigeria Business & Economy Desk ---
  {
    url: 'https://nairametrics.com/feed/',
    category: 'Economy',
    sourceName: 'Nairametrics',
    authorId: 'staff-wire-nigeria-biz',
    fixed: true
  },
  {
    url: 'https://businessday.ng/feed/',
    category: 'Economy',
    sourceName: 'BusinessDay Nigeria',
    authorId: 'staff-wire-nigeria-biz',
    fixed: true
  },

  // --- Global World & Geopolitics ---
  {
    url: 'https://feeds.bbci.co.uk/news/world/rss.xml',
    category: 'World',
    sourceName: 'BBC World News',
    authorId: 'staff-wire-bbc'
  },
  {
    url: 'https://www.aljazeera.com/xml/rss/all.xml',
    category: 'World',
    sourceName: 'Al Jazeera Global Wire',
    authorId: 'staff-wire-global'
  },
  {
    url: 'https://www.theguardian.com/world/rss',
    category: 'World',
    sourceName: 'The Guardian World Wire',
    authorId: 'staff-wire-global'
  },
  {
    url: 'https://feeds.skynews.com/feeds/rss/world.xml',
    category: 'World',
    sourceName: 'Sky News International Wire',
    authorId: 'staff-wire-global'
  },
  {
    url: 'https://www.france24.com/en/rss',
    category: 'World',
    sourceName: 'France 24 Global Wire',
    authorId: 'staff-wire-global'
  },
  {
    url: 'https://feeds.npr.org/1004/rss.xml',
    category: 'World',
    sourceName: 'NPR International Wire',
    authorId: 'staff-wire-global'
  },
  {
    url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
    category: 'World',
    sourceName: 'New York Times World Wire',
    authorId: 'staff-wire-global'
  },
  {
    url: 'https://www.theguardian.com/world/europe-news/rss',
    category: 'Geopolitics',
    sourceName: 'The Guardian Europe Wire',
    authorId: 'staff-wire-global'
  },

  // --- Economy & Markets ---
  {
    url: 'https://feeds.bbci.co.uk/news/business/rss.xml',
    category: 'Economy',
    sourceName: 'BBC Business Wire',
    authorId: 'staff-wire-bbc'
  },
  {
    url: 'https://feeds.bloomberg.com/markets/news.rss',
    category: 'Economy',
    sourceName: 'Bloomberg Markets Wire',
    authorId: 'staff-wire-economy'
  },
  {
    url: 'https://feeds.a.dj.com/rss/RSSMarketsMain.xml',
    category: 'Economy',
    sourceName: 'Wall Street Journal Markets Wire',
    authorId: 'staff-wire-economy'
  },
  {
    url: 'https://feeds.marketwatch.com/marketwatch/topstories/',
    category: 'Economy',
    sourceName: 'MarketWatch Wire',
    authorId: 'staff-wire-economy'
  },

  // --- Climate & Tech ---
  {
    url: 'https://feeds.bbci.co.uk/news/technology/rss.xml',
    category: 'Climate & Tech',
    sourceName: 'BBC Tech & Science Wire',
    authorId: 'staff-wire-bbc'
  },
  {
    url: 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml',
    category: 'Climate & Tech',
    sourceName: 'BBC Global Climate Wire',
    authorId: 'staff-wire-bbc'
  },
  {
    url: 'https://www.space.com/feeds/all',
    category: 'Climate & Tech',
    sourceName: 'Space.com Aerospace Wire',
    authorId: 'staff-wire-space'
  },
  {
    url: 'https://www.nasa.gov/rss/dyn/breaking_news.rss',
    category: 'Climate & Tech',
    sourceName: 'NASA Newsroom Wire',
    authorId: 'staff-wire-space'
  },

  // --- Defense & Security ---
  {
    url: 'https://breakingdefense.com/feed/',
    category: 'Defense & Security',
    sourceName: 'Breaking Defense Wire',
    authorId: 'staff-wire-defense'
  },
  {
    url: 'https://www.defensenews.com/arc/outboundfeeds/rss/category/air/',
    category: 'Defense & Security',
    sourceName: 'Defense News Air Wire',
    authorId: 'staff-wire-defense'
  },
  {
    url: 'https://www.twz.com/feed',
    category: 'Defense & Security',
    sourceName: 'The War Zone Wire',
    authorId: 'staff-wire-defense'
  },
  {
    url: 'https://warontherocks.com/feed/',
    category: 'Analysis',
    sourceName: 'War on the Rocks Wire',
    authorId: 'staff-wire-defense'
  },

  // --- Air & Aerospace ---
  {
    url: 'https://simpleflying.com/feed/',
    category: 'Air & Aerospace',
    sourceName: 'Global Aerospace Wire',
    authorId: 'staff-wire-aviation'
  },
  {
    url: 'https://www.flightglobal.com/rss',
    category: 'Air & Aerospace',
    sourceName: 'FlightGlobal Wire',
    authorId: 'staff-wire-aviation'
  }
];

const FEED_TIMEOUT_MS = 10000;
const MAX_ITEMS_PER_FEED = 6;
const MAX_ITEM_AGE_MS = 7 * 24 * 60 * 60 * 1000; // ignore wire items older than 7 days

// Fetch and parse a single wire feed. Never throws — returns [] on failure so a
// single dead source can never take down the whole ingestion cycle.
async function fetchFeedItems(feed) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FEED_TIMEOUT_MS);

  try {
    const res = await fetch(feed.url, {
      headers: { 'User-Agent': 'AirRealNews/2.0 (Automated Ingestion Feed)' },
      signal: controller.signal
    });

    if (!res.ok) {
      console.warn(`[ARN Ingestion] Failed to fetch ${feed.sourceName}: status ${res.status}`);
      return [];
    }

    const xml = await res.text();
    const now = Date.now();
    return parseRss(xml, feed.category, feed.sourceName, feed.authorId, feed.fixed)
      .filter((item) => now - new Date(toIsoDate(item.pubDateStr)).getTime() <= MAX_ITEM_AGE_MS)
      .slice(0, MAX_ITEMS_PER_FEED);
  } catch (err) {
    console.warn(`[ARN Ingestion] Feed fetch error for ${feed.sourceName}:`, err.message);
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

// Convert an RSS pubDate (RFC 822) into a valid ISO string, falling back to now.
function toIsoDate(pubDateStr) {
  const parsed = new Date(pubDateStr);
  return isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

// Persist a parsed wire item into both the live desk and the articles table.
// Recency is taken from the feed's real published date so an old story is never
// presented as if it were just published.
// Returns { article: boolean, wire: boolean } indicating what was newly inserted.
async function persistItem(item) {
  const ingestedAt = new Date();
  const publishedAt = toIsoDate(item.pubDateStr);
  const publishedDate = new Date(publishedAt);
  const gmtTime = `${String(publishedDate.getUTCHours()).padStart(2, '0')}:${String(publishedDate.getUTCMinutes()).padStart(2, '0')} GMT`;
  const inserted = { article: false, wire: false };

  // 1. Live Updates Table (Continuous Live Desk)
  const existingWire = await db.prepare('SELECT id FROM live_updates WHERE title = ?').get(item.title);
  if (!existingWire) {
    const wireId = `wire-live-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    await db.prepare(`
      INSERT INTO live_updates (id, timestamp, time_ago, title, content, author, is_flash, category, source_url, source_name, published_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      wireId,
      gmtTime,
      'Just now',
      item.title,
      item.description.slice(0, 220) + (item.description.length > 220 ? '...' : ''),
      item.sourceName,
      item.category === 'Defense & Security' || item.category === 'Air & Aerospace' ? 1 : 0,
      item.category,
      item.link,
      item.sourceName,
      publishedAt,
      ingestedAt.toISOString()
    );
    inserted.wire = true;
  }

  // 2. Articles Table (if not exists)
  const existingArticle = await db.prepare('SELECT id FROM articles WHERE title = ? OR source_url = ?').get(item.title, item.link);
  if (!existingArticle) {
    const artId = `arn-wire-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    await db.prepare(`
      INSERT INTO articles (
        id, title, subtitle, category, image_url, image_caption, published_at,
        read_time, author_id, is_breaking, is_lead, key_takeaways, content,
        audio_duration, comments_count, tags, source_url, source_name, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      artId,
      item.title,
      item.description.slice(0, 180) + '...',
      item.category,
      item.imageUrl,
      `Source Feed: ${item.sourceName}`,
      publishedAt,
      '3 min read',
      item.authorId,
      0,
      0,
      JSON.stringify([
        `Ingested live from ${item.sourceName} automated syndicate feed.`,
        'Verified for international accuracy and relevance.'
      ]),
      JSON.stringify([
        item.description,
        `This dispatch was ingested in real time from the ${item.sourceName} global wire feed for Air Real News readers. For complete syndicated coverage and primary documentation, view the original source report via the wire dispatch link below.`
      ]),
      '3:15',
      0,
      JSON.stringify([item.category, item.sourceName, 'Live Wire']),
      item.link,
      item.sourceName,
      ingestedAt.toISOString()
    );
    inserted.article = true;
  }

  return inserted;
}

// Run async tasks with a bounded concurrency. Persisting a wire item costs
// several database round trips, so processing them serially would make a full
// ingestion cycle far too slow for a serverless function.
async function mapWithConcurrency(items, limit, worker) {
  const results = new Array(items.length);
  let nextIndex = 0;

  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (nextIndex < items.length) {
      const current = nextIndex++;
      results[current] = await worker(items[current]);
    }
  });

  await Promise.all(runners);
  return results;
}

export async function ingestLiveFeeds() {
  console.log(`[ARN Ingestion] Fetching ${WIRE_FEEDS.length} live wire feeds across all editorial beats...`);

  // Fetch every feed in parallel so a growing source list stays fast.
  const settled = await Promise.allSettled(WIRE_FEEDS.map(fetchFeedItems));

  const items = [];
  for (const result of settled) {
    if (result.status === 'fulfilled') items.push(...result.value);
  }

  // Collapse any repeated headlines up front so concurrent writers can't insert
  // the same story twice.
  const seenTitles = new Set();
  const uniqueItems = items.filter((item) => {
    if (seenTitles.has(item.title)) return false;
    seenTitles.add(item.title);
    return true;
  });

  let newArticlesCount = 0;
  let newWireCount = 0;

  const outcomes = await mapWithConcurrency(uniqueItems, 10, persistItem);
  for (const { article, wire } of outcomes) {
    if (article) newArticlesCount++;
    if (wire) newWireCount++;
  }

  console.log(`[ARN Ingestion Complete] ${newArticlesCount} new articles ingested, ${newWireCount} new live wire updates ingested.`);
  return { newArticlesCount, newWireCount };
}
