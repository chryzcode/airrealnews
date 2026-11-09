import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'arn-backend-api',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url && req.url.startsWith('/api')) {
            // Loaded lazily so `vite build` never evaluates the backend
            // (db/Neon/auth) in the production build step.
            const { handleApiRequest } = await import('./server/api.js');
            await handleApiRequest(req, res);
          } else {
            next();
          }
        });
      }
    }
  ],
  server: {
    port: 5173,
    host: true
  }
});
