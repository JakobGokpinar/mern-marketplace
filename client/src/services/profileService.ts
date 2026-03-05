import { instanceAxs } from '../lib/axios';
import type { User } from '../types/user';

interface ProfileResponse {
  message: string;
  user?: User;
}

export const uploadProfilePictureApi = async (formData: FormData): Promise<ProfileResponse> => {
  const res = await instanceAxs.post<ProfileResponse>('/profile/upload/picture', formData);
  return res.data;
};

export const updateUserInfoApi = async (userdata: Record<string, string>): Promise<ProfileResponse> => {
  const res = await instanceAxs.post<ProfileResponse>('/profile/update/userinfo', userdata);
  return res.data;
};

export const removeProfilePictureApi = async (): Promise<ProfileResponse> => {
  const res = await instanceAxs.post<ProfileResponse>('/profile/delete/picture');
  return res.data;
};

export const deleteAccountApi = async (): Promise<void> => {
  await instanceAxs.post('/profile/delete/account');
};

export const removeListingApi = async (listingId: string): Promise<{ message: string }> => {
  const res = await instanceAxs.post<{ message: string }>('/listing/delete', { listingId });
  return res.data;
};
