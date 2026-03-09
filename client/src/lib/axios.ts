import axios from 'axios';
import { emitUnauthorized } from './authEvents';

const serverURL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3080' : '');

const instanceAxs = axios.create({
  baseURL: serverURL + '/api',
  withCredentials: true,
});

const AUTH_PATHS = ['/auth/login', '/auth/signup'];

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
    // If CSRF token is rejected (403 with CSRF error), clear and retry once
    if (axios.isAxiosError(error) && error.response?.status === 403 && !(error.config as any)?._csrfRetry) {
      const msg = error.response?.data?.message ?? '';
      if (typeof msg === 'string' && msg.toLowerCase().includes('csrf')) {
        csrfToken = null;
        const config = error.config!;
        (config as any)._csrfRetry = true;
        return instanceAxs(config);
      }
    }
    return Promise.reject(error);
  }
);

export { instanceAxs };
