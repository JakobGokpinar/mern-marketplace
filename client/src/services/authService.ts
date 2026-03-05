import { instanceAxs } from '../lib/axios';
import type { User } from '../types/user';

interface AuthResponse {
  message: string;
  user?: User;
}

export const loginApi = async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
  const res = await instanceAxs.post<AuthResponse>('/login', credentials);
  return res.data;
};

export const signupApi = async (userData: { name: string; lastname: string; email: string; password: string }): Promise<AuthResponse> => {
  const res = await instanceAxs.post<AuthResponse>('/signup', userData);
  return res.data;
};

export const logoutApi = async (): Promise<void> => {
  await instanceAxs.delete('/logout');
};

export const fetchUserApi = async (): Promise<User> => {
  const res = await instanceAxs.get<{ user: User }>('/fetchuser');
  return res.data.user;
};

export const fetchUserByIdApi = async (userId: string): Promise<User> => {
  const res = await instanceAxs.get<{ user: User }>('/fetchuser', { params: { userId } });
  return res.data.user;
};
