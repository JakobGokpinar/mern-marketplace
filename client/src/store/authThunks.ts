import toast from 'react-hot-toast';
import { isAxiosError } from 'axios';
import type { AppDispatch } from './index';
import { userActions } from './userSlice';
import { loginApi, signupApi, logoutApi, fetchUserApi } from '../services/authService';
import { clearCsrfToken } from '../lib/axios';

export const fetchUser = () => async (dispatch: AppDispatch) => {
  try {
    const user = await fetchUserApi();
    dispatch(userActions.setUser(user));
  } catch {
    // silently ignore — user simply stays logged out
  }
};

export const sendSignUpRequest = (userData: { fullName: string; email: string; password: string }) => async (dispatch: AppDispatch) => {
  try {
    const { message, user } = await signupApi(userData);
    if (user) {
      clearCsrfToken(); // session changed after signup
      dispatch(userActions.login(user));
      toast.success(`Velkommen, ${user.fullName}! Sjekk innboksen for bekreftelsesmail.`);
    } else {
      toast.error(message);
    }
  } catch (err) {
    const msg = isAxiosError(err) ? err.response?.data?.message : undefined;
    toast.error(msg || 'Noe gikk galt. Prøv igjen.');
  }
};

export const sendLoginRequest = (credentials: { email: string; password: string }) => async (dispatch: AppDispatch) => {
  try {
    const { user } = await loginApi(credentials);
    if (user) {
      clearCsrfToken(); // session changed after login
      dispatch(userActions.login(user));
      toast.success(`Velkommen tilbake, ${user.fullName}`);
    }
  } catch (err) {
    const msg = isAxiosError(err) ? err.response?.data?.message : undefined;
    toast.error(msg || 'Noe gikk galt. Prøv igjen.');
  }
};

export const logoutRequest = () => async (dispatch: AppDispatch) => {
  // Clear frontend state immediately — never block the user on a server response
  dispatch(userActions.logout());
  clearCsrfToken();
  toast('Du har logget ut');
  // Best-effort server-side session invalidation — failure is non-critical
  logoutApi().catch(() => { /* session expires on its own */ });
};
