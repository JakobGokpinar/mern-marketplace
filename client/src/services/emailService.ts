import { instanceAxs } from '../lib/axios';

interface EmailResponse {
  message: string;
  success?: boolean;
  user?: import('../types/user').User;
}

export const verifyEmailApi = async (userId: string, token: string): Promise<EmailResponse> => {
  const res = await instanceAxs.post<EmailResponse>('/email/verify', { userId, token });
  return res.data;
};

export const resendVerificationEmailApi = async (email: string, fullName: string, id: string): Promise<EmailResponse> => {
  const res = await instanceAxs.post<EmailResponse>('/email/newverificationemail', { email, fullName, id });
  return res.data;
};
