import toast from 'react-hot-toast';
import { isAxiosError } from 'axios';
import type { AppDispatch } from './index';
import { userActions } from './userSlice';
import { loginApi, signupApi, logoutApi, fetchUserApi } from '../services/authService';

export const fetchUser = () => async (dispatch: AppDispatch) => {
  try {
    const user = await fetchUserApi();
    dispatch(userActions.setUser(user));
  } catch {
    // silently ignore — user simply stays logged out
  }
};

export const sendSignUpRequest = (userData: { name: string; lastname: string; email: string; password: string }) => async (dispatch: AppDispatch) => {
  try {
    const { message, user } = await signupApi(userData);
    if (user) {
      dispatch(userActions.login(user));
      toast.success(`Velkommen, ${user.name}. Vennligst sjekk epost adressen for å verifisere kontoen.`);
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
      dispatch(userActions.login(user));
      toast.success(`Velkommen tilbake, ${user.name}`);
    }
  } catch (err) {
    const msg = isAxiosError(err) ? err.response?.data?.message : undefined;
    toast.error(msg || 'Noe gikk galt. Prøv igjen.');
  }
};

export const logoutRequest = () => async (dispatch: AppDispatch) => {
  // Clear frontend state immediately — never block the user on a server response
  dispatch(userActions.logout());
  toast('Du har logget ut');
  // Best-effort server-side session invalidation
  logoutApi().catch(() => {});
};
