import axios from 'axios';
import { emitUnauthorized } from './authEvents';

const serverURL = import.meta.env.VITE_API_URL || 'http://localhost:3080';

const instanceAxs = axios.create({
  baseURL: serverURL + '/api',
  withCredentials: true,
});

const AUTH_PATHS = ['/login', '/signup'];

let csrfToken: string | null = null;

// Fetch CSRF token lazily on first state-changing request
async function ensureCsrfToken(): Promise<string> {
  if (csrfToken) return csrfToken;
  const res = await instanceAxs.get<{ csrfToken: string }>('/csrf-token');
  csrfToken = res.data.csrfToken;
  return csrfToken;
}

export const clearCsrfToken = () => {
  csrfToken = null;
};

// Attach CSRF token to all non-GET requests
instanceAxs.interceptors.request.use(async (config) => {
  if (config.method && config.method !== 'get') {
    const token = await ensureCsrfToken();
    config.headers['x-csrf-token'] = token;
  }
  return config;
});

instanceAxs.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const url = error.config?.url ?? '';
      if (!AUTH_PATHS.some((p) => url.startsWith(p))) {
        emitUnauthorized();
      }
    }
    // If CSRF token is rejected (403 with CSRF error), clear and retry
    if (axios.isAxiosError(error) && error.response?.status === 403) {
      const msg = error.response?.data?.message ?? '';
      if (typeof msg === 'string' && msg.toLowerCase().includes('csrf')) {
        csrfToken = null;
      }
    }
    return Promise.reject(error);
  }
);

export { instanceAxs };
