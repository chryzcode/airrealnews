import { handleApiRequest } from '../server/api.js';

// Single serverless function that serves every /api/* route. The catch-all file
// name lets Vercel forward the original request URL unchanged, so the router in
// handleApiRequest sees the real pathname.
export default async function handler(req, res) {
  await handleApiRequest(req, res);
}
