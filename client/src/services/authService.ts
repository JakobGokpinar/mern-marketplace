import { instanceAxs } from '../lib/axios';
import type { User } from '../types/user';

interface AuthResponse {
  message: string;
  user?: User;
}

export const loginApi = async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
  const res = await instanceAxs.post<AuthResponse>('/auth/login', credentials);
  return res.data;
};

export const signupApi = async (userData: { fullName: string; email: string; password: string }): Promise<AuthResponse> => {
  const res = await instanceAxs.post<AuthResponse>('/auth/signup', userData);
  return res.data;
};

export const logoutApi = async (): Promise<void> => {
  await instanceAxs.delete('/auth/logout');
};

export const fetchUserApi = async (): Promise<User> => {
  const res = await instanceAxs.get<{ user: User }>('/user/me');
  return res.data.user;
};

export const fetchUserByIdApi = async (userId: string): Promise<User> => {
  const res = await instanceAxs.get<{ user: User }>('/users/' + userId);
  return res.data.user;
};

export const forgotPasswordApi = async (email: string): Promise<{ success: boolean; message: string }> => {
  const res = await instanceAxs.post<{ success: boolean; message: string }>('/auth/password/forgot', { email });
  return res.data;
};

export const resetPasswordApi = async (token: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
  const res = await instanceAxs.post<{ success: boolean; message: string }>('/auth/password/reset', { token, newPassword });
  return res.data;
};
