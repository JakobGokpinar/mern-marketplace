import axios from 'axios';
import { emitUnauthorized } from './authEvents';

const serverURL = import.meta.env.VITE_API_URL || 'http://localhost:3080';

const instanceAxs = axios.create({
  baseURL: serverURL + '/api',
  withCredentials: true,
});

const AUTH_PATHS = ['/login', '/signup'];

instanceAxs.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const url = error.config?.url ?? '';
      if (!AUTH_PATHS.some((p) => url.startsWith(p))) {
        emitUnauthorized();
      }
    }
    return Promise.reject(error);
  }
);

export { instanceAxs };
