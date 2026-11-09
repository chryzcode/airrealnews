import { Article, AdCampaign, StaffMember, LiveUpdate, Comment } from '../types/news';

const BASE_URL = '/api';
const TOKEN_KEY = 'arn_auth_token_v1';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: 'ceo' | 'editor' | 'journalist';
  name: string;
  staffId?: string;
  createdAt?: string;
  lastLogin?: string;
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

function authHeaders(additional: Record<string, string> = {}): Record<string, string> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...additional,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// ----------------------------------------------------
// AUTHENTICATION APIs
// ----------------------------------------------------
export async function login(username: string, password: string): Promise<{ token: string; user: AuthUser }> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Invalid credentials');
  }
  const data = await res.json();
  setStoredToken(data.token);
  return data;
}

export async function fetchCurrentUser(): Promise<AuthUser> {
  const res = await fetch(`${BASE_URL}/auth/me`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Not authenticated');
  return res.json();
}

export async function getSetupStatus(): Promise<{ needsSetup: boolean }> {
  const res = await fetch(`${BASE_URL}/auth/setup-status`);
  if (!res.ok) throw new Error('Failed to check newsroom setup status');
  return res.json();
}

export async function setupCeoAccount(userData: {
  username: string;
  email: string;
  password: string;
  name: string;
}): Promise<{ token: string; user: AuthUser }> {
  const res = await fetch(`${BASE_URL}/auth/setup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to set up the Chief Executive account');
  }
  const data = await res.json();
  setStoredToken(data.token);
  return data;
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${BASE_URL}/auth/change-password`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to change password');
  }
  return res.json();
}

export async function fetchAllUsers(): Promise<AuthUser[]> {
  const res = await fetch(`${BASE_URL}/auth/users`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch newsroom team accounts');
  return res.json();
}

export async function createUser(userData: {
  username: string;
  email: string;
  password: string;
  role: 'ceo' | 'editor' | 'journalist';
  name: string;
  staffId?: string;
}): Promise<AuthUser> {
  const res = await fetch(`${BASE_URL}/auth/create-user`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(userData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create staff account');
  }
  return res.json();
}

export async function deleteUser(userId: string): Promise<{ success: boolean }> {
  const res = await fetch(`${BASE_URL}/auth/users/${userId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to delete account');
  }
  return res.json();
}

// ----------------------------------------------------
// ARTICLES APIs
// ----------------------------------------------------
export async function fetchArticles(params?: { category?: string; q?: string; breaking?: boolean }): Promise<Article[]> {
  const query = new URLSearchParams();
  if (params?.category && params.category !== 'All Stories') query.set('category', params.category);
  if (params?.q) query.set('q', params.q);
  if (params?.breaking) query.set('breaking', '1');

  const res = await fetch(`${BASE_URL}/articles?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch articles from ARN backend');
  return res.json();
}

export async function fetchArticleById(id: string): Promise<Article> {
  const res = await fetch(`${BASE_URL}/articles/${id}`);
  if (!res.ok) throw new Error('Failed to fetch article from ARN backend');
  return res.json();
}

export async function publishArticle(article: Partial<Article>): Promise<Article> {
  const res = await fetch(`${BASE_URL}/articles`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(article),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to publish article to ARN backend');
  }
  return res.json();
}

export async function deleteArticle(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`${BASE_URL}/articles/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to delete article');
  }
  return res.json();
}

export async function triggerLiveIngestion(): Promise<{ success: boolean; newArticlesCount: number; newWireCount: number }> {
  const res = await fetch(`${BASE_URL}/ingest`, {
    method: 'POST',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to trigger live wire ingestion');
  return res.json();
}

// ----------------------------------------------------
// ADS APIs
// ----------------------------------------------------
export async function fetchAds(): Promise<AdCampaign[]> {
  const res = await fetch(`${BASE_URL}/ads`);
  if (!res.ok) throw new Error('Failed to fetch advertisements');
  return res.json();
}

export async function createAd(ad: Partial<AdCampaign>): Promise<AdCampaign> {
  const res = await fetch(`${BASE_URL}/ads`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(ad),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create advertisement');
  }
  return res.json();
}

export async function toggleAd(id: string): Promise<{ success: boolean; active: boolean }> {
  const res = await fetch(`${BASE_URL}/ads/${id}/toggle`, {
    method: 'PUT',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to toggle advertisement status');
  return res.json();
}

export async function recordAdClick(id: string): Promise<void> {
  await fetch(`${BASE_URL}/ads/${id}/click`, {
    method: 'POST',
  });
}

export async function deleteAd(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`${BASE_URL}/ads/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete advertisement');
  return res.json();
}

// ----------------------------------------------------
// STAFF & WIRE APIs
// ----------------------------------------------------
export async function fetchStaff(): Promise<StaffMember[]> {
  const res = await fetch(`${BASE_URL}/staff`);
  if (!res.ok) throw new Error('Failed to fetch ARN newsroom staff');
  return res.json();
}

export async function createStaff(staff: Partial<StaffMember>): Promise<StaffMember> {
  const res = await fetch(`${BASE_URL}/staff`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(staff),
  });
  if (!res.ok) throw new Error('Failed to accredit staff member');
  return res.json();
}

export async function fetchLiveWire(): Promise<LiveUpdate[]> {
  const res = await fetch(`${BASE_URL}/live-wire`);
  if (!res.ok) throw new Error('Failed to fetch live wire dispatches');
  return res.json();
}

export async function broadcastLiveWire(wire: Partial<LiveUpdate>): Promise<LiveUpdate> {
  const res = await fetch(`${BASE_URL}/live-wire`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(wire),
  });
  if (!res.ok) throw new Error('Failed to broadcast wire dispatch');
  return res.json();
}

// ----------------------------------------------------
// COMMENTS & TELEMETRY APIs
// ----------------------------------------------------
export async function fetchComments(articleId: string): Promise<Comment[]> {
  const res = await fetch(`${BASE_URL}/comments/${articleId}`);
  if (!res.ok) throw new Error('Failed to fetch comments');
  return res.json();
}

export async function postComment(comment: {
  articleId: string;
  authorName: string;
  text: string;
  avatar?: string;
}): Promise<Comment> {
  const res = await fetch(`${BASE_URL}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(comment),
  });
  if (!res.ok) throw new Error('Failed to submit reader insight');
  return res.json();
}

export async function likeComment(commentId: string): Promise<void> {
  await fetch(`${BASE_URL}/comments/${commentId}/like`, {
    method: 'POST',
  });
}

export async function fetchTelemetry(): Promise<any[]> {
  const res = await fetch(`${BASE_URL}/telemetry`);
  if (!res.ok) throw new Error('Failed to fetch corridor telemetry');
  return res.json();
}
