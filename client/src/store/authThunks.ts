import type { AppDispatch } from './index';
import { userActions } from './userSlice';
import { uiSliceActions } from './uiSlice';
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
    if (message === 'user created' && user) {
      dispatch(userActions.login(user));
      dispatch(uiSliceActions.setFeedbackBanner({
        severity: 'success',
        msg: `Velkommen, ${user.name}. Vennligst sjekk epost adressen for å verifisere kontoen.`,
      }));
    } else {
      dispatch(uiSliceActions.setFeedbackBanner({ severity: 'error', msg: message }));
    }
  } catch {
    dispatch(uiSliceActions.setFeedbackBanner({ severity: 'error', msg: 'Noe gikk galt. Prøv igjen.' }));
  }
};

export const sendLoginRequest = (credentials: { email: string; password: string }) => async (dispatch: AppDispatch) => {
  try {
    const { message, user } = await loginApi(credentials);
    if (message === 'user logged in' && user) {
      dispatch(userActions.login(user));
      dispatch(uiSliceActions.setFeedbackBanner({ severity: 'success', msg: `Velkommen tilbake, ${user.name}` }));
    } else {
      dispatch(uiSliceActions.setFeedbackBanner({ severity: 'error', msg: message }));
    }
  } catch {
    dispatch(uiSliceActions.setFeedbackBanner({ severity: 'error', msg: 'Noe gikk galt. Prøv igjen.' }));
  }
};

export const logoutRequest = () => async (dispatch: AppDispatch) => {
  try {
    await logoutApi();
    dispatch(userActions.logout());
    dispatch(uiSliceActions.setFeedbackBanner({ severity: 'info', msg: 'Du har logget ut' }));
  } catch {
    dispatch(uiSliceActions.setFeedbackBanner({ severity: 'error', msg: 'Det oppsto et feil. Prøve igjen senere' }));
  }
};
