import { instanceAxs } from '../lib/axios';
import type { User } from '../types/user';

interface ProfileResponse {
  message: string;
  user?: User;
}

export const uploadProfilePictureApi = async (formData: FormData): Promise<ProfileResponse> => {
  const res = await instanceAxs.put<ProfileResponse>('/user/me/picture', formData);
  return res.data;
};

export const updateUserInfoApi = async (userdata: Record<string, string>): Promise<ProfileResponse> => {
  const res = await instanceAxs.patch<ProfileResponse>('/user/me', userdata);
  return res.data;
};

export const removeProfilePictureApi = async (): Promise<ProfileResponse> => {
  const res = await instanceAxs.delete<ProfileResponse>('/user/me/picture');
  return res.data;
};

export const changePasswordApi = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
  const res = await instanceAxs.put<{ success: boolean; message: string }>('/user/me/password', { currentPassword, newPassword });
  return res.data;
};

export const changeEmailApi = async (newEmail: string): Promise<{ success: boolean; message: string; user?: User }> => {
  const res = await instanceAxs.put<{ success: boolean; message: string; user?: User }>('/user/me/email', { newEmail });
  return res.data;
};

export const deleteAccountApi = async (): Promise<void> => {
  await instanceAxs.delete('/user/me');
};

export const removeListingApi = async (listingId: string): Promise<{ message: string }> => {
  const res = await instanceAxs.delete<{ message: string }>('/listings/' + listingId);
  return res.data;
};
