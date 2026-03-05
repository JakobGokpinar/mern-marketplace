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
      '/search': 'http://localhost:3080',
      '/login': 'http://localhost:3080',
      '/signup': 'http://localhost:3080',
      '/logout': 'http://localhost:3080',
      '/fetchuser': 'http://localhost:3080',
      '/product': 'http://localhost:3080',
      '/newannonce': 'http://localhost:3080',
      '/chat': 'http://localhost:3080',
      '/favorites': 'http://localhost:3080',
      '/profile': 'http://localhost:3080',
      '/email': 'http://localhost:3080',
      '/searchproduct': 'http://localhost:3080',
    }
  }
});
