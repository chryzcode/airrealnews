export interface Article {
  id: string;
  title: string;
  subtitle?: string;
  category: 'National' | 'Air & Aerospace' | 'World' | 'Defense & Security' | 'Geopolitics' | 'Economy' | 'Climate & Tech' | 'Analysis' | 'Investigation';
  imageUrl: string;
  imageCaption?: string;
  publishedAt: string;
  readTime: string;
  authorId?: string;
  author: {
    name: string;
    role: string;
    avatar?: string;
    bureau?: string;
    location?: string;
  };
  isBreaking?: boolean;
  isLead?: boolean;
  isSponsored?: boolean;
  isTrending?: boolean;
  sponsorName?: string;
  keyTakeaways?: string[];
  content: string[];
  pullQuote?: {
    text: string;
    attribution: string;
  };
  audioDuration?: string;
  commentsCount: number;
  tags: string[];
  sourceUrl?: string;
  sourceName?: string;
}

export interface AdCampaign {
  id: string;
  clientName: string;
  title: string;
  tagline: string;
  imageUrl: string;
  targetUrl: string;
  placement: 'top-billboard' | 'sidebar' | 'in-feed';
  active: boolean;
  impressions: number;
  clicks: number;
  badgeText?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  bureau: string;
  email: string;
  avatar: string;
  bio: string;
  articlesCount: number;
}

export interface BroadcastProgram {
  id: string;
  title: string;
  time: string;
  duration: string;
  host: string;
  description: string;
  thumbnail: string;
  isNow?: boolean;
}

export interface LiveUpdate {
  id: string;
  timestamp: string; // e.g. "15:45 GMT"
  timeAgo: string;
  title: string;
  content: string;
  author: string;
  isFlash?: boolean;
  category: string;
  sourceUrl?: string;
  sourceName?: string;
}

export interface Comment {
  id: string;
  articleId: string;
  authorName: string;
  avatar: string;
  timestamp: string;
  text: string;
  likes: number;
}
