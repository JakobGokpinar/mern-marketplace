import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      include: /\.[jt]sx?$/,
    }),
  ],
  server: {
    port: 3000,
    proxy: {
      // Pure API routes (no React Router pages at these paths)
      '/fetchuser': 'http://localhost:3080',
      '/newannonce': 'http://localhost:3080',
      '/searchproduct': 'http://localhost:3080',
      '/product': 'http://localhost:3080',
      '/email': 'http://localhost:3080',
      // Routes shared with React Router pages — proxy only non-navigation requests
      '/login': {
        target: 'http://localhost:3080',
        bypass: (req) => req.headers.accept?.includes('text/html') ? req.url : undefined,
      },
      '/signup': {
        target: 'http://localhost:3080',
        bypass: (req) => req.headers.accept?.includes('text/html') ? req.url : undefined,
      },
      '/logout': {
        target: 'http://localhost:3080',
        bypass: (req) => req.headers.accept?.includes('text/html') ? req.url : undefined,
      },
      '/search': {
        target: 'http://localhost:3080',
        bypass: (req) => req.headers.accept?.includes('text/html') ? req.url : undefined,
      },
      '/chat': {
        target: 'http://localhost:3080',
        bypass: (req) => req.headers.accept?.includes('text/html') ? req.url : undefined,
      },
      '/favorites': {
        target: 'http://localhost:3080',
        bypass: (req) => req.headers.accept?.includes('text/html') ? req.url : undefined,
      },
      '/profile': {
        target: 'http://localhost:3080',
        bypass: (req) => req.headers.accept?.includes('text/html') ? req.url : undefined,
      },
    }
  }
});
